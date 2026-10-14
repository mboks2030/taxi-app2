import { useState } from 'react';
import { saveData } from '../../utils/storage';
import { CARS, EXPENSE_TYPES } from '../../constants';
import ConfirmationModal from '../common/ConfirmationModal';
import Toast from '../common/Toast';
import { validateRequired, validateNumber } from '../../utils/validation';

const MonthlyExpenseForm = ({ monthlyExpenses, setMonthlyExpenses }) => {
  const [month, setMonth] = useState('');
  const [car, setCar] = useState('SG24ZSN');
  const [type, setType] = useState('Fleet Insurance');
  const [amount, setAmount] = useState('');

  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const handleClear = () => {
    setMonth('');
    setCar('SG24ZSN');
    setType('Fleet Insurance');
    setAmount('');
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    // Custom logic for month required check if needed, but validateRequired works for strings
    const monthError = validateRequired(month, 'Month');
    if (monthError) newErrors.month = monthError;

    const amountError = validateNumber(amount, 'Amount', { min: 0 });
    if (amountError) newErrors.amount = amountError;

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
    const newItem = {
      id: Date.now(),
      month,
      car,
      type,
      amount: Number(amount)
    };

    const updatedExpenses = [...monthlyExpenses, newItem];
    setMonthlyExpenses(updatedExpenses);
    await saveData('monthlyExpenses', updatedExpenses);

    setShowConfirm(false);
    setToast({ type: 'success', message: 'Monthly expense captured successfully!' });
    handleClear();
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    if (newType === 'Fleet Insurance') {
      setCar('ALL');
    }
  };

  return (
    <div className="form-section">
      <form onSubmit={handlePreSubmit}>
        <div className="form-group">
          <label>Month *</label>
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              if (errors.month) setErrors({ ...errors, month: null });
            }}
            className={errors.month ? 'error' : ''}
          />
          {errors.month && <div className="error-message">! {errors.month}</div>}
        </div>

        <div className="form-group">
          <label>Car</label>
          <select
            value={car}
            onChange={(e) => setCar(e.target.value)}
          >
            {Object.entries(CARS).map(([id, { label }]) => (
              <option key={id} value={id}>{label}</option>
            ))}
            <option value="ALL">All Taxis (Fleet Insurance/Shared)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Expense Type</label>
          <select value={type} onChange={handleTypeChange}>
            {EXPENSE_TYPES.map(expense => (
              <option key={expense} value={expense}>{expense}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Amount (£) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors({ ...errors, amount: null });
            }}
            className={errors.amount ? 'error' : ''}
          />
          {errors.amount && <div className="error-message">! {errors.amount}</div>}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn">Preview & Save</button>
          <button type="button" className="btn alt" onClick={handleClear}>Reset Form</button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Confirm Monthly Expense"
        data={{
          'Month': month,
          'Car': car === 'ALL' ? 'All Taxis' : (CARS[car]?.label || car),
          'Type': type,
          'Amount': `£${Number(amount).toFixed(2)}`
        }}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MonthlyExpenseForm;