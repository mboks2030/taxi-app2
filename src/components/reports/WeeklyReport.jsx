import { useState, useMemo } from 'react';
import { calculatePaymentBreakdown, calculateWeeklyReport } from '../../utils/dashboardCalculator';
import { RefreshIcon, ShareIcon, CheckIcon, WarningIcon } from '../../shared/icons';

const WeeklyReport = ({
    dailyIncome,
    weeklyRentals,
    dailyFuel,
    mileage,
    otherExpenses,
    selectedWeek
}) => {
    const [reportStatus, setReportStatus] = useState(null);

    const handleGenerate = () => {
        setReportStatus({ type: 'success', message: 'Report updated with latest data' });
        setTimeout(() => setReportStatus(null), 3000);
    };

    const handleExport = () => {
        if (navigator.share) {
            const shareText = generateShareText();
            if (shareText) {
                navigator.share({
                    title: `Taxi Weekly Report - ${selectedWeek}`,
                    text: shareText
                })
                    .then(() => setReportStatus({ type: 'success', message: 'Report shared successfully!' }))
                    .catch((error) => console.log('Share failed:', error));
            } else {
                window.print();
            }
        } else {
            window.print();
        }
    };

    const generateShareText = () => {
        if (!reportData) return '';
        const { totalRent, totalIncomeA, totalFuelA, profitA, totalMileage, totalOtherExpenses } = reportData;
        return `Weekly Report: ${selectedWeek}\n\n` +
            `Rental Income: £${totalRent.toFixed(2)}\n` +
            `Taxi A Income: £${totalIncomeA.toFixed(2)}\n` +
            `Fuel Cost: £${totalFuelA.toFixed(2)}\n` +
            (totalOtherExpenses > 0 ? `Other Expenses: £${totalOtherExpenses.toFixed(2)}\n` : '') +
            (totalMileage > 0 ? `Distance: ${totalMileage.toLocaleString()} miles\n` : '') +
            `\nWeekly Profit: £${profitA.toFixed(2)}`;
    };

    const reportData = useMemo(() => {
        return calculateWeeklyReport({
            dailyIncome, weeklyRentals, dailyFuel, mileage, otherExpenses
        }, selectedWeek);
    }, [dailyIncome, weeklyRentals, dailyFuel, mileage, otherExpenses, selectedWeek]);

    if (!selectedWeek || !reportData) {
        return <p className="muted">Select a week to view the report.</p>;
    }

    const { rentals, totalRent, taxiAIncome, totalIncomeA, totalFuelA, profitA, methodTotals,
        weekMileage, totalMileage, weekOtherExpenses, totalOtherExpenses, noData } = reportData;

    const METHOD_LABELS = {
        cash: 'Cash',
        card: 'Card',
        prePaid: 'Pre Paid',
        gcc: 'GCC Account',
        nonGcc: 'Non-GCC Account'
    };

    return (
        <div className="report-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0 }}>Weekly Report: {selectedWeek}</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative', zIndex: 100 }}>
                    {reportStatus && (
                        <span style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            background: reportStatus.type === 'success' ? 'var(--success-bg, #dcfce7)' : 'var(--warn-bg, #fef3c7)',
                            color: reportStatus.type === 'success' ? 'var(--success-text, #15803d)' : 'var(--warn-text, #92400e)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            {reportStatus.type === 'success' ? <CheckIcon size={14} /> : <WarningIcon size={14} />} {reportStatus.message}
                        </span>
                    )}
                    <button
                        className="btn primary"
                        type="button"
                        onClick={handleGenerate}
                        onTouchEnd={(e) => { e.preventDefault(); handleGenerate(); }}
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <RefreshIcon size={14} /> Generate Report
                    </button>
                    <button
                        className="btn alt no-print"
                        type="button"
                        onClick={handleExport}
                        onTouchEnd={(e) => { e.preventDefault(); handleExport(); }}
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <ShareIcon size={14} /> Export / Share
                    </button>
                </div>
            </div>

            {noData && (
                <div className="card" style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    padding: '30px',
                    borderRadius: '12px'
                }}>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>No Data for This Week</h3>
                    <p className="muted" style={{ margin: 0 }}>
                        There are no entries recorded for the selected week. Start adding income, fuel, or mileage data.
                    </p>
                </div>
            )}

            {!noData && (
                <>
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <h3>Rental Income (Taxi B & C)</h3>
                        {rentals.length > 0 ? (
                            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Taxi</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Week Start</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount (£)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rentals.map((r, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '8px 12px' }}>{r.car === 'NU75DXB' ? 'Taxi B' : r.car === 'LL68RRX' ? 'Taxi C' : r.car}</td>
                                                <td style={{ padding: '8px 12px' }}>{r.weekStartDate || r.week}</td>
                                                <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{Number(r.amount).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: 'var(--bg-secondary)', fontWeight: '700', borderTop: '2px solid var(--border)' }}>
                                            <td colSpan="2" style={{ padding: '8px 12px' }}>Total</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--success, #16a34a)' }}>£{totalRent.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : <p className="muted">No rentals recorded for this week.</p>}
                    </div>

                    <div className="card">
                        <h3>Taxi A Operations</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <h4>Totals by Payment Method</h4>
                                <div style={{ padding: '10px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <tbody>
                                            {Object.keys(methodTotals).length > 0 ? (
                                                ['cash', 'card', 'prePaid', 'gcc', 'nonGcc'].map(m => (
                                                    methodTotals[m] > 0 && (
                                                        <tr key={m} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '6px 8px' }}>{METHOD_LABELS[m]}</td>
                                                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>£{methodTotals[m].toFixed(2)}</td>
                                                        </tr>
                                                    )
                                                ))
                                            ) : (
                                                <tr><td colSpan="2" className="muted">No income recorded</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h4>Profit Calculation</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '6px 8px' }}>Total Income</td>
                                            <td style={{ padding: '6px 8px', textAlign: 'right' }} className="success">£{totalIncomeA.toFixed(2)}</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '6px 8px' }}>Rental Income</td>
                                            <td style={{ padding: '6px 8px', textAlign: 'right' }} className="success">+ £{totalRent.toFixed(2)}</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '6px 8px' }}>Total Fuel Cost</td>
                                            <td style={{ padding: '6px 8px', textAlign: 'right' }} className="danger">- £{totalFuelA.toFixed(2)}</td>
                                        </tr>
                                        {totalOtherExpenses > 0 && (
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '6px 8px' }}>Other Expenses</td>
                                                <td style={{ padding: '6px 8px', textAlign: 'right' }} className="danger">- £{totalOtherExpenses.toFixed(2)}</td>
                                            </tr>
                                        )}
                                        <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 'bold' }}>
                                            <td style={{ padding: '8px 8px' }}>Weekly Profit</td>
                                            <td style={{ padding: '8px 8px', textAlign: 'right' }} className={profitA >= 0 ? 'success' : 'danger'}>£{profitA.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {totalMileage > 0 && (
                            <div style={{
                                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                border: '1px solid #10b981',
                                borderRadius: '8px',
                                padding: '15px 20px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: '600', textTransform: 'uppercase' }}>
                                        Weekly Distance
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#047857' }}>
                                        {totalMileage.toLocaleString()} miles
                                    </div>
                                </div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#065f46' }}>Trips Recorded</div>
                                    <div style={{ fontWeight: '600', color: '#047857' }}>{weekMileage.length}</div>
                                </div>
                            </div>
                        )}

                        {weekOtherExpenses.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4>Other Expenses</h4>
                                <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Type</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount (£)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {weekOtherExpenses.map((exp, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '8px 12px' }}>{exp.date}</td>
                                                <td style={{ padding: '8px 12px' }}>{exp.type}</td>
                                                <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--danger, #dc2626)' }}>£{Number(exp.amount).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <h4>Detailed Transactions</h4>
                        {taxiAIncome.length > 0 ? (
                            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Method</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount (£)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {taxiAIncome.sort((a, b) => new Date(a.date) - new Date(b.date)).map((item, i) => {
                                            const b = calculatePaymentBreakdown(item);
                                            const methodStr = b.card > 0 ? 'Card' :
                                                b.prePaid > 0 ? 'Pre Paid' :
                                                    b.gcc > 0 ? 'GCC Account' :
                                                        b.nonGcc > 0 ? 'Non-GCC Account' : 'Cash';
                                            return (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '8px 12px' }}>{item.date}</td>
                                                    <td style={{ padding: '8px 12px' }}>{methodStr}</td>
                                                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>£{b.total.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="muted">No transactions recorded.</p>}
                    </div>
                </>
            )}
        </div>
    );
};

export default WeeklyReport;
