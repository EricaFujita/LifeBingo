
import React, { useState } from 'react';
import { X, Calendar, Check, Palette } from 'lucide-react';
import { Language, UserProfile, ThemeId } from '../types';
import { THEMES } from '../constants';

interface PeriodSettingsModalProps {
  lang: Language;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

const translations = {
  ja: {
    title: "設定",
    periodTitle: "期間",
    themeTitle: "テーマカラー",
    yearLabel: "年",
    monthLabel: "月（任意）",
    noMonth: "設定しない",
    save: "設定を保存",
  },
  en: {
    title: "Settings",
    periodTitle: "Period",
    themeTitle: "Theme Color",
    yearLabel: "Year",
    monthLabel: "Month (Optional)",
    noMonth: "None",
    save: "Save Settings",
  }
};

export const PeriodSettingsModal: React.FC<PeriodSettingsModalProps> = ({ lang, profile, onSave, onClose }) => {
  const [year, setYear] = useState(profile.year);
  const [month, setMonth] = useState<number | undefined>(profile.month);
  const [themeId, setThemeId] = useState<ThemeId>(profile.theme || 'pink');
  const t = translations[lang];

  // 2026年から10年分を表示
  const years = Array.from({ length: 10 }, (_, i) => 2026 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const themeIds: ThemeId[] = ['pink', 'blue', 'green', 'purple', 'orange'];

  const primaryColor = THEMES[themeId].primary;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2" style={{ color: primaryColor }}>
            <Calendar size={22} />
            <h2 className="text-xl font-bold">{t.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-400">
              <Palette size={18} />
              <label className="text-xs font-bold uppercase tracking-wider">{t.themeTitle}</label>
            </div>
            <div className="flex justify-between gap-2 p-1 bg-gray-50 rounded-2xl">
              {themeIds.map(id => (
                <button
                  key={id}
                  onClick={() => setThemeId(id)}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${themeId === id ? 'scale-110 shadow-lg' : 'scale-90 opacity-60'}`}
                  style={{ 
                    backgroundColor: THEMES[id].primary,
                    borderColor: themeId === id ? 'white' : 'transparent'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.yearLabel}</label>
            <div className="grid grid-cols-4 gap-2">
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`py-2 rounded-xl font-bold transition-all text-sm ${year === y ? 'text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                  style={{ backgroundColor: year === y ? primaryColor : undefined }}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.monthLabel}</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setMonth(undefined)}
                className={`col-span-2 py-2 rounded-xl font-bold transition-all text-sm ${month === undefined ? 'text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                style={{ backgroundColor: month === undefined ? primaryColor : undefined }}
              >
                {t.noMonth}
              </button>
              {months.map(m => (
                <button
                  key={m}
                  onClick={() => setMonth(m)}
                  className={`py-2 rounded-xl font-bold transition-all text-sm ${month === m ? 'text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                  style={{ backgroundColor: month === m ? primaryColor : undefined }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSave({ year, month, theme: themeId })}
            className="w-full py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 mt-4"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 10px 15px -3px ${primaryColor}40`
            }}
          >
            <Check size={20} />
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
