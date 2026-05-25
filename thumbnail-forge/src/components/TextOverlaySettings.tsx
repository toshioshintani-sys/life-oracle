import { useState } from 'react';
import type { TextOverlay } from '../lib/types';

interface Props {
  settings: TextOverlay;
  onChange: (settings: TextOverlay) => void;
}

const COLORS: { value: TextOverlay['titleColor']; label: string; bg: string; text: string }[] = [
  { value: 'white', label: '白', bg: 'bg-white', text: 'text-black' },
  { value: 'yellow', label: '黄', bg: 'bg-yellow-400', text: 'text-black' },
  { value: 'black', label: '黒', bg: 'bg-gray-900', text: 'text-white' },
];

export function TextOverlaySettings({ settings, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm
                   hover:bg-slate-800 transition-colors"
      >
        <span className="font-medium text-slate-300 flex items-center gap-2">
          テキスト合成
          {settings.enabled && (
            <span className="px-1.5 py-0.5 text-xs bg-green-600 text-white rounded-full">ON</span>
          )}
        </span>
        <span className="text-slate-500 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 pt-2">
            生成画像にタイトルを直接合成します。ダウンロード時も反映されます。
          </p>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => onChange({ ...settings, enabled: e.target.checked })}
              className="accent-indigo-500 w-4 h-4"
            />
            <span className="text-xs text-slate-300">テキスト合成を有効にする</span>
          </label>

          {settings.enabled && (
            <>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">タイトル（大）</p>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => onChange({ ...settings, title: e.target.value })}
                  placeholder="例: 決めつけ上司の取扱説明書"
                  className="w-full rounded bg-slate-800 border border-slate-700 text-slate-200
                             placeholder-slate-600 px-3 py-2 text-xs
                             focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">サブタイトル（小・任意）</p>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => onChange({ ...settings, subtitle: e.target.value })}
                  placeholder="例: 3つの処方箋"
                  className="w-full rounded bg-slate-800 border border-slate-700 text-slate-200
                             placeholder-slate-600 px-3 py-2 text-xs
                             focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">文字色</p>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onChange({ ...settings, titleColor: c.value })}
                      className={`px-3 py-1.5 text-xs rounded-md border-2 font-medium transition-colors
                                  ${c.bg} ${c.text} ${
                        settings.titleColor === c.value
                          ? 'border-indigo-400 ring-1 ring-indigo-400'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">テキスト位置</p>
                <div className="flex gap-2">
                  {(['top', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => onChange({ ...settings, position: pos })}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        settings.position === pos
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {pos === 'top' ? '上部' : '下部'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
