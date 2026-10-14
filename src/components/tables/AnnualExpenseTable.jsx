import React from 'react';
import { TrashIcon } from '../../shared/icons';

const AnnualExpenseTable = ({ annualExpenses, handleDelete }) => {
  const totalAnnual = (annualExpenses || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  if (!annualExpenses || annualExpenses.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <p className="muted" style={{ margin: 0 }}>No annual expenses recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="table-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Annual Expenses (Amortized)</h3>
        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--danger, #dc2626)' }}>
          Total: £{totalAnnual.toFixed(2)}
        </span>
      </div>

      <div className="table-responsive" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Year</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Taxi</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount (£)</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', width: '70px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {annualExpenses.map((expense, index) => (
              <tr key={`annual-${index}`} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 12px' }}>{expense.year}</td>
                <td style={{ padding: '8px 12px' }}>{expense.car === 'ALL' ? 'All Taxis' : expense.car}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ background: 'var(--bg-tertiary, rgba(0,0,0,0.05))', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {expense.type}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--danger, #dc2626)' }}>
                  £{Number(expense.amount || 0).toFixed(2)}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleDelete('annual', index)}
                    title="Delete annual expense"
                    aria-label="Delete annual expense"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--danger, #dc2626)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <TrashIcon size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--bg-secondary)', fontWeight: '700', borderTop: '2px solid var(--border)' }}>
              <td colSpan="3" style={{ padding: '10px 12px' }}>TOTAL ANNUAL EXPENSES</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--danger, #dc2626)' }}>£{totalAnnual.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default AnnualExpenseTable;
