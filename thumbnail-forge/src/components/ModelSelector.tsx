import type { ModelId } from '../lib/types';

interface Props {
  selected: ModelId[];
  onChange: (models: ModelId[]) => void;
}

const MODELS: { id: ModelId; label: string; detail: string }[] = [
  { id: 'gemini', label: 'Gemini', detail: 'gemini-2.5-flash-image' },
  { id: 'openai', label: 'OpenAI', detail: 'gpt-image-1' },
  // { id: 'flux', label: 'FLUX', detail: 'flux-1.1-pro' },
];

export function ModelSelector({ selected, onChange }: Props) {
  const toggle = (id: ModelId) => {
    const next = selected.includes(id)
      ? selected.filter((m) => m !== id)
      : [...selected, id];
    if (next.length > 0) onChange(next);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">使用モデル</label>
      <div className="flex flex-wrap gap-2">
        {MODELS.map((model) => {
          const isSelected = selected.includes(model.id);
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => toggle(model.id)}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white border border-indigo-500'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
              }`}
            >
              <span
                className={`w-3 h-3 rounded border flex-shrink-0 ${
                  isSelected ? 'bg-white border-white' : 'border-slate-500'
                }`}
              />
              <span className="font-medium">{model.label}</span>
              <span className="text-slate-400">{model.detail}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
