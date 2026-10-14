import React, { useState } from 'react';
import ProfitReport from '../../components/reports/ProfitReport';
import WeeklyReport from '../../components/reports/WeeklyReport';
import MonthlyReport from '../../components/reports/MonthlyReport';
import AnnualReport from '../../components/reports/AnnualReport';
import { getISOWeekString } from '../../utils/helpers';
import { printReport } from '../../utils/print';
import { shareReport } from '../../utils/sharing';
import { PrintIcon, ShareIcon } from '../../shared/icons';

const TABS = [
  { id: 'profit',  label: 'Financial Summary' },
  { id: 'weekly',  label: 'Weekly Report' },
  { id: 'monthly', label: 'Monthly Report' },
  { id: 'annual',  label: 'Annual Report' },
];

function TabPill({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        padding: '7px 16px', borderRadius: '20px',
        border: active ? 'none' : '1px solid var(--border)',
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text)',
        fontWeight: active ? '600' : '400',
        fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {label}
    </button>
  );
}

export default function ReportsView({
  dailyIncome, weeklyRentals, dailyFuel,
  monthlyExpenses, annualExpenses, mileage, otherExpenses,
}) {
  const today = new Date();
  const [activeTab, setActiveTab] = useState('profit');
  const [selectedWeek, setSelectedWeek] = useState(() => today.toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(() => today.toISOString().substring(0, 7));
  const [selectedYear, setSelectedYear] = useState(() => today.getFullYear().toString());

  const reportTitle = TABS.find(t => t.id === activeTab)?.label || 'Report';

  return (
    <div>
      {/* Tab + actions row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
        marginBottom: '20px', paddingBottom: '16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          {TABS.map(t => (
            <TabPill key={t.id} id={t.id} label={t.label} active={activeTab === t.id} onClick={setActiveTab} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => printReport('report-content')}
            style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
              padding: '6px 12px', fontSize: '0.8rem', fontWeight: '500',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text)',
            }}
          >
            <PrintIcon size={13} /> Print
          </button>
          <button
            onClick={() => shareReport('report-content', reportTitle)}
            style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
              padding: '6px 12px', fontSize: '0.8rem', fontWeight: '500',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text)',
            }}
          >
            <ShareIcon size={13} /> Share
          </button>
        </div>
      </div>

      {/* Period pickers */}
      {activeTab === 'weekly' && (
        <div className="card" style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, fontWeight: '500', fontSize: '0.88rem' }}>Select week (pick any day in the week)</label>
          <input
            type="date"
            value={selectedWeek}
            onChange={e => setSelectedWeek(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.88rem' }}
          />
        </div>
      )}
      {activeTab === 'monthly' && (
        <div className="card" style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, fontWeight: '500', fontSize: '0.88rem' }}>Select month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.88rem' }}
          />
        </div>
      )}
      {activeTab === 'annual' && (
        <div className="card" style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, fontWeight: '500', fontSize: '0.88rem' }}>Select year</label>
          <input
            type="number"
            min="2000" max="2100"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', width: '100px', fontSize: '0.88rem' }}
          />
        </div>
      )}

      {/* Report content */}
      <div id="report-content">
        {activeTab === 'profit' && (
          <ProfitReport
            dailyIncome={dailyIncome} weeklyRentals={weeklyRentals}
            dailyFuel={dailyFuel} monthlyExpenses={monthlyExpenses}
            annualExpenses={annualExpenses} mileage={mileage} otherExpenses={otherExpenses}
          />
        )}
        {activeTab === 'weekly' && (
          <WeeklyReport
            dailyIncome={dailyIncome} weeklyRentals={weeklyRentals}
            dailyFuel={dailyFuel} mileage={mileage} otherExpenses={otherExpenses}
            selectedWeek={getISOWeekString(new Date(selectedWeek))}
          />
        )}
        {activeTab === 'monthly' && (
          <MonthlyReport
            dailyIncome={dailyIncome} weeklyRentals={weeklyRentals}
            dailyFuel={dailyFuel} monthlyExpenses={monthlyExpenses}
            annualExpenses={annualExpenses} mileage={mileage} otherExpenses={otherExpenses}
            selectedMonth={selectedMonth}
          />
        )}
        {activeTab === 'annual' && (
          <AnnualReport
            dailyIncome={dailyIncome} weeklyRentals={weeklyRentals}
            dailyFuel={dailyFuel} monthlyExpenses={monthlyExpenses}
            annualExpenses={annualExpenses} mileage={mileage} otherExpenses={otherExpenses}
            selectedYear={selectedYear}
          />
        )}
      </div>
    </div>
  );
}
