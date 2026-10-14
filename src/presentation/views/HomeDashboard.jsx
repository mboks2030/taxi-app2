import React, { useMemo } from 'react';
import { CARS } from '../../constants';
import { getISOWeekString } from '../../utils/helpers';

/* ---- helpers ---- */
const todayStr = () => new Date().toISOString().split('T')[0];

function getWeekMonday(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmt(n) { return `£${Number(n || 0).toFixed(2)}`; }

/* ---- sub-components ---- */
function MetricCard({ label, value, sub, type = 'default' }) {
  const styles = {
    primary: {
      background: 'var(--primary)',
      color: '#fff',
      border: '1px solid var(--primary)',
    },
    success: {
      background: 'var(--card-bg, #fff)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
      borderLeft: '4px solid var(--success, #16a34a)',
    },
    warning: {
      background: 'var(--card-bg, #fff)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
      borderLeft: '4px solid #f59e0b',
    },
    danger: {
      background: 'var(--card-bg, #fff)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
      borderLeft: '4px solid var(--danger, #dc2626)',
    },
    default: {
      background: 'var(--card-bg, #fff)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    }
  };

  const currentStyle = styles[type] || styles.default;
  const isWhiteText = type === 'primary';

  return (
    <div style={{
      ...currentStyle,
      borderRadius: '12px',
      padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: '4px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
    }}>
      <span style={{ fontSize: '0.78rem', fontWeight: '500', color: isWhiteText ? 'rgba(255,255,255,0.85)' : 'var(--muted)' }}>
        {label}
      </span>
      <span style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: '0.75rem', color: isWhiteText ? 'rgba(255,255,255,0.75)' : 'var(--muted)' }}>{sub}</span>}
    </div>
  );
}

function QuickAction({ label, icon, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px', borderRadius: '10px',
        border: primary ? 'none' : '1px solid var(--border)',
        background: primary ? 'var(--primary)' : 'var(--panel)',
        color: primary ? '#fff' : 'var(--text)',
        fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
    >
      <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ChecklistItem({ step, label, status, onClick }) {
  const colors = {
    complete:  { bg: 'var(--success-bg, rgba(22,163,74,0.08))',  border: 'var(--success, #16a34a)',  text: 'var(--success-text, #16a34a)', dot: 'var(--success, #16a34a)'  },
    partial:   { bg: 'rgba(245,158,11,0.08)',                    border: '#f59e0b',                   text: '#b45309',                      dot: '#f59e0b'    },
    pending:   { bg: 'var(--bg)',                                 border: 'var(--border)',             text: 'var(--muted)',                 dot: 'var(--border)'  },
  };
  const c = colors[status] || colors.pending;
  const statusLabel = { complete: 'Complete', partial: 'In progress', pending: 'Pending' }[status] || 'Pending';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '12px 16px', borderRadius: '10px',
        background: c.bg, border: `1px solid ${c.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: c.dot, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: '700', flexShrink: 0,
        opacity: status === 'pending' ? 0.35 : 1,
      }}>{step}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{label}</div>
      </div>
      <span style={{
        fontSize: '0.75rem', fontWeight: '600', color: c.text,
        background: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: '20px'
      }}>{statusLabel}</span>
      {onClick && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: c.text, flexShrink: 0 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </div>
  );
}

function RentalReminderCard({ carId, carLabel, status, weekStart, onRecord }) {
  const isRecorded = status === 'recorded';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '13px 16px', borderRadius: '10px',
      background: isRecorded ? 'var(--success-bg, rgba(22,163,74,0.08))' : 'rgba(245,158,11,0.08)',
      border: `1px solid ${isRecorded ? 'var(--success, #16a34a)' : '#f59e0b'}`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{carLabel}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
          Week starting {weekStart}
        </div>
      </div>
      {isRecorded ? (
        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--success-text, #16a34a)', background: 'rgba(255,255,255,0.7)', padding: '3px 10px', borderRadius: '20px' }}>
          Recorded
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onRecord(carId, weekStart)}
          style={{
            background: '#f59e0b', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '6px 14px', fontSize: '0.8rem',
            fontWeight: '600', cursor: 'pointer', flexShrink: 0,
          }}
        >
          Record Rental
        </button>
      )}
    </div>
  );
}

/* ---- Main Dashboard Component ---- */
export default function HomeDashboard({
  dailyIncome = [],
  weeklyRentals = [],
  dailyFuel = [],
  monthlyExpenses = [],
  annualExpenses = [],
  otherExpenses = [],
  mileage = [],
  onStartDaily,
  onNavigateDaily,
  onNavigateRecords,
}) {
  const today = todayStr();
  const thisWeekMonday = getWeekMonday(today);
  const thisWeekISO = getISOWeekString(new Date(today));

  /* Daily checklist — derived from persisted records */
  const dailyStatus = useMemo(() => {
    const todayMileage = (mileage || []).find(m => m.date === today && m.car === 'SG24ZSN');
    const hasMorning = !!(todayMileage && (todayMileage.morningMileage || todayMileage.startMileage));
    const hasEndOfDay = !!(todayMileage && (todayMileage.endOfDayMileage || todayMileage.endMileage));
    const todayIncome = (dailyIncome || []).filter(i => i.date === today);
    return {
      mileageMorning: hasMorning ? (hasEndOfDay ? 'complete' : 'partial') : 'pending',
      income: todayIncome.length > 0 ? 'partial' : 'pending',
      endOfDay: hasEndOfDay ? 'complete' : (hasMorning ? 'partial' : 'pending'),
      hasMorning, hasEndOfDay, hasIncome: todayIncome.length > 0,
    };
  }, [dailyIncome, mileage, today]);

  /* Weekly rental reminders */
  const rentalReminders = useMemo(() => {
    const weeklyCars = Object.entries(CARS).filter(([, v]) => v.type === 'weekly');
    return weeklyCars.map(([id, { label }]) => {
      const recorded = (weeklyRentals || []).some(r => {
        const rWeekMonday = getWeekMonday(r.weekStartDate || r.week || '');
        return r.car === id && rWeekMonday === thisWeekMonday;
      });
      return { carId: id, carLabel: label, status: recorded ? 'recorded' : 'needs_entry', weekStart: thisWeekMonday };
    });
  }, [weeklyRentals, thisWeekMonday]);

  const outstandingRentals = rentalReminders.filter(r => r.status === 'needs_entry');

  /* Financial performance metrics */
  const todayTotal = useMemo(() => {
    return (dailyIncome || []).filter(i => i.date === today).reduce((s, i) => s + Number(i.amount || 0), 0);
  }, [dailyIncome, today]);

  const weekIncome = useMemo(() => {
    const incomeThisWeek = (dailyIncome || []).filter(i => getISOWeekString(new Date(i.date || '')) === thisWeekISO);
    const rentalsThisWeek = (weeklyRentals || []).filter(r => {
      const d = r.weekStartDate || r.week || '';
      return d && getISOWeekString(new Date(d)) === thisWeekISO;
    });
    return incomeThisWeek.reduce((s, i) => s + Number(i.amount || 0), 0)
      + rentalsThisWeek.reduce((s, r) => s + Number(r.amount || 0), 0);
  }, [dailyIncome, weeklyRentals, thisWeekISO]);

  const weekExpenses = useMemo(() => {
    const fuelThisWeek = (dailyFuel || []).filter(f => getISOWeekString(new Date(f.date || '')) === thisWeekISO);
    const otherThisWeek = (otherExpenses || []).filter(o => getISOWeekString(new Date(o.date || '')) === thisWeekISO);
    return fuelThisWeek.reduce((s, f) => s + Number(f.amount || 0), 0)
      + otherThisWeek.reduce((s, o) => s + Number(o.amount || 0), 0);
  }, [dailyFuel, otherExpenses, thisWeekISO]);

  const weekProfit = weekIncome - weekExpenses;

  /* Recent transactions across all streams */
  const recentTransactions = useMemo(() => {
    const list = [];
    (dailyIncome || []).forEach(i => list.push({
      date: i.date || '',
      type: 'Income',
      car: CARS[i.car]?.label?.split(' - ')[0] || i.car || 'SG24ZSN',
      desc: i.method || 'Fare',
      amount: Number(i.amount || 0),
      isIncome: true
    }));
    (weeklyRentals || []).forEach(r => list.push({
      date: r.weekStartDate || r.week || '',
      type: 'Rental',
      car: CARS[r.car]?.label?.split(' - ')[0] || r.car,
      desc: 'Weekly Rental',
      amount: Number(r.amount || 0),
      isIncome: true
    }));
    (dailyFuel || []).forEach(f => list.push({
      date: f.date || '',
      type: 'Fuel',
      car: CARS[f.car]?.label?.split(' - ')[0] || f.car,
      desc: 'Fuel Expense',
      amount: Number(f.amount || 0),
      isIncome: false
    }));
    (otherExpenses || []).forEach(o => list.push({
      date: o.date || '',
      type: 'Expense',
      car: CARS[o.car]?.label?.split(' - ')[0] || o.car || 'General',
      desc: o.category || 'Expense',
      amount: Number(o.amount || 0),
      isIncome: false
    }));

    return list
      .filter(item => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [dailyIncome, weeklyRentals, dailyFuel, otherExpenses]);

  /* CTA label */
  const ctaLabel = dailyStatus.hasMorning
    ? (dailyStatus.hasEndOfDay ? 'View Today\'s Records' : 'Continue Today\'s Records')
    : 'Start Morning Workflow';

  const displayDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Greeting Banner ── */}
      <div style={{
        background: 'var(--primary-gradient, var(--primary))',
        borderRadius: '14px', padding: '24px 28px', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        boxShadow: '0 4px 12px rgba(37,99,235,0.15)'
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: '700' }}>
            {getGreeting()}!
          </h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.88rem' }}>{displayDate}</p>
          <p style={{ margin: '8px 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            {dailyStatus.hasMorning
              ? (dailyStatus.hasEndOfDay ? 'Today is closed and up to date.' : 'Morning recorded. Ready to add fares?')
              : 'Ready to begin today\'s taxi shift?'}
          </p>
        </div>
        <button
          type="button"
          onClick={onStartDaily}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1.5px solid rgba(255,255,255,0.5)',
            borderRadius: '10px', padding: '10px 22px',
            color: '#fff', fontWeight: '700', fontSize: '0.9rem',
            cursor: 'pointer', backdropFilter: 'blur(4px)',
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
        >
          {ctaLabel}
        </button>
      </div>

      {/* ── Quick Action Shortcuts ── */}
      <section>
        <div style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)', marginBottom: '10px' }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <QuickAction
            label="Log Mileage"
            icon="🚗"
            primary
            onClick={() => onNavigateDaily({ step: 'mileage' })}
          />
          <QuickAction
            label="Add Income"
            icon="💷"
            onClick={() => onNavigateDaily({ step: 'income' })}
          />
          <QuickAction
            label="Closing Mileage"
            icon="🏁"
            onClick={() => onNavigateDaily({ step: 'endofday' })}
          />
          <QuickAction
            label="Record Rental"
            icon="📋"
            onClick={() => onNavigateDaily({ step: 'rental' })}
          />
          {onNavigateRecords && (
            <QuickAction
              label="Log Fuel"
              icon="⛽"
              onClick={() => onNavigateRecords('fuel')}
            />
          )}
        </div>
      </section>

      {/* ── Business Performance Overview ── */}
      <section>
        <div style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)', marginBottom: '10px' }}>
          Performance Overview
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
          <MetricCard
            label="Today's Income"
            value={fmt(todayTotal)}
            sub="Regular taxi"
            type="primary"
          />
          <MetricCard
            label="This Week's Income"
            value={fmt(weekIncome)}
            sub="All vehicles & rentals"
            type="success"
          />
          <MetricCard
            label="This Week's Expenses"
            value={fmt(weekExpenses)}
            sub="Fuel & operating"
            type="danger"
          />
          <MetricCard
            label="Estimated Week Profit"
            value={fmt(weekProfit)}
            sub={weekProfit >= 0 ? 'Net positive' : 'Net negative'}
            type={weekProfit >= 0 ? 'success' : 'warning'}
          />
        </div>
      </section>

      {/* ── Attention / Reminders Section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Weekly rental reminders */}
        <section className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700' }}>
              Weekly Rental Reminders
            </h2>
            {outstandingRentals.length > 0 ? (
              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                {outstandingRentals.length} due
              </span>
            ) : (
              <span style={{ background: 'var(--success-bg, rgba(22,163,74,0.08))', color: 'var(--success-text, #16a34a)', fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                All up to date
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rentalReminders.map(r => (
              <RentalReminderCard
                key={r.carId}
                {...r}
                onRecord={(carId, weekStart) => onNavigateDaily({ step: 'rental', carId, weekStart })}
              />
            ))}
          </div>
        </section>

        {/* Daily operations checklist */}
        <section className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700' }}>
              Today's Operations Checklist
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ChecklistItem
              step={1}
              label="Morning Mileage (SG24ZSN)"
              status={dailyStatus.mileageMorning}
              onClick={() => onNavigateDaily({ step: 'mileage' })}
            />
            <ChecklistItem
              step={2}
              label="Daily Income Entries"
              status={dailyStatus.income}
              onClick={() => onNavigateDaily({ step: 'income' })}
            />
            <ChecklistItem
              step={3}
              label="End-of-Day Closing Mileage"
              status={dailyStatus.endOfDay}
              onClick={() => onNavigateDaily({ step: 'endofday' })}
            />
          </div>
        </section>
      </div>

      {/* ── Recent Activity / Transactions ── */}
      <section className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700' }}>
            Recent Transactions
          </h2>
          {onNavigateRecords && (
            <button
              type="button"
              onClick={() => onNavigateRecords('income')}
              style={{
                background: 'none', border: 'none', color: 'var(--primary)',
                fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', padding: 0
              }}
            >
              View All Records →
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>No recent transactions found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Type</th>
                  <th style={{ padding: '8px 10px' }}>Vehicle</th>
                  <th style={{ padding: '8px 10px' }}>Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px' }}>{tx.date}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px',
                        background: tx.isIncome ? 'var(--success-bg, rgba(22,163,74,0.08))' : 'rgba(220,38,38,0.08)',
                        color: tx.isIncome ? 'var(--success-text, #16a34a)' : 'var(--danger, #dc2626)'
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{tx.car}</td>
                    <td style={{ padding: '10px', color: 'var(--muted)' }}>{tx.desc}</td>
                    <td style={{
                      padding: '10px', textAlign: 'right', fontWeight: '700',
                      color: tx.isIncome ? 'var(--success-text, #16a34a)' : 'var(--danger, #dc2626)'
                    }}>
                      {tx.isIncome ? `+${fmt(tx.amount)}` : `-${fmt(tx.amount)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
