import { useState, useMemo } from 'react';
import { getISOWeekString } from '../../utils/helpers';
import { calculateDashboardTotals, calculateEndOfDayIncome, calculateWeeklyReport, calculateMonthlyReport } from '../../utils/dashboardCalculator';
import { printReport } from '../../utils/print';
import { PrintIcon } from '../../shared/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProfitReport = ({
  dailyIncome,
  weeklyRentals,
  dailyFuel,
  monthlyExpenses,
  annualExpenses,
  mileage,
  otherExpenses
}) => {
  const currentMonth = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const currentWeek = useMemo(() => getISOWeekString(new Date()), []);
  const [month, setMonth] = useState(currentMonth);

  const allTimeTotals = useMemo(() => calculateDashboardTotals({
    dailyIncome,
    weeklyRentals,
    dailyFuel,
    monthlyExpenses,
    annualExpenses,
    mileage,
    otherExpenses
  }), [dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses]);

  const endOfDayIncome = useMemo(() => calculateEndOfDayIncome(dailyIncome), [dailyIncome]);

  const weeklyStats = useMemo(() => calculateWeeklyReport({
    dailyIncome, weeklyRentals, dailyFuel, mileage, otherExpenses
  }, currentWeek), [dailyIncome, weeklyRentals, dailyFuel, mileage, otherExpenses, currentWeek]);

  const monthlyStats = useMemo(() => calculateMonthlyReport({
    dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses
  }, month), [dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses, month]);

  const handlePrint = () => {
    printReport('dashboard-report');
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();

  const chartDataA = days.map((_, i) => {
    const d = new Date(today);
    const currentDay = d.getDay() || 7;
    d.setDate(d.getDate() - currentDay + 1 + i);
    const dateStr = d.toISOString().split('T')[0];
    return endOfDayIncome[dateStr] || 0;
  });

  const monthlyExpensesChartData = useMemo(() => {
    if (!monthlyStats) return { labels: [], values: [] };
    const types = {};
    (monthlyExpenses || []).concat(otherExpenses || []).forEach(e => {
      if ((e.month === month) || (e.date && e.date.startsWith(month))) {
        const k = e.type || 'Other';
        types[k] = (types[k] || 0) + Number(e.amount || 0);
      }
    });
    return { labels: Object.keys(types), values: Object.values(types) };
  }, [monthlyExpenses, otherExpenses, monthlyStats, month]);

  const lineChartData = {
    labels: days,
    datasets: [{
      label: 'Taxi A Daily Income',
      data: chartDataA,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,.15)',
      tension: 0.3,
      fill: true
    }]
  };

  const barChartData = {
    labels: monthlyExpensesChartData.labels,
    datasets: [{
      label: 'Monthly Expenses',
      data: monthlyExpensesChartData.values,
      backgroundColor: ['#2563eb', '#1d4ed8', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#ef4444', '#0891b2', '#65a30d']
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'var(--text, #111827)', font: { family: 'Inter' } } }
    },
    scales: {
      x: { ticks: { color: 'var(--muted, #4b5563)' }, grid: { color: 'rgba(17,24,39,.08)' } },
      y: { ticks: { color: 'var(--muted, #4b5563)' }, grid: { color: 'rgba(17,24,39,.08)' } }
    }
  };

  const taxiAWeekIncome = weeklyStats ? weeklyStats.totalIncomeA : 0;
  const weekRentTotal = weeklyStats ? weeklyStats.totalRent : 0;
  const weekMileageTotal = weeklyStats ? weeklyStats.totalMileage : 0;

  const profitA = monthlyStats ? (monthlyStats.income.SG24ZSN - monthlyStats.fuel.SG24ZSN - monthlyStats.expenses.SG24ZSN) : 0;
  const profitB = monthlyStats ? (monthlyStats.income.NU75DXB - monthlyStats.fuel.NU75DXB - monthlyStats.expenses.NU75DXB) : 0;
  const profitC = monthlyStats ? (monthlyStats.income.LL68RRX - monthlyStats.fuel.LL68RRX - monthlyStats.expenses.LL68RRX) : 0;
  const totalMonthlyProfit = monthlyStats ? monthlyStats.totalProfit : 0;

  return (
    <div className="dashboard-layout" id="dashboard-report">
      <div className="grid">
        <div className="card span-12" style={{
          background: 'linear-gradient(135deg, var(--primary, #2563eb) 0%, #1d4ed8 100%)',
          color: 'white',
          marginBottom: '10px',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.9)', borderBottom: 'none', marginBottom: '8px' }}>All-Time Business Summary</h3>
              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Total Income</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>£{allTimeTotals.totalIncome.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Total Expenses</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>£{allTimeTotals.totalExpenses.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Net Profit</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: allTimeTotals.netProfit >= 0 ? '#86efac' : '#fca5a5' }}>
                    £{allTimeTotals.netProfit.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            <button
              className="btn alt no-print"
              type="button"
              onClick={handlePrint}
              onTouchEnd={(e) => { e.preventDefault(); handlePrint(); }}
              style={{
                background: 'white',
                color: 'var(--primary, #2563eb)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600',
                padding: '8px 14px',
                borderRadius: '8px'
              }}
            >
              <PrintIcon size={16} /> Print Dashboard
            </button>
          </div>
        </div>

        <div className="card span-3">
          <h3>Taxi A Income (Week)</h3>
          <div className="kpi">
            <div className="value">£{taxiAWeekIncome.toFixed(2)}</div>
            <div className="tag">{currentWeek.split('-W')[1]}</div>
          </div>
        </div>
        <div className="card span-3">
          <h3>Rentals (B & C, Week)</h3>
          <div className="kpi">
            <div className="value">£{weekRentTotal.toFixed(2)}</div>
            <div className="tag">{currentWeek.split('-W')[1]}</div>
          </div>
        </div>
        <div className="card span-3">
          <h3>Business Profit (Month)</h3>
          <div className="kpi">
            <div className="value">£{totalMonthlyProfit.toFixed(2)}</div>
            <div className="tag">{month}</div>
          </div>
        </div>
        <div className="card span-3">
          <h3>Mileage (Week)</h3>
          <div className="kpi">
            <div className="value warn">{weekMileageTotal.toLocaleString()} mi</div>
            <div className="tag">{currentWeek.split('-W')[1]}</div>
          </div>
        </div>

        <div className="card span-8" style={{ minHeight: '300px' }}>
          <h3>Taxi A Daily Income (Current Week)</h3>
          <div style={{ height: '240px' }}><Line data={lineChartData} options={chartOptions} /></div>
        </div>
        <div className="card span-4" style={{ minHeight: '300px' }}>
          <h3>Monthly Expenses by Type</h3>
          <div style={{ height: '240px' }}><Bar data={barChartData} options={chartOptions} /></div>
        </div>

        <div className="card span-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Monthly Performance Breakdown</h3>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="no-print"
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}
            />
          </div>

          {!monthlyStats || monthlyStats.noData ? (
            <p className="muted">No data available for {month}.</p>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table striped" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Taxi</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Income (£)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Fuel (£)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Expenses (£)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Profit (£)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px' }}>Taxi A (SG24ZSN)</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{(monthlyStats.income["SG24ZSN"] || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{(monthlyStats.fuel["SG24ZSN"] || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{(monthlyStats.expenses["SG24ZSN"] || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }} className={profitA >= 0 ? 'success' : 'danger'}>£{profitA.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px' }}>Taxi B (NU75DXB)</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{(monthlyStats.income["NU75DXB"] || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{(monthlyStats.fuel["NU75DXB"] || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{(monthlyStats.expenses["NU75DXB"] || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }} className={profitB >= 0 ? 'success' : 'danger'}>£{profitB.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px' }}>Taxi C (LL68RRX)</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{(monthlyStats.income["LL68RRX"] || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{(monthlyStats.fuel["LL68RRX"] || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>£{(monthlyStats.expenses["LL68RRX"] || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }} className={profitC >= 0 ? 'success' : 'danger'}>£{profitC.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <p className="muted" style={{ fontSize: '0.75rem', marginTop: '10px' }}>
            * Monthly profit includes amortized annual expenses (1/12th per month), weekly rentals, and other expenses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfitReport;