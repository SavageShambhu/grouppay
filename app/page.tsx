'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      // Middleware will handle the redirect on next navigation
      if (data.member.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/portal');
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="animate-fadeUp" style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--accent-glow)',
            border: '1px solid rgba(74,222,128,0.3)',
            marginBottom: '16px',
            fontSize: '22px',
          }}>◈</div>
          <h1 className="font-display" style={{ fontSize: '24px', marginBottom: '6px' }}>GroupPay</h1>
          <p style={{
            color: 'var(--text-3)',
            fontSize: '12px',
            fontFamily: 'DM Mono, monospace',
            letterSpacing: '0.04em',
          }}>
            Ledger of the Commons
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, var(--accent-dim), var(--accent), transparent)',
          }} />

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
              Sign in to your account
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>
              Demo password for all accounts: demo123
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: 'var(--text-3)',
                fontFamily: 'DM Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '7px',
              }}>
                Email
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ width: '100%', boxSizing: 'border-box' }}
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: 'var(--text-3)',
                fontFamily: 'DM Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '7px',
              }}>
                Password
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ width: '100%', boxSizing: 'border-box' }}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: '7px',
                padding: '10px 14px',
                fontSize: '12px',
                color: 'var(--red)',
                fontFamily: 'DM Mono, monospace',
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                background: loading || !email || !password
                  ? 'var(--surface-2)'
                  : 'var(--accent)',
                border: 'none',
                color: loading || !email || !password
                  ? 'var(--text-3)'
                  : '#0d0f0e',
                fontSize: '13px',
                fontWeight: '600',
                cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'DM Mono, monospace',
                marginTop: '4px',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>
        </div>

        {/* Footer hint */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '11px',
          color: 'var(--text-3)',
          fontFamily: 'DM Mono, monospace',
        }}>
          Admin access · Member portal · Audit trail
        </div>
      </div>
    </div>
  );
}
