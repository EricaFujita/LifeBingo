
import React from 'react';
import { X, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import { BingoBoard, Language } from '../types';
import { THEMES } from '../constants';

interface BoardListModalProps {
  lang: Language;
  boards: BingoBoard[];
  activeBoardId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

const translations = {
  ja: {
    title: "ビンゴ一覧",
    newBoard: "新しいビンゴを作る",
    achieved: "達成率",
    formatYear: (y: number) => `${y}年`,
    formatMonth: (m: number) => `${m}月`,
    noMonth: "通年",
    empty: "ボードがありません",
  },
  en: {
    title: "My Boards",
    newBoard: "Create New Board",
    achieved: "Progress",
    formatYear: (y: number) => `${y}`,
    formatMonth: (m: number) => {
      const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return names[m-1];
    },
    noMonth: "Full Year",
    empty: "No boards found",
  }
};

export const BoardListModal: React.FC<BoardListModalProps> = ({ 
  lang, boards, activeBoardId, onSelect, onCreate, onClose 
}) => {
  const t = translations[lang];

  const getProgress = (board: BingoBoard) => {
    const achievedCount = board.items.filter(i => i.isAchieved && i.text).length;
    return Math.round((achievedCount / 25) * 100);
  };

  // 年月でソート（新しい順）
  const sortedBoards = [...boards].sort((a, b) => {
    // 年月を数値化して比較 (例: 2025年1月 -> 202501)
    const aVal = a.profile.year * 100 + (a.profile.month || 0);
    const bVal = b.profile.year * 100 + (b.profile.month || 0);
    return bVal - aVal;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-sm p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">{t.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
          {boards.length === 0 && (
            <div className="text-center py-10 text-gray-400 font-bold">{t.empty}</div>
          )}
          {sortedBoards.map((board) => {
            const theme = THEMES[board.profile.theme];
            const isActive = board.id === activeBoardId;
            const progress = getProgress(board);
            
            return (
              <div 
                key={board.id}
                onClick={() => onSelect(board.id)}
                className={`group relative p-4 rounded-3xl border-2 transition-all cursor-pointer select-none active:scale-95 ${
                  isActive ? 'border-theme-primary shadow-sm' : 'border-gray-50 bg-gray-50/50'
                }`}
                style={{ 
                  borderColor: isActive ? theme.primary : undefined,
                  backgroundColor: isActive ? `${theme.primary}05` : undefined
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-800">
                          {board.profile.year} {board.profile.month ? t.formatMonth(board.profile.month) : t.noMonth}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: theme.primary }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <CheckCircle2 size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400 font-bold">{t.achieved}: {progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 w-full h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: theme.primary 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onCreate}
          className="mt-6 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Plus size={20} />
          {t.newBoard}
        </button>
      </div>
    </div>
  );
};
