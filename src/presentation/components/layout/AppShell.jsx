import React, { useState, useEffect } from 'react';
import ThemeToggle from '../../../components/common/ThemeToggle';
import UserProfile from './UserProfile';

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const DailyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const RecordsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const ReportsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'dashboard', alias: 'home', label: 'Dashboard',             Icon: HomeIcon },
  { id: 'daily',                    label: 'Daily Operations',      Icon: DailyIcon },
  { id: 'records',                  label: 'Records & Management',  Icon: RecordsIcon },
  { id: 'reports',                  label: 'Reports',               Icon: ReportsIcon },
  { id: 'settings',                 label: 'Account & Settings',    Icon: SettingsIcon },
];

export default function AppShell({ activeSection, onNavigate, user, userProfile, onSignOut, rentalAlerts, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = (e) => { setIsMobile(e.matches); if (e.matches) setCollapsed(true); };
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const displayName = userProfile?.full_name
    || user?.user_metadata?.full_name
    || (user?.email ? user.email.split('@')[0] : 'User');
  const initial = displayName.charAt(0).toUpperCase();

  const handleNav = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const navBtn = (id, label, Icon) => {
    const active = activeSection === id || (id === 'dashboard' && activeSection === 'home');
    const hasBadge = id === 'daily' && rentalAlerts > 0;
    return (
      <button
        key={id}
        onClick={() => handleNav(id)}
        title={collapsed && !isMobile ? label : undefined}
        style={{
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : '10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '10px 0' : '10px 14px',
          margin: '0 8px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          background: active ? 'var(--primary)' : 'transparent',
          color: active ? '#fff' : 'var(--text)',
          fontWeight: active ? '600' : '400',
          fontSize: '0.88rem',
          position: 'relative',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--border)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ flexShrink: 0, display: 'flex', position: 'relative' }}>
          <Icon />
          {hasBadge && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '8px', height: '8px',
              background: '#f59e0b', borderRadius: '50%',
              border: '2px solid var(--panel)'
            }} />
          )}
        </span>
        {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
        {!collapsed && hasBadge && (
          <span style={{
            marginLeft: 'auto',
            background: '#fef3c7', color: '#92400e',
            fontSize: '0.7rem', fontWeight: '700',
            padding: '1px 6px', borderRadius: '10px', flexShrink: 0
          }}>{rentalAlerts}</span>
        )}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar - desktop only */}
      {!isMobile && (
        <aside style={{
          width: collapsed ? '64px' : '220px',
          minHeight: '100vh',
          background: 'var(--panel)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '18px 0' : '18px 16px',
            borderBottom: '1px solid var(--border)',
            minHeight: '60px',
          }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontWeight: '700', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>Taxi Manager</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px', display: 'flex', borderRadius: '6px', flexShrink: 0 }}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <MenuIcon /> : <ChevronLeft />}
            </button>
          </div>

          <nav style={{ flex: 1, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {NAV_ITEMS.map(({ id, label, Icon }) => navBtn(id, label, Icon))}
          </nav>

          <div style={{ borderTop: '1px solid var(--border)', padding: collapsed ? '12px 0' : '12px 16px' }}>
            {!collapsed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '700', flexShrink: 0
                }}>{initial}</div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '700'
                }}>{initial}</div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: '56px', background: 'var(--panel)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px',
          position: 'sticky', top: 0, zIndex: 90, flexShrink: 0
        }}>
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '4px', display: 'flex' }}
            >
              <MenuIcon />
            </button>
          )}
          <span style={{ fontWeight: '600', fontSize: '0.95rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {NAV_ITEMS.find(n => n.id === activeSection || (n.id === 'dashboard' && activeSection === 'home'))?.label || 'Dashboard'}
          </span>
          <ThemeToggle />
          <UserProfile user={user} userProfile={userProfile} onSignOut={onSignOut} />
        </header>

        {/* Content */}
        <main style={{
          flex: 1, padding: '24px 20px',
          paddingBottom: isMobile ? '80px' : '32px',
          maxWidth: '1200px', width: '100%',
          margin: '0 auto', boxSizing: 'border-box'
        }}>
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }}
        />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, height: '100%', width: '260px',
          background: 'var(--panel)', zIndex: 201,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-110%)',
          transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--border)'
        }}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%' }} />
              <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Taxi Manager</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.2rem' }}>✕</button>
          </div>
          <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const active = activeSection === id || (id === 'dashboard' && activeSection === 'home');
              const hasBadge = id === 'daily' && rentalAlerts > 0;
              return (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--text)',
                    fontWeight: active ? '600' : '400', fontSize: '0.9rem',
                    textAlign: 'left', width: '100%'
                  }}
                >
                  <Icon />
                  {label}
                  {hasBadge && (
                    <span style={{
                      marginLeft: 'auto', background: '#fef3c7', color: '#92400e',
                      fontSize: '0.72rem', fontWeight: '700', padding: '1px 6px', borderRadius: '10px'
                    }}>{rentalAlerts}</span>
                  )}
                </button>
              );
            })}
          </nav>
          <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', fontSize: '0.83rem', color: 'var(--muted)' }}>
            Signed in as <strong style={{ color: 'var(--text)' }}>{displayName}</strong>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--panel)', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '6px 0 max(8px, env(safe-area-inset-bottom))', zIndex: 90,
        }}>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeSection === id || (id === 'dashboard' && activeSection === 'home');
            const hasBadge = id === 'daily' && rentalAlerts > 0;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: active ? 'var(--primary)' : 'var(--muted)',
                  fontSize: '0.62rem', fontWeight: active ? '600' : '400',
                  padding: '4px 8px', position: 'relative',
                }}
              >
                <span style={{ position: 'relative' }}>
                  <Icon />
                  {hasBadge && (
                    <span style={{
                      position: 'absolute', top: '-3px', right: '-3px',
                      width: '7px', height: '7px',
                      background: '#f59e0b', borderRadius: '50%'
                    }} />
                  )}
                </span>
                <span>{label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
