import { useState, useEffect } from 'react';
import { saveData } from '../../utils/storage';
import { CARS } from '../../constants';
import ConfirmationModal from '../common/ConfirmationModal';
import Toast from '../common/Toast';
import { validateRequired, validateNumber } from '../../utils/validation';

const MileageForm = ({ mileage, setMileage }) => {
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [car, setCar] = useState('SG24ZSN');
    const [morningMileage, setMorningMileage] = useState('');
    const [endOfDayMileage, setEndOfDayMileage] = useState('');
    const [dailyMileage, setDailyMileage] = useState(0);
    const [existingEntry, setExistingEntry] = useState(null);
    const [errors, setErrors] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (!date || !car) { setExistingEntry(null); return; }
        const existing = (mileage || []).find(m => m.date === date && m.car === car);
        if (existing) {
            setExistingEntry(existing);
            setMorningMileage(String(existing.morningMileage ?? existing.startMileage ?? ''));
            setEndOfDayMileage(existing.endOfDayMileage ?? existing.endMileage ? String(existing.endOfDayMileage ?? existing.endMileage) : '');
        } else {
            setExistingEntry(null);
            setMorningMileage('');
            setEndOfDayMileage('');
        }
    }, [date, car, mileage]);

    useEffect(() => {
        const m = Number(morningMileage) || 0, e = Number(endOfDayMileage) || 0;
        setDailyMileage(e >= m && m > 0 ? e - m : 0);
    }, [morningMileage, endOfDayMileage]);

    const handleClear = () => { setDate(''); setCar('SG24ZSN'); setMorningMileage(''); setEndOfDayMileage(''); setDailyMileage(0); setExistingEntry(null); setErrors({}); };

    const validate = () => {
        const newErrors = {};
        if (validateRequired(date, 'Date')) newErrors.date = 'Date required';
        if (validateNumber(morningMileage, 'Morning', { min: 0 })) newErrors.morningMileage = 'Valid morning mileage required';
        if (endOfDayMileage && Number(endOfDayMileage) < Number(morningMileage)) newErrors.endOfDayMileage = 'End of day must be >= morning';
        if (!existingEntry && (mileage || []).some(m => m.date === date && m.car === car)) newErrors.date = 'Morning mileage exists for this date';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePreSubmit = (e) => { e.preventDefault(); if (validate()) setShowConfirm(true); };

    const handleConfirm = async () => {
        const entry = {
            id: existingEntry?.id || Date.now(),
            date, car,
            morningMileage: Number(morningMileage),
            startMileage: Number(morningMileage),
            ...(endOfDayMileage ? { endOfDayMileage: Number(endOfDayMileage), endMileage: Number(endOfDayMileage), distance: dailyMileage, dailyMileage } : {})
        };
        const updated = existingEntry ? (mileage || []).map(m => m.date === date && m.car === car ? entry : m) : [...(mileage || []), entry];
        setMileage(updated);
        await saveData('mileage', updated);
        setShowConfirm(false);
        setToast({ type: 'success', message: endOfDayMileage ? 'Mileage complete!' : 'Morning mileage saved!' });
        handleClear();
    };

    const isUpdating = existingEntry && !(existingEntry.endOfDayMileage || existingEntry.endMileage);

    return (
        <div className="form-section">
            <form onSubmit={handlePreSubmit}>
                <div className="form-group">
                    <label>Date *</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={errors.date ? 'error' : ''} />
                    {errors.date && <div className="error-message">! {errors.date}</div>}
                </div>
                <div className="form-group">
                    <label>Car</label>
                    <select value={car} onChange={(e) => setCar(e.target.value)}>
                        {Object.entries(CARS).map(([id, { label }]) => <option key={id} value={id}>{label}</option>)}
                    </select>
                </div>
                {isUpdating && <div style={{ background: 'var(--warn-bg)', border: '1px solid var(--warn)', borderRadius: '8px', padding: '10px', marginBottom: '15px', fontSize: '0.85rem' }}>Morning: {Number(morningMileage).toLocaleString()} mi — add end of day to complete.</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                        <label>Morning Mileage *</label>
                        <input type="number" min="0" value={morningMileage} onChange={(e) => setMorningMileage(e.target.value)} disabled={isUpdating} className={errors.morningMileage ? 'error' : ''} />
                        {errors.morningMileage && <div className="error-message">! {errors.morningMileage}</div>}
                    </div>
                    <div className="form-group">
                        <label>End of Day Mileage</label>
                        <input type="number" min="0" value={endOfDayMileage} onChange={(e) => setEndOfDayMileage(e.target.value)} className={errors.endOfDayMileage ? 'error' : ''} />
                        {errors.endOfDayMileage && <div className="error-message">! {errors.endOfDayMileage}</div>}
                    </div>
                </div>
                {dailyMileage > 0 && <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: '8px', padding: '12px', marginBottom: '15px' }}>Daily Mileage: <strong>{dailyMileage.toLocaleString()} miles</strong></div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn">{isUpdating ? 'Save End of Day' : 'Save'}</button>
                    <button type="button" className="btn alt" onClick={handleClear}>Reset</button>
                </div>
            </form>
            <ConfirmationModal isOpen={showConfirm} title="Confirm Mileage" data={{ 'Date': date, 'Car': CARS[car]?.label || car, 'Morning': `${Number(morningMileage).toLocaleString()} mi`, ...(endOfDayMileage ? { 'End of Day': `${Number(endOfDayMileage).toLocaleString()} mi`, 'Daily Mileage': `${dailyMileage.toLocaleString()} mi` } : {}) }} onConfirm={handleConfirm} onCancel={() => setShowConfirm(false)} />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default MileageForm;
