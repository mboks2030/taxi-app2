import React, { useState, useMemo } from 'react';
import { CARS } from '../../constants';
import { calculatePaymentBreakdown } from '../../utils/dashboardCalculator';
import { TrashIcon, SearchIcon } from '../../shared/icons';

const DailyIncomeTable = ({ dailyIncome, handleDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [carFilter, setCarFilter] = useState('ALL');

  const filteredIncome = useMemo(() => {
    return (dailyIncome || []).filter(item => {
      const matchesCar = carFilter === 'ALL' || item.car === carFilter;
      const matchesSearch = !searchTerm ||
        (item.date && item.date.includes(searchTerm)) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (CARS[item.car]?.label && CARS[item.car].label.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCar && matchesSearch;
    });
  }, [dailyIncome, carFilter, searchTerm]);

  const { totals, groupedByDate } = useMemo(() => {
    let tCash = 0, tCard = 0, tPrePaid = 0, tGcc = 0, tNonGcc = 0, tAll = 0;
    const sortedList = [...filteredIncome].sort((a, b) => new Date(b.date) - new Date(a.date));

    const grouped = {};
    sortedList.forEach(e => {
      const breakdown = calculatePaymentBreakdown(e);
      tCash += breakdown.cash;
      tCard += breakdown.card;
      tPrePaid += breakdown.prePaid;
      tGcc += breakdown.gcc;
      tNonGcc += breakdown.nonGcc;
      tAll += breakdown.total;

      if (!grouped[e.date]) {
        grouped[e.date] = {
          entries: [],
          subtotal: { cash: 0, card: 0, prePaid: 0, gcc: 0, nonGcc: 0, total: 0 }
        };
      }
      grouped[e.date].entries.push({ ...e, _breakdown: breakdown });
      grouped[e.date].subtotal.cash += breakdown.cash;
      grouped[e.date].subtotal.card += breakdown.card;
      grouped[e.date].subtotal.prePaid += breakdown.prePaid;
      grouped[e.date].subtotal.gcc += breakdown.gcc;
      grouped[e.date].subtotal.nonGcc += breakdown.nonGcc;
      grouped[e.date].subtotal.total += breakdown.total;
    });

    const dateGroups = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    return {
      totals: { tCash, tCard, tPrePaid, tGcc, tNonGcc, tAll },
      groupedByDate: { grouped, dateGroups }
    };
  }, [filteredIncome]);

  if (!dailyIncome || dailyIncome.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <p className="muted" style={{ margin: 0 }}>No daily income records found. Add an entry above to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Daily Income Records</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '10px', color: 'var(--muted)', display: 'flex' }}>
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search date, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '6px 10px 6px 30px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)', width: '180px' }}
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
        </div>
      </div>

      <div className="table-responsive" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Taxi</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Cash (£)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Card (£)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Pre-Paid (£)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>GCC (£)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Non-GCC (£)</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>Total (£)</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', width: '70px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {groupedByDate.dateGroups.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>
                  No entries match the selected filters.
                </td>
              </tr>
            ) : (
              groupedByDate.dateGroups.map((date) => {
                const group = groupedByDate.grouped[date];
                return (
                  <React.Fragment key={date}>
                    {group.entries.map((item) => {
                      const originalIndex = dailyIncome.indexOf(dailyIncome.find(orig => orig.id === item.id));
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{item.date}</td>
                          <td style={{ padding: '8px 12px' }}>{CARS[item.car]?.label?.split(' - ')[0] || item.car}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{item._breakdown.cash.toFixed(2)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{item._breakdown.card.toFixed(2)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{item._breakdown.prePaid.toFixed(2)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{item._breakdown.gcc.toFixed(2)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{item._breakdown.nonGcc.toFixed(2)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>£{item._breakdown.total.toFixed(2)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleDelete('income', originalIndex)}
                              title="Delete entry"
                              aria-label="Delete entry"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--danger, #dc2626)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '4px'
                              }}
                            >
                              <TrashIcon size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: 'var(--bg-tertiary, rgba(0,0,0,0.03))', borderTop: '1px solid var(--border)', borderBottom: '2px solid var(--border)', fontWeight: '600', fontSize: '0.85rem' }}>
                      <td colSpan="2" style={{ padding: '8px 12px', fontStyle: 'italic' }}>
                        {date} Subtotal
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{group.subtotal.cash.toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{group.subtotal.card.toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{group.subtotal.prePaid.toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{group.subtotal.gcc.toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{group.subtotal.nonGcc.toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--primary, #2563eb)' }}>£{group.subtotal.total.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--bg-secondary)', fontWeight: '700', borderTop: '2px solid var(--border)' }}>
              <td colSpan="2" style={{ padding: '10px 12px' }}>GRAND TOTAL</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>£{totals.tCash.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>£{totals.tCard.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>£{totals.tPrePaid.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>£{totals.tGcc.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>£{totals.tNonGcc.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--success, #16a34a)', fontSize: '1rem' }}>£{totals.tAll.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DailyIncomeTable;