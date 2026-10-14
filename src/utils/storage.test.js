import { toSupabaseFormat, toLocalFormat } from './storage';

describe('Storage Supabase Data Converters', () => {
    const userId = '00000000-0000-0000-0000-000000000001';

    test('dailyIncome maps correctly to Supabase and back', () => {
        const local = {
            id: 1710000001,
            date: '2026-03-10',
            car: 'SG24ZSN',
            method: 'Cash',
            amount: 150,
            payments: [{ method: 'Cash', amount: 150 }],
            dailyTotal: 150,
            endOfDay: true,
            notes: 'Test note'
        };

        const supabaseRow = toSupabaseFormat('dailyIncome', local, userId);
        expect(supabaseRow.user_id).toBe(userId);
        expect(supabaseRow.date).toBe('2026-03-10');
        expect(supabaseRow.car).toBe('SG24ZSN');
        expect(supabaseRow.amount).toBe(150);
        expect(supabaseRow.daily_total).toBe(150);
        expect(supabaseRow.end_of_day).toBe(true);

        const restored = toLocalFormat('dailyIncome', supabaseRow);
        expect(restored.id).toBe(1710000001);
        expect(restored.date).toBe(local.date);
        expect(restored.car).toBe(local.car);
        expect(restored.dailyTotal).toBe(150);
        expect(restored.endOfDay).toBe(true);
    });

    test('mileage records map correctly to Supabase and back', () => {
        const local = {
            id: 1710000002,
            date: '2026-03-10',
            car: 'SG24ZSN',
            morningMileage: 45000,
            endOfDayMileage: 45150,
            distance: 150
        };

        const supabaseRow = toSupabaseFormat('mileage', local, userId);
        expect(supabaseRow.morning_mileage).toBe(45000);
        expect(supabaseRow.end_of_day_mileage).toBe(45150);
        expect(supabaseRow.distance).toBe(150);

        const restored = toLocalFormat('mileage', supabaseRow);
        expect(restored.morningMileage).toBe(45000);
        expect(restored.endOfDayMileage).toBe(45150);
        expect(restored.distance).toBe(150);
    });

    test('weeklyRentals map correctly', () => {
        const local = {
            id: 1710000003,
            weekStartDate: '2026-03-09',
            car: 'NU75DXB',
            amount: 250
        };

        const supabaseRow = toSupabaseFormat('weeklyRentals', local, userId);
        expect(supabaseRow.week_start_date).toBe('2026-03-09');
        expect(supabaseRow.amount).toBe(250);

        const restored = toLocalFormat('weeklyRentals', supabaseRow);
        expect(restored.weekStartDate).toBe('2026-03-09');
        expect(restored.amount).toBe(250);
    });
});
