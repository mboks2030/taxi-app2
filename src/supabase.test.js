import supabase, { isSupabaseConfigured } from './supabase';

describe('Supabase Client Config and Auth Checks', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('isSupabaseConfigured returns true when valid credentials are configured', () => {
        expect(isSupabaseConfigured()).toBe(true);
    });

    test('getSession returns null session when not logged in', async () => {
        const { data, error } = await supabase.auth.getSession();
        expect(error).toBeNull();
        expect(data.session).toBeNull();
    });

    test('getSession handles expired session without throwing TypeError: this.refreshSession is not a function', async () => {
        // Mock an expired session in storage
        const expiredSession = {
            access_token: 'fake-old-access-token',
            refresh_token: 'fake-refresh-token',
            expires_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
            user: { id: 'test-user-id', email: 'driver@test.com' }
        };
        localStorage.setItem('taxi_app_supabase_session', JSON.stringify(expiredSession));

        // Re-simulate client session from storage
        supabase.currentSession = expiredSession;

        // Calling getSession should NOT throw "this.refreshSession is not a function"
        const result = await supabase.auth.getSession();
        expect(result).toBeDefined();
        // Since fake-refresh-token cannot reach or fails on refresh endpoint, session expires safely
        expect(result.data.session).toBeNull();
    });

    test('refreshSession is defined on auth object and handles missing token gracefully', async () => {
        expect(typeof supabase.auth.refreshSession).toBe('function');
        const { data, error } = await supabase.auth.refreshSession();
        expect(data.session).toBeNull();
        expect(error).toBeDefined();
    });

    test('signOut clears current session and storage cleanly', async () => {
        const validSession = {
            access_token: 'active-token',
            user: { id: 'user-123' }
        };
        supabase.setSession(validSession, 'SIGNED_IN');
        expect(supabase.currentSession).toEqual(validSession);

        await supabase.auth.signOut();
        expect(supabase.currentSession).toBeNull();
        expect(localStorage.getItem('taxi_app_supabase_session')).toBeNull();
    });
});
