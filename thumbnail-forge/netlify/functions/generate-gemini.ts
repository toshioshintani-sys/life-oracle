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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['Image'],
            imageConfig: {
              aspectRatio: ASPECT_RATIO_MAP[aspectRatio] ?? '1:1',
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: err?.error?.message ?? 'Gemini APIエラー' }),
      };
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { data: string; mimeType: string } }> };
      }>;
    };

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData);

    if (!imagePart?.inlineData) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: '画像データが返されませんでした' }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        imageData: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'サーバーエラーが発生しました' }),
    };
  }
};
