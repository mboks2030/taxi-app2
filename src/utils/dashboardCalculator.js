import { getISOWeekString } from './helpers';

// --- Shared Helpers ---

const getNum = (val) => Number(val || 0);

export const calculatePaymentBreakdown = (entry) => {
    if (!entry) return { cash: 0, card: 0, prePaid: 0, gcc: 0, nonGcc: 0, total: 0 };

    let cash = 0, card = 0, prePaid = 0, gcc = 0, nonGcc = 0;

    // 1. Array-based payments (New Structure)
    if (entry.payments && Array.isArray(entry.payments)) {
        entry.payments.forEach(p => {
            const amount = getNum(p.amount);
            const method = (p.method || '').toLowerCase().trim();

            if (method.includes('cash')) {
                cash += amount;
            } else if (method === 'card') {
                card += amount;
            } else if (method.includes('pre') || method.includes('credit') || method.includes('card credits')) {
                prePaid += amount;
            } else if (method.includes('non-gcc') || method.includes('nongcc')) {
                nonGcc += amount;
            } else if (method.includes('gcc')) {
                gcc += amount;
            } else {
                cash += amount; // Fallback
            }
        });
    } else {
        // 2. Legacy fields (Fallback)
        cash = getNum(entry.cash);
        // Map cardCredits to prePaid (as per instructions)
        prePaid = getNum(entry.prePaid) + getNum(entry.cardCredits) + getNum(entry.credit);
        card = getNum(entry.card);
        gcc = getNum(entry.gccAccount) || getNum(entry.gcc);
        nonGcc = getNum(entry.nonGccAccount) || getNum(entry.nonGcc);

        // Map method to field if amount is present but fields are 0
        if (cash === 0 && card === 0 && prePaid === 0 && gcc === 0 && nonGcc === 0 && entry.amount) {
            const method = (entry.method || entry.paymentMethod || '').toLowerCase().trim();
            const amt = getNum(entry.amount);
            if (method === 'cash') cash = amt;
            else if (method === 'card') card = amt;
            else if (method === 'pre paid' || method === 'prepaid' || method === 'credit' || method === 'card credits') prePaid = amt;
            else if (method === 'gcc account' || method === 'gcc') gcc = amt;
            else if (method === 'non-gcc account' || method === 'non-gcc') nonGcc = amt;
            else cash = amt;
        }
    }

    const total = cash + card + prePaid + gcc + nonGcc;
    return { cash, card, prePaid, gcc, nonGcc, total };
};

export const getIncomeAmount = (entry) => {
    if (!entry) return 0;
    const breakdown = calculatePaymentBreakdown(entry);
    return breakdown.total;
};

// --- Core Calculators ---

export const calculateEndOfDayIncome = (dailyIncome) => {
    const totals = {};
    (dailyIncome || []).forEach(entry => {
        if (!entry.date) return;
        totals[entry.date] = (totals[entry.date] || 0) + getIncomeAmount(entry);
    });
    return totals;
};

export const calculateDashboardTotals = (state) => {
    const { dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, otherExpenses } = state;
    let totalIncome = 0;
    let totalExpenses = 0;

    // 1. Income from Daily
    (dailyIncome || []).forEach(e => {
        totalIncome += getIncomeAmount(e);
    });

    // 2. Income from Rentals
    (weeklyRentals || []).forEach(e => {
        totalIncome += getNum(e.amount);
    });

    // 3. Expenses (Fuel)
    (dailyFuel || []).forEach(e => {
        totalExpenses += getNum(e.amount);
    });

    // 4. Expenses (Monthly)
    (monthlyExpenses || []).forEach(e => {
        totalExpenses += getNum(e.amount);
    });

    // 5. Expenses (Annual)
    (annualExpenses || []).forEach(e => {
        totalExpenses += getNum(e.amount);
    });

    // 6. Expenses (Other)
    (otherExpenses || []).forEach(e => {
        totalExpenses += getNum(e.amount);
    });

    return {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses
    };
};

export const calculateWeeklyReport = (state, selectedWeek) => {
    if (!selectedWeek) return null;
    const { dailyIncome, weeklyRentals, dailyFuel, mileage, otherExpenses } = state;

    // Filter Helpers
    const isWeek = (dateStr) => {
        try {
            if (!dateStr) return false;
            if (dateStr.includes('-W')) return dateStr === selectedWeek;
            return getISOWeekString(new Date(dateStr)) === selectedWeek;
        } catch (e) { return false; }
    };

    // 1. Rentals - Fix: Filter by computing ISO week
    const rentals = (weeklyRentals || []).filter(r => isWeek(r.weekStartDate || r.week));
    const totalRent = rentals.reduce((s, r) => s + getNum(r.amount), 0);

    // 2. Taxi A Operations (SG24ZSN)
    const taxiAIncome = (dailyIncome || []).filter(e => e.car === 'SG24ZSN' && isWeek(e.date));
    const taxiAFuel = (dailyFuel || []).filter(e => e.car === 'SG24ZSN' && isWeek(e.date));

    const totalIncomeA = taxiAIncome.reduce((s, e) => s + getIncomeAmount(e), 0);
    const totalFuelA = taxiAFuel.reduce((s, e) => s + getNum(e.amount), 0);

    // 3. Mileage
    const weekMileage = (mileage || []).filter(m => isWeek(m.date));
    const totalMileage = weekMileage.reduce((s, m) => s + getNum(m.distance), 0);

    // 4. Other Expenses
    const weekOtherExpenses = (otherExpenses || []).filter(e => isWeek(e.date));
    const totalOtherExpenses = weekOtherExpenses.reduce((s, e) => s + getNum(e.amount), 0);

    // Profit
    const profitA = totalIncomeA + totalRent - totalFuelA - totalOtherExpenses;

    // Method Totals
    const methodTotals = { cash: 0, card: 0, prePaid: 0, gcc: 0, nonGcc: 0 };
    taxiAIncome.forEach(item => {
        const b = calculatePaymentBreakdown(item);
        methodTotals.cash += b.cash;
        methodTotals.card += b.card;
        methodTotals.prePaid += b.prePaid;
        methodTotals.gcc += b.gcc;
        methodTotals.nonGcc += b.nonGcc;
    });

    const noData = rentals.length === 0 && taxiAIncome.length === 0 && taxiAFuel.length === 0 && weekMileage.length === 0 && weekOtherExpenses.length === 0;

    return {
        rentals, totalRent, taxiAIncome, totalIncomeA, totalFuelA, profitA,
        methodTotals, weekMileage, totalMileage, weekOtherExpenses, totalOtherExpenses, noData
    };
};

export const calculateMonthlyReport = (state, selectedMonth) => {
    if (!selectedMonth) return null;
    const { dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses } = state;
    const year = Number(selectedMonth.split('-')[0]);

    let income = { SG24ZSN: 0, NU75DXB: 0, LL68RRX: 0 };
    let fuel = { SG24ZSN: 0, NU75DXB: 0, LL68RRX: 0 };
    let expenses = { SG24ZSN: 0, NU75DXB: 0, LL68RRX: 0 };
    let rentalIncome = { NU75DXB: 0, LL68RRX: 0 };

    // 1. Daily Income
    (dailyIncome || []).forEach(e => {
        if (e.date && e.date.startsWith(selectedMonth)) income[e.car] = (income[e.car] || 0) + getIncomeAmount(e);
    });

    // 2. Daily Fuel
    (dailyFuel || []).forEach(e => {
        if (e.date && e.date.startsWith(selectedMonth)) fuel[e.car] = (fuel[e.car] || 0) + getNum(e.amount);
    });

    // 3. Monthly Expenses
    (monthlyExpenses || []).forEach(e => {
        if (e.month === selectedMonth) {
            if (e.car === 'ALL') {
                const shared = getNum(e.amount) / 3;
                expenses.SG24ZSN += shared; expenses.NU75DXB += shared; expenses.LL68RRX += shared;
            } else if (expenses[e.car] !== undefined) {
                expenses[e.car] += getNum(e.amount);
            }
        }
    });

    // 4. Weekly Rentals
    (weeklyRentals || []).forEach(e => {
        const weekMonth = String(e.weekStartDate || e.week).substring(0, 7);
        if (weekMonth === selectedMonth) {
            rentalIncome[e.car] = (rentalIncome[e.car] || 0) + getNum(e.amount);
            income[e.car] = (income[e.car] || 0) + getNum(e.amount);
        }
    });

    // 5. Annual Expenses (amortized)
    (annualExpenses || []).forEach(e => {
        if (Number(e.year) === year) {
            const amortized = getNum(e.amount) / 12;
            if (e.car === 'ALL') {
                expenses.SG24ZSN += amortized / 3; expenses.NU75DXB += amortized / 3; expenses.LL68RRX += amortized / 3;
            } else if (expenses[e.car] !== undefined) {
                expenses[e.car] += amortized;
            }
        }
    });

    // 6. Mileage
    const monthMileage = (mileage || []).filter(m => m.date && m.date.startsWith(selectedMonth));
    const totalMileage = monthMileage.reduce((s, m) => s + getNum(m.distance), 0);
    const mileageByTaxi = {};
    monthMileage.forEach(m => { mileageByTaxi[m.car] = (mileageByTaxi[m.car] || 0) + getNum(m.distance); });

    // 7. Other Expenses
    const monthOtherExpenses = (otherExpenses || []).filter(e => e.date && e.date.startsWith(selectedMonth));
    const totalOtherExpenses = monthOtherExpenses.reduce((s, e) => s + getNum(e.amount), 0);

    monthOtherExpenses.forEach(e => {
        if (e.car === 'ALL') {
            const shared = getNum(e.amount) / 3;
            expenses.SG24ZSN += shared; expenses.NU75DXB += shared; expenses.LL68RRX += shared;
        } else if (expenses[e.car] !== undefined) {
            expenses[e.car] += getNum(e.amount);
        }
    });

    const totalSalary = (monthlyExpenses || [])
        .filter(e => e.month === selectedMonth && e.type && e.type.toLowerCase() === 'salary')
        .reduce((s, e) => s + getNum(e.amount), 0);

    const totalProfit = (income.SG24ZSN - fuel.SG24ZSN - expenses.SG24ZSN) +
        (income.NU75DXB - fuel.NU75DXB - expenses.NU75DXB) +
        (income.LL68RRX - fuel.LL68RRX - expenses.LL68RRX);

    const noData = Object.values(income).every(v => v === 0) && Object.values(fuel).every(v => v === 0) &&
        monthMileage.length === 0 && monthOtherExpenses.length === 0;

    return { income, fuel, expenses, rentalIncome, totalSalary, totalProfit, totalMileage, mileageByTaxi, monthOtherExpenses, totalOtherExpenses, noData };
};

export const calculateAnnualReport = (state, selectedYear) => {
    if (!selectedYear) return null;
    const { dailyIncome, weeklyRentals, dailyFuel, monthlyExpenses, annualExpenses, mileage, otherExpenses } = state;
    const year = Number(selectedYear);
    const yearStr = selectedYear.toString();

    let income = { SG24ZSN: 0, NU75DXB: 0, LL68RRX: 0 };
    let fuel = { SG24ZSN: 0, NU75DXB: 0, LL68RRX: 0 };
    let expenses = { SG24ZSN: 0, NU75DXB: 0, LL68RRX: 0 };

    // 1. Daily Income
    (dailyIncome || []).forEach(e => { if (e.date && e.date.startsWith(yearStr)) income[e.car] = (income[e.car] || 0) + getIncomeAmount(e); });
    // 2. Daily Fuel
    (dailyFuel || []).forEach(e => { if (e.date && e.date.startsWith(yearStr)) fuel[e.car] = (fuel[e.car] || 0) + getNum(e.amount); });
    // 3. Monthly Expenses
    (monthlyExpenses || []).forEach(e => {
        if (e.month && e.month.startsWith(yearStr)) {
            if (e.car === 'ALL') {
                const shared = getNum(e.amount) / 3;
                expenses.SG24ZSN += shared; expenses.NU75DXB += shared; expenses.LL68RRX += shared;
            } else if (expenses[e.car] !== undefined) expenses[e.car] += getNum(e.amount);
        }
    });
    // 4. Weekly Rentals
    (weeklyRentals || []).forEach(e => {
        const d = e.weekStartDate || e.week;
        if (d && d.startsWith(yearStr)) income[e.car] = (income[e.car] || 0) + getNum(e.amount);
    });
    // 5. Annual Expenses
    (annualExpenses || []).forEach(e => {
        if (Number(e.year) === year) {
            if (e.car === 'ALL') {
                const shared = getNum(e.amount) / 3;
                expenses.SG24ZSN += shared; expenses.NU75DXB += shared; expenses.LL68RRX += shared;
            } else if (expenses[e.car] !== undefined) expenses[e.car] += getNum(e.amount);
        }
    });
    // 6. Mileage
    const yearMileage = (mileage || []).filter(m => m.date && m.date.startsWith(yearStr));
    const totalMileage = yearMileage.reduce((s, m) => s + getNum(m.distance), 0);
    const mileageByTaxi = {};
    yearMileage.forEach(m => { mileageByTaxi[m.car] = (mileageByTaxi[m.car] || 0) + getNum(m.distance); });
    // 7. Other Expenses
    const yearOtherExpenses = (otherExpenses || []).filter(e => e.date && e.date.startsWith(yearStr));
    const totalOtherExpenses = yearOtherExpenses.reduce((s, e) => s + getNum(e.amount), 0);
    yearOtherExpenses.forEach(e => {
        if (e.car === 'ALL') {
            const shared = getNum(e.amount) / 3;
            expenses.SG24ZSN += shared; expenses.NU75DXB += shared; expenses.LL68RRX += shared;
        } else if (expenses[e.car] !== undefined) expenses[e.car] += getNum(e.amount);
    });

    const totalProfit = (income.SG24ZSN - fuel.SG24ZSN - expenses.SG24ZSN) +
        (income.NU75DXB - fuel.NU75DXB - expenses.NU75DXB) +
        (income.LL68RRX - fuel.LL68RRX - expenses.LL68RRX);

    const noData = Object.values(income).every(v => v === 0) && Object.values(fuel).every(v => v === 0) && yearMileage.length === 0;

    return { income, fuel, expenses, totalProfit, totalMileage, mileageByTaxi, totalOtherExpenses, noData };
};
