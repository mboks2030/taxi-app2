import { useState, useEffect, useCallback, useMemo } from 'react';
import AppShell from './presentation/components/layout/AppShell';
import HomeDashboard from './presentation/views/HomeDashboard';
import DailyWorkflowView from './presentation/views/DailyWorkflowView';
import RecordsView from './presentation/views/RecordsView';
import ReportsView from './presentation/views/ReportsView';
import SettingsView from './presentation/views/SettingsView';

import { getData, deleteData, syncAllData, clearUserLocalCache } from './utils/storage';
import { supabase } from './supabase';
import LoginForm from './components/auth/LoginForm';
import DeleteModal from './components/modals/DeleteModal';
import Toast from './components/common/Toast';
import { CARS } from './constants';
import './App.css';

/* Determine how many weekly-car vehicles are missing a rental for the current week */
function countOutstandingRentals(weeklyRentals) {
  const today = new Date().toISOString().split('T')[0];
  const d = new Date(today);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const thisMonday = d.toISOString().split('T')[0];

  const weeklyCars = Object.entries(CARS).filter(([, v]) => v.type === 'weekly').map(([id]) => id);
  return weeklyCars.filter(carId => {
    return !(weeklyRentals || []).some(r => {
      const rDate = r.weekStartDate || r.week || '';
      if (!rDate) return false;
      const rd = new Date(rDate);
      const rDay = rd.getDay();
      const rDiff = rDay === 0 ? -6 : 1 - rDay;
      rd.setDate(rd.getDate() + rDiff);
      return r.car === carId && rd.toISOString().split('T')[0] === thisMonday;
    });
  }).length;
}

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [dailyIncome, setDailyIncome] = useState([]);
  const [weeklyRentals, setWeeklyRentals] = useState([]);
  const [dailyFuel, setDailyFuel] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [annualExpenses, setAnnualExpenses] = useState([]);
  const [mileage, setMileage] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  // Daily workflow navigation hints (from Home reminders)
  const [dailyNavHint, setDailyNavHint] = useState(null);
  const [recordsNavHint, setRecordsNavHint] = useState(null);

  /* ── Auth ── */
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).limit(1);
      if (!error && data && data.length > 0) setUserProfile(data[0]);
    } catch (e) {
      console.warn('Could not load user profile:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem('taxi_local_mode');
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) fetchUserProfile(currentUser.id);
      else setUserProfile(null);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) fetchUserProfile(currentUser.id);
      setAuthLoading(false);
    }).catch(err => {
      console.warn('Authentication getSession error:', err);
      setUser(null);
      setAuthLoading(false);
    });
    return () => authListener?.subscription?.unsubscribe();
  }, [fetchUserProfile]);

  /* ── Data loading ── */
  const loadData = useCallback(async () => {
    const [income, rentals, fuel, expenses, annual, mileageData, otherExp] = await Promise.all([
      getData('dailyIncome'),
      getData('weeklyRentals'),
      getData('dailyFuel'),
      getData('monthlyExpenses'),
      getData('annualExpenses'),
      getData('mileage'),
      getData('otherExpenses'),
    ]);
    setDailyIncome(income || []);
    setWeeklyRentals(rentals || []);
    setDailyFuel(fuel || []);
    setMonthlyExpenses(expenses || []);
    setAnnualExpenses(annual || []);
    setMileage(mileageData || []);
    setOtherExpenses(otherExp || []);
  }, []);

  useEffect(() => {
    if (!user) return;
    loadData();
    setIsSyncing(true);
    syncAllData().then((result) => {
      setIsSyncing(false);
      if (result && result.success) loadData();
    });
  }, [user, loadData]);

  /* ── Sync ── */
  const handleManualSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    const result = await syncAllData();
    setIsSyncing(false);
    if (result && result.success) {
      await loadData();
      setToast({ type: 'success', message: result.message || 'Cloud Sync Complete!' });
    } else {
      setToast({ type: 'error', message: result?.message || 'Sync failed. Check connection.' });
    }
  };

  /* ── Sign out ── */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await clearUserLocalCache();
    setUser(null);
    setUserProfile(null);
    setDailyIncome([]);
    setWeeklyRentals([]);
    setDailyFuel([]);
    setMonthlyExpenses([]);
    setAnnualExpenses([]);
    setMileage([]);
    setOtherExpenses([]);
    setActiveSection('home');
  };

  /* ── Delete ── */
  const handleDelete = (type, id) => {
    setItemToDelete({ type, id });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    const typeMap = {
      income:       [dailyIncome,      setDailyIncome,      'dailyIncome'],
      rental:       [weeklyRentals,    setWeeklyRentals,    'weeklyRentals'],
      fuel:         [dailyFuel,        setDailyFuel,        'dailyFuel'],
      expense:      [monthlyExpenses,  setMonthlyExpenses,  'monthlyExpenses'],
      annual:       [annualExpenses,   setAnnualExpenses,   'annualExpenses'],
      mileage:      [mileage,          setMileage,          'mileage'],
      otherExpense: [otherExpenses,    setOtherExpenses,    'otherExpenses'],
    };
    const dataInfo = typeMap[itemToDelete.type];
    if (dataInfo) {
      const [data, setter, key] = dataInfo;
      const targetItem = data[itemToDelete.id];
      const targetLocalId = targetItem?.id || targetItem?.local_id;
      const updated = data.filter((_, index) => index !== itemToDelete.id);
      setter(updated);
      await deleteData(key, targetLocalId, updated);
    }
    setShowModal(false);
    setToast({ type: 'success', message: 'Record deleted.' });
  };

  /* ── Navigation helpers ── */
  const handleStartDaily = () => {
    setDailyNavHint(null);
    setActiveSection('daily');
  };

  const handleNavigateDaily = (hint) => {
    setDailyNavHint(hint);
    setActiveSection('daily');
  };

  const handleNavigateRecords = (section) => {
    setRecordsNavHint(section);
    setActiveSection('records');
  };

  const handleSectionChange = (id) => {
    if (id !== 'daily') setDailyNavHint(null);
    if (id !== 'records') setRecordsNavHint(null);
    setActiveSection(id);
  };

  /* ── Rental alert count ── */
  const rentalAlerts = useMemo(() => countOutstandingRentals(weeklyRentals), [weeklyRentals]);

  /* ── Loading / Login gates ── */
  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '15px' }}>
        <div className="dot" style={{ width: '28px', height: '28px', background: 'var(--primary, #2563eb)', animation: 'pulse 1s infinite' }} />
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoginForm />
      </div>
    );
  }

  return (
    <>
      <AppShell
        activeSection={activeSection}
        onNavigate={handleSectionChange}
        user={user}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        rentalAlerts={rentalAlerts}
      >
        {(activeSection === 'home' || activeSection === 'dashboard') && (
          <HomeDashboard
            dailyIncome={dailyIncome}
            weeklyRentals={weeklyRentals}
            dailyFuel={dailyFuel}
            monthlyExpenses={monthlyExpenses}
            annualExpenses={annualExpenses}
            otherExpenses={otherExpenses}
            mileage={mileage}
            onStartDaily={handleStartDaily}
            onNavigateDaily={handleNavigateDaily}
            onNavigateRecords={handleNavigateRecords}
          />
        )}

        {activeSection === 'daily' && (
          <DailyWorkflowView
            mileage={mileage}
            setMileage={setMileage}
            dailyIncome={dailyIncome}
            setDailyIncome={setDailyIncome}
            weeklyRentals={weeklyRentals}
            setWeeklyRentals={setWeeklyRentals}
            handleDelete={handleDelete}
            initialStep={dailyNavHint?.step || null}
            initialCarId={dailyNavHint?.carId || null}
            initialWeekStart={dailyNavHint?.weekStart || null}
          />
        )}

        {activeSection === 'records' && (
          <RecordsView
            dailyIncome={dailyIncome}
            setDailyIncome={setDailyIncome}
            weeklyRentals={weeklyRentals}
            setWeeklyRentals={setWeeklyRentals}
            dailyFuel={dailyFuel}
            setDailyFuel={setDailyFuel}
            monthlyExpenses={monthlyExpenses}
            setMonthlyExpenses={setMonthlyExpenses}
            annualExpenses={annualExpenses}
            setAnnualExpenses={setAnnualExpenses}
            mileage={mileage}
            setMileage={setMileage}
            otherExpenses={otherExpenses}
            setOtherExpenses={setOtherExpenses}
            handleDelete={handleDelete}
            initialSection={recordsNavHint || 'income'}
          />
        )}

        {activeSection === 'reports' && (
          <ReportsView
            dailyIncome={dailyIncome}
            weeklyRentals={weeklyRentals}
            dailyFuel={dailyFuel}
            monthlyExpenses={monthlyExpenses}
            annualExpenses={annualExpenses}
            mileage={mileage}
            otherExpenses={otherExpenses}
          />
        )}

        {activeSection === 'settings' && (
          <SettingsView
            user={user}
            userProfile={userProfile}
            onSignOut={handleSignOut}
            onSync={handleManualSync}
            isSyncing={isSyncing}
          />
        )}
      </AppShell>

      {showModal && (
        <DeleteModal
          onCancel={() => setShowModal(false)}
          onConfirm={confirmDelete}
          itemType={itemToDelete?.type}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default App;