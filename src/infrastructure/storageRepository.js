import { supabase, isSupabaseConfigured } from '../supabase';
import { localDb, getFromLocal } from '../utils/localDb';

export const TABLE_MAP = {
    dailyIncome: 'daily_income',
    weeklyRentals: 'weekly_rentals',
    dailyFuel: 'daily_fuel',
    monthlyExpenses: 'monthly_expenses',
    annualExpenses: 'annual_expenses',
    mileage: 'mileage_records',
    otherExpenses: 'other_expenses'
};

export const COLLECTIONS = Object.keys(TABLE_MAP);

export const toSupabaseFormat = (key, item, userId) => {
    const localId = Number(item.id || item.local_id || Date.now());
    const base = {
        user_id: userId,
        local_id: localId
    };

    switch (key) {
        case 'dailyIncome':
            return {
                ...base,
                date: item.date,
                car: item.car,
                method: item.method || item.paymentMethod || 'Cash',
                amount: Number(item.amount || 0),
                payments: item.payments || [{ method: item.method || 'Cash', amount: Number(item.amount || 0) }],
                daily_total: Number(item.dailyTotal || item.amount || 0),
                end_of_day: Boolean(item.endOfDay),
                notes: item.notes || null
            };

        case 'weeklyRentals':
            return {
                ...base,
                week_start_date: item.weekStartDate,
                car: item.car,
                amount: Number(item.amount || 0),
                notes: item.notes || null
            };

        case 'dailyFuel':
            return {
                ...base,
                date: item.date,
                car: item.car,
                amount: Number(item.amount || 0),
                notes: item.notes || null
            };

        case 'mileage':
            return {
                ...base,
                date: item.date,
                car: item.car,
                morning_mileage: Number(item.morningMileage ?? item.startMileage ?? 0),
                end_of_day_mileage: (item.endOfDayMileage ?? item.endMileage) ? Number(item.endOfDayMileage ?? item.endMileage) : null,
                distance: Number(item.distance ?? item.dailyMileage ?? 0),
                notes: item.notes || null
            };

        case 'monthlyExpenses':
            return {
                ...base,
                month: item.month,
                car: item.car,
                type: item.type,
                amount: Number(item.amount || 0),
                notes: item.notes || null
            };

        case 'annualExpenses':
            return {
                ...base,
                year: Number(item.year),
                car: item.car,
                type: item.type,
                amount: Number(item.amount || 0),
                notes: item.notes || null
            };

        case 'otherExpenses':
            return {
                ...base,
                date: item.date,
                car: item.car,
                type: item.type,
                description: item.description || item.type,
                amount: Number(item.amount || 0)
            };

        default:
            return { ...base, ...item };
    }
};

export const toLocalFormat = (key, row) => {
    const id = row.local_id || Date.now();
    const userId = row.user_id;

    switch (key) {
        case 'dailyIncome':
            return {
                id,
                user_id: userId,
                date: row.date,
                car: row.car,
                method: row.method,
                paymentMethod: row.method,
                amount: Number(row.amount || 0),
                payments: row.payments || [{ method: row.method, amount: Number(row.amount || 0) }],
                dailyTotal: Number(row.daily_total || row.amount || 0),
                endOfDay: Boolean(row.end_of_day),
                notes: row.notes || ''
            };

        case 'weeklyRentals':
            return {
                id,
                user_id: userId,
                weekStartDate: row.week_start_date,
                car: row.car,
                amount: Number(row.amount || 0),
                notes: row.notes || ''
            };

        case 'dailyFuel':
            return {
                id,
                user_id: userId,
                date: row.date,
                car: row.car,
                amount: Number(row.amount || 0),
                notes: row.notes || ''
            };

        case 'mileage':
            return {
                id,
                user_id: userId,
                date: row.date,
                car: row.car,
                morningMileage: Number(row.morning_mileage || 0),
                startMileage: Number(row.morning_mileage || 0),
                endOfDayMileage: row.end_of_day_mileage !== null ? Number(row.end_of_day_mileage) : null,
                endMileage: row.end_of_day_mileage !== null ? Number(row.end_of_day_mileage) : null,
                distance: Number(row.distance || 0),
                dailyMileage: Number(row.distance || 0),
                notes: row.notes || ''
            };

        case 'monthlyExpenses':
            return {
                id,
                user_id: userId,
                month: row.month,
                car: row.car,
                type: row.type,
                amount: Number(row.amount || 0),
                notes: row.notes || ''
            };

        case 'annualExpenses':
            return {
                id,
                user_id: userId,
                year: Number(row.year),
                car: row.car,
                type: row.type,
                amount: Number(row.amount || 0),
                notes: row.notes || ''
            };

        case 'otherExpenses':
            return {
                id,
                user_id: userId,
                date: row.date,
                car: row.car,
                type: row.type,
                description: row.description || row.type,
                amount: Number(row.amount || 0)
            };

        default:
            return { ...row, id, user_id: userId };
    }
};

/**
 * Safely updates local table for a specific user without wiping other accounts' records
 */
const replaceUserLocalRecords = async (key, userId, newRecords) => {
    try {
        if (!localDb[key]) return;
        const allItems = await localDb[key].toArray();
        // Keep records belonging to other users
        const remaining = userId
            ? allItems.filter(item => item.user_id && item.user_id !== userId)
            : [];

        await localDb[key].clear();
        for (const item of remaining) {
            await localDb[key].add(item);
        }
        for (const item of newRecords) {
            const { id, ...rest } = item;
            await localDb[key].add({ ...rest, id: id || Date.now(), user_id: userId || item.user_id });
        }
    } catch (e) {
        console.error(`replaceUserLocalRecords failed for ${key}:`, e);
    }
};

/**
 * Enqueue a pending mutation when offline so it is guaranteed to sync later
 */
const enqueuePendingSync = async (userId, collection, action, data) => {
    try {
        if (localDb.pendingSync && userId) {
            await localDb.pendingSync.add({
                user_id: userId,
                collection,
                action,
                data,
                timestamp: Date.now()
            });
        }
    } catch (e) {
        console.warn('enqueuePendingSync warning:', e);
    }
};

export const getData = async (key) => {
    try {
        let currentUserId = null;
        if (isSupabaseConfigured()) {
            const { data: { user } } = await supabase.auth.getUser();
            currentUserId = user?.id || null;
            if (currentUserId) {
                localStorage.setItem('taxi_current_user_id', currentUserId);
            }
        }

        const allLocal = await getFromLocal(key);
        // Isolate cached records by authenticated user ID
        const userItems = currentUserId
            ? allLocal.filter(item => item.user_id === currentUserId || !item.user_id)
            : allLocal;

        if (userItems && userItems.length > 0) {
            return userItems;
        }

        // Fetch from cloud if local cache for this user is empty
        if (isSupabaseConfigured() && currentUserId) {
            const tableName = TABLE_MAP[key];
            if (tableName) {
                const { data, error } = await supabase.from(tableName).select('*').eq('user_id', currentUserId);
                if (!error && Array.isArray(data) && data.length > 0) {
                    const converted = data.map(row => toLocalFormat(key, row));
                    await replaceUserLocalRecords(key, currentUserId, converted);
                    return converted;
                }
            }
        }
    } catch (e) {
        console.warn(`getData failed for ${key}:`, e);
    }
    return [];
};

export const saveData = async (key, data) => {
    let currentUserId = null;
    if (isSupabaseConfigured()) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            currentUserId = user?.id || null;
        } catch (e) {
            console.warn('Could not retrieve user during save:', e);
        }
    }

    // 1. Update local IndexedDB, partitioned for this user
    await replaceUserLocalRecords(key, currentUserId, data);

    // 2. Perform background backup to Supabase
    if (isSupabaseConfigured() && currentUserId && Array.isArray(data) && data.length > 0) {
        try {
            const tableName = TABLE_MAP[key];
            if (tableName) {
                const payload = data.map(item => toSupabaseFormat(key, item, currentUserId));
                const { error } = await supabase.from(tableName).upsert(payload, { onConflict: 'user_id,local_id' });
                if (error) {
                    console.warn(`Supabase upsert warning for ${tableName}:`, error.message);
                    await enqueuePendingSync(currentUserId, key, 'upsert', payload);
                }
            }
        } catch (e) {
            console.warn(`Supabase cloud backup warning for ${key}:`, e);
            await enqueuePendingSync(currentUserId, key, 'upsert', data);
        }
    }
};

export const deleteData = async (key, localId, updatedList) => {
    let currentUserId = null;
    if (isSupabaseConfigured()) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            currentUserId = user?.id || null;
        } catch (e) {
            console.warn('Could not retrieve user during delete:', e);
        }
    }

    // 1. Update local partitioned table
    await replaceUserLocalRecords(key, currentUserId, updatedList);

    // 2. Delete targeted row from Supabase
    if (isSupabaseConfigured() && currentUserId && localId) {
        try {
            const tableName = TABLE_MAP[key];
            if (tableName) {
                const { error } = await supabase.from(tableName)
                    .delete()
                    .eq('user_id', currentUserId)
                    .eq('local_id', localId);
                if (error) {
                    console.warn(`Supabase delete error for ${tableName}:`, error.message);
                    await enqueuePendingSync(currentUserId, key, 'delete', { localId });
                }
            }
        } catch (e) {
            console.warn(`Supabase cloud delete warning for ${key}:`, e);
            await enqueuePendingSync(currentUserId, key, 'delete', { localId });
        }
    }
};

export const syncAllData = async () => {
    if (!isSupabaseConfigured()) {
        return { success: true, message: 'Supabase credentials not configured.' };
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Please sign in to sync.' };
        const userId = user.id;

        // 1. Process any pending sync queue for this user
        if (localDb.pendingSync) {
            try {
                const pendingItems = await localDb.pendingSync.where('user_id').equals(userId).toArray();
                for (const pending of pendingItems) {
                    const tableName = TABLE_MAP[pending.collection];
                    if (tableName) {
                        if (pending.action === 'upsert' && Array.isArray(pending.data)) {
                            await supabase.from(tableName).upsert(pending.data, { onConflict: 'user_id,local_id' });
                        } else if (pending.action === 'delete' && pending.data?.localId) {
                            await supabase.from(tableName).delete().eq('user_id', userId).eq('local_id', pending.data.localId);
                        }
                    }
                    await localDb.pendingSync.delete(pending.id);
                }
            } catch (queueErr) {
                console.warn('Pending sync queue replay notice:', queueErr.message);
            }
        }

        // 2. Bi-directional sync for each collection
        for (const key of COLLECTIONS) {
            const tableName = TABLE_MAP[key];
            if (!tableName) continue;

            const allLocal = await getFromLocal(key);
            const userLocalItems = allLocal.filter(item => item.user_id === userId || !item.user_id);
            const { data: remoteData, error } = await supabase.from(tableName).select('*').eq('user_id', userId);

            if (error) {
                console.warn(`Error fetching ${tableName} during sync:`, error);
                return { success: false, message: `Failed to fetch ${tableName}: ${error.message}` };
            }

            const remoteItems = (remoteData || []).map(r => toLocalFormat(key, r));
            const uniqueMap = new Map();

            (remoteItems || []).forEach(item => {
                const uniqueKey = item.id || JSON.stringify(item);
                uniqueMap.set(uniqueKey, item);
            });

            (userLocalItems || []).forEach(item => {
                const uniqueKey = item.id || JSON.stringify(item);
                if (!uniqueMap.has(uniqueKey)) {
                    uniqueMap.set(uniqueKey, item);
                }
            });

            const merged = Array.from(uniqueMap.values());
            await replaceUserLocalRecords(key, userId, merged);

            if (merged.length > 0) {
                const payload = merged.map(item => toSupabaseFormat(key, item, userId));
                const { error: upsertErr } = await supabase.from(tableName).upsert(payload, { onConflict: 'user_id,local_id' });
                if (upsertErr) {
                    console.warn(`Upsert error during sync for ${tableName}:`, upsertErr.message);
                }
            }
        }

        return { success: true, message: 'Cloud sync complete!' };
    } catch (e) {
        console.error("Sync failed:", e);
        return { success: false, message: e.message || 'Sync failed. Check network connection.' };
    }
};

export const clearUserLocalCache = async () => {
    // Deprecated for full wipe to preserve offline records;
    // Clears user tracking session
    localStorage.removeItem('taxi_current_user_id');
};

export const migrateLocalToSupabase = async () => {
    return await syncAllData();
};
