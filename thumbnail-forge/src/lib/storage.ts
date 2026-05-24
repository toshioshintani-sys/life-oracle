import type { PromptHistoryItem, AspectRatio, DailyCallCount, ModelId, StyleSettings } from './types';
import { DEFAULT_STYLE_SETTINGS } from './types';

const STYLE_SETTINGS_KEY = 'thumbnail-forge:style';

const HISTORY_KEY = 'thumbnail-forge:history';
const CALL_COUNT_KEY = 'thumbnail-forge:call-count';
const MAX_HISTORY = 20;
const DAILY_CALL_LIMIT = 100;

export function getHistory(): PromptHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function addToHistory(prompt: string, aspectRatio: AspectRatio): void {
  const history = getHistory().filter((item) => item.prompt !== prompt);
  history.unshift({ prompt, aspectRatio, timestamp: Date.now() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

export function getDailyCallCount(): DailyCallCount {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const stored = JSON.parse(localStorage.getItem(CALL_COUNT_KEY) ?? '{}') as DailyCallCount;
    if (stored.date === today) return stored;
  } catch {
    // ignore parse errors
  }
  return { date: today, counts: { gemini: 0, openai: 0, flux: 0 } };
}

export function incrementCallCount(models: ModelId[]): { exceeded: boolean } {
  const counts = getDailyCallCount();
  for (const model of models) {
    counts.counts[model] = (counts.counts[model] ?? 0) + 1;
  }
  localStorage.setItem(CALL_COUNT_KEY, JSON.stringify(counts));
  const total = Object.values(counts.counts).reduce((a, b) => a + b, 0);
  return { exceeded: total >= DAILY_CALL_LIMIT };
}

export function getTodayTotal(): number {
  const counts = getDailyCallCount();
  return Object.values(counts.counts).reduce((a, b) => a + b, 0);
}

export function getStyleSettings(): StyleSettings {
  try {
    return { ...DEFAULT_STYLE_SETTINGS, ...JSON.parse(localStorage.getItem(STYLE_SETTINGS_KEY) ?? '{}') };
  } catch {
    return DEFAULT_STYLE_SETTINGS;
  }
}

export function saveStyleSettings(settings: StyleSettings): void {
  localStorage.setItem(STYLE_SETTINGS_KEY, JSON.stringify(settings));
}
