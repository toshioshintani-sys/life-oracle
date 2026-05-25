import type { StyleSettings } from './types';

const KEYWORD_EN: Record<string, string> = {
  'マンガ/アニメ': 'manga anime illustration style, flat bold colors, strong black outlines, exaggerated expressive character faces, Japanese self-help book cover art',
  'ミニマル': 'minimal clean design',
  '和風モダン': 'Japanese modern aesthetic, wabi-sabi',
  'サイバーパンク': 'cyberpunk, neon lights, futuristic',
  'ナチュラル': 'natural, organic, earthy',
  'ラグジュアリー': 'luxury, premium, elegant',
  'ポップ': 'pop art, vibrant, bold colors',
  'ダーク': 'dark, moody, dramatic',
  'レトロ': 'retro, vintage aesthetic',
};

const COLOR_TONE_EN: Record<string, string> = {
  'ウォーム': 'warm golden tones',
  'クール': 'cool blue-gray palette',
  'モノクロ': 'monochromatic black and white',
  'ビビッド': 'vivid saturated colors',
  'パステル': 'soft pastel tones',
};

const MOOD_EN: Record<string, string> = {
  '知的': 'intellectual sophisticated atmosphere',
  'エネルギッシュ': 'energetic dynamic powerful',
  '洗練': 'refined polished clean',
  '親しみやすい': 'friendly approachable warm',
  '神秘的': 'mysterious ethereal dreamlike',
};

export function buildStyleSuffix(settings: StyleSettings): string {
  const parts: string[] = [];

  for (const kw of settings.keywords) {
    const en = KEYWORD_EN[kw];
    if (en) parts.push(en);
  }

  if (settings.colorTone) {
    const en = COLOR_TONE_EN[settings.colorTone];
    if (en) parts.push(en);
  }

  if (settings.mood) {
    const en = MOOD_EN[settings.mood];
    if (en) parts.push(en);
  }

  if (settings.freeText.trim()) {
    parts.push(settings.freeText.trim());
  }

  return parts.length > 0 ? `, ${parts.join(', ')}` : '';
}

export function hasStyleSettings(settings: StyleSettings): boolean {
  return (
    settings.keywords.length > 0 ||
    settings.colorTone !== '' ||
    settings.mood !== '' ||
    settings.freeText.trim() !== ''
  );
}
