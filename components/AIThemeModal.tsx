
import React, { useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { Language } from '../types';

interface AIThemeModalProps {
  lang: Language;
  onGenerate: (theme: string) => void;
  onClose: () => void;
  isGenerating: boolean;
}

const translations = {
  ja: {
    title: "AIに目標を相談する",
    description: "今年一年、どんな風に過ごしたいですか？テーマを入力するとAIが25個の目標を提案します。",
    placeholder: "例：健康的な生活、新しい趣味を始める、仕事で成果を出す...",
    btn: "目標を生成する",
  },
  en: {
    title: "Ask AI for Goals",
    description: "How do you want to spend this year? Enter a theme and AI will suggest 25 goals.",
    placeholder: "e.g. Healthy lifestyle, start new hobbies, career growth...",
    btn: "Generate Goals",
  }
};

export const AIThemeModal: React.FC<AIThemeModalProps> = ({ lang, onGenerate, onClose, isGenerating }) => {
  const [theme, setTheme] = useState('');
  const t = translations[lang];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-pink-500">
            <Sparkles size={20} />
            <h2 className="text-xl font-bold">{t.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {t.description}
        </p>

        <div className="space-y-4">
          <textarea
            autoFocus
            className="w-full p-4 border-2 border-pink-100 rounded-2xl focus:border-pink-300 focus:ring-0 outline-none resize-none text-base h-28 handwritten"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder={t.placeholder}
            disabled={isGenerating}
          />

          <button
            onClick={() => theme.trim() && onGenerate(theme)}
            disabled={!theme.trim() || isGenerating}
            className={`w-full py-4 bg-pink-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-200 hover:bg-pink-600 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100`}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Thinking...</span>
              </div>
            ) : (
              <>
                <Send size={18} />
                {t.btn}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
