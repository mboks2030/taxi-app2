import { useState, useMemo } from 'react';
import { saveData } from '../../utils/storage';
import { CARS } from '../../constants';
import ConfirmationModal from '../common/ConfirmationModal';
import Toast from '../common/Toast';
import { validateRequired, validateNumber } from '../../utils/validation';
import { calculatePaymentBreakdown } from '../../utils/dashboardCalculator';

const PAYMENT_METHODS = [
  'Cash',
  'Card',
  'Pre Paid',
  'GCC Account',
  'Non-GCC Account'
];

const DailyIncomeForm = ({ dailyIncome, setDailyIncome }) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [car, setCar] = useState('SG24ZSN');
  const [method, setMethod] = useState('Cash');
  const [amount, setAmount] = useState('');

  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const handleClear = () => {
    setMethod('Cash');
    setAmount('');
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    const dateError = validateRequired(date, 'Date');
    if (dateError) newErrors.date = dateError;

    const amountError = validateNumber(amount, 'Amount', { min: 0.01 });
    if (amountError) newErrors.amount = amountError;

    const methodError = validateRequired(method, 'Payment Method');
    if (methodError) newErrors.method = methodError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = async () => {
    const newEntry = {
      id: Date.now(),
      date,
      car,
      method,
      amount: Number(amount),
      payments: [{ method, amount: Number(amount) }],
      dailyTotal: Number(amount)
    };

    const updatedIncome = [...dailyIncome, newEntry];
    setDailyIncome(updatedIncome);
    await saveData('dailyIncome', updatedIncome);

    setShowConfirm(false);
    setToast({ type: 'success', message: 'Daily income entry saved successfully' });
    handleClear();
  };

  const dailyTotals = useMemo(() => {
    if (!date) return null;
    const totals = {
      cash: 0,
      card: 0,
      prePaid: 0,
      gcc: 0,
      nonGcc: 0,
      total: 0
    };

    (dailyIncome || [])
      .filter(item => item.date === date)
      .forEach(item => {
        const b = calculatePaymentBreakdown(item);
        totals.cash += b.cash;
        totals.card += b.card;
        totals.prePaid += b.prePaid;
        totals.gcc += b.gcc;
        totals.nonGcc += b.nonGcc;
        totals.total += b.total;
      });

    return totals;
  }, [date, dailyIncome]);

  return (
    <div className="form-section">
      <form onSubmit={handlePreSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors({ ...errors, date: null });
              }}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <div className="error-message">! {errors.date}</div>}
          </div>
          <div className="form-group">
            <label>Car</label>
            <select value={car} onChange={(e) => setCar(e.target.value)}>
              {Object.entries(CARS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Payment Method *</label>
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                if (errors.method) setErrors({ ...errors, method: null });
              }}
              className={errors.method ? 'error' : ''}
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {errors.method && <div className="error-message">! {errors.method}</div>}
          </div>
          <div className="form-group">
            <label>Amount (£) *</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors({ ...errors, amount: null });
              }}
              className={errors.amount ? 'error' : ''}
              placeholder="0.00"
            />
            {errors.amount && <div className="error-message">! {errors.amount}</div>}
          </div>
        </div>

        {dailyTotals && (
          <div className="card" style={{ padding: '15px', background: 'var(--bg)', marginBottom: '20px', border: '1px solid var(--border)' }}>
            <h4 style={{ marginTop: 0, fontSize: '0.9rem', color: 'var(--muted)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '10px' }}>
              Daily Income Info ({date})
            </h4>
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cash:</span> <span>£{dailyTotals.cash.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Card:</span> <span>£{dailyTotals.card.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pre Paid:</span> <span>£{dailyTotals.prePaid.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GCC Account:</span> <span>£{dailyTotals.gcc.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Non-GCC Account:</span> <span>£{dailyTotals.nonGcc.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '5px', color: 'var(--primary)' }}>
                <span>Daily Total:</span> <span>£{dailyTotals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn">Preview & Save</button>
          <button type="button" className="btn alt" onClick={() => {
            setDate('');
            handleClear();
          }}>Reset Form</button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Confirm Daily Income"
        data={{
          'Date': date,
          'Car': CARS[car]?.label || car,
          'Method': method,
          'Amount': `£${Number(amount).toFixed(2)}`
        }}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DailyIncomeForm;