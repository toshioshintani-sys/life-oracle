import type { Handler } from '@netlify/functions';
import mammoth from 'mammoth';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const SYSTEM_PROMPT = `You are an expert thumbnail prompt engineer specializing in note.jp and Japanese self-help blog thumbnails.

Given an article, generate ONE highly effective image generation prompt in English.

Style target: Japanese manga/anime illustration style — the same visual language used in popular note.jp self-help articles, business manga, and Japanese infographic content.

Requirements:
- Art style: clean manga/anime illustration, flat bold colors, strong outlines, expressive character faces
- Color palette: high-contrast vivid colors — yellows, reds, oranges, strong blacks; avoid muted or pastel tones
- Composition: single dominant character (office worker, business person, or symbolic figure) with exaggerated emotional expression that conveys the article's core emotion
- The character's expression and pose must immediately communicate the article's theme (e.g., frustration, confidence, relief, determination)
- Background: simple, graphic, minimal — solid color with bold geometric shapes, speed lines, or simple icons; NOT photorealistic scenes
- NO text, NO letters, NO words, NO speech bubbles anywhere in the image
- Style reference: Japanese business manga panel, self-help book cover illustration, bold editorial cartoon
- Aspect ratio: 16:9 landscape
- Quality: sharp lines, professional illustration quality

Output ONLY the prompt text. No explanations, no quotes, no labels.`;

async function callGemini(articleText: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: `Article:\n${articleText}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
      }),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? 'Gemini APIエラー');
  }
  const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini からレスポンスが返りませんでした');
  return text.trim();
}

async function callOpenAI(articleText: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Article:\n${articleText}` },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? 'OpenAI APIエラー');
  }
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI からレスポンスが返りませんでした');
  return text.trim();
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body ?? '{}') as {
      articleText?: string;
      docxBase64?: string;
      llm?: string;
    };

    const { docxBase64, llm = 'gemini' } = body;
    let articleText = body.articleText ?? '';

    // docx のパース
    if (docxBase64) {
      const buffer = Buffer.from(docxBase64, 'base64');
      const result = await mammoth.extractRawText({ buffer });
      articleText = result.value;
    }

    if (!articleText || articleText.trim().length < 10) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: '記事テキストが短すぎます' }),
      };
    }

    // 長すぎる記事はトークン節約のため先頭3000字に絞る
    const truncated = articleText.slice(0, 3000);

    const prompt = llm === 'openai'
      ? await callOpenAI(truncated)
      : await callGemini(truncated);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ prompt }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: e instanceof Error ? e.message : 'サーバーエラーが発生しました' }),
    };
  }
};
