import { useState } from 'react';
import { saveData } from '../../utils/storage';
import { CARS } from '../../constants';
import ConfirmationModal from '../common/ConfirmationModal';
import Toast from '../common/Toast';
import { validateRequired, validateNumber } from '../../utils/validation';

const WeeklyRentalForm = ({ weeklyRentals, setWeeklyRentals, preselectedCar, preselectedWeek }) => {
  const [weekStartDate, setWeekStartDate] = useState(preselectedWeek || '');
  const [car, setCar] = useState(preselectedCar || 'NU75DXB');
  const [amount, setAmount] = useState('');

  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const handleClear = () => {
    setWeekStartDate('');
    setCar('NU75DXB');
    setAmount('');
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    const dateError = validateRequired(weekStartDate, 'Week Start Date');
    if (dateError) newErrors.weekStartDate = dateError;

    const amountError = validateNumber(amount, 'Rental Income', { min: 0 });
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
    const newRental = {
      id: Date.now(),
      weekStartDate,
      car,
      amount: Number(amount)
    };

    const updatedRentals = [...weeklyRentals, newRental];
    setWeeklyRentals(updatedRentals);
    await saveData('weeklyRentals', updatedRentals);

    setShowConfirm(false);
    setToast({ type: 'success', message: 'Weekly rental captured successfully!' });
    handleClear();
  };

  return (
    <div className="form-section">
      <form onSubmit={handlePreSubmit}>
        <div className="form-group">
          <label>Week Starting *</label>
          <input
            type="date"
            value={weekStartDate}
            onChange={(e) => {
              setWeekStartDate(e.target.value);
              if (errors.weekStartDate) setErrors({ ...errors, weekStartDate: null });
            }}
            className={errors.weekStartDate ? 'error' : ''}
          />
          {errors.weekStartDate && <div className="error-message">! {errors.weekStartDate}</div>}
        </div>

        <div className="form-group">
          <label>Car</label>
          <select value={car} onChange={(e) => setCar(e.target.value)}>
            {Object.entries(CARS)
              .filter(([_, { type }]) => type === 'weekly')
              .map(([id, { label }]) => (
                <option key={id} value={id}>{label}</option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label>Rental Income (£) *</label>
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
        title="Confirm Weekly Rental"
        data={{
          'Week Starting': weekStartDate,
          'Car': CARS[car]?.label || car,
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

export default WeeklyRentalForm;