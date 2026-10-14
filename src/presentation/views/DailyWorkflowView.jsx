import React, { useState, useMemo } from 'react';
import MileageForm from '../../components/forms/MileageForm';
import DailyIncomeForm from '../../components/forms/DailyIncomeForm';
import WeeklyRentalForm from '../../components/forms/WeeklyRentalForm';
import DailyIncomeTable from '../../components/tables/DailyIncomeTable';

const todayStr = () => new Date().toISOString().split('T')[0];

function WorkflowStepNav({ currentStep, onSelectStep, liveMorning, liveEndOfDay, incomeCount }) {
  const steps = [
    { num: 1, label: '1. Morning Mileage', status: liveMorning ? 'Complete' : 'Pending', done: liveMorning },
    { num: 2, label: '2. Daily Income', status: incomeCount > 0 ? `${incomeCount} entries` : 'Ready', done: incomeCount > 0 },
    { num: 3, label: '3. End of Day', status: liveEndOfDay ? 'Complete' : (liveMorning ? 'In progress' : 'Pending'), done: liveEndOfDay },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
      gap: '10px', marginBottom: '20px'
    }}>
      {steps.map(s => {
        const isActive = currentStep === s.num;
        return (
          <button
            key={s.num}
            type="button"
            onClick={() => onSelectStep(s.num)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '10px',
              border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: isActive ? 'var(--card-bg, #fff)' : 'var(--panel)',
              color: 'var(--text)', cursor: 'pointer', textAlign: 'left',
              boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.12)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: s.done ? 'var(--success, #16a34a)' : (isActive ? 'var(--primary, #2563eb)' : 'var(--border)'),
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: '700', flexShrink: 0
            }}>
              {s.done ? '✓' : s.num}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: isActive ? '700' : '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: s.done ? 'var(--success, #16a34a)' : 'var(--muted)' }}>
                {s.status}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function StepHeader({ step, total, title, subtitle, onBack }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
              padding: '6px 10px', cursor: 'pointer', color: 'var(--muted)',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', flexShrink: 0, marginTop: '2px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        )}
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: '500', marginBottom: '2px' }}>
            Step {step} of {total}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>{title}</h2>
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function ContinueButton({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'var(--primary)', color: '#fff', border: 'none',
        borderRadius: '10px', padding: '10px 22px',
        fontWeight: '700', fontSize: '0.9rem', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s',
        display: 'inline-flex', alignItems: 'center', gap: '8px',
      }}
    >
      {label}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

/* ---- Main daily workflow ---- */
export default function DailyWorkflowView({
  mileage, setMileage,
  dailyIncome, setDailyIncome,
  weeklyRentals, setWeeklyRentals,
  handleDelete,
  initialStep,
  initialCarId,
  initialWeekStart,
}) {
  const today = todayStr();

  // Determine starting step
  const todayMileage = (mileage || []).find(m => m.date === today && m.car === 'SG24ZSN');
  const hasMorning = !!(todayMileage && (todayMileage.morningMileage || todayMileage.startMileage));
  const hasEndOfDay = !!(todayMileage && (todayMileage.endOfDayMileage || todayMileage.endMileage));
  const todayIncomeEntries = (dailyIncome || []).filter(i => i.date === today);

  // Steps: 1=mileage, 2=income, 3=endofday, 4=rental
  const getDefaultStep = () => {
    if (initialStep === 'rental') return 4;
    if (initialStep === 'endofday') return 3;
    if (initialStep === 'income') return 2;
    if (initialStep === 'mileage') return 1;
    // Auto-advance based on data
    if (!hasMorning) return 1;
    if (todayIncomeEntries.length === 0) return 2;
    if (!hasEndOfDay) return 3;
    return 2; // default to income if all done
  };

  const [step, setStep] = useState(getDefaultStep);

  // Re-check mileage state from live data
  const liveMileage = useMemo(() => (mileage || []).find(m => m.date === today && m.car === 'SG24ZSN'), [mileage, today]);
  const liveMorning = !!(liveMileage && (liveMileage.morningMileage || liveMileage.startMileage));
  const liveEndOfDay = !!(liveMileage && (liveMileage.endOfDayMileage || liveMileage.endMileage));
  const liveIncome = (dailyIncome || []).filter(i => i.date === today);
  const todayTotal = liveIncome.reduce((s, i) => s + Number(i.amount || 0), 0);

  const TOTAL_STEPS = 3;

  // ── Step 4: Record a Rental (launched from Dashboard reminders) ──
  if (step === 4) {
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
              padding: '6px 12px', cursor: 'pointer', color: 'var(--muted)',
              display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
            }}
          >
            ← Return to Daily Operations
          </button>
        </div>
        <StepHeader
          step={1} total={1}
          title="Record Weekly Rental"
          subtitle="Record the weekly rental income for the preselected vehicle below."
        />
        <div className="card" style={{ padding: '24px' }}>
          <WeeklyRentalForm
            weeklyRentals={weeklyRentals}
            setWeeklyRentals={setWeeklyRentals}
            preselectedCar={initialCarId}
            preselectedWeek={initialWeekStart}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Clickable Step Nav: User is never trapped in a wizard */}
      <WorkflowStepNav
        currentStep={step}
        onSelectStep={setStep}
        liveMorning={liveMorning}
        liveEndOfDay={liveEndOfDay}
        incomeCount={liveIncome.length}
      />

      {/* ── Step 1: Morning Mileage ── */}
      {step === 1 && (
        <div>
          <StepHeader
            step={1} total={TOTAL_STEPS}
            title="Morning Mileage"
            subtitle="Record the starting odometer reading for the regular taxi (SG24ZSN) today."
          />
          <div className="card" style={{ padding: '24px' }}>
            <MileageForm mileage={mileage} setMileage={setMileage} />
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ContinueButton
              label="Continue to Daily Income"
              onClick={() => setStep(2)}
            />
            {!liveMorning && (
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                (Opening mileage not yet saved for today)
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: Daily Income ── */}
      {step === 2 && (
        <div>
          <StepHeader
            step={2} total={TOTAL_STEPS}
            title="Daily Income"
            subtitle="Record each fare or account payment for today. Add as many as needed."
            onBack={() => setStep(1)}
          />

          {/* Running total banner */}
          <div style={{
            background: liveIncome.length > 0 ? 'var(--success-bg, rgba(22,163,74,0.08))' : 'var(--panel)',
            border: `1px solid ${liveIncome.length > 0 ? 'var(--success, #16a34a)' : 'var(--border)'}`,
            borderRadius: '10px', padding: '12px 18px', marginBottom: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px'
          }}>
            <span style={{ fontWeight: '600', color: liveIncome.length > 0 ? 'var(--success-text, #16a34a)' : 'var(--text)', fontSize: '0.9rem' }}>
              {liveIncome.length} {liveIncome.length === 1 ? 'entry' : 'entries'} recorded today
            </span>
            <span style={{ fontWeight: '700', color: liveIncome.length > 0 ? 'var(--success-text, #16a34a)' : 'var(--primary)', fontSize: '1.15rem' }}>
              £{todayTotal.toFixed(2)} running total
            </span>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <DailyIncomeForm dailyIncome={dailyIncome} setDailyIncome={setDailyIncome} />
          </div>

          {/* Today's Entries list */}
          {liveIncome.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: '700' }}>Today's Entries</h3>
              <DailyIncomeTable
                dailyIncome={liveIncome}
                handleDelete={handleDelete}
              />
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <ContinueButton
              label="Continue to End of Day"
              onClick={() => setStep(3)}
            />
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
                fontSize: '0.85rem', textDecoration: 'underline', padding: 0
              }}
            >
              Back to morning mileage
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: End of Day ── */}
      {step === 3 && (() => {
        const morningOdo = liveMileage ? (liveMileage.morningMileage || liveMileage.startMileage || 0) : null;
        const endOdo = liveMileage ? (liveMileage.endOfDayMileage || liveMileage.endMileage || null) : null;
        const dailyDist = endOdo && morningOdo ? endOdo - morningOdo : null;

        return (
          <div>
            <StepHeader
              step={3} total={TOTAL_STEPS}
              title="End of Day Closing"
              subtitle="Enter the final odometer reading to calculate total miles driven and close the day."
              onBack={() => setStep(2)}
            />

            {/* Day summary badges */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px'
            }}>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>Today's Total Income</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>£{todayTotal.toFixed(2)}</div>
              </div>
              {morningOdo && (
                <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>Morning Odometer</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{Number(morningOdo).toLocaleString()} mi</div>
                </div>
              )}
              {dailyDist !== null && (
                <div style={{ background: 'var(--success-bg, rgba(22,163,74,0.08))', border: '1px solid var(--success, #16a34a)', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success-text, #16a34a)', marginBottom: '4px' }}>Distance Driven Today</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success-text, #16a34a)' }}>{dailyDist.toLocaleString()} mi</div>
                </div>
              )}
            </div>

            {!liveEndOfDay ? (
              <div className="card" style={{ padding: '24px' }}>
                <MileageForm mileage={mileage} setMileage={setMileage} />
              </div>
            ) : (
              <div style={{
                background: 'var(--success-bg, rgba(22,163,74,0.08))', border: '1px solid var(--success, #16a34a)',
                borderRadius: '12px', padding: '24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--success, #16a34a)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div style={{ fontWeight: '700', color: 'var(--success-text, #16a34a)', fontSize: '1.05rem' }}>
                  Day successfully closed! Closing reading: {Number(endOdo).toLocaleString()} mi
                </div>
                {dailyDist !== null && (
                  <div style={{ color: 'var(--success-text, #16a34a)', fontSize: '0.88rem', marginTop: '4px' }}>
                    Total distance logged: {dailyDist.toLocaleString()} miles
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
                  fontSize: '0.85rem', textDecoration: 'underline', padding: 0
                }}
              >
                Back to income entries
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
