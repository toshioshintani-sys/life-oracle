import type { Handler } from '@netlify/functions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const ASPECT_RATIO_MAP: Record<string, string> = {
  '1:1': '1:1',
  '16:9': '16:9',
  '3:2': '3:2',
  '9:16': '9:16',
};

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
  urls: { get: string };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt, aspectRatio } = JSON.parse(event.body ?? '{}');

    if (!prompt || typeof prompt !== 'string' || prompt.length > 3000) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: '不正なリクエストです' }),
      };
    }

    // Prefer: wait=55 で同期的に待機（Replicate が対応している場合は polling 不要）
    const createRes = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          Prefer: 'wait=55',
        },
        body: JSON.stringify({
          input: {
            prompt,
            aspect_ratio: ASPECT_RATIO_MAP[aspectRatio] ?? '1:1',
            output_format: 'png',
            output_quality: 95,
            safety_tolerance: 2,
          },
        }),
      },
    );

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({})) as { detail?: string };
      return {
        statusCode: createRes.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: err?.detail ?? 'Replicate APIエラー' }),
      };
    }

    let prediction = await createRes.json() as ReplicatePrediction;

    // Prefer: wait で未完了の場合は polling でフォールバック
    const deadline = Date.now() + 55_000;
    while (
      prediction.status !== 'succeeded' &&
      prediction.status !== 'failed' &&
      prediction.status !== 'canceled'
    ) {
      if (Date.now() > deadline) {
        return {
          statusCode: 504,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'タイムアウト: FLUX の生成に時間がかかりすぎています' }),
        };
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));

      const pollRes = await fetch(prediction.urls.get, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      });
      prediction = await pollRes.json() as ReplicatePrediction;
    }

    if (prediction.status !== 'succeeded') {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: prediction.error ?? 'FLUX 生成に失敗しました' }),
      };
    }

    const imageUrl = Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output;

    if (!imageUrl) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: '画像 URL が取得できませんでした' }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ imageUrl }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'サーバーエラーが発生しました' }),
    };
  }
};
