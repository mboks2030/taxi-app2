import { useState } from 'react';
import { saveData } from '../../utils/storage';
import { CARS, ANNUAL_EXPENSE_TYPES } from '../../constants';
import ConfirmationModal from '../common/ConfirmationModal';
import Toast from '../common/Toast';
import { validateNumber } from '../../utils/validation';

const AnnualExpenseForm = ({ annualExpenses, setAnnualExpenses }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [car, setCar] = useState('SG24ZSN');
    const [type, setType] = useState('Annual Inspection');
    const [amount, setAmount] = useState('');

    const [errors, setErrors] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState(null);

    const handleClear = () => {
        setYear(new Date().getFullYear());
        setCar('SG24ZSN');
        setType('Annual Inspection');
        setAmount('');
        setErrors({});
    };

    const validate = () => {
        const newErrors = {};

        const yearError = validateNumber(year, 'Year', { min: 2000, max: 2100 });
        if (yearError) newErrors.year = yearError;

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
        const newItem = {
            id: Date.now(),
            year: Number(year),
            car,
            type,
            amount: Number(amount)
        };

        const updatedExpenses = [...annualExpenses, newItem];
        setAnnualExpenses(updatedExpenses);
        await saveData('annualExpenses', updatedExpenses);

        setShowConfirm(false);
        setToast({ type: 'success', message: 'Annual expense captured successfully!' });
        handleClear();
    };

    return (
        <div className="form-section">
            <form onSubmit={handlePreSubmit}>
                <div className="form-group">
                    <label>Year *</label>
                    <input
                        type="number"
                        min="2000"
                        max="2100"
                        value={year}
                        onChange={(e) => {
                            setYear(e.target.value);
                            if (errors.year) setErrors({ ...errors, year: null });
                        }}
                        className={errors.year ? 'error' : ''}
                    />
                    {errors.year && <div className="error-message">! {errors.year}</div>}
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
                        <option value="ALL">All Taxis (Shared)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Expense Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        {ANNUAL_EXPENSE_TYPES.map(expense => (
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
                title="Confirm Annual Expense"
                data={{
                    'Year': year,
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

export default AnnualExpenseForm;
