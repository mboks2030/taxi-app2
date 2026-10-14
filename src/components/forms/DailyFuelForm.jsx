import { useState } from 'react';
import { saveData } from '../../utils/storage';
import { CARS } from '../../constants';
import ConfirmationModal from '../common/ConfirmationModal';
import Toast from '../common/Toast';
import { validateRequired, validateNumber } from '../../utils/validation';

const DailyFuelForm = ({ dailyFuel, setDailyFuel }) => {
  const [date, setDate] = useState('');
  const [car, setCar] = useState('SG24ZSN');
  const [amount, setAmount] = useState('');

  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const handleClear = () => {
    setDate('');
    setCar('SG24ZSN');
    setAmount('');
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    const dateError = validateRequired(date, 'Date');
    if (dateError) newErrors.date = dateError;

    const amountError = validateNumber(amount, 'Fuel Cost', { min: 0 });
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
    const newFuel = {
      id: Date.now(),
      date,
      car,
      amount: Number(amount)
    };

    const updatedFuel = [...dailyFuel, newFuel];
    setDailyFuel(updatedFuel);
    await saveData('dailyFuel', updatedFuel);

    setShowConfirm(false);
    setToast({ type: 'success', message: 'Fuel cost capture successful!' });
    handleClear();
  };

  return (
    <div className="form-section">
      <form onSubmit={handlePreSubmit}>
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
            {Object.entries(CARS).map(([id, { label }]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fuel (£) *</label>
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
        title="Confirm Daily Fuel"
        data={{
          'Date': date,
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

export default DailyFuelForm;