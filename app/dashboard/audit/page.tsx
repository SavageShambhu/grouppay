'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';

interface AuditLog {
  id: string; timestamp: string; actor: string; action: string; details: string;
  type: 'payment' | 'admin' | 'system' | 'member';
}

const TYPE_CONFIG = {
  payment: { color: 'var(--accent)', bg: 'rgba(74,222,128,0.1)', icon: '₹', label: 'Payment' },
  admin:   { color: 'var(--blue)',   bg: 'rgba(96,165,250,0.1)',  icon: '⚙', label: 'Admin'   },
  system:  { color: 'var(--text-3)', bg: 'var(--surface-2)',      icon: '◎', label: 'System'  },
  member:  { color: 'var(--amber)',  bg: 'rgba(251,191,36,0.1)',  icon: '◉', label: 'Member'  },
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hrs < 24)   return `${hrs}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function fullTime(ts: string) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/audit').then(r => r.json()).then(data => {
      setLogs(data); setLoading(false);
    });
  }, []);

  const types = ['all', 'payment', 'admin', 'system', 'member'];
  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  // Group by date
  const grouped: Record<string, AuditLog[]> = {};
  filtered.forEach(log => {
    const date = new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(log);
  });

  return (
    <AppLayout requiredRole="admin">
      <div style={{ padding: '28px 28px 48px', maxWidth: '800px' }}>
        <div className="animate-fadeUp" style={{ marginBottom: '24px' }}>
          <h1 className="font-display" style={{ fontSize: '28px', marginBottom: '4px' }}>Auditor's Timeline</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>
            Immutable ledger of every action taken in the system
          </p>
        </div>

        {/* Filters */}
        <div className="animate-fadeUp delay-1" style={{ display: 'flex', gap: '6px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {types.map(t => {
            const cfg = t === 'all' ? null : TYPE_CONFIG[t as keyof typeof TYPE_CONFIG];
            const active = filter === t;
            return (
              <button key={t} onClick={() => setFilter(t)}
                style={{
                  padding: '7px 14px', borderRadius: '6px', border: '1px solid',
                  borderColor: active ? (cfg?.color || 'var(--accent)') : 'var(--border)',
                  background: active ? (cfg?.bg || 'var(--accent-glow)') : 'var(--surface-2)',
                  color: active ? (cfg?.color || 'var(--accent)') : 'var(--text-3)',
                  fontSize: '11px', fontFamily: 'DM Mono, monospace', cursor: 'pointer',
                  textTransform: 'capitalize', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                {cfg && <span style={{ fontSize: '12px' }}>{cfg.icon}</span>}
                {t}
              </button>
            );
          })}
          <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', display: 'flex', alignItems: 'center' }}>
            {filtered.length} events
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>Loading timeline...</div>
        ) : (
          <div className="animate-fadeUp delay-2">
            {Object.entries(grouped).map(([date, dateLogs]) => (
              <div key={date} style={{ marginBottom: '32px' }}>
                {/* Date header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {date}
                  </div>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                {/* Events */}
                <div style={{ position: 'relative', paddingLeft: '32px' }}>
                  {/* Vertical line */}
                  <div style={{
                    position: 'absolute', left: '11px', top: '12px', bottom: '12px',
                    width: '1px', background: 'linear-gradient(to bottom, var(--border-2), transparent)',
                  }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dateLogs.map((log, i) => {
                      const cfg = TYPE_CONFIG[log.type];
                      const isExpanded = expanded === log.id;
                      return (
                        <div key={log.id}
                          onClick={() => setExpanded(isExpanded ? null : log.id)}
                          style={{
                            position: 'relative', cursor: 'pointer',
                            padding: '12px 14px', borderRadius: '8px',
                            background: isExpanded ? 'var(--surface-2)' : 'transparent',
                            border: `1px solid ${isExpanded ? 'var(--border-2)' : 'transparent'}`,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--surface)'; }}
                          onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {/* Node dot */}
                          <div style={{
                            position: 'absolute', left: '-23px', top: '16px',
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: cfg.bg, border: `1.5px solid ${cfg.color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: cfg.color }} />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            {/* Type badge */}
                            <span style={{
                              background: cfg.bg, color: cfg.color,
                              fontSize: '10px', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase',
                              padding: '2px 7px', borderRadius: '4px', flexShrink: 0,
                              border: `1px solid ${cfg.color}30`,
                            }}>{cfg.icon} {cfg.label}</span>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>{log.action}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', flexShrink: 0 }} title={fullTime(log.timestamp)}>
                                  {timeAgo(log.timestamp)}
                                </div>
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>{log.details}</div>
                              {isExpanded && (
                                <div style={{ marginTop: '10px', padding: '10px', background: 'var(--surface-3)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                    <div>
                                      <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', marginBottom: '3px' }}>Actor</div>
                                      <div style={{ color: 'var(--text)' }}>{log.actor}</div>
                                    </div>
                                    <div>
                                      <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', marginBottom: '3px' }}>Timestamp</div>
                                      <div style={{ color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>{fullTime(log.timestamp)}</div>
                                    </div>
                                    <div>
                                      <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', marginBottom: '3px' }}>Event ID</div>
                                      <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>{log.id}</div>
                                    </div>
                                    <div>
                                      <div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', marginBottom: '3px' }}>Type</div>
                                      <div style={{ color: cfg.color, fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>{log.type}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: '13px', padding: '48px 0' }}>
                No events found for this filter
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
