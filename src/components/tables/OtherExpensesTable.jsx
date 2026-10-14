import React, { useState, useMemo } from 'react';
import { CARS } from '../../constants';
import { TrashIcon, SearchIcon } from '../../shared/icons';

const OtherExpensesTable = ({ otherExpenses, handleDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const sortedExpenses = useMemo(() => {
        return [...(otherExpenses || [])]
            .filter(e => {
                if (!searchTerm) return true;
                const term = searchTerm.toLowerCase();
                return (e.date && e.date.includes(term)) ||
                    (e.type && e.type.toLowerCase().includes(term)) ||
                    (e.description && e.description.toLowerCase().includes(term)) ||
                    (e.car && e.car.toLowerCase().includes(term));
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [otherExpenses, searchTerm]);

    const totalOther = (otherExpenses || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    if (!otherExpenses || otherExpenses.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <p className="muted" style={{ margin: 0 }}>No other expenses recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="table-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Other Business Expenses</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '10px', color: 'var(--muted)', display: 'flex' }}>
                            <SearchIcon size={14} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '6px 10px 6px 30px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)', width: '180px' }}
                        />
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--danger, #dc2626)' }}>
                        Total: £{totalOther.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Taxi</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Type</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Description</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount (£)</th>
                            <th style={{ padding: '10px 12px', textAlign: 'center', width: '70px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedExpenses.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>
                                    No expenses match your search.
                                </td>
                            </tr>
                        ) : (
                            sortedExpenses.map((expense) => {
                                const originalIndex = otherExpenses.findIndex(e =>
                                    e.date === expense.date &&
                                    e.type === expense.type &&
                                    e.amount === expense.amount
                                );

                                return (
                                    <tr key={`${expense.date}-${originalIndex}`} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '8px 12px' }}>{expense.date}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                            {expense.car === 'ALL'
                                                ? 'All Taxis'
                                                : (CARS[expense.car]?.label?.split(' - ')[0] || expense.car)}
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>
                                            <span style={{
                                                background: 'var(--bg-tertiary, rgba(0,0,0,0.05))',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem'
                                            }}>
                                                {expense.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {expense.description || '—'}
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--danger, #dc2626)' }}>
                                            £{Number(expense.amount || 0).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete('otherExpense', originalIndex)}
                                                title="Delete expense"
                                                aria-label="Delete expense"
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
                                );
                            })
                        )}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: 'var(--bg-secondary)', fontWeight: '700', borderTop: '2px solid var(--border)' }}>
                            <td colSpan="4" style={{ padding: '10px 12px' }}>TOTAL OTHER EXPENSES</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--danger, #dc2626)' }}>£{totalOther.toFixed(2)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default OtherExpensesTable;
