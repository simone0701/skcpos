export type MemberTier = 'SILVER' | 'GOLD' | 'DIAMOND';

export interface Member {
  id: string;
  memberCode: string;
  barcode: string;
  name: string;
  phone: string;
  tier: MemberTier;
  tierName: string;
  tierMultiplier: number;
  currentPoints: number;
  avatarUrl: string;
  totalSpent: number;
  joinedDate: string;
  cardTheme: 'gold' | 'emerald' | 'slate' | 'violet';
}

export interface ConsumptionItem {
  id: string;
  receiptNo: string;
  barcode: string;
  itemName: string;
  category: string;
  amount: number;
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  scannedAt: string;
}

export interface TransactionBatch {
  id: string;
  batchNo: string;
  memberId: string;
  memberName: string;
  memberTier: MemberTier;
  items: ConsumptionItem[];
  totalAmount: number;
  totalPointsEarned: number;
  oldPointsBalance: number;
  newPointsBalance: number;
  status: 'DRAFT' | 'SUBMITTED';
  submittedAt?: string;
  posTerminalId: string;
  cashierName: string;
  notes?: string;
}

export interface PointAuditLog {
  id: string;
  batchId: string;
  batchNo: string;
  memberId: string;
  memberName: string;
  type: 'CONSUMPTION_POINTS' | 'TIER_BONUS' | 'REWARD_REDEEM';
  pointsChange: number;
  balanceBefore: number;
  balanceAfter: number;
  totalSpend: number;
  itemCount: number;
  timestamp: string;
  cashier: string;
}

export interface SystemRuleConfig {
  pointsPerDollar: number; // e.g. 0.1 = 1 point per 10 dollars (10%)
  silverMultiplier: number;
  goldMultiplier: number;
  diamondMultiplier: number;
  doublePointsCampaign: boolean;
  soundEnabled: boolean;
}
