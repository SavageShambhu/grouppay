'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import StatCard from '@/components/StatCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface Stats {
  total: number; collected: number; pending: number; overdue: number;
  collectionRate: number; overdueCount: number; lateMembers: number;
  utilityHistory: { month: string; electricity: number; water: number; maintenance: number; security: number }[];
}

interface Transaction {
  id: string; memberName: string; flat: string; category: string;
  amount: number; paidAmount: number; status: string; description: string;
  dueDate: string; receiptNo: string;
}

const STATUS_COLOR: Record<string, string> = {
  paid: 'var(--accent)', overdue: 'var(--red)', pending: 'var(--amber)', partial: 'var(--blue)',
};

const MONTH_SHORT: Record<string, string> = {
  '2025-10': 'Oct', '2025-11': 'Nov', '2025-12': 'Dec',
  '2026-01': 'Jan', '2026-02': 'Feb', '2026-03': 'Mar',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/transactions').then(r => r.json()),
    ]).then(([s, txns]) => {
      setStats(s);
      setRecentTx(txns.slice(0, 8));
      setLoading(false);
    });
  }, []);

  const chartData = stats?.utilityHistory.map(u => ({
    month: MONTH_SHORT[u.month] || u.month,
    electricity: u.electricity,
    water: u.water,
    maintenance: u.maintenance,
    total: u.electricity + u.water + u.maintenance + u.security,
  })) || [];

  const collectionBreakdown = stats ? [
    { label: 'Collected', value: stats.collected, color: '#4ade80' },
    { label: 'Pending',   value: stats.pending,   color: '#fbbf24' },
    { label: 'Overdue',   value: stats.overdue,   color: '#f87171' },
  ] : [];

  function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
        <div style={{ color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'DM Mono, monospace' }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color, marginBottom: '2px' }}>{p.name}: {fmt(p.value)}</div>
        ))}
      </div>
    );
  };

  return (
    <AppLayout requiredRole="admin">
      <div style={{ padding: '28px 28px 48px', maxWidth: '1200px' }}>
        {/* Header */}
        <div className="animate-fadeUp" style={{ marginBottom: '28px' }}>
          <h1 className="font-display" style={{ fontSize: '28px', marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>Loading data...</div>
        ) : stats && (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <StatCard label="Total Billed"     value={fmt(stats.total)}           sub="this period"        accent="var(--text)"   icon="◈" delay={1} />
              <StatCard label="Collected"        value={fmt(stats.collected)}        sub={`${stats.collectionRate}% rate`} accent="var(--accent)" icon="✓" trend="up" trendText={`${stats.collectionRate}%`} delay={2} />
              <StatCard label="Pending"          value={fmt(stats.pending)}          sub="awaiting payment"   accent="var(--amber)"  icon="⏳" delay={3} />
              <StatCard label="Overdue"          value={fmt(stats.overdue)}          sub={`${stats.overdueCount} invoices`} accent="var(--red)" icon="⚠" trend="down" trendText={`${stats.overdueCount} bills`} delay={4} />
              <StatCard label="Late Payers"      value={`${stats.lateMembers}`}       sub="consistent defaulters" accent="var(--red)"   icon="◎" delay={5} />
              <StatCard label="Active Members"   value="8"                           sub="across 4 blocks"    accent="var(--blue)"   icon="◎" delay={6} />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {/* Utility trend */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }} className="animate-fadeUp delay-2">
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>Utility Expenditure Trend</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>Oct 2025 — Mar 2026</div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradElec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="electricity" stroke="#4ade80" strokeWidth={2} fill="url(#gradElec)" name="Electricity" />
                    <Area type="monotone" dataKey="total" stroke="#60a5fa" strokeWidth={1.5} fill="url(#gradTotal)" strokeDasharray="4 2" name="Total" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Collection breakdown */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }} className="animate-fadeUp delay-3">
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>Collection Status</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>Current period</div>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={collectionBreakdown} layout="vertical" margin={{ left: 0, right: 10 }}>
                    <XAxis type="number" tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="label" tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={65} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Amount">
                      {collectionBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>COLLECTION RATE</span>
                    <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>{stats.collectionRate}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'var(--surface-3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${stats.collectionRate}%`, background: 'linear-gradient(90deg, var(--accent-dim), var(--accent))', borderRadius: '3px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }} className="animate-fadeUp delay-4">
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Recent Transactions</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>Latest activity</div>
                </div>
                <a href="/dashboard/transactions" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'DM Mono, monospace' }}>View all →</a>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTx.map(tx => (
                      <tr key={tx.id}>
                        <td>
                          <div style={{ fontWeight: '500' }}>{tx.memberName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>{tx.flat}</div>
                        </td>
                        <td style={{ color: 'var(--text-2)' }}>{tx.description}</td>
                        <td>
                          <span style={{
                            background: 'var(--surface-2)', border: '1px solid var(--border)',
                            padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                            fontFamily: 'DM Mono, monospace', color: 'var(--text-3)', textTransform: 'capitalize',
                          }}>{tx.category}</span>
                        </td>
                        <td style={{ fontFamily: 'DM Mono, monospace' }}>
                          <div>{fmt(tx.amount)}</div>
                          {tx.status === 'partial' && <div style={{ fontSize: '11px', color: 'var(--amber)' }}>Paid: {fmt(tx.paidAmount)}</div>}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '11px', fontWeight: '500', padding: '3px 8px', borderRadius: '20px',
                            fontFamily: 'DM Mono, monospace', textTransform: 'uppercase',
                            color: STATUS_COLOR[tx.status],
                            background: `${STATUS_COLOR[tx.status]}18`,
                            border: `1px solid ${STATUS_COLOR[tx.status]}30`,
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: STATUS_COLOR[tx.status], display: 'inline-block' }} />
                            {tx.status}
                          </span>
                        </td>
                        <td>
                          {tx.status === 'paid' && (
                            <a href={`/api/receipt?id=${tx.id}`} target="_blank"
                              style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'DM Mono, monospace' }}>
                              ↗ PDF
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
