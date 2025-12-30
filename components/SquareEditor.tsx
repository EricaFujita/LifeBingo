
import React, { useState } from 'react';
import { BingoItem, Difficulty, Language, Theme, SubGoal } from '../types';
import { X, Save, Trash2, Plus, CheckSquare, Square } from 'lucide-react';

interface SquareEditorProps {
  item: BingoItem;
  lang: Language;
  activeTheme: Theme;
  onSave: (updates: Partial<BingoItem>) => void;
  onClose: () => void;
}

const translations = {
  ja: {
    title: "マスの編集",
    label: "大目標",
    placeholder: "例: 月に1回は運動する",
    difficulty: "難易度 (1:易 〜 5:難)",
    subGoalTitle: "小目標 (ブレイクダウン)",
    subGoalPlaceholder: "具体的に何をする？",
    addSubGoal: "ステップを追加",
    clear: "クリア",
    save: "保存する"
  },
  en: {
    title: "Edit Goal",
    label: "Main Goal",
    placeholder: "e.g. Exercise once a month",
    difficulty: "Difficulty (1:Easy - 5:Hard)",
    subGoalTitle: "Sub-goals (Breakdown)",
    subGoalPlaceholder: "Specific step...",
    addSubGoal: "Add Step",
    clear: "Clear",
    save: "Save"
  }
};

export const SquareEditor: React.FC<SquareEditorProps> = ({ item, lang, activeTheme, onSave, onClose }) => {
  const [text, setText] = useState(item.text);
  const [difficulty, setDifficulty] = useState<Difficulty>(item.difficulty);
  const [subGoals, setSubGoals] = useState<SubGoal[]>(item.subGoals || []);
  const t = translations[lang];

  const handleAddSubGoal = () => {
    const newSub: SubGoal = {
      id: crypto.randomUUID(),
      text: '',
      isDone: false
    };
    setSubGoals([...subGoals, newSub]);
  };

  const handleUpdateSubGoal = (id: string, updates: Partial<SubGoal>) => {
    setSubGoals(subGoals.map(sg => sg.id === id ? { ...sg, ...updates } : sg));
  };

  const handleRemoveSubGoal = (id: string) => {
    setSubGoals(subGoals.filter(sg => sg.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200 my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{t.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.label}</label>
            <textarea
              className="w-full p-4 border-2 rounded-2xl focus:ring-0 outline-none resize-none text-lg h-24 handwritten"
              style={{ 
                borderColor: activeTheme.accent,
              } as any}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.difficulty}</label>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl as Difficulty)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    difficulty === lvl
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  style={{ backgroundColor: difficulty === lvl ? activeTheme.primary : undefined }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 小目標セクション */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">{t.subGoalTitle}</label>
            <div className="space-y-2 mb-3">
              {subGoals.map((sg) => (
                <div key={sg.id} className="flex items-center gap-2 group">
                  <button 
                    onClick={() => handleUpdateSubGoal(sg.id, { isDone: !sg.isDone })}
                    className="flex-shrink-0"
                    style={{ color: sg.isDone ? activeTheme.primary : '#d1d5db' }}
                  >
                    {sg.isDone ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                  <input
                    type="text"
                    className={`flex-1 text-sm outline-none bg-transparent border-b border-transparent focus:border-gray-200 py-1 transition-all ${sg.isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                    value={sg.text}
                    onChange={(e) => handleUpdateSubGoal(sg.id, { text: e.target.value })}
                    placeholder={t.subGoalPlaceholder}
                  />
                  <button 
                    onClick={() => handleRemoveSubGoal(sg.id)}
                    className="p-1 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddSubGoal}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg transition-all"
              style={{ color: activeTheme.primary, backgroundColor: `${activeTheme.primary}10` }}
            >
              <Plus size={14} /> {t.addSubGoal}
            </button>
          </div>

          <div className="pt-4 flex gap-3">
             <button
              onClick={() => {
                  setText('');
                  setDifficulty(1);
                  setSubGoals([]);
              }}
              className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200"
            >
              <Trash2 size={20} /> {t.clear}
            </button>
            <button
              onClick={() => onSave({ text, difficulty, subGoals })}
              className="flex-[2] py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              style={{ 
                backgroundColor: activeTheme.primary,
                boxShadow: `0 10px 15px -3px ${activeTheme.primary}40`
              }}
            >
              <Save size={20} /> {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
