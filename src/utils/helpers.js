export const calculateMonthlyIncome = (dailyIncome, weeklyRentals, month) => {
  const income = { SG24ZSN: 0, NU75DXB: 0, LL68RRX: 0 };

  (dailyIncome || []).forEach(e => {
    if (e && e.date && e.date.startsWith(month) && income.hasOwnProperty(e.car)) {
      income[e.car] += Number(e.amount || 0);
    }
  });

  (weeklyRentals || []).forEach(e => {
    if (e && e.weekStartDate && e.weekStartDate.startsWith(month) && income.hasOwnProperty(e.car)) {
      income[e.car] += Number(e.amount || 0);
    }
  });

  return income;
};

export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

export function getISOWeekYear(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  return d.getFullYear();
}

export function getISOWeekString(date) {
  const d = new Date(date);
  const w = getWeekNumber(d);
  const y = getISOWeekYear(d);
  return `${y}-W${String(w).padStart(2, '0')}`;
}
