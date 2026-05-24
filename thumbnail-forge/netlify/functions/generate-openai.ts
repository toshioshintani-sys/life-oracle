import type { Handler } from '@netlify/functions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const SIZE_MAP: Record<string, string> = {
  '1:1': '1024x1024',
  '16:9': '1536x1024',
  '3:2': '1536x1024',
  '9:16': '1024x1536',
};

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

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size: SIZE_MAP[aspectRatio] ?? '1024x1024',
        quality: 'medium',
        n: 1,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: err?.error?.message ?? 'OpenAI APIエラー' }),
      };
    }

    const data = await response.json() as { data?: Array<{ b64_json?: string }> };
    const imageData = data.data?.[0]?.b64_json;

    if (!imageData) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: '画像データが返されませんでした' }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ imageData, mimeType: 'image/png' }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'サーバーエラーが発生しました' }),
    };
  }
};
