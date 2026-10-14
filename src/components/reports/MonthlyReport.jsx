import React, { useMemo, useState } from 'react';
import { calculateMonthlyReport } from '../../utils/dashboardCalculator';
import { RefreshIcon, ShareIcon, CheckIcon, WarningIcon } from '../../shared/icons';

const MonthlyReport = ({ dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses, selectedMonth }) => {
    const [reportStatus, setReportStatus] = useState(null);

    const handleGenerate = () => {
        if (!reportData || reportData.noData) {
            setReportStatus({ type: 'warning', message: 'No data available for the selected month.' });
            setTimeout(() => setReportStatus(null), 3000);
            return;
        }
        setReportStatus({ type: 'success', message: 'Monthly Report generated successfully!' });
        setTimeout(() => setReportStatus(null), 3000);
    };

    const handleExport = () => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile && navigator.share) {
            const shareText = generateShareText();
            if (shareText) {
                navigator.share({
                    title: `Monthly Report - ${selectedMonth}`,
                    text: shareText,
                }).catch(() => window.print());
            } else {
                window.print();
            }
        } else {
            window.print();
        }
    };

    const generateShareText = () => {
        if (!reportData) return '';
        const { income, totalProfit, totalMileage, totalOtherExpenses } = reportData;
        const totalIncome = income.SG24ZSN + income.NU75DXB + income.LL68RRX;
        return `Monthly Report: ${selectedMonth}\n\n` +
            `Total Income: £${totalIncome.toFixed(2)}\n` +
            (totalMileage > 0 ? `Distance: ${totalMileage.toLocaleString()} miles\n` : '') +
            (totalOtherExpenses > 0 ? `Other Expenses: £${totalOtherExpenses.toFixed(2)}\n` : '') +
            `\nNet Profit: £${totalProfit.toFixed(2)}`;
    };

    const reportData = useMemo(() => {
        return calculateMonthlyReport({
            dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses
        }, selectedMonth);
    }, [dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses, selectedMonth]);

    if (!selectedMonth || !reportData) {
        return <p className="muted">Select a month to view the report.</p>;
    }

    const { income, fuel, expenses, rentalIncome, totalSalary, totalProfit,
        totalMileage, mileageByTaxi, monthOtherExpenses, totalOtherExpenses, noData } = reportData;
    const profitPreSalary = totalProfit + totalSalary;

    const renderRow = (id, name) => {
        const p = income[id] - fuel[id] - expenses[id];
        return (
            <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 12px' }}>{name}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{income[id].toFixed(2)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{fuel[id].toFixed(2)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{expenses[id].toFixed(2)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }} className={p >= 0 ? 'success' : 'danger'}>
                    £{p.toFixed(2)}
                </td>
            </tr>
        );
    };

    return (
        <div className="report-container">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0 }}>Monthly Performance Summary: {selectedMonth}</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                        <button className="btn primary" type="button" onClick={handleGenerate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <RefreshIcon size={14} /> Generate Report
                        </button>
                        <button className="btn alt no-print" type="button" onClick={handleExport} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <ShareIcon size={14} /> Export / Share
                        </button>
                    </div>
                </div>

                {noData ? (
                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        padding: '30px'
                    }}>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>No Data for This Month</h4>
                        <p className="muted" style={{ margin: 0 }}>
                            There are no entries recorded for the selected month.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive" style={{ overflowX: 'auto' }}>
                            <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Taxi</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Income (£)</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Fuel (£)</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Expenses (£)</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Profit (£)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderRow('SG24ZSN', 'Taxi A')}
                                    {renderRow('NU75DXB', 'Taxi B (Rented)')}
                                    {renderRow('LL68RRX', 'Taxi C (Rented)')}
                                </tbody>
                            </table>
                        </div>

                        {totalMileage > 0 && (
                            <div style={{
                                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                border: '1px solid #10b981',
                                borderRadius: '8px',
                                padding: '15px 20px',
                                marginTop: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: '600', textTransform: 'uppercase' }}>
                                            Monthly Distance
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#047857' }}>
                                            {totalMileage.toLocaleString()} miles
                                        </div>
                                    </div>
                                </div>
                                {Object.keys(mileageByTaxi).length > 0 && (
                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
                                        {Object.entries(mileageByTaxi).map(([car, dist]) => (
                                            <div key={car} style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#065f46' }}>
                                                    {car === 'SG24ZSN' ? 'Taxi A' : car === 'NU75DXB' ? 'Taxi B' : 'Taxi C'}
                                                </div>
                                                <div style={{ fontWeight: '600', color: '#047857' }}>{dist.toLocaleString()} mi</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {totalSalary > 0 ? (
                            <div style={{ marginTop: '20px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>Operating Profit:</span> <span style={{ fontWeight: '600' }}>£{profitPreSalary.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#dc2626' }}>
                                    <span>Less Salary:</span> <span>- £{totalSalary.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '1px solid #86efac', paddingTop: '8px' }}>
                                    <span>Net Business Profit:</span> <span style={{ color: totalProfit >= 0 ? '#15803d' : '#dc2626' }}>£{totalProfit.toFixed(2)}</span>
                                </div>
                            </div>
                        ) : (
                            <h3 style={{ marginTop: '20px', textAlign: 'right' }}>
                                Total Business Profit: <span className={totalProfit >= 0 ? 'success' : 'danger'}>£{totalProfit.toFixed(2)}</span>
                            </h3>
                        )}

                        <div style={{ marginTop: '30px' }}>
                            <h4>Detailed Breakdown</h4>
                            <p className="muted" style={{ fontSize: '0.8rem' }}>* Figures include 1/12th of annual expenses (inspections, renewals).</p>

                            {((rentalIncome.NU75DXB || 0) > 0 || (rentalIncome.LL68RRX || 0) > 0) && (
                                <div style={{ marginBottom: '15px' }}>
                                    <h5>Rental Income</h5>
                                    <ul>
                                        <li>Taxi B: £{(rentalIncome.NU75DXB || 0).toFixed(2)}</li>
                                        <li>Taxi C: £{(rentalIncome.LL68RRX || 0).toFixed(2)}</li>
                                    </ul>
                                </div>
                            )}

                            {monthOtherExpenses.length > 0 && (
                                <div style={{ marginBottom: '15px' }}>
                                    <h5>Other Expenses (£{totalOtherExpenses.toFixed(2)} total)</h5>
                                    <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                                                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                                                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Type</th>
                                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount (£)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthOtherExpenses.map((exp, i) => (
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

                            {(monthlyExpenses || []).filter(e => e.month === selectedMonth && e.car === 'ALL').length > 0 && (
                                <div>
                                    <h5>Shared Expenses (Fleet & Others)</h5>
                                    <ul>
                                        {(monthlyExpenses || []).filter(e => e.month === selectedMonth && e.car === 'ALL').map((exp, i) => (
                                            <li key={i}>{exp.type}: £{Number(exp.amount).toFixed(2)} (Split equally)</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MonthlyReport;
