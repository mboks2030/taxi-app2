import React, { useState, useRef, useEffect } from 'react';
import { LogoutIcon } from '../../../shared/icons';

const UserProfile = ({ user, userProfile, onSignOut }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const displayName = userProfile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'User');
    const email = user?.email || '';
    const role = userProfile?.role || 'admin';

    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('') || (email ? email[0].toUpperCase() : 'U');

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="User account menu"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--bg-secondary, rgba(255,255,255,0.08))',
                    border: '1px solid var(--border, rgba(0,0,0,0.1))',
                    borderRadius: '24px',
                    padding: '4px 10px 4px 5px',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    fontSize: '0.85rem'
                }}
            >
                <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                }}>
                    {initials}
                </div>
                <div style={{ textAlign: 'left', lineHeight: '1.2' }} className="user-profile-text">
                    <div style={{ fontWeight: '600', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayName}
                    </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '240px',
                    background: 'var(--card-bg, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    padding: '12px',
                    animation: 'fadeIn 0.15s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.95rem'
                        }}>
                            {initials}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {displayName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {email}
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '8px 0', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--muted)' }}>Role</span>
                        <span style={{
                            background: 'var(--primary-bg, #eff6ff)',
                            color: 'var(--primary, #2563eb)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '0.75rem',
                            textTransform: 'capitalize'
                        }}>
                            {role}
                        </span>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                        <button
                            type="button"
                            onClick={() => { setIsOpen(false); onSignOut(); }}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--danger, #dc2626)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                borderRadius: '6px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary, #fee2e2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <LogoutIcon size={16} /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
