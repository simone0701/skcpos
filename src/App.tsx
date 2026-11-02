import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { HeaderNav } from './components/common/HeaderNav';
import { POSTerminal } from './components/pos/POSTerminal';
import { CustomerPhoneApp } from './components/mobile/CustomerPhoneApp';
import { AdminBackoffice } from './components/admin/AdminBackoffice';
import { Smartphone, Monitor, Info, CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { viewMode } = usePOS();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
      <HeaderNav />

      {/* Main Viewport Content */}
      <main className="flex-1 p-3 sm:p-5 flex flex-col">
        {/* Split Screen Mode: POS Machine on left + Customer Phone on right */}
        {viewMode === 'split' && (
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start max-w-[1700px] w-full mx-auto">
            {/* Left: POS Cashier Terminal (7 or 8 columns) */}
            <div className="xl:col-span-8 flex flex-col h-[780px]">
              <POSTerminal />
            </div>

            {/* Right: Customer Phone Live Synchronized View (4 or 5 columns) */}
            <div className="xl:col-span-4 flex flex-col items-center justify-start">
              <div className="w-full flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  顧客手機 App（即時連動端）
                </span>
                <span className="text-[10px] text-slate-400">
                  即時接收 POS 送出的點數更新
                </span>
              </div>
              <CustomerPhoneApp />
            </div>
          </div>
        )}

        {/* POS Terminal Only View */}
        {viewMode === 'pos-only' && (
          <div className="flex-1 max-w-6xl w-full mx-auto h-[820px]">
            <POSTerminal />
          </div>
        )}

        {/* Customer Phone Only View */}
        {viewMode === 'phone-only' && (
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <CustomerPhoneApp />
          </div>
        )}

        {/* Member Admin Backoffice View */}
        {viewMode === 'admin' && (
          <div className="flex-1 max-w-7xl w-full mx-auto">
            <AdminBackoffice />
          </div>
        )}
      </main>

      {/* Compact Status Footer */}
      <footer className="border-t border-slate-900 px-6 py-2.5 bg-slate-950 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-emerald-400 font-semibold">POS 會員點數積點系統</span>
          <span>·</span>
          <span>流程: 1.掃描會員 ➔ 2.批次掃描多筆消費 ➔ 3.送出後台 ➔ 4.手機即時同步</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>支援硬體掃描槍 / 虛擬感應</span>
          <span>·</span>
          <span>已加密連線至後台資料庫</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
