import React, { useState, useEffect, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { SvgBarcode } from '../../utils/barcodeGenerator';
import confetti from 'canvas-confetti';
import {
  Barcode,
  ScanLine,
  Receipt,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Printer,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Ticket,
  Film,
  Coffee,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface CinemaItemPreset {
  barcode: string;
  itemName: string;
  category: '電影票券' | '影城餐飲';
  type: 'ticket' | 'fnb';
  amount: number;
  badge?: string;
}

const CINEMA_PRESETS: CinemaItemPreset[] = [
  // 電影票券類
  { barcode: 'TKT-2D-8801', itemName: '2D 數位電影票 (全票)', category: '電影票券', type: 'ticket', amount: 340, badge: '一般場' },
  { barcode: 'TKT-IMAX-8802', itemName: 'IMAX 巨幕 3D 電影票', category: '電影票券', type: 'ticket', amount: 480, badge: '巨幕場' },
  { barcode: 'TKT-4DX-8803', itemName: '4DX 體感旗艦電影票', category: '電影票券', type: 'ticket', amount: 550, badge: '體感廳' },
  { barcode: 'TKT-VIP-8804', itemName: 'VIP 尊榮豪華廳電影票', category: '電影票券', type: 'ticket', amount: 680, badge: '豪華廳' },
  { barcode: 'TKT-STU-8805', itemName: '早場 / 學生特惠電影票', category: '電影票券', type: 'ticket', amount: 280, badge: '特惠票' },

  // 影城餐飲類
  { barcode: 'FNB-POP-7701', itemName: '經典焦糖爆米花 (大)', category: '影城餐飲', type: 'fnb', amount: 180, badge: '熱銷' },
  { barcode: 'FNB-COLA-7702', itemName: '特大杯碳酸飲料 (可樂/雪碧)', category: '影城餐飲', type: 'fnb', amount: 90 },
  { barcode: 'FNB-SET-7703', itemName: '經典雙人餐 (大爆米花+中可2杯+熱狗堡)', category: '影城餐飲', type: 'fnb', amount: 340, badge: '套餐' },
  { barcode: 'FNB-HOT-7704', itemName: '美式起司牛肉熱狗堡', category: '影城餐飲', type: 'fnb', amount: 150 },
  { barcode: 'FNB-CHURRO-7705', itemName: '現炸肉桂糖霜吉拿棒', category: '影城餐飲', type: 'fnb', amount: 130 },
  { barcode: 'FNB-NACHO-7706', itemName: '墨西哥起司玉米脆片佐莎莎醬', category: '影城餐飲', type: 'fnb', amount: 160 },
];

export const POSTerminal: React.FC = () => {
  const {
    currentStep,
    setCurrentStep,
    scannedMember,
    scannedItems,
    members,
    scanMemberByBarcode,
    addConsumptionItem,
    removeConsumptionItem,
    clearScannedItems,
    submitTransaction,
    resetPOSTransaction,
    cashierName,
    posTerminalId,
    lastCompletedBatch,
  } = usePOS();

  // Inputs & states
  const [memberBarcodeInput, setMemberBarcodeInput] = useState('');
  const [memberScanError, setMemberScanError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Consumption scan inputs
  const [itemBarcodeInput, setItemBarcodeInput] = useState('');
  const [consumptionScanMsg, setConsumptionScanMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'ticket' | 'fnb'>('all');
  const [cashierNotes, setCashierNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual fast input
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState<'電影票券' | '影城餐飲'>('電影票券');
  const [manualAmount, setManualAmount] = useState('');

  // Input auto-focus
  const memberInputRef = useRef<HTMLInputElement>(null);
  const itemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentStep === 1) {
      setMemberBarcodeInput('');
      memberInputRef.current?.focus();
    } else if (currentStep === 2) {
      setItemBarcodeInput('');
      itemInputRef.current?.focus();
    }
  }, [currentStep]);

  // Handle Step 1 Member Scan
  const handleMemberScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const barcodeToScan = memberBarcodeInput.trim();
    if (!barcodeToScan) {
      setMemberScanError('請掃描或輸入顧客會員條碼');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const res = scanMemberByBarcode(barcodeToScan);
    if (res.success && res.member) {
      // Direct jump to consumption scan page (Step 2)
      setMemberScanError(null);
      setMemberBarcodeInput('');
      setConsumptionScanMsg({
        text: `✓ 會員認證成功：【${res.member.name}】已直接進入消費掃描頁面`,
      });
      setCurrentStep(2);
    } else {
      // STRICTLY BLOCK: Do not advance, trigger visual shake and error warning
      setMemberScanError(`🛑 條碼不匹配！系統已阻擋進入消費掃描：查無此會員條碼 [${barcodeToScan}]，請核對顧客條碼。`);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      memberInputRef.current?.select();
    }
  };

  const handleQuickMemberSelect = (barcode: string) => {
    const res = scanMemberByBarcode(barcode);
    if (res.success && res.member) {
      setMemberScanError(null);
      setMemberBarcodeInput('');
      setConsumptionScanMsg({
        text: `✓ 會員認證成功：【${res.member.name}】已直接進入消費掃描頁面`,
      });
      setCurrentStep(2);
    } else {
      setMemberScanError(`🛑 條碼不匹配！系統已阻擋進入消費掃描：查無此會員條碼 [${barcode}]，請核對顧客條碼。`);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Handle Step 2 Consumption Item Scan
  const handleItemScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = itemBarcodeInput.trim();
    if (!cleanInput) {
      setConsumptionScanMsg({ text: '請輸入或掃描電影票或餐飲單號條碼', isError: true });
      return;
    }

    // Match preset or auto categorize
    const preset = CINEMA_PRESETS.find(
      (p) => p.barcode.toLowerCase() === cleanInput.toLowerCase()
    );

    if (preset) {
      const res = addConsumptionItem({
        barcode: preset.barcode,
        itemName: preset.itemName,
        category: preset.category,
        amount: preset.amount,
        receiptNo: preset.barcode,
      });
      setConsumptionScanMsg({ text: res.message });
      setItemBarcodeInput('');
    } else {
      const codeUpper = cleanInput.toUpperCase();
      const isTicket = codeUpper.startsWith('TKT') || codeUpper.startsWith('TIC');
      const isFnb = codeUpper.startsWith('FNB') || codeUpper.startsWith('FOOD') || codeUpper.startsWith('POP');

      const category = isTicket ? '電影票券' : isFnb ? '影城餐飲' : '電影票券';
      const name = isTicket
        ? `電影票 (${cleanInput})`
        : isFnb
        ? `影城餐飲 (${cleanInput})`
        : `消費單據 (${cleanInput})`;
      const amount = isTicket ? 340 : 180;

      const res = addConsumptionItem({
        barcode: cleanInput,
        itemName: name,
        category,
        amount,
        receiptNo: cleanInput,
      });
      setConsumptionScanMsg({ text: res.message });
      setItemBarcodeInput('');
    }
  };

  const handleQuickAddPreset = (preset: CinemaItemPreset) => {
    const res = addConsumptionItem({
      barcode: `${preset.barcode}-${scannedItems.length + 1}`,
      itemName: preset.itemName,
      category: preset.category,
      amount: preset.amount,
      receiptNo: preset.barcode,
    });
    setConsumptionScanMsg({ text: res.message });
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(manualAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setConsumptionScanMsg({ text: '請輸入有效之消費金額', isError: true });
      return;
    }
    const name = manualName.trim() || (manualCategory === '電影票券' ? '自訂電影票券' : '自訂影城餐飲');
    const res = addConsumptionItem({
      itemName: name,
      category: manualCategory,
      amount: amountNum,
      barcode: `MANUAL-${Date.now().toString().slice(-4)}`,
    });
    setConsumptionScanMsg({ text: res.message });
    setManualAmount('');
    setManualName('');
  };

  // Handle Step 3 Final Submit
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitTransaction(cashierNotes);
      if (res.success) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = scannedItems.reduce((acc, it) => acc + it.amount, 0);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* POS Top Terminal Header (Clean & Professional) */}
      <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">
                影城售票與餐飲 POS 收銀端
              </span>
              <span className="text-xs px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono">
                {posTerminalId}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>操作人員: {cashierName}</span>
              <span>·</span>
              <span className="text-emerald-400">系統連線正常</span>
            </div>
          </div>
        </div>

        {/* Workflow Progress Steps */}
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { step: 1 as const, label: '1. 掃描會員條碼' },
            { step: 2 as const, label: '2. 掃描消費 (票券/餐飲)' },
            { step: 3 as const, label: '3. 核對送出' },
            { step: 4 as const, label: '4. 完成' },
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isPassed = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step > 1 && !scannedMember) {
                    setMemberScanError('🛑 請先於步驟 1 掃描有效會員條碼，驗證成功後方可進行消費掃描！');
                    setIsShaking(true);
                    setTimeout(() => setIsShaking(false), 500);
                    return;
                  }
                  if (s.step === 3 && scannedItems.length === 0) {
                    setConsumptionScanMsg({ text: '尚未掃入任何消費明細，無法送出', isError: true });
                    return;
                  }
                  setCurrentStep(s.step);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : isPassed
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                    {s.step}
                  </span>
                )}
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* POS Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-950">
        {/* ================= STEP 1: SCAN MEMBER BARCODE ================= */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-6 pt-4">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                步驟 1 / 4
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                請掃描顧客會員條碼
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                掃描確認有此會員後<strong className="text-emerald-400 font-semibold">直接進入消費掃描頁面</strong>；若非匹配條碼將阻擋進入。
              </p>
            </div>

            {/* Member Scanner Card */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center overflow-hidden transition-all ${
                isShaking ? 'animate-shake' : ''
              } ${
                memberScanError
                  ? 'border-red-500/80 bg-red-950/20'
                  : 'border-slate-700 bg-slate-900/70'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-1 ${
                    memberScanError
                      ? 'bg-red-900/30 border-red-500 text-red-400'
                      : 'bg-slate-800 border-slate-700 text-emerald-400'
                  }`}
                >
                  <ScanLine className="w-7 h-7" />
                </div>
                <span className="text-xs text-slate-300 font-medium">
                  使用條碼掃描槍對準顧客手機會員卡條碼
                </span>

                {/* Form Input for Barcode Gun */}
                <form
                  onSubmit={handleMemberScanSubmit}
                  className="w-full max-w-md flex items-center gap-2 mt-1"
                >
                  <div className="relative flex-1">
                    <input
                      ref={memberInputRef}
                      type="text"
                      value={memberBarcodeInput}
                      onChange={(e) => {
                        setMemberBarcodeInput(e.target.value);
                        if (memberScanError) setMemberScanError(null);
                      }}
                      placeholder="掃描會員條碼 (如 MB-88029145)"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none font-mono ${
                        memberScanError
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                          : 'border-slate-700 focus:ring-2 focus:ring-emerald-500'
                      }`}
                    />
                    <Barcode className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors whitespace-nowrap cursor-pointer shadow-md"
                  >
                    讀取條碼
                  </button>
                </form>

                {/* Strict Blocking Warning Banner */}
                {memberScanError && (
                  <div className="w-full max-w-md flex items-start gap-2.5 text-red-300 text-xs bg-red-950/70 border border-red-500/80 p-3 rounded-xl mt-3 text-left">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-red-200">
                        {memberScanError}
                      </div>
                      <div className="text-[11px] text-red-400">
                        安全機制：非系統會員條碼禁止進行消費掃描。
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Testing Shortcuts for Cashier */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-300">快速測試快捷鍵（點選有效會員條碼直接通關）：</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleQuickMemberSelect(m.barcode)}
                    className="text-left p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-emerald-500/60 hover:bg-slate-800 transition-all cursor-pointer group"
                    title={`點選以 ${m.name} 條碼直接刷入`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
                        {m.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-400/20">
                        {m.tierName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1 flex items-center justify-between">
                      <span>{m.barcode}</span>
                      <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        直接通關 ➔
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Strict Block Testing Button */}
              <div className="pt-1">
                <button
                  onClick={() => handleQuickMemberSelect('MB-INVALID-888999')}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-300 text-xs font-medium transition-all cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>模擬掃描「非匹配條碼」(MB-INVALID-888999) 測試系統阻擋</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SCAN MULTIPLE CONSUMPTION RECORDS ================= */}
        {currentStep === 2 && (
          !scannedMember ? (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">未檢測到有效會員身分</h3>
                <p className="text-xs text-slate-400">
                  必須先於步驟 1 掃描確認為會員，方可進行消費掃描。
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                返回步驟 1 重新掃描會員條碼
              </button>
            </div>
          ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Clean Reminder Callout (Explicit Staff Guideline) */}
            <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-amber-200 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>提醒工作人員：</strong>消費資訊包含<strong>電影票</strong>與<strong>影城餐飲</strong>，可能不只一筆，<strong>請等全部掃完再按下一步才可送出</strong>。
              </span>
            </div>

            {/* Active Member Verified Header (Clean, strictly no point calculations) */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  {scannedMember.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {scannedMember.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-medium">
                      ✓ 已驗證會員
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-400/20">
                      {scannedMember.tierName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    會員卡號: {scannedMember.memberCode} · 電話: {scannedMember.phone}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setMemberScanError(null);
                }}
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>更換會員</span>
              </button>
            </div>

            {/* Scanner Input for Movie Tickets & F&B */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-emerald-400" />
                  掃描消費條碼（電影票券、爆米花餐飲單據，支援掃描槍連續刷入）
                </span>
                <span className="text-slate-400 text-[11px]">
                  目前已刷入: <strong className="text-emerald-400 font-mono">{scannedItems.length}</strong> 筆
                </span>
              </div>

              <form onSubmit={handleItemScanSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={itemInputRef}
                    type="text"
                    value={itemBarcodeInput}
                    onChange={(e) => setItemBarcodeInput(e.target.value)}
                    placeholder="對準條碼槍掃描，或輸入票券/餐飲單號 (例: TKT-2D-8801, FNB-POP-7701)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <Barcode className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors whitespace-nowrap cursor-pointer shadow-md"
                >
                  刷入此筆
                </button>
              </form>

              {/* Feedback toast */}
              {consumptionScanMsg && (
                <div
                  className={`text-xs px-3 py-2 rounded-lg flex items-center justify-between ${
                    consumptionScanMsg.isError
                      ? 'bg-red-950/40 border border-red-800 text-red-300'
                      : 'bg-emerald-950/40 border border-emerald-800/70 text-emerald-300'
                  }`}
                >
                  <span>{consumptionScanMsg.text}</span>
                  <button
                    onClick={() => setConsumptionScanMsg(null)}
                    className="text-slate-400 hover:text-white ml-2 text-[10px]"
                  >
                    關閉
                  </button>
                </div>
              )}

              {/* Cinema Preset Items: Movie Tickets & Concessions */}
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-emerald-400" />
                    影城專用快捷刷入（點擊即可連續加入票券與餐飲）：
                  </span>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setActiveCategoryTab('all')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeCategoryTab === 'all'
                          ? 'bg-slate-800 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      全部品項 ({CINEMA_PRESETS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCategoryTab('ticket')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                        activeCategoryTab === 'ticket'
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Ticket className="w-3 h-3" />
                      <span>電影票券 (5)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCategoryTab('fnb')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                        activeCategoryTab === 'fnb'
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Coffee className="w-3 h-3" />
                      <span>影城餐飲 (6)</span>
                    </button>
                  </div>
                </div>

                {/* Preset Item Cards (Clean: Name, Category, Price only, NO points) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {CINEMA_PRESETS.filter(
                    (p) => activeCategoryTab === 'all' || p.type === activeCategoryTab
                  ).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickAddPreset(preset)}
                      className="text-xs p-2.5 bg-slate-800/80 hover:bg-slate-700 hover:border-emerald-500/50 text-slate-200 border border-slate-700/80 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 text-emerald-400">
                          {preset.type === 'ticket' ? (
                            <Ticket className="w-3.5 h-3.5" />
                          ) : (
                            <Coffee className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="truncate">
                          <div className="font-medium text-white group-hover:text-emerald-300 transition-colors truncate">
                            {preset.itemName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {preset.category} · {preset.barcode}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-mono text-emerald-400 font-bold tabular-nums">
                          ${preset.amount.toLocaleString()}
                        </span>
                        {preset.badge && (
                          <span className="text-[9px] px-1 rounded bg-slate-900 text-amber-300 border border-amber-400/20">
                            {preset.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Manual input drawer for special items */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer font-medium flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{showManualInput ? '收起手動輸入' : '手動輸入特殊票種或特製餐點'}</span>
                  </button>

                  {showManualInput && (
                    <form onSubmit={handleManualAdd} className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap gap-2 items-center">
                      <input
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="品項名稱 (例: 影廳特映首映票、特大杯黑咖啡)"
                        className="flex-1 min-w-[160px] px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <select
                        value={manualCategory}
                        onChange={(e) => setManualCategory(e.target.value as any)}
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="電影票券">電影票券</option>
                        <option value="影城餐飲">影城餐飲</option>
                      </select>
                      <input
                        type="number"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="金額 (例: 360)"
                        className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap cursor-pointer"
                      >
                        加入清單
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Scanned Items Table (Clean, Sharp, No points column) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm text-white">
                    已掃描之消費品項清單
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    共 {scannedItems.length} 筆
                  </span>
                </div>

                {scannedItems.length > 0 && (
                  <button
                    onClick={clearScannedItems}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>清空全部</span>
                  </button>
                )}
              </div>

              {scannedItems.length === 0 ? (
                <div className="py-10 text-center text-slate-500 space-y-2">
                  <ScanLine className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                  <div className="text-sm font-medium text-slate-400">
                    目前尚未掃入任何電影票券或餐飲品項
                  </div>
                  <div className="text-xs text-slate-500 max-w-sm mx-auto">
                    請使用掃描槍讀取單據條碼，或點擊上方快捷品項快速刷入。
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                  {scannedItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="px-5 py-2.5 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-mono">
                          {scannedItems.length - idx}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-white flex items-center gap-2">
                            <span>{item.itemName}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                              item.category === '電影票券'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                                : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                            }`}>
                              {item.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                            <span>條碼: {item.barcode}</span>
                            <span>·</span>
                            <span>時間: {item.scannedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white font-mono tabular-nums">
                          ${item.amount.toLocaleString()}
                        </span>

                        <button
                          onClick={() => removeConsumptionItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                          title="移除此項"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Running Tally Bottom Bar: Staff view (Only Items & Amount, No Points) */}
              {scannedItems.length > 0 && (
                <div className="bg-slate-950 border-t border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-8">
                    <div>
                      <div className="text-[11px] text-slate-400">已掃描消費總筆數</div>
                      <div className="text-base font-bold text-white font-mono">
                        {scannedItems.length} 筆
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">本次消費總金額</div>
                      <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
                        NT$ {totalAmount.toLocaleString()} 元
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Step 3 Button */}
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={scannedItems.length === 0}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md whitespace-nowrap cursor-pointer hover:scale-[1.01]"
                  >
                    <span>全部掃描完畢，下一步確認送出 ➔</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          )
        )}

        {/* ================= STEP 3: REVIEW & SUBMIT TO BACKEND (Clean Staff View) ================= */}
        {currentStep === 3 && scannedMember && (
          <div className="max-w-xl mx-auto space-y-5 pt-2">
            <div className="text-center space-y-1">
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                步驟 3 / 4
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                核對消費資訊並送出
              </h2>
              <p className="text-xs text-slate-400">
                核對消費品項與金額無誤後送出，後台將更新會員點數並即時推播至顧客手機 App。
              </p>
            </div>

            {/* Clean Review Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              {/* Member Profile in Review */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base font-bold text-emerald-400">
                    {scannedMember.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {scannedMember.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-medium border border-amber-400/30">
                        {scannedMember.tierName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      卡號: {scannedMember.memberCode} · 手機: {scannedMember.phone}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-400">消費單據</div>
                  <div className="text-sm font-bold text-white font-mono">
                    共 {scannedItems.length} 筆
                  </div>
                </div>
              </div>

              {/* Scanned Items Summary List */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-400 flex items-center justify-between px-1">
                  <span>消費品項清單（電影票 / 影城餐飲）</span>
                  <span>金額</span>
                </div>
                <div className="bg-slate-950/80 rounded-xl p-3 divide-y divide-slate-800/70 max-h-48 overflow-y-auto">
                  {scannedItems.map((item, idx) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="truncate mr-3">
                        <span className="text-slate-300 font-medium">
                          {idx + 1}. {item.itemName}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px] ml-1.5">
                          [{item.category}]
                        </span>
                      </div>
                      <span className="text-white font-mono font-semibold tabular-nums shrink-0">
                        ${item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clean Total Bar */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">本次結帳總金額</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    共 {scannedItems.length} 筆消費
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                  NT$ {totalAmount.toLocaleString()} 元
                </div>
              </div>

              {/* Notice */}
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                ✓ 點擊「確認送出」後，會員後台將自動根據消費進行點數更新，並即時推播至顧客手機 App 顯示最新餘額。
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  返回補掃
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>確認送出至會員後台系統 ➔</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: SUCCESS & COMPLETION ================= */}
        {currentStep === 4 && lastCompletedBatch && (
          <div className="max-w-md mx-auto space-y-6 pt-2">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">
                消費已送出！點數已更新入帳
              </h2>
              <p className="text-xs text-slate-400">
                後台系統已完成點數更新，顧客手機 App 已即時顯示最新點數餘額。
              </p>
            </div>

            {/* Thermal Slip Simulation */}
            <div className="bg-white text-slate-900 rounded-lg p-5 shadow-2xl font-mono text-xs border-t-8 border-emerald-500">
              <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
                <div className="font-bold text-sm tracking-widest">BONJAYS 旗艦影城</div>
                <div className="text-[10px] text-slate-500">電影票券與餐飲消費積點憑單</div>
                <div className="text-[10px] text-slate-500 mt-1">單號: {lastCompletedBatch.batchNo}</div>
                <div className="text-[10px] text-slate-500">{lastCompletedBatch.submittedAt}</div>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span>會員姓名:</span>
                  <span className="font-bold">{lastCompletedBatch.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span>會員卡號:</span>
                  <span>{lastCompletedBatch.memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span>收銀機台:</span>
                  <span>{lastCompletedBatch.posTerminalId}</span>
                </div>
              </div>

              {/* Items */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1">
                <div className="font-bold text-[11px] mb-1">消費明細 ({lastCompletedBatch.items.length} 筆):</div>
                {lastCompletedBatch.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[190px]">{it.itemName}</span>
                    <span className="tabular-nums">${it.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="pt-2.5 pb-1 space-y-1 text-slate-800">
                <div className="flex justify-between font-bold text-sm">
                  <span>本次消費總額:</span>
                  <span>${lastCompletedBatch.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold text-xs">
                  <span>後台核算點數:</span>
                  <span>+{lastCompletedBatch.totalPointsEarned.toLocaleString()} 點</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px] pt-1">
                  <span>原點數餘額:</span>
                  <span>{lastCompletedBatch.oldPointsBalance.toLocaleString()} 點</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-slate-200 pt-1 text-slate-900">
                  <span>最新點數餘額:</span>
                  <span className="text-emerald-600">{lastCompletedBatch.newPointsBalance.toLocaleString()} 點</span>
                </div>
              </div>

              {/* Barcode */}
              <div className="pt-3 border-t border-dashed border-slate-300 text-center">
                <SvgBarcode value={lastCompletedBatch.batchNo} height={35} showText={true} />
                <div className="text-[9px] text-slate-400 mt-1">謝謝惠顧 · 最新點數餘額已即時更新於手機 App</div>
              </div>
            </div>

            {/* Next Customer Button */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>列印單據</span>
              </button>

              <button
                type="button"
                onClick={resetPOSTransaction}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>服務下一位顧客</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
