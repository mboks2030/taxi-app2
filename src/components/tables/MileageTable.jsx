import React, { useState, useMemo } from 'react';
import { CARS } from '../../constants';
import { TrashIcon, SearchIcon, CheckIcon } from '../../shared/icons';

const MileageTable = ({ mileage, handleDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [carFilter, setCarFilter] = useState('ALL');

    const filtered = useMemo(() => {
        return (mileage || []).filter(item => {
            const matchesCar = carFilter === 'ALL' || item.car === carFilter;
            const matchesSearch = !searchTerm ||
                (item.date && item.date.includes(searchTerm)) ||
                (CARS[item.car]?.label && CARS[item.car].label.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesCar && matchesSearch;
        });
    }, [mileage, carFilter, searchTerm]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [filtered]);

    const totalMileage = useMemo(() => {
        return sorted.reduce((s, m) => s + Number(m.dailyMileage || m.distance || 0), 0);
    }, [sorted]);

    if (!mileage || mileage.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <p className="muted" style={{ margin: 0 }}>No mileage records yet.</p>
            </div>
        );
    }

    return (
        <div className="table-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Mileage Records</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '10px', color: 'var(--muted)', display: 'flex' }}>
                            <SearchIcon size={14} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search date..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '6px 10px 6px 30px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)', width: '160px' }}
                        />
                    </div>
                    <select
                        value={carFilter}
                        onChange={(e) => setCarFilter(e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                    >
                        <option value="ALL">All Taxis</option>
                        {Object.entries(CARS).map(([id, { label }]) => (
                            <option key={id} value={id}>{label}</option>
                        ))}
                    </select>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--success, #16a34a)', marginLeft: '6px' }}>
                        Total: {totalMileage.toLocaleString()} mi
                    </span>
                </div>
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Taxi</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Morning</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>End of Day</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Daily Distance</th>
                            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '10px 12px', textAlign: 'center', width: '70px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>
                                    No records match your filters.
                                </td>
                            </tr>
                        ) : (
                            sorted.map((e, i) => {
                                const origIdx = mileage.findIndex(m => m.date === e.date && m.car === e.car && (m.morningMileage ?? m.startMileage) === (e.morningMileage ?? e.startMileage));
                                const morning = e.morningMileage ?? e.startMileage ?? 0;
                                const eod = e.endOfDayMileage ?? e.endMileage ?? null;
                                const daily = e.dailyMileage ?? e.distance ?? 0;
                                const complete = eod !== null && eod > 0;

                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '8px 12px' }}>{e.date}</td>
                                        <td style={{ padding: '8px 12px' }}>{CARS[e.car]?.label?.split(' - ')[0] || e.car}</td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>{Number(morning).toLocaleString()}</td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                            {complete ? Number(eod).toLocaleString() : <span style={{ color: 'var(--warn, #d97706)' }}>Pending</span>}
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: complete ? 'var(--success, #16a34a)' : 'var(--muted)' }}>
                                            {complete ? `${daily.toLocaleString()} mi` : '—'}
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                            {complete ? (
                                                <span style={{
                                                    background: 'var(--success-bg, #dcfce7)',
                                                    color: 'var(--success-text, #15803d)',
                                                    padding: '3px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <CheckIcon size={12} /> Complete
                                                </span>
                                            ) : (
                                                <span style={{
                                                    background: 'var(--warn-bg, #fef3c7)',
                                                    color: 'var(--warn-text, #92400e)',
                                                    padding: '3px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    Pending EOD
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete('mileage', origIdx)}
                                                title="Delete mileage entry"
                                                aria-label="Delete mileage entry"
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
                            <td colSpan="4" style={{ padding: '10px 12px' }}>TOTAL MILEAGE</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--success, #16a34a)' }}>{totalMileage.toLocaleString()} mi</td>
                            <td colSpan="2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default MileageTable;
