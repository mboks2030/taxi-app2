import Dexie from 'dexie';

/**
 * High-performance local IndexedDB with Multi-User Partitioning & Offline Sync Queue
 */
export const localDb = new Dexie('TaxiBusinessDB');

localDb.version(1).stores({
    dailyIncome: '++id, date, car, paymentMethod, amount',
    dailyFuel: '++id, date, car, amount',
    weeklyRentals: '++id, weekStartDate, car, amount',
    monthlyExpenses: '++id, month, car, type, amount',
    annualExpenses: '++id, year, car, type, amount',
    settings: 'key, value'
});

// Version 2: Add mileage and other expenses tracking
localDb.version(2).stores({
    dailyIncome: '++id, date, car, paymentMethod, amount',
    dailyFuel: '++id, date, car, amount',
    weeklyRentals: '++id, weekStartDate, car, amount',
    monthlyExpenses: '++id, month, car, type, amount',
    annualExpenses: '++id, year, car, type, amount',
    mileage: '++id, date, car, startMileage, endMileage, distance',
    otherExpenses: '++id, date, car, type, description, amount',
    settings: 'key, value'
});

// Version 3: Multi-user partitioning and pending offline sync persistence
localDb.version(3).stores({
    dailyIncome: '++id, user_id, date, car, paymentMethod, amount',
    dailyFuel: '++id, user_id, date, car, amount',
    weeklyRentals: '++id, user_id, weekStartDate, car, amount',
    monthlyExpenses: '++id, user_id, month, car, type, amount',
    annualExpenses: '++id, user_id, year, car, type, amount',
    mileage: '++id, user_id, date, car, startMileage, endMileage, distance',
    otherExpenses: '++id, user_id, date, car, type, description, amount',
    pendingSync: '++id, user_id, collection, action, timestamp',
    settings: 'key, value'
});

// Helper functions for local DB
export const addToLocal = async (collection, data) => {
    return await localDb[collection].add(data);
};

export const getFromLocal = async (collection) => {
    return await localDb[collection].toArray();
};

export const deleteFromLocal = async (collection, id) => {
    return await localDb[collection].delete(id);
};

export const clearLocal = async (collection) => {
    return await localDb[collection].clear();
};
