import type { PromptHistoryItem, AspectRatio } from '../lib/types';

interface Props {
  history: PromptHistoryItem[];
  onSelect: (prompt: string, aspectRatio: AspectRatio) => void;
}

export function PromptHistory({ history, onSelect }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">履歴</p>
      <ul className="space-y-1 max-h-48 overflow-y-auto">
        {history.map((item) => (
          <li key={item.timestamp}>
            <button
              type="button"
              onClick={() => onSelect(item.prompt, item.aspectRatio)}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-400
                         hover:bg-slate-800 hover:text-slate-200 transition-colors truncate"
            >
              <span className="text-slate-600 mr-2">[{item.aspectRatio}]</span>
              {item.prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
