import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  ShieldCheck,
  Users,
  FileSpreadsheet,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Award,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';

export const AdminBackoffice: React.FC = () => {
  const { members, auditLogs, rules, updateRules, completedTransactions } = usePOS();

  const [activeTab, setActiveTab] = useState<'audit' | 'members' | 'rules'>('audit');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculations
  const totalPointsCirculating = members.reduce((sum, m) => sum + m.currentPoints, 0);
  const totalAuditPointsEarned = auditLogs.reduce((sum, l) => sum + l.pointsChange, 0);
  const totalSpendRecorded = auditLogs.reduce((sum, l) => sum + l.totalSpend, 0);

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.memberName.includes(searchTerm) ||
      l.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cashier.includes(searchTerm)
  );

  const filteredMembers = members.filter(
    (m) =>
      m.name.includes(searchTerm) ||
      m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 space-y-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              會員後台管理系統 · 點數即時異動與核算中心
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            即時監控影城售票處與餐飲部 POS 機端批次點數送出、會員累積餘額與稽核軌跡。
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'audit'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>點數異動稽核紀錄</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>會員資料總表</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'rules'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>積點規則配置</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">目前流通總點數</div>
          <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
            {totalPointsCirculating.toLocaleString()}
            <span className="text-xs text-slate-400 font-normal ml-1">點</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>全通路會員即時可用</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">本日累積發放點數</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            +{totalAuditPointsEarned.toLocaleString()}
            <span className="text-xs text-emerald-400/80 font-normal ml-1">點</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            共計 {auditLogs.length} 筆 POS 交易批次
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">登錄消費總金額</div>
          <div className="text-2xl font-bold text-amber-300 font-mono mt-1 tabular-nums">
            ${totalSpendRecorded.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            平均客單點數率: 約 10% ~ 15%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">有效會員總數</div>
          <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
            {members.length}
            <span className="text-xs text-slate-400 font-normal ml-1">位</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            金卡 / 黑鑽卡佔比 66%
          </div>
        </div>
      </div>

      {/* Main Tab Area */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm font-bold text-white">
              POS 交易送出稽核軌跡（Point Audit Ledger）
            </div>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋單號、會員或收銀員..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-2.5 px-4">時間</th>
                  <th className="py-2.5 px-4">批次單號</th>
                  <th className="py-2.5 px-4">會員姓名</th>
                  <th className="py-2.5 px-4 text-center">掃描筆數</th>
                  <th className="py-2.5 px-4 text-right">消費總額</th>
                  <th className="py-2.5 px-4 text-right">變動點數</th>
                  <th className="py-2.5 px-4 text-right">更新後餘額</th>
                  <th className="py-2.5 px-4">收銀員</th>
                  <th className="py-2.5 px-4 text-center">手機同步狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400 whitespace-nowrap">
                      {log.batchNo}
                    </td>
                    <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                      {log.memberName}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300 font-mono">
                      {log.itemCount} 筆
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-white tabular-nums">
                      ${log.totalSpend.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      +{log.pointsChange.toLocaleString()} 點
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-300 font-semibold tabular-nums">
                      {log.balanceAfter.toLocaleString()} 點
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {log.cashier}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        已同步
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm font-bold text-white">
              會員名冊與點數即時現況
            </div>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋姓名、卡號或手機..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-2.5 px-4">會員</th>
                  <th className="py-2.5 px-4">卡號</th>
                  <th className="py-2.5 px-4">條碼識別</th>
                  <th className="py-2.5 px-4">會員等級</th>
                  <th className="py-2.5 px-4">積點倍率</th>
                  <th className="py-2.5 px-4 text-right">當前點數餘額</th>
                  <th className="py-2.5 px-4 text-right">累計消費總額</th>
                  <th className="py-2.5 px-4">加入日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 text-xs">
                        {m.name.slice(0, 1)}
                      </div>
                      <div>
                        <div>{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {m.memberCode}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {m.barcode}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-amber-300 border border-amber-400/30">
                        {m.tierName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {m.tierMultiplier}x
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm tabular-nums">
                      {m.currentPoints.toLocaleString()} 點
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300 tabular-nums">
                      ${m.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {m.joinedDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">
              點數核算與回饋參數配置
            </h2>
            <p className="text-xs text-slate-400">
              調整 POS 送出時的點數換算公式，修改將立即套用於下次交易。
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="text-xs font-semibold text-white">基礎消費積點比例</div>
                <div className="text-[11px] text-slate-400">預設消費 $10 元獲得 1 點（10% 回饋）</div>
              </div>
              <span className="text-sm font-bold text-emerald-400 font-mono">10% ($10=1點)</span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">各等級會員回饋倍率</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <div className="text-xs text-slate-400">銀卡會員</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">1.0x</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <div className="text-xs text-amber-300">金卡會員</div>
                  <div className="text-lg font-bold text-amber-400 font-mono mt-1">1.2x</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <div className="text-xs text-indigo-300">黑鑽卡會員</div>
                  <div className="text-lg font-bold text-indigo-400 font-mono mt-1">1.5x</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="text-xs font-semibold text-white">全館週末限時點數雙倍活動 (2x Bonus)</div>
                <div className="text-[11px] text-slate-400">開啟後所有消費單據之積點將自動乘上 2 倍</div>
              </div>
              <button
                onClick={() => updateRules({ doublePointsCampaign: !rules.doublePointsCampaign })}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  rules.doublePointsCampaign
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {rules.doublePointsCampaign ? '雙倍活動已開啟' : '雙倍活動關閉中'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
