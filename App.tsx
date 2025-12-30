
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BingoItem, Difficulty, Language, UserProfile, ThemeId, BingoBoard } from './types';
import { StampEffect } from './components/StampEffect';
import { SquareEditor } from './components/SquareEditor';
import { Share2, Shuffle, LayoutGrid, ListTodo, Edit3, Square, CheckSquare, Plus, Trophy, Settings2, Info, CheckCircle2 } from 'lucide-react';
import { ShareModal } from './components/ShareModal';
import { PeriodSettingsModal } from './components/PeriodSettingsModal';
import { BoardListModal } from './components/BoardListModal';
import { THEMES } from './constants';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'lifeBingo_v2_boards';
const ACTIVE_ID_KEY = 'lifeBingo_v2_activeId';
const DEFAULT_START_YEAR = 2026;

const translations = {
  ja: {
    title: "人生ビンゴ",
    subtitle: "目標をかなえてスタンプを押そう！",
    achieved: "達成数",
    bingo: "ビンゴ",
    progress: "進捗率",
    sortBtn: "並替",
    shareBtn: "共有",
    tabBingo: "ビンゴ",
    tabDetails: "詳細",
    detailsTitle: "目標のブレイクダウン",
    noGoals: "まだ目標が設定されていません。マスをタップして目標を立てましょう！",
    hintTitle: "使い方ヒント",
    hint1: "・タップでスタンプを押す",
    hint2: "・長押しで小目標を設定する",
    hint3: "・「並替」で簡単な目標を中央に配置",
    formatMonth: (m: number) => `${m}月`,
    achievedBadge: "達成！",
  },
  en: {
    title: "Life Bingo",
    subtitle: "Complete goals and get stamps!",
    achieved: "Achieved",
    bingo: "Bingo",
    progress: "Progress",
    sortBtn: "Sort",
    shareBtn: "Share",
    tabBingo: "Bingo",
    tabDetails: "Details",
    detailsTitle: "Goal Breakdown",
    noGoals: "No goals set yet. Tap a square to start!",
    hintTitle: "Tips",
    hint1: "• Tap to stamp goal",
    hint2: "• Long press to add sub-goals",
    hint3: "• 'Sort' puts easy goals in center",
    formatMonth: (m: number) => {
      const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return names[m-1];
    },
    achievedBadge: "Done!",
  }
};

const createNewBoard = (year: number): BingoBoard => ({
  id: crypto.randomUUID(),
  profile: { year, theme: 'pink' },
  items: Array.from({ length: 25 }, (_, i) => ({
    id: crypto.randomUUID(),
    text: '',
    difficulty: 1,
    isAchieved: false,
    position: i,
    subGoals: []
  })),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lifeBingoLang');
    return (saved as Language) || 'ja';
  });

  const [boards, setBoards] = useState<BingoBoard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return [createNewBoard(DEFAULT_START_YEAR)];
  });

  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_ID_KEY);
    return saved || (boards[0] && boards[0].id) || "";
  });

  const activeBoard = useMemo(() => {
    const board = boards.find(b => b.id === activeBoardId);
    return board || boards[0] || createNewBoard(DEFAULT_START_YEAR);
  }, [boards, activeBoardId]);

  const [activeTab, setActiveTab] = useState<'bingo' | 'details'>('bingo');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showBoardList, setShowBoardList] = useState(false);
  const [bingoCount, setBingoCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];
  const activeTheme = THEMES[activeBoard.profile.theme || 'pink'];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    if (activeBoardId) {
      localStorage.setItem(ACTIVE_ID_KEY, activeBoardId);
    }
  }, [activeBoardId]);

  useEffect(() => {
    localStorage.setItem('lifeBingoLang', lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', activeTheme.primary);
    document.documentElement.style.setProperty('--secondary-color', activeTheme.secondary);
    document.documentElement.style.setProperty('--accent-color', activeTheme.accent);
    document.body.style.backgroundColor = activeTheme.bg;
  }, [activeTheme]);

  useEffect(() => {
    const items = activeBoard.items;
    const grid = Array.from({ length: 5 }, (_, r) => 
      items.filter(item => Math.floor(item.position / 5) === r)
           .sort((a, b) => a.position - b.position)
    );

    let count = 0;
    for (let r = 0; r < 5; r++) if (grid[r].every(i => i.isAchieved && i.text)) count++;
    for (let c = 0; c < 5; c++) if (grid.every(r => r[c].isAchieved && r[c].text)) count++;
    if (grid.every((r, idx) => r[idx].isAchieved && r[idx].text)) count++;
    if (grid.every((r, idx) => r[4 - idx].isAchieved && r[4 - idx].text)) count++;

    if (count > bingoCount) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [activeTheme.primary, '#FFD93D', '#6BCB77', '#4D96FF']
      });
    }
    setBingoCount(count);
  }, [activeBoard, bingoCount, activeTheme.primary]);

  const updateActiveBoard = (updates: Partial<BingoBoard>) => {
    setBoards(prev => prev.map(b => 
      b.id === activeBoardId ? { ...b, ...updates, updatedAt: Date.now() } : b
    ));
  };

  const toggleAchievement = (id: string) => {
    const newItems = activeBoard.items.map(item => 
      item.id === id ? { ...item, isAchieved: !item.isAchieved } : item
    );
    updateActiveBoard({ items: newItems });
  };

  const handleSaveSquare = (squareUpdates: Partial<BingoItem>) => {
    if (!editingId) return;
    const newItems = activeBoard.items.map(item => {
      if (item.id === editingId) {
        const isActuallyEmpty = !squareUpdates.text || squareUpdates.text.trim() === '';
        return { 
          ...item, 
          ...squareUpdates, 
          isAchieved: isActuallyEmpty ? false : item.isAchieved 
        };
      }
      return item;
    });
    updateActiveBoard({ items: newItems });
    setEditingId(null);
  };

  const toggleSubGoal = (itemId: string, subGoalId: string) => {
    const newItems = activeBoard.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          subGoals: item.subGoals?.map(sg => sg.id === subGoalId ? { ...sg, isDone: !sg.isDone } : sg)
        };
      }
      return item;
    });
    updateActiveBoard({ items: newItems });
  };

  const autoLayout = () => {
    const sorted = [...activeBoard.items].sort((a, b) => a.difficulty - b.difficulty);
    const insideOutPositions = [12, 7, 11, 13, 17, 6, 8, 16, 18, 2, 10, 14, 22, 1, 3, 5, 9, 15, 19, 21, 23, 0, 4, 20, 24];
    const rearranged = sorted.map((item, idx) => ({ ...item, position: insideOutPositions[idx] })).sort((a, b) => a.position - b.position);
    updateActiveBoard({ items: rearranged });
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    updateActiveBoard({ profile });
  };

  const handleCreateBoard = () => {
    // 最後のボードの翌年を作成
    const lastYear = boards.length > 0 ? Math.max(...boards.map(b => b.profile.year)) : DEFAULT_START_YEAR - 1;
    const nb = createNewBoard(lastYear + 1);
    setBoards(prev => [...prev, nb]);
    setActiveBoardId(nb.id);
    setShowBoardList(false);
  };

  const handlePointerDown = (id: string) => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setEditingId(id);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 500);
  };

  const handlePointerUp = (item: BingoItem) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isLongPress.current) {
      if (item.text) toggleAchievement(item.id);
      else setEditingId(item.id);
    }
  };

  const displayPeriod = activeBoard.profile.month ? t.formatMonth(activeBoard.profile.month) : "";

  const activeItems = activeBoard.items.filter(item => item.text.trim() !== "").sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen max-w-md mx-auto relative flex flex-col p-4 pb-28 select-none overflow-x-hidden">
      <style>{`
        :root {
          --primary: ${activeTheme.primary};
          --secondary: ${activeTheme.secondary};
          --accent: ${activeTheme.accent};
        }
        .handwritten { font-family: 'Kiwi Maru', serif; }
        .text-theme-primary { color: var(--primary); }
        .bg-theme-primary { background-color: var(--primary); }
        .bg-theme-secondary { background-color: var(--secondary); }
        .bg-theme-accent { background-color: var(--accent); }
        .border-theme-primary { border-color: var(--primary); }
        .border-theme-accent { border-color: var(--accent); }
        .shadow-theme { box-shadow: 0 4px 14px 0 var(--primary); }
      `}</style>

      {/* トップ・ユーティリティバー */}
      <div className="flex justify-between items-center mb-4 h-10 px-1">
        <button 
          onClick={() => setShowBoardList(true)} 
          className="p-2 bg-white/50 backdrop-blur rounded-xl shadow-sm text-theme-primary border border-theme-secondary active:scale-95 transition-all"
        >
          <LayoutGrid size={20} />
        </button>

        <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur p-1 rounded-xl border border-theme-secondary shadow-sm">
          {activeTab === 'bingo' && (
            <button 
              onClick={autoLayout} 
              className="p-2 text-theme-primary hover:bg-theme-secondary rounded-lg transition-all"
              title={t.sortBtn}
            >
              <Shuffle size={18} />
            </button>
          )}
          <button 
            onClick={() => setShowShareModal(true)} 
            className="p-2 text-theme-primary hover:bg-theme-secondary rounded-lg transition-all"
            title={t.shareBtn}
          >
            <Share2 size={18} />
          </button>
          
          <button 
            onClick={() => setLang(l => l === 'ja' ? 'en' : 'ja')} 
            className="px-2 py-1 text-[10px] font-black uppercase text-theme-primary hover:bg-theme-secondary rounded-md transition-all border border-theme-secondary/50"
          >
            {lang === 'ja' ? 'EN' : 'JP'}
          </button>
        </div>
      </div>

      {activeTab === 'bingo' ? (
        <div ref={captureRef} className="flex flex-col p-4 rounded-[40px] animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ backgroundColor: activeTheme.bg }}>
          {/* ヘッダー */}
          <header className="text-center py-6">
            <div 
              onClick={() => setShowPeriodModal(true)} 
              className="inline-flex items-center justify-center gap-2 cursor-pointer group px-4 py-2 rounded-full transition-all hover:bg-white/40 active:scale-95"
            >
              <Trophy className="text-yellow-500 flex-shrink-0" size={24} />
              <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tighter handwritten whitespace-nowrap overflow-hidden text-ellipsis pb-1 leading-normal">
                {t.title} {activeBoard.profile.year}{displayPeriod && ` ${displayPeriod}`}
              </h1>
              <Settings2 size={18} className="text-theme-accent opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            <p className="text-gray-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{t.subtitle}</p>
          </header>

          <div className="flex justify-around bg-white/80 backdrop-blur rounded-3xl p-4 mb-6 shadow-sm border border-theme-secondary">
            <div className="text-center">
              <div className="text-2xl font-black text-theme-primary">{activeBoard.items.filter(i => i.isAchieved && i.text).length}</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">{t.achieved}</div>
            </div>
            <div className="w-px bg-theme-secondary my-1"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-theme-primary">{bingoCount}</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">{t.bingo}</div>
            </div>
            <div className="w-px bg-theme-secondary my-1"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-theme-primary">
                {Math.round((activeBoard.items.filter(i => i.isAchieved && i.text).length / 25) * 100)}%
              </div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">{t.progress}</div>
            </div>
          </div>

          <div className="bingo-grid aspect-square bg-theme-accent p-1.5 rounded-3xl shadow-xl shadow-theme/10">
            {activeBoard.items.sort((a, b) => a.position - b.position).map((item) => (
              <div
                key={item.id}
                onPointerDown={() => handlePointerDown(item.id)}
                onPointerUp={() => handlePointerUp(item)}
                onPointerLeave={() => { if (timerRef.current) clearTimeout(timerRef.current); }}
                onContextMenu={(e) => e.preventDefault()}
                className={`
                  relative flex items-center justify-center p-1 sm:p-2 text-[10px] sm:text-[11px] leading-tight text-center aspect-square rounded-xl cursor-pointer transition-all active:scale-95 touch-none overflow-hidden
                  ${item.text ? 'bg-white shadow-sm' : 'bg-white/40 border-2 border-dashed border-white/60'}
                  ${item.isAchieved ? 'opacity-90' : 'hover:shadow-inner'}
                `}
              >
                {item.text ? (
                  <span className={`handwritten font-medium pb-0.5 ${item.isAchieved ? 'text-gray-400 line-through decoration-theme-primary/30' : 'text-gray-700'}`}>
                    {item.text}
                  </span>
                ) : (
                  <span className="text-theme-primary font-bold opacity-30 text-2xl">+</span>
                )}
                
                {item.text && !item.isAchieved && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {Array.from({ length: item.difficulty }).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-theme-accent"></div>
                    ))}
                  </div>
                )}

                {item.isAchieved && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 text-theme-primary transform rotate-12 scale-90">
                    <StampEffect />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <header className="mb-6 px-1">
            <h2 className="text-2xl font-black text-theme-primary tracking-tight flex items-center gap-2">
              <ListTodo size={24} /> {t.detailsTitle}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Action steps for your dreams</p>
          </header>

          <div className="space-y-4">
            {activeItems.length === 0 ? (
              <div className="bg-white/50 border-2 border-dashed border-theme-secondary rounded-[32px] p-10 text-center">
                <p className="text-gray-400 font-bold leading-relaxed">{t.noGoals}</p>
              </div>
            ) : (
              activeItems.map((item) => {
                const completedSubs = item.subGoals?.filter(sg => sg.isDone).length || 0;
                const totalSubs = item.subGoals?.length || 0;
                const subProgress = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-[32px] p-5 shadow-sm border transition-all ${
                      item.isAchieved ? 'border-theme-primary bg-theme-secondary/20' : 'border-theme-secondary/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-theme-secondary text-theme-primary text-[10px] font-black uppercase">
                            SQUARE {item.position + 1}
                          </span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: item.difficulty }).map((_, i) => (
                              <div key={i} className="w-1 h-1 rounded-full bg-theme-accent"></div>
                            ))}
                          </div>
                          {item.isAchieved && (
                            <div 
                              className="px-2 py-0.5 rounded-lg text-white text-[10px] font-black uppercase flex items-center gap-1 animate-in zoom-in" 
                              style={{ backgroundColor: activeTheme.primary }}
                            >
                              <CheckCircle2 size={10} /> {t.achievedBadge}
                            </div>
                          )}
                        </div>
                        <h3 className={`text-lg font-black handwritten transition-all ${
                          item.isAchieved ? 'text-gray-400 line-through decoration-theme-primary/30' : 'text-gray-800'
                        }`}>
                          {item.text}
                        </h3>
                      </div>
                      <button 
                        onClick={() => setEditingId(item.id)}
                        className="p-2 text-theme-primary hover:bg-theme-secondary rounded-full transition-colors flex-shrink-0 ml-2"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>

                    {totalSubs > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-theme-primary transition-all duration-500" style={{ width: `${subProgress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-gray-400">{completedSubs}/{totalSubs}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {item.subGoals?.map(sg => (
                            <div key={sg.id} className="flex items-center gap-2 py-1.5 px-2 hover:bg-theme-secondary/30 rounded-xl transition-colors cursor-pointer" onClick={() => toggleSubGoal(item.id, sg.id)}>
                              <button className="flex-shrink-0" style={{ color: sg.isDone ? activeTheme.primary : '#d1d5db' }}>
                                {sg.isDone ? <CheckSquare size={18} /> : <Square size={18} />}
                              </button>
                              <span className={`text-sm font-medium ${sg.isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{sg.text || "Untitled Step"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setEditingId(item.id)}
                        className="w-full py-3 mt-2 border-2 border-dashed border-theme-secondary rounded-2xl text-[10px] font-black text-theme-accent hover:text-theme-primary hover:border-theme-primary transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> ADD STEPS
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ボトム・タブナビゲーション */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-10 flex justify-center z-40 pointer-events-none">
        <div className="flex items-center bg-gray-900/95 backdrop-blur-xl text-white p-1.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-[280px] pointer-events-auto border border-white/10">
          <button 
            onClick={() => setActiveTab('bingo')}
            className={`flex-1 py-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'bingo' ? 'bg-white text-gray-900 shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <LayoutGrid size={16} />
            {t.tabBingo}
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'details' ? 'bg-white text-gray-900 shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <ListTodo size={16} />
            {t.tabDetails}
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-400 flex flex-col items-center justify-center gap-1 bg-white/30 backdrop-blur py-4 rounded-3xl border border-theme-secondary/50 mb-10">
        <div className="flex items-center gap-1 text-theme-accent font-bold uppercase tracking-widest">
          <Info size={12} /> {t.hintTitle}
        </div>
        <ul className="space-y-0.5 opacity-60 font-medium">
          <li>{t.hint1}</li>
          <li>{t.hint2}</li>
          <li>{t.hint3}</li>
        </ul>
      </div>

      {showBoardList && (
        <BoardListModal lang={lang} boards={boards} activeBoardId={activeBoardId} onSelect={(id) => { setActiveBoardId(id); setShowBoardList(false); }} onCreate={handleCreateBoard} onClose={() => setShowBoardList(false)} />
      )}

      {editingId && (
        <SquareEditor item={activeBoard.items.find(i => i.id === editingId)!} lang={lang} activeTheme={activeTheme} onSave={handleSaveSquare} onClose={() => setEditingId(null)} />
      )}

      {showShareModal && (
        <ShareModal lang={lang} profile={activeBoard.profile} captureRef={captureRef} onClose={() => setShowShareModal(false)} />
      )}

      {showPeriodModal && (
        <PeriodSettingsModal lang={lang} profile={activeBoard.profile} onSave={(p) => { handleUpdateProfile(p); setShowPeriodModal(false); }} onClose={() => setShowPeriodModal(false)} />
      )}

      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-theme-primary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-10 w-60 h-60 bg-yellow-200 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-theme-accent rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default App;
