import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Member,
  ConsumptionItem,
  TransactionBatch,
  PointAuditLog,
  SystemRuleConfig,
} from '../types/pos';
import { playScanBeep, playItemScanBeep, playSuccessChime, playErrorBuzzer } from '../utils/audio';

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem_01',
    memberCode: 'VIP-880291',
    barcode: 'MB-88029145',
    name: '林曉芬',
    phone: '0912-888-567',
    tier: 'GOLD',
    tierName: '尊榮金卡',
    tierMultiplier: 1.2,
    currentPoints: 1420,
    avatarUrl: '/src/assets/images/avatar_member_female_1792552670241.jpg',
    totalSpent: 48500,
    joinedDate: '2023-04-15',
    cardTheme: 'gold',
  },
  {
    id: 'mem_02',
    memberCode: 'DIA-993812',
    barcode: 'MB-99381204',
    name: '陳建宏',
    phone: '0928-333-789',
    tier: 'DIAMOND',
    tierName: '頂級黑鑽卡',
    tierMultiplier: 1.5,
    currentPoints: 3850,
    avatarUrl: '/src/assets/images/avatar_member_male_1792552685479.jpg',
    totalSpent: 126000,
    joinedDate: '2022-09-01',
    cardTheme: 'slate',
  },
  {
    id: 'mem_03',
    memberCode: 'SLV-771928',
    barcode: 'MB-77192834',
    name: '黃志明',
    phone: '0935-123-999',
    tier: 'SILVER',
    tierName: '標準銀卡',
    tierMultiplier: 1.0,
    currentPoints: 460,
    avatarUrl: '',
    totalSpent: 15200,
    joinedDate: '2024-01-10',
    cardTheme: 'emerald',
  },
];

const INITIAL_RULES: SystemRuleConfig = {
  pointsPerDollar: 0.1, // $10 = 1 point (10% rate)
  silverMultiplier: 1.0,
  goldMultiplier: 1.2,
  diamondMultiplier: 1.5,
  doublePointsCampaign: false,
  soundEnabled: true,
};

const INITIAL_AUDIT_LOGS: PointAuditLog[] = [
  {
    id: 'log_seed_1',
    batchId: 'tx_seed_1',
    batchNo: 'TX-20261021-019',
    memberId: 'mem_01',
    memberName: '林曉芬',
    type: 'CONSUMPTION_POINTS',
    pointsChange: 180,
    balanceBefore: 1240,
    balanceAfter: 1420,
    totalSpend: 1500,
    itemCount: 3,
    timestamp: '2026-10-21 18:32:10',
    cashier: '陳思妤 (No.042 影城櫃台)',
  },
  {
    id: 'log_seed_2',
    batchId: 'tx_seed_2',
    batchNo: 'TX-20261021-018',
    memberId: 'mem_02',
    memberName: '陳建宏',
    type: 'CONSUMPTION_POINTS',
    pointsChange: 450,
    balanceBefore: 3400,
    balanceAfter: 3850,
    totalSpend: 2500,
    itemCount: 4,
    timestamp: '2026-10-21 17:15:45',
    cashier: '陳思妤 (No.042 影城櫃台)',
  },
];

export interface LiveNotification {
  id: string;
  memberId: string;
  memberName: string;
  pointsAdded: number;
  newBalance: number;
  totalSpent: number;
  itemCount: number;
  timestamp: string;
}

interface POSContextType {
  members: Member[];
  selectedCustomerPhoneMemberId: string;
  setSelectedCustomerPhoneMemberId: (id: string) => void;
  rules: SystemRuleConfig;
  updateRules: (newRules: Partial<SystemRuleConfig>) => void;
  auditLogs: PointAuditLog[];
  completedTransactions: TransactionBatch[];

  // Active POS Session
  currentStep: 1 | 2 | 3 | 4;
  setCurrentStep: (step: 1 | 2 | 3 | 4) => void;
  scannedMember: Member | null;
  scannedItems: ConsumptionItem[];
  posTerminalId: string;
  cashierName: string;
  lastCompletedBatch: TransactionBatch | null;

  // Actions
  scanMemberByBarcode: (barcodeOrCode: string) => { success: boolean; message: string; member?: Member };
  addConsumptionItem: (item: {
    barcode?: string;
    itemName: string;
    category: string;
    amount: number;
    receiptNo?: string;
  }) => { success: boolean; message: string };
  removeConsumptionItem: (itemId: string) => void;
  clearScannedItems: () => void;
  submitTransaction: (cashierNotes?: string) => Promise<{ success: boolean; batch?: TransactionBatch }>;
  resetPOSTransaction: () => void;
  resetDemoData: () => void;

  // Live Sync & Alerts
  liveNotification: LiveNotification | null;
  dismissLiveNotification: () => void;
  viewMode: 'split' | 'pos-only' | 'phone-only' | 'admin';
  setViewMode: (mode: 'split' | 'pos-only' | 'phone-only' | 'admin') => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('bonjays_pos_members');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [rules, setRules] = useState<SystemRuleConfig>(() => {
    try {
      const saved = localStorage.getItem('bonjays_pos_rules');
      return saved ? JSON.parse(saved) : INITIAL_RULES;
    } catch {
      return INITIAL_RULES;
    }
  });

  const [auditLogs, setAuditLogs] = useState<PointAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('bonjays_pos_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [completedTransactions, setCompletedTransactions] = useState<TransactionBatch[]>([]);

  // POS Workflow State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [scannedMember, setScannedMember] = useState<Member | null>(null);
  const [scannedItems, setScannedItems] = useState<ConsumptionItem[]>([]);
  const [lastCompletedBatch, setLastCompletedBatch] = useState<TransactionBatch | null>(null);

  // Default viewed member in customer phone
  const [selectedCustomerPhoneMemberId, setSelectedCustomerPhoneMemberId] = useState<string>('mem_01');

  // Push notification for customer phone
  const [liveNotification, setLiveNotification] = useState<LiveNotification | null>(null);

  // View mode: 'split' (POS + Phone side-by-side), 'pos-only', 'phone-only', 'admin'
  const [viewMode, setViewMode] = useState<'split' | 'pos-only' | 'phone-only' | 'admin'>('split');

  const posTerminalId = 'POS-01 (影城售票與餐飲機台)';
  const cashierName = '陳思妤 (No.042 影城專櫃)';

  // Persist storage
  useEffect(() => {
    localStorage.setItem('bonjays_pos_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('bonjays_pos_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('bonjays_pos_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // When a member is scanned in POS, automatically point the customer phone view to this member
  useEffect(() => {
    if (scannedMember) {
      setSelectedCustomerPhoneMemberId(scannedMember.id);
    }
  }, [scannedMember]);

  const updateRules = (newRules: Partial<SystemRuleConfig>) => {
    setRules((prev) => ({ ...prev, ...newRules }));
  };

  /**
   * Step 1: Scan Member Barcode
   */
  const scanMemberByBarcode = useCallback(
    (barcodeOrCode: string) => {
      const clean = barcodeOrCode.trim();
      if (!clean) {
        playErrorBuzzer(rules.soundEnabled);
        return { success: false, message: '請輸入或掃描會員條碼' };
      }

      const found = members.find(
        (m) =>
          m.barcode.toLowerCase() === clean.toLowerCase() ||
          m.memberCode.toLowerCase() === clean.toLowerCase() ||
          m.phone.replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))
      );

      if (found) {
        setScannedMember(found);
        setSelectedCustomerPhoneMemberId(found.id);
        playScanBeep(rules.soundEnabled);
        return { success: true, message: `會員驗證成功：${found.name}（${found.tierName}）`, member: found };
      } else {
        playErrorBuzzer(rules.soundEnabled);
        return { success: false, message: `查無此會員條碼 [${clean}]，請重新核對` };
      }
    },
    [members, rules.soundEnabled]
  );

  /**
   * Step 2: Scan Consumption Info (Multi-item support!)
   */
  const addConsumptionItem = useCallback(
    (item: {
      barcode?: string;
      itemName: string;
      category: string;
      amount: number;
      receiptNo?: string;
    }) => {
      if (!scannedMember) {
        playErrorBuzzer(rules.soundEnabled);
        return { success: false, message: '請先完成第 1 步驟：掃描會員條碼' };
      }

      if (!item.amount || item.amount <= 0) {
        playErrorBuzzer(rules.soundEnabled);
        return { success: false, message: '消費金額必須大於 0' };
      }

      // Calculate points
      const basePoints = Math.floor(item.amount * rules.pointsPerDollar);
      let multiplier = scannedMember.tierMultiplier;
      if (rules.doublePointsCampaign) {
        multiplier *= 2;
      }
      const totalPoints = Math.round(basePoints * multiplier);

      const newItem: ConsumptionItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        receiptNo: item.receiptNo || `RC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: item.barcode || `INV-${Date.now().toString().slice(-6)}`,
        itemName: item.itemName,
        category: item.category,
        amount: Math.round(item.amount),
        basePoints,
        bonusPoints: Math.max(0, totalPoints - basePoints),
        totalPoints,
        scannedAt: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
      };

      setScannedItems((prev) => {
        playItemScanBeep(prev.length, rules.soundEnabled);
        return [newItem, ...prev];
      });

      return { success: true, message: `已成功刷入消費明細：${item.itemName}（$${item.amount.toLocaleString()}）` };
    },
    [scannedMember, rules]
  );

  const removeConsumptionItem = useCallback((itemId: string) => {
    setScannedItems((prev) => prev.filter((it) => it.id !== itemId));
  }, []);

  const clearScannedItems = useCallback(() => {
    setScannedItems([]);
  }, []);

  /**
   * Step 3: Final Submit to Member Backend & Instant Sync to Mobile App
   */
  const submitTransaction = useCallback(
    async (cashierNotes?: string) => {
      if (!scannedMember) {
        playErrorBuzzer(rules.soundEnabled);
        return { success: false };
      }
      if (scannedItems.length === 0) {
        playErrorBuzzer(rules.soundEnabled);
        return { success: false };
      }

      const totalAmount = scannedItems.reduce((sum, it) => sum + it.amount, 0);
      const totalPointsEarned = scannedItems.reduce((sum, it) => sum + it.totalPoints, 0);

      const oldPointsBalance = scannedMember.currentPoints;
      const newPointsBalance = oldPointsBalance + totalPointsEarned;

      const batchNo = `TX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });

      const newBatch: TransactionBatch = {
        id: `batch_${Date.now()}`,
        batchNo,
        memberId: scannedMember.id,
        memberName: scannedMember.name,
        memberTier: scannedMember.tier,
        items: [...scannedItems],
        totalAmount,
        totalPointsEarned,
        oldPointsBalance,
        newPointsBalance,
        status: 'SUBMITTED',
        submittedAt: nowStr,
        posTerminalId,
        cashierName,
        notes: cashierNotes,
      };

      // 1. Update Member state
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === scannedMember.id) {
            return {
              ...m,
              currentPoints: newPointsBalance,
              totalSpent: m.totalSpent + totalAmount,
            };
          }
          return m;
        })
      );

      // 2. Add Audit Log
      const newAuditLog: PointAuditLog = {
        id: `log_${Date.now()}`,
        batchId: newBatch.id,
        batchNo,
        memberId: scannedMember.id,
        memberName: scannedMember.name,
        type: 'CONSUMPTION_POINTS',
        pointsChange: totalPointsEarned,
        balanceBefore: oldPointsBalance,
        balanceAfter: newPointsBalance,
        totalSpend: totalAmount,
        itemCount: scannedItems.length,
        timestamp: nowStr,
        cashier: cashierName,
      };

      setAuditLogs((prev) => [newAuditLog, ...prev]);
      setCompletedTransactions((prev) => [newBatch, ...prev]);
      setLastCompletedBatch(newBatch);

      // 3. Audio & Haptics
      playSuccessChime(rules.soundEnabled);

      // 4. Trigger Live Notification for Customer Mobile App
      setLiveNotification({
        id: `notif_${Date.now()}`,
        memberId: scannedMember.id,
        memberName: scannedMember.name,
        pointsAdded: totalPointsEarned,
        newBalance: newPointsBalance,
        totalSpent: totalAmount,
        itemCount: scannedItems.length,
        timestamp: '剛剛',
      });

      // Update scanned member snapshot to new balance
      setScannedMember((prev) => (prev ? { ...prev, currentPoints: newPointsBalance } : null));

      // Advance to Step 4 (Success / Receipt)
      setCurrentStep(4);

      return { success: true, batch: newBatch };
    },
    [scannedMember, scannedItems, rules, cashierName, posTerminalId]
  );

  const resetPOSTransaction = useCallback(() => {
    setCurrentStep(1);
    setScannedMember(null);
    setScannedItems([]);
  }, []);

  const resetDemoData = useCallback(() => {
    setMembers(INITIAL_MEMBERS);
    setRules(INITIAL_RULES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCompletedTransactions([]);
    setCurrentStep(1);
    setScannedMember(null);
    setScannedItems([]);
    setLastCompletedBatch(null);
    setLiveNotification(null);
    localStorage.removeItem('bonjays_pos_members');
    localStorage.removeItem('bonjays_pos_rules');
    localStorage.removeItem('bonjays_pos_audit_logs');
  }, []);

  const dismissLiveNotification = useCallback(() => {
    setLiveNotification(null);
  }, []);

  return (
    <POSContext.Provider
      value={{
        members,
        selectedCustomerPhoneMemberId,
        setSelectedCustomerPhoneMemberId,
        rules,
        updateRules,
        auditLogs,
        completedTransactions,

        currentStep,
        setCurrentStep,
        scannedMember,
        scannedItems,
        posTerminalId,
        cashierName,
        lastCompletedBatch,

        scanMemberByBarcode,
        addConsumptionItem,
        removeConsumptionItem,
        clearScannedItems,
        submitTransaction,
        resetPOSTransaction,
        resetDemoData,

        liveNotification,
        dismissLiveNotification,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
