const DeleteModal = ({ onCancel, onConfirm, itemType = 'record' }) => {
  const typeLabels = {
    income: 'income entry',
    rental: 'rental entry',
    fuel: 'fuel entry',
    expense: 'expense entry',
    annual: 'annual expense',
    mileage: 'mileage entry',
    otherExpense: 'expense entry',
    record: 'record'
  };

  const label = typeLabels[itemType] || 'record';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px', borderRadius: '12px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.2rem', color: '#dc2626' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Confirm Deletion
          </h3>
          <button
            className="close-btn"
            onClick={onCancel}
            type="button"
            aria-label="Close"
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--muted)' }}
          >
            &times;
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem 0' }}>
          <p style={{ margin: '0 0 16px', color: 'var(--text)', lineHeight: '1.6' }}>
            Are you sure you want to delete this <strong>{label}</strong>?
          </p>

          <div style={{
            background: 'var(--warn-bg, #fffbeb)',
            border: '1px solid var(--warn, #fef3c7)',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div style={{ fontSize: '0.85rem', color: 'var(--warn-text, #92400e)', lineHeight: '1.5' }}>
              <strong>Notice:</strong> This action cannot be undone. The entry will be removed permanently from both your local device and cloud records.
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn alt" type="button" onClick={onCancel} style={{ borderRadius: '6px' }}>
            Cancel
          </button>
          <button className="btn danger" type="button" onClick={onConfirm} style={{ borderRadius: '6px', background: '#dc2626', color: '#fff', border: 'none' }}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;