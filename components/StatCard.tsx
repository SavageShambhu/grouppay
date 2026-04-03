'use client';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  icon?: string;
  delay?: number;
}

export default function StatCard({ label, value, sub, accent = 'var(--text)', trend, trendText, icon, delay = 0 }: StatCardProps) {
  const trendColor = trend === 'up' ? 'var(--accent)' : trend === 'down' ? 'var(--red)' : 'var(--text-3)';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div
      className={`animate-fadeUp delay-${delay}`}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '20px',
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent === 'var(--text)' ? 'var(--border-2)' : accent; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Top glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.6 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'DM Mono, monospace' }}>
          {label}
        </span>
        {icon && <span style={{ fontSize: '16px', opacity: 0.6 }}>{icon}</span>}
      </div>

      <div style={{ fontSize: '28px', fontWeight: '600', color: accent, fontFamily: 'DM Mono, monospace', lineHeight: 1.1, marginBottom: '8px' }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {sub && <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{sub}</span>}
        {trendText && (
          <span style={{ fontSize: '11px', color: trendColor, fontFamily: 'DM Mono, monospace' }}>
            {trendIcon} {trendText}
          </span>
        )}
      </div>
    </div>
  );
}
