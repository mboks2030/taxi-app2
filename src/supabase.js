/**
 * Supabase Client Configuration & Universal Connector
 * Works seamlessly with @supabase/supabase-js and provides a fallback HTTP client
 * for web, Electron, and Capacitor Android WebView.
 */

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL ||
    (typeof window !== 'undefined' && window.__ENV__?.REACT_APP_SUPABASE_URL) ||
    (typeof window !== 'undefined' && localStorage.getItem('supabase_url')) ||
    '';

const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' && window.__ENV__?.REACT_APP_SUPABASE_ANON_KEY) ||
    (typeof window !== 'undefined' && localStorage.getItem('supabase_anon_key')) ||
    '';

export const isSupabaseConfigured = () => {
    return Boolean(
        SUPABASE_URL &&
        SUPABASE_ANON_KEY &&
        !SUPABASE_URL.includes('your-project') &&
        !SUPABASE_ANON_KEY.includes('your-anon-key')
    );
};

// Storage key for persistent user sessions
const SESSION_STORAGE_KEY = 'taxi_app_supabase_session';

// Build a clean, resilient client interface
class SimpleSupabaseClient {
    constructor(url, key) {
        this.url = (url || '').replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
        this.key = key || '';
        this.listeners = new Set();

        // Load existing session from storage if present
        this.currentSession = null;
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(SESSION_STORAGE_KEY);
                if (saved) {
                    this.currentSession = JSON.parse(saved);
                }
            } catch (e) {
                console.warn('Failed to parse saved session:', e);
            }
        }

        this.auth = {
            getSession: async () => {
                if (!this.currentSession?.access_token) {
                    return { data: { session: null }, error: null };
                }

                // Check timestamp expiration
                const nowSec = Math.floor(Date.now() / 1000);
                if (this.currentSession.expires_at && nowSec >= this.currentSession.expires_at) {
                    if (this.currentSession.refresh_token) {
                        try {
                            const refreshed = await this.refreshSession();
                            if (refreshed) {
                                return { data: { session: refreshed }, error: null };
                            }
                        } catch (e) {
                            console.warn('Session refresh error:', e);
                        }
                    }
                    this.setSession(null, 'SIGNED_OUT');
                    return { data: { session: null }, error: new Error('Session expired') };
                }

                return { data: { session: this.currentSession }, error: null };
            },

            getUser: async () => {
                if (!this.currentSession?.access_token) {
                    return { data: { user: null }, error: null };
                }

                const nowSec = Math.floor(Date.now() / 1000);
                if (this.currentSession.expires_at && nowSec >= this.currentSession.expires_at) {
                    if (this.currentSession.refresh_token) {
                        try {
                            const refreshed = await this.refreshSession();
                            if (!refreshed) {
                                this.setSession(null, 'SIGNED_OUT');
                                return { data: { user: null }, error: new Error('Session expired') };
                            }
                        } catch (e) {
                            this.setSession(null, 'SIGNED_OUT');
                            return { data: { user: null }, error: new Error('Session expired') };
                        }
                    } else {
                        this.setSession(null, 'SIGNED_OUT');
                        return { data: { user: null }, error: new Error('Session expired') };
                    }
                }

                // Validate token with Supabase Auth endpoint if online
                if (this.url && this.key) {
                    try {
                        const res = await fetch(`${this.url}/auth/v1/user`, {
                            headers: {
                                'apikey': this.key,
                                'Authorization': `Bearer ${this.currentSession.access_token}`
                            }
                        });
                        if (res.status === 401 || res.status === 403) {
                            this.setSession(null, 'SIGNED_OUT');
                            return { data: { user: null }, error: new Error('Session invalid or expired') };
                        } else if (res.ok) {
                            const freshUser = await res.json();
                            this.currentSession.user = freshUser;
                            return { data: { user: freshUser }, error: null };
                        }
                    } catch (e) {
                        // Offline network failure: fallback to unexpired local session
                    }
                }

                return { data: { user: this.currentSession.user }, error: null };
            },

            signInWithPassword: async ({ email, password }) => {
                if (!isSupabaseConfigured()) {
                    return {
                        data: null,
                        error: new Error('Supabase is not configured. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.')
                    };
                }

                try {
                    const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': this.key
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        return { data: null, error: new Error(data.error_description || data.msg || data.message || 'Login failed') };
                    }

                    const session = {
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        expires_in: data.expires_in,
                        expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
                        token_type: data.token_type,
                        user: data.user
                    };

                    this.setSession(session, 'SIGNED_IN');
                    return { data: { user: data.user, session }, error: null };
                } catch (err) {
                    return { data: null, error: err };
                }
            },

            signUp: async ({ email, password, options = {} }) => {
                if (!isSupabaseConfigured()) {
                    return {
                        data: null,
                        error: new Error('Supabase is not configured. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.')
                    };
                }

                try {
                    const response = await fetch(`${this.url}/auth/v1/signup`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': this.key
                        },
                        body: JSON.stringify({
                            email,
                            password,
                            data: options.data || {}
                        })
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        return { data: null, error: new Error(data.msg || data.message || data.error_description || 'Registration failed') };
                    }

                    const session = data.access_token ? {
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        user: data.user || data
                    } : null;

                    if (session) {
                        this.setSession(session, 'SIGNED_IN');
                    }

                    return { data: { user: data.user || data, session }, error: null };
                } catch (err) {
                    return { data: null, error: err };
                }
            },

            resetPasswordForEmail: async (email) => {
                if (!isSupabaseConfigured()) {
                    return {
                        data: null,
                        error: new Error('Supabase is not configured.')
                    };
                }

                try {
                    const response = await fetch(`${this.url}/auth/v1/recover`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': this.key
                        },
                        body: JSON.stringify({ email })
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        return { data: null, error: new Error(data.msg || data.message || 'Password reset request failed') };
                    }
                    return { data, error: null };
                } catch (err) {
                    return { data: null, error: err };
                }
            },

            signInWithOAuth: async ({ provider, options = {} }) => {
                if (!isSupabaseConfigured()) {
                    return { data: null, error: new Error('Supabase is not configured.') };
                }
                const redirectTo = options.redirectTo || (typeof window !== 'undefined' ? window.location.origin : '');
                const url = `${this.url}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;
                if (typeof window !== 'undefined') {
                    window.location.href = url;
                }
                return { data: { url, provider }, error: null };
            },

            signOut: async () => {
                if (this.currentSession?.access_token) {
                    try {
                        await fetch(`${this.url}/auth/v1/logout`, {
                            method: 'POST',
                            headers: {
                                'apikey': this.key,
                                'Authorization': `Bearer ${this.currentSession.access_token}`
                            }
                        });
                    } catch (e) {
                        console.warn('Logout request warning:', e);
                    }
                }
                this.setSession(null, 'SIGNED_OUT');
                return { error: null };
            },

            refreshSession: async (options = {}) => {
                const token = options?.refresh_token || this.currentSession?.refresh_token;
                if (!token) {
                    return { data: { session: null, user: null }, error: new Error('No refresh token available') };
                }
                const refreshed = await this.refreshSession(token);
                if (refreshed) {
                    return { data: { session: refreshed, user: refreshed.user }, error: null };
                }
                return { data: { session: null, user: null }, error: new Error('Session refresh failed') };
            },

            onAuthStateChange: (callback) => {
                this.listeners.add(callback);
                // Trigger initial callback
                if (this.currentSession) {
                    callback('INITIAL_SESSION', this.currentSession);
                } else {
                    callback('INITIAL_SESSION', null);
                }

                return {
                    data: {
                        subscription: {
                            unsubscribe: () => {
                                this.listeners.delete(callback);
                            }
                        }
                    }
                };
            }
        };
    }

    async refreshSession(refreshTokenOverride) {
        const tokenToUse = refreshTokenOverride || this.currentSession?.refresh_token;
        if (!tokenToUse || !this.url || !this.key) {
            return null;
        }

        try {
            const response = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.key
                },
                body: JSON.stringify({ refresh_token: tokenToUse })
            });

            if (!response.ok) {
                console.warn('Session refresh returned HTTP status:', response.status);
                return null;
            }

            const data = await response.json();
            if (!data?.access_token) {
                return null;
            }

            const session = {
                access_token: data.access_token,
                refresh_token: data.refresh_token || tokenToUse,
                expires_in: data.expires_in,
                expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
                token_type: data.token_type || 'bearer',
                user: data.user || this.currentSession?.user
            };

            this.setSession(session, 'TOKEN_REFRESHED');
            return session;
        } catch (err) {
            console.warn('Network error during session refresh:', err);
            return null;
        }
    }

    setSession(session, event) {
        this.currentSession = session;
        if (typeof window !== 'undefined') {
            if (session) {
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
            } else {
                localStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
        for (const listener of this.listeners) {
            try {
                listener(event, session);
            } catch (e) {
                console.error('Error in auth listener:', e);
            }
        }
    }

    from(table) {
        const client = this;
        return {
            select: (columns = '*') => {
                let queryUrl = `${client.url}/rest/v1/${table}?select=${encodeURIComponent(columns)}`;
                const headers = client.getHeaders();

                const builder = {
                    eq: (col, val) => {
                        queryUrl += `&${col}=eq.${encodeURIComponent(val)}`;
                        return builder;
                    },
                    order: (col, { ascending = true } = {}) => {
                        queryUrl += `&order=${col}.${ascending ? 'asc' : 'desc'}`;
                        return builder;
                    },
                    then: async (resolve, reject) => {
                        try {
                            const res = await fetch(queryUrl, { method: 'GET', headers });
                            const data = await res.json();
                            if (!res.ok) {
                                resolve({ data: null, error: new Error(data.message || data.hint || 'Select failed') });
                            } else {
                                resolve({ data, error: null });
                            }
                        } catch (err) {
                            resolve({ data: null, error: err });
                        }
                    }
                };
                return builder;
            },

            insert: (records) => {
                const queryUrl = `${client.url}/rest/v1/${table}`;
                const headers = { ...client.getHeaders(), 'Prefer': 'return=representation' };

                return {
                    then: async (resolve, reject) => {
                        try {
                            const res = await fetch(queryUrl, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify(records)
                            });
                            const data = await res.json();
                            if (!res.ok) {
                                resolve({ data: null, error: new Error(data.message || data.hint || 'Insert failed') });
                            } else {
                                resolve({ data, error: null });
                            }
                        } catch (err) {
                            resolve({ data: null, error: err });
                        }
                    }
                };
            },

            upsert: (records, { onConflict = '' } = {}) => {
                let queryUrl = `${client.url}/rest/v1/${table}`;
                if (onConflict) queryUrl += `?on_conflict=${encodeURIComponent(onConflict)}`;
                const headers = { ...client.getHeaders(), 'Prefer': 'resolution=merge-duplicates,return=representation' };

                return {
                    then: async (resolve, reject) => {
                        try {
                            const res = await fetch(queryUrl, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify(records)
                            });
                            const data = await res.json();
                            if (!res.ok) {
                                resolve({ data: null, error: new Error(data.message || data.hint || 'Upsert failed') });
                            } else {
                                resolve({ data, error: null });
                            }
                        } catch (err) {
                            resolve({ data: null, error: err });
                        }
                    }
                };
            },

            update: (values) => {
                let queryUrl = `${client.url}/rest/v1/${table}`;
                const headers = { ...client.getHeaders(), 'Prefer': 'return=representation' };

                const builder = {
                    eq: (col, val) => {
                        queryUrl += `?${col}=eq.${encodeURIComponent(val)}`;
                        return builder;
                    },
                    then: async (resolve, reject) => {
                        try {
                            const res = await fetch(queryUrl, {
                                method: 'PATCH',
                                headers,
                                body: JSON.stringify(values)
                            });
                            const data = await res.json();
                            if (!res.ok) {
                                resolve({ data: null, error: new Error(data.message || 'Update failed') });
                            } else {
                                resolve({ data, error: null });
                            }
                        } catch (err) {
                            resolve({ data: null, error: err });
                        }
                    }
                };
                return builder;
            },

            delete: () => {
                let queryUrl = `${client.url}/rest/v1/${table}`;
                const headers = client.getHeaders();

                const builder = {
                    eq: (col, val) => {
                        queryUrl += `?${col}=eq.${encodeURIComponent(val)}`;
                        return builder;
                    },
                    then: async (resolve, reject) => {
                        try {
                            const res = await fetch(queryUrl, {
                                method: 'DELETE',
                                headers
                            });
                            if (!res.ok) {
                                const data = await res.json().catch(() => ({}));
                                resolve({ data: null, error: new Error(data.message || 'Delete failed') });
                            } else {
                                resolve({ data: null, error: null });
                            }
                        } catch (err) {
                            resolve({ data: null, error: err });
                        }
                    }
                };
                return builder;
            }
        };
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'apikey': this.key
        };
        if (this.currentSession?.access_token) {
            headers['Authorization'] = `Bearer ${this.currentSession.access_token}`;
        }
        return headers;
    }
}

// Export singleton instance
export const supabase = new SimpleSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
