import React from 'react';
import { usePOS } from '../../context/POSContext';
import { Volume2, VolumeX, RotateCcw, Monitor, Smartphone, LayoutGrid, ShieldCheck } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const { viewMode, setViewMode, rules, updateRules, resetDemoData } = usePOS();

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white select-none">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-base tracking-wider">
          P
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            BONJAYS CINEMA · 影城會員點數系統
          </span>
          <span className="text-[11px] text-slate-400">
            售票處與餐飲販賣部 POS-01 · 雲端即時連動
          </span>
        </div>
      </div>

      {/* Zone 2: Segmented Viewport Switcher */}
      <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs">
        <button
          onClick={() => setViewMode('split')}
          className={`flex items-center gap-2 px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap ${
            viewMode === 'split'
              ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          title="同時顯示收銀機操作與顧客手機端即時反應"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>雙螢幕連動模式</span>
        </button>

        <button
          onClick={() => setViewMode('pos-only')}
          className={`flex items-center gap-2 px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap ${
            viewMode === 'pos-only'
              ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          title="POS機收銀員觸控介面"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>POS 收銀專屬</span>
        </button>

        <button
          onClick={() => setViewMode('phone-only')}
          className={`flex items-center gap-2 px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap ${
            viewMode === 'phone-only'
              ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          title="顧客端手機 App 餘額檢視"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>顧客手機 App</span>
        </button>

        <button
          onClick={() => setViewMode('admin')}
          className={`flex items-center gap-2 px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap ${
            viewMode === 'admin'
              ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          title="會員後台系統與審核稽核日誌"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>後台管理系統</span>
        </button>
      </div>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => updateRules({ soundEnabled: !rules.soundEnabled })}
          className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
            rules.soundEnabled
              ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
              : 'bg-slate-800/50 border-slate-700/60 text-slate-500 hover:bg-slate-700'
          }`}
          title={rules.soundEnabled ? '點擊關閉掃描音效' : '點擊開啟掃描音效'}
        >
          {rules.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline text-[11px]">
            {rules.soundEnabled ? '掃描音效開' : '音效已靜音'}
          </span>
        </button>

        <button
          onClick={() => {
            if (confirm('確定重置所有演示資料（恢復為預設會員與消費紀錄）？')) {
              resetDemoData();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          title="重置為初始示範狀態"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">重置示範資料</span>
        </button>
      </div>
    </header>
  );
};
