-- ==============================================================================
-- TAXI BUSINESS MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- Migration: 20260313_initial_schema.sql
-- Description: Full relational schema with Row Level Security (RLS) for
--              user profiles, vehicles, daily income, weekly rentals, daily fuel,
--              mileage records, monthly expenses, annual expenses, other expenses,
--              and app settings.
-- Includes:
--   - Concurrency-safe first-administrator bootstrap (advisory locks)
--   - Role escalation protection trigger (prevents self-promotion)
--   - Unique constraints on (user_id, local_id) for reliable deduplication & sync
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES TABLE
-- Linked directly to Supabase Auth users (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    business_name TEXT DEFAULT 'Taxi Business Management',
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'driver', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. VEHICLES / FLEET TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    registration TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'daily' CHECK (type IN ('daily', 'weekly')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, registration)
);

-- 4. DAILY INCOME TABLE
CREATE TABLE IF NOT EXISTS public.daily_income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    local_id BIGINT NOT NULL,
    date DATE NOT NULL,
    car TEXT NOT NULL,
    method TEXT,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payments JSONB NOT NULL DEFAULT '[]'::jsonb,
    daily_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    end_of_day BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_daily_income_user_local UNIQUE (user_id, local_id)
);

-- 5. WEEKLY RENTALS TABLE
CREATE TABLE IF NOT EXISTS public.weekly_rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    local_id BIGINT NOT NULL,
    week_start_date DATE NOT NULL,
    car TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_weekly_rentals_user_local UNIQUE (user_id, local_id)
);

-- 6. DAILY FUEL TABLE
CREATE TABLE IF NOT EXISTS public.daily_fuel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    local_id BIGINT NOT NULL,
    date DATE NOT NULL,
    car TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_daily_fuel_user_local UNIQUE (user_id, local_id)
);

-- 7. MILEAGE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.mileage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    local_id BIGINT NOT NULL,
    date DATE NOT NULL,
    car TEXT NOT NULL,
    morning_mileage NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    end_of_day_mileage NUMERIC(12,2),
    distance NUMERIC(12,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_mileage_user_local UNIQUE (user_id, local_id),
    CONSTRAINT uq_mileage_user_date_car UNIQUE (user_id, date, car)
);

-- 8. MONTHLY EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.monthly_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    local_id BIGINT NOT NULL,
    month TEXT NOT NULL,
    car TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_monthly_expenses_user_local UNIQUE (user_id, local_id)
);

-- 9. ANNUAL EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.annual_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    local_id BIGINT NOT NULL,
    year INTEGER NOT NULL,
    car TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_annual_expenses_user_local UNIQUE (user_id, local_id)
);

-- 10. OTHER EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.other_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    local_id BIGINT NOT NULL,
    date DATE NOT NULL,
    car TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_other_expenses_user_local UNIQUE (user_id, local_id)
);

-- 11. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, key)
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_daily_income_user_date ON public.daily_income(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_income_user_car ON public.daily_income(user_id, car);
CREATE INDEX IF NOT EXISTS idx_weekly_rentals_user_date ON public.weekly_rentals(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_daily_fuel_user_date ON public.daily_fuel(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mileage_user_date ON public.mileage_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_user_month ON public.monthly_expenses(user_id, month);
CREATE INDEX IF NOT EXISTS idx_annual_expenses_user_year ON public.annual_expenses(user_id, year);
CREATE INDEX IF NOT EXISTS idx_other_expenses_user_date ON public.other_expenses(user_id, date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Users can ONLY view and mutate their own business records.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_fuel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mileage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.other_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. VEHICLES POLICIES
CREATE POLICY "Users can view their own vehicles"
    ON public.vehicles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
    ON public.vehicles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
    ON public.vehicles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
    ON public.vehicles FOR DELETE
    USING (auth.uid() = user_id);

-- 3. DAILY INCOME POLICIES
CREATE POLICY "Users can view their own daily income"
    ON public.daily_income FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily income"
    ON public.daily_income FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily income"
    ON public.daily_income FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily income"
    ON public.daily_income FOR DELETE
    USING (auth.uid() = user_id);

-- 4. WEEKLY RENTALS POLICIES
CREATE POLICY "Users can view their own weekly rentals"
    ON public.weekly_rentals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly rentals"
    ON public.weekly_rentals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly rentals"
    ON public.weekly_rentals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly rentals"
    ON public.weekly_rentals FOR DELETE
    USING (auth.uid() = user_id);

-- 5. DAILY FUEL POLICIES
CREATE POLICY "Users can view their own daily fuel records"
    ON public.daily_fuel FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily fuel records"
    ON public.daily_fuel FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily fuel records"
    ON public.daily_fuel FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily fuel records"
    ON public.daily_fuel FOR DELETE
    USING (auth.uid() = user_id);

-- 6. MILEAGE POLICIES
CREATE POLICY "Users can view their own mileage records"
    ON public.mileage_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mileage records"
    ON public.mileage_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mileage records"
    ON public.mileage_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mileage records"
    ON public.mileage_records FOR DELETE
    USING (auth.uid() = user_id);

-- 7. MONTHLY EXPENSES POLICIES
CREATE POLICY "Users can view their own monthly expenses"
    ON public.monthly_expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly expenses"
    ON public.monthly_expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly expenses"
    ON public.monthly_expenses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly expenses"
    ON public.monthly_expenses FOR DELETE
    USING (auth.uid() = user_id);

-- 8. ANNUAL EXPENSES POLICIES
CREATE POLICY "Users can view their own annual expenses"
    ON public.annual_expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own annual expenses"
    ON public.annual_expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annual expenses"
    ON public.annual_expenses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annual expenses"
    ON public.annual_expenses FOR DELETE
    USING (auth.uid() = user_id);

-- 9. OTHER EXPENSES POLICIES
CREATE POLICY "Users can view their own other expenses"
    ON public.other_expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own other expenses"
    ON public.other_expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own other expenses"
    ON public.other_expenses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own other expenses"
    ON public.other_expenses FOR DELETE
    USING (auth.uid() = user_id);

-- 10. APP SETTINGS POLICIES
CREATE POLICY "Users can view their own settings"
    ON public.app_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
    ON public.app_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- ROLE PROTECTION TRIGGER
-- Prevents ordinary users from changing their own role to 'admin'
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Only allow role modification if executor is an existing admin
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Access Denied: Only administrators can modify roles.';
        END IF;
    END IF;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- ==============================================================================
-- CONCURRENCY-SAFE FIRST-ADMINISTRATOR BOOTSTRAP TRIGGER
-- Uses transaction-level advisory locking to prevent race conditions
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_count INTEGER;
    assigned_role TEXT;
BEGIN
    -- Transaction-level advisory lock prevents concurrent signup race condition
    PERFORM pg_advisory_xact_lock(742918237);

    SELECT count(*) INTO profile_count FROM public.profiles;

    IF profile_count = 0 THEN
        assigned_role := 'admin';
    ELSE
        assigned_role := 'driver';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        assigned_role
    );

    -- Seed default fleet vehicles for the user
    INSERT INTO public.vehicles (user_id, registration, label, type)
    VALUES
        (NEW.id, 'SG24ZSN', 'Taxi A - SG24ZSN', 'daily'),
        (NEW.id, 'NU75DXB', 'Taxi B - NU75DXB', 'weekly'),
        (NEW.id, 'LL68RRX', 'Taxi C - LL68RRX', 'weekly')
    ON CONFLICT (user_id, registration) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists, then re-create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
