import type { AspectRatio } from '../lib/types';

interface Props {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

const OPTIONS: { value: AspectRatio; label: string; desc: string }[] = [
  { value: '1:1', label: 'Square', desc: '1:1' },
  { value: '16:9', label: 'Landscape', desc: '16:9 — note' },
  { value: '3:2', label: 'Wide', desc: '3:2 — Substack' },
  { value: '9:16', label: 'Portrait', desc: '9:16 — Pinterest' },
];

export function AspectRatioSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">アスペクト比</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors text-left ${
              value === opt.value
                ? 'bg-indigo-600 text-white border border-indigo-500'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="font-semibold">{opt.label}</div>
            <div className="text-slate-400 mt-0.5">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
