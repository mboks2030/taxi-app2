import React from 'react';
import { CARS } from '../../constants';
import { TrashIcon } from '../../shared/icons';

const DailyFuelTable = ({ dailyFuel, handleDelete }) => {
  const totalFuel = (dailyFuel || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  if (!dailyFuel || dailyFuel.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <p className="muted" style={{ margin: 0 }}>No daily fuel records yet.</p>
      </div>
    );
  }

  return (
    <div className="table-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Daily Fuel Expenses</h3>
        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--danger, #dc2626)' }}>
          Total: £{totalFuel.toFixed(2)}
        </span>
      </div>

      <div className="table-responsive" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Taxi</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Fuel (£)</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', width: '70px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {dailyFuel.map((item, index) => (
              <tr key={`fuel-${index}`} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 12px' }}>{item.date}</td>
                <td style={{ padding: '8px 12px' }}>{CARS[item.car]?.label?.split(' - ')[0] || item.car}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--danger, #dc2626)' }}>
                  £{Number(item.amount || 0).toFixed(2)}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleDelete('fuel', index)}
                    title="Delete fuel entry"
                    aria-label="Delete fuel entry"
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
              <td colSpan="2" style={{ padding: '10px 12px' }}>TOTAL FUEL</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--danger, #dc2626)' }}>£{totalFuel.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DailyFuelTable;