import { useState } from 'react';
import type { StyleSettings as StyleSettingsType } from '../lib/types';
import { hasStyleSettings } from '../lib/styleUtils';

interface Props {
  settings: StyleSettingsType;
  onChange: (settings: StyleSettingsType) => void;
}

const KEYWORDS = ['ミニマル', '和風モダン', 'サイバーパンク', 'ナチュラル', 'ラグジュアリー', 'ポップ', 'ダーク', 'レトロ'];
const COLOR_TONES = ['ウォーム', 'クール', 'モノクロ', 'ビビッド', 'パステル'];
const MOODS = ['知的', 'エネルギッシュ', '洗練', '親しみやすい', '神秘的'];

export function StyleSettings({ settings, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const active = hasStyleSettings(settings);

  const toggleKeyword = (kw: string) => {
    const next = settings.keywords.includes(kw)
      ? settings.keywords.filter((k) => k !== kw)
      : [...settings.keywords, kw];
    onChange({ ...settings, keywords: next });
  };

  const selectColor = (tone: string) => {
    onChange({ ...settings, colorTone: settings.colorTone === tone ? '' : tone });
  };

  const selectMood = (mood: string) => {
    onChange({ ...settings, mood: settings.mood === mood ? '' : mood });
  };

  const reset = () => {
    onChange({ keywords: [], colorTone: '', mood: '', freeText: '' });
  };

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm
                   hover:bg-slate-800 transition-colors"
      >
        <span className="font-medium text-slate-300 flex items-center gap-2">
          世界観設定
          {active && (
            <span className="px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">ON</span>
          )}
        </span>
        <span className="text-slate-500 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 pt-2">
            設定した内容はすべてのプロンプトに自動付与されます。空欄でも綺麗なサムネイルが生成されます。
          </p>

          {/* スタイルキーワード（複数選択可） */}
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">スタイル（複数可）</p>
            <div className="flex flex-wrap gap-1.5">
              {KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => toggleKeyword(kw)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.keywords.includes(kw)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* カラートーン（単一選択） */}
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">カラートーン</p>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => selectColor(tone)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.colorTone === tone
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* 雰囲気（単一選択） */}
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">雰囲気</p>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => selectMood(mood)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    settings.mood === mood
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* 自由記述 */}
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">自由記述（任意）</p>
            <textarea
              value={settings.freeText}
              onChange={(e) => onChange({ ...settings, freeText: e.target.value })}
              placeholder="例: 常に夕焼けを背景に、宇宙をモチーフに..."
              rows={2}
              className="w-full rounded bg-slate-800 border border-slate-700 text-slate-200
                         placeholder-slate-600 px-3 py-2 text-xs resize-none
                         focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {active && (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              設定をリセット
            </button>
          )}
        </div>
      )}
    </div>
  );
}
