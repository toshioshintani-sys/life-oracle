export type ModelId = 'gemini' | 'openai' | 'flux';
export type LlmId = 'gemini' | 'openai';
export type AspectRatio = '1:1' | '16:9' | '3:2' | '9:16';

export interface GenerationResult {
  modelId: ModelId;
  status: 'idle' | 'loading' | 'success' | 'error';
  imageData?: string;
  mimeType?: string;
  imageUrl?: string;
  error?: string;
  timestamp?: number;
}

export interface GenerationRequest {
  prompt: string;
  aspectRatio: AspectRatio;
  models: ModelId[];
}

export interface PromptHistoryItem {
  prompt: string;
  aspectRatio: AspectRatio;
  timestamp: number;
}

export interface DailyCallCount {
  date: string;
  counts: Record<ModelId, number>;
}

export interface StyleSettings {
  keywords: string[];
  colorTone: string;
  mood: string;
  freeText: string;
}

export const DEFAULT_STYLE_SETTINGS: StyleSettings = {
  keywords: [],
  colorTone: '',
  mood: '',
  freeText: '',
};

export interface TextOverlay {
  enabled: boolean;
  title: string;
  subtitle: string;
  titleColor: 'white' | 'yellow' | 'black';
  position: 'top' | 'bottom';
}

export const DEFAULT_TEXT_OVERLAY: TextOverlay = {
  enabled: false,
  title: '',
  subtitle: '',
  titleColor: 'white',
  position: 'bottom',
};
