import React from 'react';

const ConfirmationModal = ({ isOpen, title, data, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={onCancel}>&times;</button>
                </div>
                <div className="modal-body">
                    <p className="modal-subtitle">Please review your entries before confirming.</p>
                    <div className="data-summary">
                        {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="summary-row">
                                <span className="summary-label">{key}:</span>
                                <span className="summary-value">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="btn alt" onClick={onCancel}>Edit / Cancel</button>
                    <button className="btn" onClick={onConfirm}>Confirm & Save</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
