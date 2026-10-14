import React from 'react';
import ThemeToggle from '../../components/common/ThemeToggle';
import { RefreshIcon } from '../../shared/icons';

export default function SettingsView({ user, userProfile, onSignOut, onSync, isSyncing }) {
  const displayName = userProfile?.full_name
    || user?.user_metadata?.full_name
    || (user?.email ? user.email.split('@')[0] : 'User');
  const role = userProfile?.role || 'driver';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px' }}>
      {/* Profile card */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: '700' }}>Account</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'var(--primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: '700', flexShrink: 0,
          }}>{initial}</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{displayName}</div>
            <div style={{ fontSize: '0.83rem', color: 'var(--muted)', marginTop: '2px' }}>{user?.email}</div>
            <span style={{
              display: 'inline-block', marginTop: '4px',
              background: 'var(--primary-bg, #eff6ff)', color: 'var(--primary)',
              padding: '2px 8px', borderRadius: '10px',
              fontSize: '0.72rem', fontWeight: '600', textTransform: 'capitalize'
            }}>{role}</span>
          </div>
        </div>
        <button
          onClick={onSignOut}
          style={{
            background: 'var(--danger-bg)', color: 'var(--danger)',
            border: '1px solid var(--danger)', borderRadius: '8px',
            padding: '9px 18px', fontWeight: '600', fontSize: '0.88rem',
            cursor: 'pointer', width: '100%',
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Appearance */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: '700' }}>Appearance</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>Theme</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>Switch between light and dark mode</div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Sync */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: '700' }}>Cloud Sync</h2>
        <p style={{ margin: '0 0 16px', fontSize: '0.83rem', color: 'var(--muted)' }}>
          Sync local records with Supabase. Data is also synced automatically on login.
        </p>
        <button
          onClick={onSync}
          disabled={isSyncing}
          style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '9px 18px',
            fontWeight: '600', fontSize: '0.88rem',
            cursor: isSyncing ? 'not-allowed' : 'pointer',
            opacity: isSyncing ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <RefreshIcon size={14} className={isSyncing ? 'spinning' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* App info */}
      <div style={{ padding: '8px 4px', fontSize: '0.78rem', color: 'var(--muted)' }}>
        Taxi Business Manager — data stored securely in Supabase and locally on this device.
      </div>
    </div>
  );
}
