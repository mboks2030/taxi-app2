import React, { useState, useEffect } from 'react';
import DailyIncomeTable from '../../components/tables/DailyIncomeTable';
import WeeklyRentalTable from '../../components/tables/WeeklyRentalTable';
import DailyFuelTable from '../../components/tables/DailyFuelTable';
import MonthlyExpenseTable from '../../components/tables/MonthlyExpenseTable';
import AnnualExpenseTable from '../../components/tables/AnnualExpenseTable';
import MileageTable from '../../components/tables/MileageTable';
import OtherExpensesTable from '../../components/tables/OtherExpensesTable';

import DailyIncomeForm from '../../components/forms/DailyIncomeForm';
import MileageForm from '../../components/forms/MileageForm';
import DailyFuelForm from '../../components/forms/DailyFuelForm';
import MonthlyExpenseForm from '../../components/forms/MonthlyExpenseForm';
import AnnualExpenseForm from '../../components/forms/AnnualExpenseForm';
import OtherExpensesForm from '../../components/forms/OtherExpensesForm';
import WeeklyRentalForm from '../../components/forms/WeeklyRentalForm';

const SECTIONS = [
  { id: 'income',   label: 'Daily Income' },
  { id: 'mileage',  label: 'Mileage' },
  { id: 'rentals',  label: 'Weekly Rentals' },
  { id: 'fuel',     label: 'Fuel Expenses' },
  { id: 'monthly',  label: 'Monthly Expenses' },
  { id: 'annual',   label: 'Annual Expenses' },
  { id: 'other',    label: 'Other Expenses' },
];

function SectionTab({ id, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      style={{
        padding: '8px 18px',
        borderRadius: '20px',
        border: active ? 'none' : '1px solid var(--border)',
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text)',
        fontWeight: active ? '600' : '400',
        fontSize: '0.85rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function FormToggle({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: open ? 'var(--panel)' : 'var(--primary)',
          color: open ? 'var(--text)' : '#fff',
          border: open ? '1px solid var(--border)' : 'none',
          borderRadius: '8px', padding: '8px 18px',
          fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          boxShadow: open ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {open ? <line x1="5" y1="12" x2="19" y2="12" /> : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>}
        </svg>
        {open ? 'Hide Form' : label}
      </button>
      {open && (
        <div className="card" style={{ padding: '20px', marginTop: '12px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function RecordsView({
  dailyIncome, setDailyIncome,
  weeklyRentals, setWeeklyRentals,
  dailyFuel, setDailyFuel,
  monthlyExpenses, setMonthlyExpenses,
  annualExpenses, setAnnualExpenses,
  mileage, setMileage,
  otherExpenses, setOtherExpenses,
  handleDelete,
  initialSection = 'income',
}) {
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    if (initialSection) setActiveSection(initialSection);
  }, [initialSection]);

  return (
    <div>
      {/* Tab pills */}
      <div style={{
        display: 'flex', gap: '8px', flexWrap: 'wrap',
        marginBottom: '24px', paddingBottom: '16px',
        borderBottom: '1px solid var(--border)',
      }}>
        {SECTIONS.map(s => (
          <SectionTab key={s.id} id={s.id} label={s.label} active={activeSection === s.id} onClick={setActiveSection} />
        ))}
      </div>

      {/* Income */}
      {activeSection === 'income' && (
        <div>
          <FormToggle label="Add Income Entry">
            <DailyIncomeForm dailyIncome={dailyIncome} setDailyIncome={setDailyIncome} />
          </FormToggle>
          <DailyIncomeTable dailyIncome={dailyIncome} handleDelete={handleDelete} />
        </div>
      )}

      {/* Mileage */}
      {activeSection === 'mileage' && (
        <div>
          <FormToggle label="Record Mileage">
            <MileageForm mileage={mileage} setMileage={setMileage} />
          </FormToggle>
          <MileageTable mileage={mileage} handleDelete={handleDelete} />
        </div>
      )}

      {/* Weekly Rentals */}
      {activeSection === 'rentals' && (
        <div>
          <FormToggle label="Add Weekly Rental">
            <WeeklyRentalForm weeklyRentals={weeklyRentals} setWeeklyRentals={setWeeklyRentals} />
          </FormToggle>
          <WeeklyRentalTable weeklyRentals={weeklyRentals} handleDelete={handleDelete} />
        </div>
      )}

      {/* Fuel Expenses */}
      {activeSection === 'fuel' && (
        <div>
          <FormToggle label="Add Fuel Record">
            <DailyFuelForm dailyFuel={dailyFuel} setDailyFuel={setDailyFuel} />
          </FormToggle>
          <DailyFuelTable dailyFuel={dailyFuel} handleDelete={handleDelete} />
        </div>
      )}

      {/* Monthly Expenses */}
      {activeSection === 'monthly' && (
        <div>
          <FormToggle label="Add Monthly Expense">
            <MonthlyExpenseForm monthlyExpenses={monthlyExpenses} setMonthlyExpenses={setMonthlyExpenses} />
          </FormToggle>
          <MonthlyExpenseTable monthlyExpenses={monthlyExpenses} handleDelete={handleDelete} />
        </div>
      )}

      {/* Annual Expenses */}
      {activeSection === 'annual' && (
        <div>
          <FormToggle label="Add Annual Expense">
            <AnnualExpenseForm annualExpenses={annualExpenses} setAnnualExpenses={setAnnualExpenses} />
          </FormToggle>
          <AnnualExpenseTable annualExpenses={annualExpenses} handleDelete={handleDelete} />
        </div>
      )}

      {/* Other Expenses */}
      {activeSection === 'other' && (
        <div>
          <FormToggle label="Add Other Expense">
            <OtherExpensesForm otherExpenses={otherExpenses} setOtherExpenses={setOtherExpenses} />
          </FormToggle>
          <OtherExpensesTable otherExpenses={otherExpenses} handleDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
