import { useState } from 'react';
import { saveData } from '../../utils/storage';
import { CARS } from '../../constants';
import ConfirmationModal from '../common/ConfirmationModal';
import Toast from '../common/Toast';
import { validateRequired, validateNumber } from '../../utils/validation';

// Common expense type suggestions for quick selection
const EXPENSE_SUGGESTIONS = [
    'Toll/Parking',
    'Car Wash',
    'Supplies',
    'Tips/Gifts',
    'Repairs',
    'Other'
];

const OtherExpensesForm = ({ otherExpenses, setOtherExpenses }) => {
    const [date, setDate] = useState('');
    const [car, setCar] = useState('SG24ZSN');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const [errors, setErrors] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState(null);

    const handleClear = () => {
        setDate('');
        setCar('SG24ZSN');
        setType('');
        setDescription('');
        setAmount('');
        setErrors({});
    };

    const validate = () => {
        const newErrors = {};

        const dateError = validateRequired(date, 'Date');
        if (dateError) newErrors.date = dateError;

        const typeError = validateRequired(type, 'Expense Type');
        if (typeError) newErrors.type = typeError;

        const amountError = validateNumber(amount, 'Amount', { min: 0.01 });
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
        const newExpense = {
            id: Date.now(),
            date,
            car,
            type,
            description: description.trim() || type,
            amount: Number(amount)
        };

        const updatedExpenses = [...(otherExpenses || []), newExpense];
        setOtherExpenses(updatedExpenses);
        await saveData('otherExpenses', updatedExpenses);

        setShowConfirm(false);
        setToast({ type: 'success', message: 'Expense recorded successfully!' });
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
                        <option value="ALL">All Taxis (Shared)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Expense Type *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {EXPENSE_SUGGESTIONS.map(suggestion => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                    setType(suggestion);
                                    if (errors.type) setErrors({ ...errors, type: null });
                                }}
                                style={{
                                    padding: '4px 10px',
                                    fontSize: '0.8rem',
                                    borderRadius: '20px',
                                    border: type === suggestion ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: type === suggestion ? 'rgba(37, 99, 235, 0.1)' : 'white',
                                    color: type === suggestion ? 'var(--primary)' : 'var(--muted)',
                                    cursor: 'pointer',
                                    fontWeight: type === suggestion ? '600' : '400',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Or type your own expense category..."
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            if (errors.type) setErrors({ ...errors, type: null });
                        }}
                        className={errors.type ? 'error' : ''}
                    />
                    {errors.type && <div className="error-message">! {errors.type}</div>}
                </div>

                <div className="form-group">
                    <label>Description (optional)</label>
                    <input
                        type="text"
                        placeholder="Additional details..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
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
                title="Confirm Other Expense"
                data={{
                    'Date': date,
                    'Car': car === 'ALL' ? 'All Taxis (Shared)' : (CARS[car]?.label || car),
                    'Type': type,
                    'Description': description || '-',
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

export default OtherExpensesForm;
