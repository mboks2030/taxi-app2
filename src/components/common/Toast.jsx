import { useEffect } from 'react';
import { CheckIcon, WarningIcon } from '../../shared/icons';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const renderIcon = () => {
        switch (type) {
            case 'success':
                return <CheckIcon size={16} />;
            case 'error':
            case 'warning':
                return <WarningIcon size={16} />;
            default:
                return <CheckIcon size={16} />;
        }
    };

    return (
        <div className={`toast toast-${type}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="toast-icon" style={{ display: 'flex', alignItems: 'center' }}>{renderIcon()}</div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={onClose} aria-label="Close" type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: '1' }}>
                &times;
            </button>
        </div>
    );
};

export default Toast;
