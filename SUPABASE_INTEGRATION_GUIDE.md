# Taxi Business Management System — Supabase Integration & Upgrade Guide

## 1. Inventory of Existing Application Features

The Taxi Business Management System is a specialized fleet financial tracking application designed for taxi fleet operators.

### Core Modules & Capabilities:
* **Fleet & Vehicle Tracking**:
  * **Taxi A (`SG24ZSN`)**: Daily operational vehicle (tracks multi-payment daily income, daily fuel, morning/evening mileage).
  * **Taxi B (`NU75DXB`)**: Weekly lease vehicle (tracks weekly rental income).
  * **Taxi C (`LL68RRX`)**: Weekly lease vehicle (tracks weekly rental income).
* **Daily Income Management**:
  * Multi-method payment logging per day: Cash, Card, Pre-Paid (credits), GCC Account, Non-GCC Account.
  * Auto-calculated daily totals and date grouping with subtotals.
  * End-of-day closure indicator (`endOfDay`).
* **Weekly Rental Tracking**:
  * Week starting date, vehicle assignment, rental amount.
* **Fuel Tracking**:
  * Date, vehicle, fuel cost.
* **Mileage Tracking**:
  * Morning mileage reading (initial).
  * End-of-day mileage reading (final).
  * Auto-calculated distance traveled (`distance = end - morning`).
  * Strict validation ensuring `end >= morning`.
* **Monthly & Annual Expense Management**:
  * Fixed & recurring fleet costs: Fleet Insurance, HP Finance, Radio PDA, Road Tax, Mobile, MOT, Car Maintenance, Driver Salary.
  * Annual expenses: Annual Inspection, Plate Renewal (amortized at 1/12th per month in monthly profit reports).
  * Other custom ad-hoc expenses with descriptions.
* **Reporting & Analytics**:
  * **Executive Dashboard (Profit Report)**: All-time revenue, total expenses, net profit, interactive breakdown charts.
  * **Weekly Report**: ISO week breakdown, payment channels, fuel costs, distance.
  * **Monthly Report**: Per-vehicle breakdown, operating margins, amortized costs.
  * **Annual Report**: Full-year fiscal breakdown by vehicle and cost center.
* **Print & Export**:
  * Clean print stylesheets (`@media print`).
  * PDF generation and native device sharing via `@capacitor/share` and `@capacitor/filesystem`.
* **Offline-First Resilience**:
  * Dexie (IndexedDB) for local instant speed and offline usage.
  * Dedicated offline mode allowing work without internet.

---

## 2. Supabase Cloud Integration Architecture

The application now features a resilient two-tier architecture:
1. **Local Speed Tier**: Dexie (IndexedDB) provides sub-millisecond local reads and writes, ensuring zero UI lag.
2. **Cloud Persistence Tier**: Supabase provides PostgreSQL relational persistence with Row Level Security (RLS) and enterprise authentication.
3. **Two-Way Synchronization**: When authenticated, records synchronize automatically between local storage and Supabase with deduplication.

### Database Tables Created:
| Table Name | Description | Key Columns |
|---|---|---|
| `profiles` | User profiles linked to `auth.users` | `id`, `email`, `role`, `business_name` |
| `vehicles` | Fleet vehicles registered to business | `id`, `user_id`, `registration`, `label`, `type` |
| `daily_income` | Daily multi-payment taxi entries | `id`, `user_id`, `date`, `car`, `payments`, `daily_total` |
| `weekly_rentals` | Lease payments for weekly taxis | `id`, `user_id`, `week_start_date`, `car`, `amount` |
| `daily_fuel` | Fuel expense entries | `id`, `user_id`, `date`, `car`, `amount` |
| `mileage_records` | Vehicle odometers & daily distance | `id`, `user_id`, `date`, `car`, `morning_mileage`, `end_of_day_mileage` |
| `monthly_expenses`| Recurring monthly costs | `id`, `user_id`, `month`, `car`, `type`, `amount` |
| `annual_expenses` | Yearly fees (amortized 1/12th) | `id`, `user_id`, `year`, `car`, `type`, `amount` |
| `other_expenses`  | Ad-hoc business expenses | `id`, `user_id`, `date`, `car`, `type`, `amount` |
| `app_settings`    | User preferences & sync state | `id`, `user_id`, `key`, `value` |

---

## 3. How to Setup Supabase

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. Click **New Project**.
3. Choose a name (e.g. `taxi-business-manager`) and set a strong database password.
4. Select your preferred region and wait for the project to provision.

### Step 2: Apply the Database Migration
1. In the Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Copy the entire contents of [`supabase/migrations/20260313_initial_schema.sql`](file:///c:/Users/user/Desktop/taxi-app2/supabase/migrations/20260313_initial_schema.sql).
4. Click **Run**.
5. You should see `Success. No rows returned`. All tables, indexes, RLS policies, and triggers are now active.

### Step 3: Configure Environment Variables
1. In the Supabase Dashboard, go to **Project Settings** → **API**.
2. Copy your **Project URL** and public **anon key**.
3. In your project root, edit the [`.env`](file:///c:/Users/user/Desktop/taxi-app2/.env) file:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

---

## 4. Row Level Security (RLS) & Multi-Tenant Isolation

* Every table has Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
* Every query automatically applies `WHERE user_id = auth.uid()`.
* Users can **never** view, modify, or delete another business's records.
* Concurrency-safe automatic bootstrap trigger (`handle_new_user` using PostgreSQL advisory lock `pg_advisory_xact_lock`) ensures only the very first registered user receives the `admin` role; all subsequent registrations receive `driver`/`viewer`.
* Dedicated role protection trigger (`trg_protect_profile_role`) strictly prevents ordinary users from modifying or escalating their own roles.
* Default fleet vehicles (`SG24ZSN`, `NU75DXB`, `LL68RRX`) are seeded automatically upon registration.

---

## 5. Exact Windows Commands

Run these commands in PowerShell from the project root (`c:\Users\user\Desktop\taxi-app2`):

### 1. Install Dependencies
```powershell
npm install
```

### 2. Run React Web Application Locally
```powershell
npm start
```
The application will open at `http://localhost:3000`.

### 3. Run Automated Tests
```powershell
npm test -- --watchAll=false
```

### 4. Build Production Web Bundle
```powershell
npm run build
```

### 5. Build Desktop Windows App (.exe)
```powershell
npm run build-electron
```
The installer will be generated in `dist/TaxiBusinessManagementSystem_Setup.exe`.

### 6. Build Android APK
```powershell
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleRelease
```
The update APK will be generated in `android/app/build/outputs/apk/release/app-release.apk`.

---

## 6. Existing Data Migration Instructions

If you have existing data stored in your browser or local Dexie IndexedDB:
1. Open the app and sign in with your Supabase account.
2. The application will detect your existing local records.
3. Click the **🔄 Sync Now** button in the header bar.
4. The system will upload and bind all local records to your Supabase account and enable real-time cloud backup.
