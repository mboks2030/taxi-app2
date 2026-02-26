# QA Validation Checklist

## ✅ 1) Daily Income validation (by payment method)

**Test data (enter exactly):**

| Field | Value |
|-------|-------|
| Date | 2026-01-15 |
| Cash | 50 |
| Card Credits | 30 |
| GCC Account | 20 |
| Non-GCC Account | 0 |

**Expected results:**

| Metric | Value |
|--------|-------|
| Daily Total | 100 |
| Dashboard Cash | 50 |
| Dashboard Card Credits | 30 |
| Dashboard GCC Account | 20 |
| Dashboard Non-GCC Account | 0 |
| Total Income | 100 |

➡️ **Delete the entry** → All totals return to 0

---

## ✅ 2) Multiple days aggregation

**Add second entry:**

| Field | Value |
|-------|-------|
| Date | 2026-01-16 |
| Cash | 40 |
| Card Credits | 10 |
| GCC Account | 0 |
| Non-GCC Account | 50 |

**Expected:**

| Metric | Value |
|--------|-------|
| Day 1 Total | 100 |
| Day 2 Total | 100 |
| Total Cash | 90 |
| Total Card Credits | 40 |
| Total GCC Account | 20 |
| Total Non-GCC Account | 50 |
| Overall Income | 200 |

**Must match in:**
- [ ] Dashboard
- [ ] Weekly Report (week of Jan 15)
- [ ] Monthly Report (Jan 2026)
- [ ] Annual Report (2026)

---

## ✅ 3) Mileage – morning → end-of-day flow

**Morning:**

| Field | Value |
|-------|-------|
| Date | 2026-01-15 |
| Morning Mileage | 120000 |

**End of day (same date):**

| Field | Value |
|-------|-------|
| End-of-Day Mileage | 120150 |

**Expected:** Daily Mileage = 150

**Must appear in:**
- [ ] Mileage Table
- [ ] Dashboard mileage summary
- [ ] Weekly report totals
- [ ] Monthly report totals
- [ ] Annual report totals

---

## ✅ 4) Mileage validation rule

**Try:**

| Field | Value |
|-------|-------|
| Morning | 120200 |
| End-of-Day | 120150 |

**Expected:**
- [ ] Save blocked
- [ ] Error shown (inline)
- [ ] No data stored
- [ ] Dashboard unchanged

---

## ✅ 5) Reactive consistency check (CRITICAL)

Perform each action and confirm **instant update**:

| Action | Dashboard | Weekly | Monthly | Annual |
|--------|-----------|--------|---------|--------|
| Add daily income | ☐ | ☐ | ☐ | ☐ |
| Delete daily income | ☐ | ☐ | ☐ | ☐ |
| Add morning mileage | ☐ | ☐ | ☐ | ☐ |
| Add end-of-day mileage | ☐ | ☐ | ☐ | ☐ |
| Delete mileage entry | ☐ | ☐ | ☐ | ☐ |

**No refresh, no reload, no manual sync required**

---

## ✅ 6) Regression safety check (old data)

- [ ] Load app with existing data (before changes)
- [ ] No crashes
- [ ] Missing fields treated as 0
- [ ] Totals still calculate correctly

---

## 📋 Test Data (JSON)

```json
{
  "dailyIncome": [
    {
      "id": 1737014400001,
      "date": "2026-01-15",
      "car": "SG24ZSN",
      "cash": 50,
      "cardCredits": 30,
      "gccAccount": 20,
      "nonGccAccount": 0,
      "dailyTotal": 100
    },
    {
      "id": 1737100800001,
      "date": "2026-01-16",
      "car": "SG24ZSN",
      "cash": 40,
      "cardCredits": 10,
      "gccAccount": 0,
      "nonGccAccount": 50,
      "dailyTotal": 100
    }
  ],
  "mileage": [
    {
      "id": 1737014400010,
      "date": "2026-01-15",
      "car": "SG24ZSN",
      "morningMileage": 120000,
      "endOfDayMileage": 120150,
      "dailyMileage": 150,
      "distance": 150
    }
  ]
}
```

---

## 🧠 Final Acceptance Rule

**PASS if and only if:**

- [ ] Dashboard totals = sum of tables
- [ ] Reports = dashboard values for same period
- [ ] Mileage difference is always correct
- [ ] No stale numbers anywhere
- [ ] Legacy data (with `amount` field) still works

---

## Sign-Off

| Role | Name | Date | Pass/Fail |
|------|------|------|-----------|
| Developer | | | |
| QA Tester | | | |
