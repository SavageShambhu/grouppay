'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

interface Prediction {
  electricity: number; water: number; maintenance: number; security: number;
  delinquencyRate: number; expectedCollection: number; projectedShortfall: number;
}

interface UtilityHistory {
  month: string; electricity: number; water: number; maintenance: number; security: number;
}

const MONTH_SHORT: Record<string, string> = {
  '2025-10': 'Oct', '2025-11': 'Nov', '2025-12': 'Dec',
  '2026-01': 'Jan', '2026-02': 'Feb', '2026-03': 'Mar',
};

export default function PredictPage() {
  const [pred, setPred] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<UtilityHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/predict').then(r => r.json()),
      fetch('/api/stats').then(r => r.json()),
    ]).then(([p, s]) => {
      setPred(p);
      setHistory(s.utilityHistory || []);
      setLoading(false);
    });
  }, []);

  function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

  const breakdownData = pred ? [
    { name: 'Maintenance', value: pred.maintenance, color: '#4ade80' },
    { name: 'Electricity', value: pred.electricity, color: '#60a5fa' },
    { name: 'Security',    value: pred.security,    color: '#a78bfa' },
    { name: 'Water',       value: pred.water,       color: '#34d399' },
  ] : [];

  const totalPredicted = pred ? pred.electricity + pred.water + pred.maintenance + pred.security : 0;

  const radarData = history.slice(-3).map(h => ({
    month: MONTH_SHORT[h.month] || h.month,
    Electricity: Math.round(h.electricity / 100),
    Water: Math.round(h.water / 100),
    Security: Math.round(h.security / 100),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
        <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', marginBottom: '4px' }}>{payload[0]?.payload?.name}</div>
        <div style={{ color: payload[0]?.fill }}>{fmt(payload[0]?.value)}</div>
      </div>
    );
  };

  return (
    <AppLayout requiredRole="admin">
      <div style={{ padding: '28px 28px 48px', maxWidth: '1000px' }}>
        <div className="animate-fadeUp" style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 className="font-display" style={{ fontSize: '28px' }}>Predictive Engine</h1>
            <span style={{
              background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(96,165,250,0.15))',
              border: '1px solid rgba(74,222,128,0.3)', color: 'var(--accent)',
              fontSize: '10px', fontFamily: 'DM Mono, monospace', padding: '3px 9px',
              borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>AI-Powered</span>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>
            Linear regression on 6 months of utility data · delinquency-adjusted collection forecast
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '13px', padding: '40px 0' }}>Running prediction model...</div>
        ) : pred && (
          <>
            {/* Main forecast card */}
            <div className="animate-fadeUp delay-1" style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
              padding: '28px', marginBottom: '20px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, var(--accent-dim), var(--accent), #60a5fa, transparent)',
              }} />
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  May 2026 Forecast
                </div>
                <div className="font-display" style={{ fontSize: '42px', color: 'var(--text)', marginBottom: '4px' }}>
                  {fmt(totalPredicted)}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>Total projected expenditure next month</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {[
                  { l: 'Expected Collections', v: fmt(pred.expectedCollection), c: 'var(--accent)', note: 'adjusted for defaults' },
                  { l: 'Projected Shortfall',  v: fmt(pred.projectedShortfall), c: 'var(--red)',    note: 'funding gap' },
                  { l: 'Delinquency Rate',     v: `${pred.delinquencyRate}%`,   c: pred.delinquencyRate > 30 ? 'var(--red)' : 'var(--amber)', note: 'current period' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', marginBottom: '8px' }}>{s.l}</div>
                    <div style={{ fontSize: '22px', fontWeight: '600', color: s.c, fontFamily: 'DM Mono, monospace', marginBottom: '4px' }}>{s.v}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{s.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {/* Breakdown bar */}
              <div className="animate-fadeUp delay-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Predicted Cost Breakdown</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', marginBottom: '16px' }}>May 2026</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={breakdownData} margin={{ left: -10, right: 10 }}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {breakdownData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Inflation trend */}
              <div className="animate-fadeUp delay-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Utility Inflation Analysis</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', marginBottom: '16px' }}>6-month trend basis</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Electricity', curr: history[history.length-1]?.electricity || 0, pred: pred.electricity, color: '#60a5fa' },
                    { label: 'Water',       curr: history[history.length-1]?.water || 0,       pred: pred.water,       color: '#34d399' },
                    { label: 'Maintenance', curr: history[history.length-1]?.maintenance || 0, pred: pred.maintenance, color: '#4ade80' },
                    { label: 'Security',    curr: history[history.length-1]?.security || 0,    pred: pred.security,    color: '#a78bfa' },
                  ].map((u, i) => {
                    const change = ((u.pred - u.curr) / u.curr * 100).toFixed(1);
                    const isUp = u.pred >= u.curr;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{u.label}</span>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>{fmt(u.curr)}</span>
                            <span style={{ fontSize: '11px', color: isUp ? 'var(--red)' : 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>
                              {isUp ? '↑' : '↓'} {Math.abs(parseFloat(change))}%
                            </span>
                            <span style={{ fontSize: '12px', color: u.color, fontFamily: 'DM Mono, monospace', fontWeight: '600' }}>{fmt(u.pred)}</span>
                          </div>
                        </div>
                        <div style={{ height: '4px', borderRadius: '2px', background: 'var(--surface-3)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min((u.pred / 25000) * 100, 100)}%`, background: u.color, borderRadius: '2px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Late payer recommendations */}
            <div className="animate-fadeUp delay-4" style={{ background: 'var(--surface)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)', animation: 'pulse-dot 2s infinite' }} />
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Proactive Split-Pay Recommendations</div>
                <span style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--red)', fontSize: '10px', fontFamily: 'DM Mono, monospace', padding: '2px 8px', borderRadius: '20px' }}>
                  3 AT-RISK MEMBERS
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '20px', lineHeight: '1.6' }}>
                Based on historical payment patterns, the following members have a high probability of defaulting next cycle. The engine recommends pre-emptively offering them a split-pay option to improve collection rates.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Rahul Gupta',   flat: 'B-201', score: 42, color: '#f87171', reason: '4 consecutive overdue bills', action: 'Offer 2-installment plan', savings: '₹5,000' },
                  { name: 'Vikram Singh',  flat: 'C-301', score: 33, color: '#f87171', reason: '3 partial payments this quarter', action: 'Offer early-bird 5% discount', savings: '₹2,500' },
                  { name: 'Kavitha Menon', flat: 'D-402', score: 55, color: '#fbbf24', reason: 'Payment delays 8-12 days average', action: 'Send pre-due reminder (D-5)', savings: '₹1,800' },
                ].map((m, i) => (
                  <div key={i} style={{
                    background: 'var(--surface-2)', borderRadius: '8px', padding: '14px 16px',
                    border: `1px solid ${m.color}20`,
                    display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: m.color + '20', border: `1px solid ${m.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: m.color }}>
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>{m.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>{m.flat} · Score: {m.score}</div>
                      </div>
                    </div>
                    <div style={{ flex: '1 1 180px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Trigger: {m.reason}</div>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ fontSize: '12px', color: m.color, fontWeight: '500' }}>→ {m.action}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>Est. recovery: {m.savings}</div>
                    </div>
                    <button style={{
                      background: m.color + '15', border: `1px solid ${m.color}40`,
                      color: m.color, padding: '6px 14px', borderRadius: '6px',
                      fontSize: '11px', fontFamily: 'DM Mono, monospace', cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}>
                      Send Offer ↗
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
