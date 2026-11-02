import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { SvgBarcode, SvgQrCode } from '../../utils/barcodeGenerator';
import {
  Smartphone,
  Wifi,
  Battery,
  Bell,
  Sparkles,
  CreditCard,
  History,
  Gift,
  QrCode,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';

export const CustomerPhoneApp: React.FC = () => {
  const {
    members,
    selectedCustomerPhoneMemberId,
    setSelectedCustomerPhoneMemberId,
    liveNotification,
    dismissLiveNotification,
    auditLogs,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'card' | 'history' | 'rewards'>('card');
  const [displayPoints, setDisplayPoints] = useState<number>(0);
  const [isPointsBumping, setIsPointsBumping] = useState(false);

  // Active member
  const member = members.find((m) => m.id === selectedCustomerPhoneMemberId) || members[0];

  // Animated points ticker
  useEffect(() => {
    if (!member) return;

    const target = member.currentPoints;
    if (displayPoints === target) return;

    setIsPointsBumping(true);
    const duration = 1200; // ms
    const start = displayPoints;
    const diff = target - start;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + diff * ease);

      setDisplayPoints(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayPoints(target);
        setTimeout(() => setIsPointsBumping(false), 300);
      }
    };

    requestAnimationFrame(animate);
  }, [member?.currentPoints]);

  // Initial sync
  useEffect(() => {
    if (member && displayPoints === 0) {
      setDisplayPoints(member.currentPoints);
    }
  }, [member?.id]);

  if (!member) return null;

  // Member's audit logs
  const memberLogs = auditLogs.filter((log) => log.memberId === member.id);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Smartphone Frame Outer Bezel */}
      <div className="w-[370px] max-w-full h-[730px] bg-slate-900 border-[10px] border-slate-800 rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden relative ring-1 ring-slate-700/50">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-3 border border-slate-800" />
        </div>

        {/* Smartphone Screen Header / Status Bar */}
        <div className="pt-2 px-6 pb-1 bg-slate-950 text-slate-300 text-xs flex items-center justify-between z-40">
          <span className="font-semibold text-[11px] tracking-tight">20:20</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[10px] font-bold text-emerald-400">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Live Push Notification Toast (Animated when POS submits!) */}
        {liveNotification && liveNotification.memberId === member.id && (
          <div className="absolute top-9 left-3 right-3 z-50 bg-slate-900/95 border border-emerald-500/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md animate-bounce duration-500">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-emerald-400">
                      BONJAYS 影城點數即時入帳！
                    </span>
                    <span className="text-[9px] text-slate-400">剛剛</span>
                  </div>
                  <div className="text-xs text-white font-medium mt-0.5">
                    影城消費 ${liveNotification.totalSpent.toLocaleString()} 累積{' '}
                    <strong className="text-emerald-400 font-bold font-mono">
                      +{liveNotification.pointsAdded.toLocaleString()} 點
                    </strong>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    包含電影票券與餐飲 · 最新餘額: {liveNotification.newBalance.toLocaleString()} 點
                  </div>
                </div>
              </div>

              <button
                onClick={dismissLiveNotification}
                className="text-slate-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* App Top Bar & Member Switcher */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-900 flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">
              C
            </div>
            <span className="font-bold text-xs text-white tracking-wide">
              BONJAYS CINEMA
            </span>
          </div>

          {/* Quick Member Switcher inside phone */}
          <select
            value={selectedCustomerPhoneMemberId}
            onChange={(e) => setSelectedCustomerPhoneMemberId(e.target.value)}
            className="text-[11px] bg-slate-900 text-slate-200 border border-slate-700/80 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            title="切換顧客手機視角"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                顧客: {m.name} ({m.tierName})
              </option>
            ))}
          </select>
        </div>

        {/* Phone Scrollable App Body */}
        <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4">
          {/* TAB 1: MEMBER CARD & BARCODE VIEW */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              {/* Virtual Membership Card */}
              <div
                className={`relative rounded-3xl p-5 text-white shadow-xl overflow-hidden border ${
                  member.tier === 'DIAMOND'
                    ? 'bg-gradient-to-br from-slate-900 via-neutral-900 to-black border-slate-700 shadow-slate-900/60'
                    : member.tier === 'GOLD'
                    ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-900 border-amber-500/40 shadow-amber-950/40'
                    : 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 border-emerald-600/40 shadow-emerald-950/40'
                }`}
              >
                {/* Decorative sheen */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/50 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                        {member.name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <div className="text-base font-bold tracking-tight">
                        {member.name}
                      </div>
                      <div className="text-[11px] opacity-80 font-mono">
                        {member.phone}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/20 tracking-wider uppercase">
                    {member.tierName}
                  </span>
                </div>

                {/* Points Counter with Bump Animation */}
                <div className="mt-5 relative z-10">
                  <div className="text-[11px] text-white/80 font-medium flex items-center justify-between">
                    <span>當前累積可用點數</span>
                    <span className="text-[10px] opacity-90">
                      享受 {member.tierMultiplier}x 倍速積點
                    </span>
                  </div>
                  <div
                    className={`text-3xl font-extrabold tracking-tight font-mono tabular-nums flex items-baseline gap-1 mt-0.5 transition-transform duration-300 ${
                      isPointsBumping ? 'scale-110 text-amber-300' : 'text-white'
                    }`}
                  >
                    <span>{displayPoints.toLocaleString()}</span>
                    <span className="text-sm font-normal opacity-80">點</span>
                  </div>
                  <div className="text-[10px] text-white/70 mt-1">
                    折抵價值約 NT${displayPoints.toLocaleString()} 元 · 無期限永久有效
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] opacity-75 relative z-10 font-mono">
                  <span>卡號: {member.memberCode}</span>
                  <span>加入: {member.joinedDate}</span>
                </div>
              </div>

              {/* Barcode & QR Code Section for POS scanning */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    結帳請出示會員條碼
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    即時感應中
                  </span>
                </div>

                {/* Member Barcode */}
                <div className="bg-white p-2.5 rounded-xl text-slate-950 flex flex-col items-center shadow-inner">
                  <SvgBarcode
                    value={member.barcode}
                    height={52}
                    showText={true}
                    lightBackground={true}
                  />
                </div>

                {/* Member QR Code */}
                <div className="flex justify-center pt-1">
                  <SvgQrCode value={`BONJAYS-MEM-${member.barcode}`} size={110} />
                </div>

                <p className="text-[11px] text-slate-400">
                  結帳時請主動出示此條碼供 POS 掃描積點
                </p>
              </div>

              {/* Quick Perks Overview */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>會員專屬禮遇</span>
                  <span className="text-[10px] text-emerald-400">
                    累計消費 ${member.totalSpent.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
                    <div className="text-amber-400 font-bold text-sm">
                      {member.tierMultiplier}x
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">點數倍率加速</div>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
                    <div className="text-emerald-400 font-bold text-sm">每 $10 = 1點</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">滿額自動升等</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REAL-TIME POINTS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-200">
                  點數即時異動紀錄 ({memberLogs.length})
                </span>
                <span className="text-[10px] text-emerald-400">
                  即時自動同步中
                </span>
              </div>

              {memberLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  尚無點數異動紀錄，完成 POS 結帳後將即時顯示於此。
                </div>
              ) : (
                <div className="space-y-2">
                  {memberLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">
                          影城消費積點（{log.itemCount} 筆電影票/餐飲單據）
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          +{log.pointsChange} 點
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>單號: {log.batchNo}</span>
                        <span>消費總額: ${log.totalSpend.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                        <span>時間: {log.timestamp}</span>
                        <span>結餘: {log.balanceAfter} 點</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REWARDS REDEMPTION */}
          {activeTab === 'rewards' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-200">
                影城會員點數兌換精選專區
              </div>
              {[
                { name: '2D 電影票平日免費兌換券', pts: 800, tag: '超人氣' },
                { name: '雙人焦糖爆米花+可樂套餐券', pts: 350, tag: '觀影必備' },
                { name: '影城售票與餐飲 100 元折抵券', pts: 200, tag: '現金折抵' },
                { name: '特大杯碳酸飲料升級兌換券', pts: 80, tag: '超值' },
              ].map((reward, idx) => {
                const canAfford = member.currentPoints >= reward.pts;
                return (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {reward.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                          {reward.tag}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                        {reward.pts} 點
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? '立即兌換' : '點數不足'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Smartphone Bottom Navigation Bar */}
        <div className="bg-slate-950 border-t border-slate-900 px-4 py-2 flex items-center justify-around z-30">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex flex-col items-center gap-0.5 text-xs transition-colors cursor-pointer ${
              activeTab === 'card' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-[10px]">會員卡</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-0.5 text-xs transition-colors cursor-pointer ${
              activeTab === 'history' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="text-[10px]">即時明細</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex flex-col items-center gap-0.5 text-xs transition-colors cursor-pointer ${
              activeTab === 'rewards' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span className="text-[10px]">兌換好禮</span>
          </button>
        </div>

        {/* Smartphone Home Indicator Bar */}
        <div className="py-1.5 bg-slate-950 flex justify-center">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
