import React, { useMemo, useState } from 'react';
import { calculateAnnualReport } from '../../utils/dashboardCalculator';
import { RefreshIcon, ShareIcon, CheckIcon, WarningIcon } from '../../shared/icons';

const AnnualReport = ({ dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses, selectedYear }) => {
    const [reportStatus, setReportStatus] = useState(null);

    const handleGenerate = () => {
        if (!reportData || reportData.noData) {
            setReportStatus({ type: 'warning', message: 'No data available for the selected year.' });
            setTimeout(() => setReportStatus(null), 3000);
            return;
        }
        setReportStatus({ type: 'success', message: 'Annual Report generated successfully!' });
        setTimeout(() => setReportStatus(null), 3000);
    };

    const handleExport = () => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile && navigator.share) {
            const shareText = generateShareText();
            if (shareText) {
                navigator.share({
                    title: `Annual Report - ${selectedYear}`,
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
        return `Annual Report: ${selectedYear}\n\n` +
            `Total Income: £${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
            (totalMileage > 0 ? `Total Distance: ${totalMileage.toLocaleString()} miles\n` : '') +
            (totalOtherExpenses > 0 ? `Other Expenses: £${totalOtherExpenses.toFixed(2)}\n` : '') +
            `\nAnnual Profit: £${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    };

    const reportData = useMemo(() => {
        return calculateAnnualReport({
            dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses
        }, selectedYear);
    }, [dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses, selectedYear]);

    if (!selectedYear || !reportData) {
        return <p className="muted">Select a year to view the annual report.</p>;
    }

    const { income, fuel, expenses, totalProfit, totalMileage, mileageByTaxi, totalOtherExpenses, noData } = reportData;

    const renderRow = (id, name) => {
        const p = income[id] - fuel[id] - expenses[id];
        return (
            <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 12px' }}>{name}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{income[id].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{fuel[id].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{expenses[id].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }} className={p >= 0 ? 'success' : 'danger'}>
                    £{p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
            </tr>
        );
    };

    return (
        <div className="report-container">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0 }}>Annual Business Performance: {selectedYear}</h3>
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
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>No Data for This Year</h4>
                        <p className="muted" style={{ margin: 0 }}>
                            There are no entries recorded for the selected year.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive" style={{ overflowX: 'auto' }}>
                            <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Taxi</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Income (£)</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Fuel (£)</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Expenses (£)</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Net Profit (£)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderRow('SG24ZSN', 'Taxi A')}
                                    {renderRow('NU75DXB', 'Taxi B (Rented)')}
                                    {renderRow('LL68RRX', 'Taxi C (Rented)')}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: 'var(--bg-secondary)', fontWeight: 'bold', borderTop: '2px solid var(--border)' }}>
                                        <td style={{ padding: '10px 12px' }}>TOTAL</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>£{(income.SG24ZSN + income.NU75DXB + income.LL68RRX).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>£{(fuel.SG24ZSN + fuel.NU75DXB + fuel.LL68RRX).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>£{(expenses.SG24ZSN + expenses.NU75DXB + expenses.LL68RRX).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: totalProfit >= 0 ? 'var(--success, #16a34a)' : 'var(--danger, #dc2626)' }}>
                                            £{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>
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
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: '600', textTransform: 'uppercase' }}>
                                        Annual Distance
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#047857' }}>
                                        {totalMileage.toLocaleString()} miles
                                    </div>
                                </div>
                                {Object.keys(mileageByTaxi).length > 0 && (
                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px' }}>
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

                        {totalOtherExpenses > 0 && (
                            <div style={{
                                marginTop: '15px',
                                padding: '10px 15px',
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                color: 'var(--danger-text, #991b1b)'
                            }}>
                                Other Expenses included: <strong>£{totalOtherExpenses.toFixed(2)}</strong>
                            </div>
                        )}

                        <div style={{ marginTop: '30px', padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Annual Profit</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: totalProfit >= 0 ? 'var(--success, #16a34a)' : 'var(--danger, #dc2626)', marginTop: '6px' }}>
                                £{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AnnualReport;
