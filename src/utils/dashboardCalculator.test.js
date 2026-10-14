import {
    calculatePaymentBreakdown,
    getIncomeAmount,
    calculateEndOfDayIncome,
    calculateDashboardTotals,
    calculateWeeklyReport,
    calculateMonthlyReport,
    calculateAnnualReport
} from './dashboardCalculator';

describe('Taxi Dashboard Calculations', () => {
    test('calculatePaymentBreakdown handles multi-payment arrays', () => {
        const entry = {
            date: '2026-03-01',
            car: 'SG24ZSN',
            payments: [
                { method: 'Cash', amount: 50 },
                { method: 'Card', amount: 30 },
                { method: 'Pre Paid', amount: 20 },
                { method: 'GCC Account', amount: 15 },
                { method: 'Non-GCC Account', amount: 25 }
            ]
        };

        const breakdown = calculatePaymentBreakdown(entry);
        expect(breakdown.cash).toBe(50);
        expect(breakdown.card).toBe(30);
        expect(breakdown.prePaid).toBe(20);
        expect(breakdown.gcc).toBe(15);
        expect(breakdown.nonGcc).toBe(25);
        expect(breakdown.total).toBe(140);
        expect(getIncomeAmount(entry)).toBe(140);
    });

    test('calculateEndOfDayIncome groups by date accurately', () => {
        const entries = [
            { date: '2026-03-01', payments: [{ method: 'Cash', amount: 100 }] },
            { date: '2026-03-01', payments: [{ method: 'Card', amount: 50 }] },
            { date: '2026-03-02', payments: [{ method: 'Cash', amount: 80 }] }
        ];

        const totals = calculateEndOfDayIncome(entries);
        expect(totals['2026-03-01']).toBe(150);
        expect(totals['2026-03-02']).toBe(80);
    });

    test('calculateDashboardTotals aggregates all income and expense streams', () => {
        const state = {
            dailyIncome: [{ payments: [{ method: 'Cash', amount: 200 }] }],
            weeklyRentals: [{ amount: 300 }, { amount: 300 }],
            dailyFuel: [{ amount: 50 }],
            monthlyExpenses: [{ amount: 120 }],
            annualExpenses: [{ amount: 240 }], // 240 total
            otherExpenses: [{ amount: 30 }]
        };

        const totals = calculateDashboardTotals(state);
        // Total income: 200 + 300 + 300 = 800
        expect(totals.totalIncome).toBe(800);
        // Total expenses: 50 + 120 + 240 + 30 = 440
        expect(totals.totalExpenses).toBe(440);
        // Net profit: 800 - 440 = 360
        expect(totals.netProfit).toBe(360);
    });
});
