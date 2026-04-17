# 🔍 Dashboard Troubleshooting

## What You Should See on Company Dashboard

### Layout (Single Page):

```
┌─────────────────────────────────────────────┐
│ TechNova Solutions Pvt. Ltd.    [Logout]   │
│ Software Development • Bangalore            │
├─────────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐  │
│  │Revenue│ │Profit │ │ Avg   │ │ Avg   │  │ ← KPI Cards
│  │₹15 Cr │ │₹3.7 Cr│ │₹62 L  │ │₹15 L  │  │
│  └───────┘ └───────┘ └───────┘ └───────┘  │
├─────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌──────────────┐  │
│  │ Revenue & Profit   │  │   Expense    │  │ ← Charts
│  │  Trend (Line)      │  │  Breakdown   │  │
│  │                    │  │  (Pie Chart) │  │
│  └────────────────────┘  └──────────────┘  │
├─────────────────────────────────────────────┤
│         🤖 AI Revenue Forecast              │
│       Next 6 months prediction              │ ← ML Section
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐      │ (SCROLL DOWN!)
│  │12/│ │1/ │ │2/ │ │3/ │ │4/ │ │5/ │      │
│  │25 │ │26 │ │26 │ │26 │ │26 │ │26 │      │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘      │
└─────────────────────────────────────────────┘
```

## If ML Forecast is NOT showing:

### Check 1: Browser Console
**Press F12** → Go to "Console" tab

**Look for errors like:**
- ❌ "Forecast error: ..."
- ❌ "Failed to fetch"
- ❌ Network error

### Check 2: Network Tab
**F12** → "Network" tab → Refresh page

**Look for:**
- ❌ GET `/api/ml/forecast` - RED (failed)
- ✅ GET `/api/ml/forecast` - GREEN (success)

### Check 3: Forecast State
**F12** → Console tab → Type:
```javascript
// Check if forecast data exists
const forecast = document.querySelector('[class*="forecast"]');
console.log('Forecast section exists:', !!forecast);
```

## Common Issues:

### Issue 1: "forecast.map is not a function"
**Cause:** Forecast API returned error
**Fix:** Check backend terminal for Python errors

### Issue 2: Forecast section not visible
**Cause:** Need to scroll down!
**Fix:** Scroll to bottom of page

### Issue 3: Charts not loading
**Cause:** Data fetching slow
**Fix:** Wait 2-3 seconds after login

## Quick Debug:

**Open DevTools Console (F12) and run:**
```javascript
// Check what data is loaded
setTimeout(() => {
  const token = localStorage.getItem('companyToken');
  fetch('http://localhost:9000/api/ml/forecast?months=6', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(d => console.log('Forecast data:', d))
  .catch(e => console.error('Forecast error:', e));
}, 1000);
```

**Expected output:**
```json
{
  "company": "TechNova Solutions Pvt. Ltd.",
  "forecast": [
    { "year": 2025, "month": 12, "predicted_revenue": 6933830, "confidence": 0.85 },
    ...
  ]
}
```

## Still Not Working?

**Tell me what you see in:**
1. Browser console (F12 → Console tab)
2. Backend terminal (any Python errors?)
3. Frontend terminal (any compilation errors?)
