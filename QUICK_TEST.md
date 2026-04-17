# Quick Test - Multi-Company Platform

## ✅ Backend API Test (PowerShell)

```powershell
# Test 1: Company Login
$response = Invoke-RestMethod -Uri "http://localhost:9000/api/company/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@technova.in","password":"password123"}'
Write-Host "✓ Login successful for: $($response.company.companyName)"
$token = $response.token

# Test 2: Get Financial Overview
$overview = Invoke-RestMethod -Uri "http://localhost:9000/api/finance/overview" -Headers @{Authorization="Bearer $token"}
Write-Host "✓ Total Revenue: ₹$([math]::Round($overview.overview.totalRevenue/10000000, 2)) Cr"

# Test 3: Get ML Forecast
$forecast = Invoke-RestMethod -Uri "http://localhost:9000/api/ml/forecast?months=6" -Headers @{Authorization="Bearer $token"}
Write-Host "✓ ML Forecast for next 6 months (R²=$($forecast.model_accuracy)):"
$forecast.forecast | ForEach-Object { Write-Host "  $($_.month)/$($_.year): ₹$([math]::Round($_.predicted_revenue/100000, 1))L" }
```

## 🌐 Frontend Manual Test

1. **Open:** http://localhost:5173/company/login
2. **Login:** admin@technova.in / password123
3. **Verify Dashboard Shows:**
   - ✓ Company name: "TechNova Solutions Pvt. Ltd."
   - ✓ 4 KPI cards (Revenue, Profit, etc.)
   - ✓ Revenue trend chart
   - ✓ Expense pie chart
   - ✓ **AI Forecast section with 6 cards** 🤖

## Test Other Companies

- admin@greenleaf.in / password123
- admin@urbanflow.in / password123
- admin@edumentor.in / password123
- admin@healthfirst.in / password123

---

**Expected Result:** All features working, ML forecasts displayed! ✅
