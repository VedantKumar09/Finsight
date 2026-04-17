# Finance App — Deep Project Analysis & Enhancement Roadmap

## 1. 🧭 Project Origin & Purpose

This project started as a **MERN Finance Dashboard** tutorial (YouTube: https://youtu.be/uoJ0Tv-BFcQ) and has been extended significantly by adding:
- Company-level authentication and multi-tenant support
- Multiple ML models (Random Forest, XGBoost, Linear Regression)
- Revenue forecasting per company
- A second "Company Portal" parallel to the original user portal

The project is intended as a **Final Year Project** demonstrating full-stack development + ML integration.

---

## 2. 🏗️ Architecture Overview

```
finance-app/
├── client/          ← React + TypeScript (Vite)
│   └── src/
│       ├── scenes/  ← Pages (dashboard, predictions, company portal, auth)
│       ├── components/ ← Shared UI primitives
│       ├── state/   ← Redux Toolkit + RTK Query
│       └── theme.ts ← MUI dark-mode theme
└── server/          ← Node.js + Express
    ├── routes/      ← REST API endpoints
    ├── models/      ← Mongoose schemas
    ├── middleware/  ← JWT auth guards
    ├── ml/          ← Python ML scripts + .pkl model files
    └── data/        ← Seed data (large JS file)
```

### Two Parallel Systems (Design Debt ⚠️)

The app has **two separate auth systems** side-by-side:

| Aspect | Legacy User System | Company System (New) |
|---|---|---|
| Model | `User.js` | `Company.js` |
| Token key | `"token"` in localStorage | `"companyToken"` |
| Routes | `/auth/*`, `/predict/*` | `/api/company/*`, `/api/finance/*`, `/api/ml/*` |
| Dashboard | Standard dashboard (Row1/2/3) | `CompanyDashboard.tsx` |
| Frontend state | RTK Query (`api.ts`) | Raw `fetch()` calls |
| Auth middleware | `middleware/auth.js` | `middleware/companyAuth.js` |

---

## 3. 📦 Tech Stack (Current)

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| TypeScript | 4.9 | Type safety |
| Vite | 4.1 | Build tool |
| Material UI | 5.11 | Component library |
| MUI X DataGrid | 6.0 | Data tables |
| Redux Toolkit | 1.9 | State management |
| RTK Query | (bundled) | API data fetching |
| React Router | 6.8 | Client-side routing |
| Recharts | 2.4 | Chart library |
| regression.js | 2.0 | Client-side linear regression |

### Backend
| Library | Version | Purpose |
|---|---|---|
| Express | 4.18 | Web framework |
| Mongoose | 7.0 | MongoDB ODM |
| mongoose-currency | 0.2 | Currency type |
| jsonwebtoken | 9.0 | JWT auth |
| bcryptjs | 2.4 | Password hashing |
| helmet | 6.0 | HTTP security headers |
| morgan | 1.10 | HTTP request logger |
| cors | 2.8 | Cross-Origin Resource Sharing |
| dotenv | 16.0 | Environment variables |
| python-shell | 5.0 | Run Python from Node (installed but not used — `child_process.spawn` is used instead) |

### Machine Learning (Python)
| Library | Purpose |
|---|---|
| scikit-learn | Random Forest, Linear Regression, StandardScaler |
| XGBoost | XGBoost regressor |
| pandas | Data manipulation |
| numpy | Numerical computing |
| joblib | Model serialization (.pkl) |

---

## 4. 🗃️ Database Design (MongoDB)

### Collections

#### `kpis` — KPI (Key Performance Indicator)
Used by the original/legacy dashboard.
```
totalProfit, totalRevenue, totalExpenses (Currency)
expensesByCategory: Map<string, Currency>
monthlyData: [{ month, revenue, expenses, operationalExpenses, nonOperationalExpenses }]
dailyData: [{ date, revenue, expenses }]
```
> ⚠️ **Fixed/static data** — seeded once and never updated by users.

#### `products` — Products
```
price, expense (Currency)
transactions: [ObjectId ref Transaction]
```

#### `transactions` — Transactions
```
buyer: String, amount (Currency)
productIds: [ObjectId ref Product]
```

#### `users` — Users (Legacy)
```
name, email, password (hashed)
```

#### `predictions` — ML Predictions
```
userId (ref User), revenue, expenses, marketingSpend, operationalCosts
predictedProfit, confidence, inputValues: Map<string, Number>
```

#### `companies` — Companies (New System)
```
companyName (unique), email, password, industry (enum), foundedDate
employees, location, description, contactPerson, phone, website, logo
```
> Industries: Software Dev, Food & Beverage, Transportation & Logistics, EdTech, Healthcare, Manufacturing, Retail, Finance, Other

#### `financialrecords` — Financial Records (New System)
```
companyId (ref Company), year, month (unique per company per month)
revenue, expenses, profit (auto-calculated)
salaries, rent, marketing, utilities, supplies, otherExpenses
cashFlow, assets, liabilities, employeeCount, notes
isVerified, blockchainHash (placeholder for Phase 2)
```
> Compound index on `(companyId, year, month)` ensures uniqueness

---

## 5. 🔌 API Endpoints

### Legacy User Auth
```
POST /auth/register     — Register user
POST /auth/login        — Login, returns JWT
```

### Legacy Prediction (Python ML)
```
POST /predict/          — Run prediction via Python child process [Protected]
GET  /predict/history   — Get user's prediction history [Protected]
```

### Original Tutorial Routes
```
GET /kpi/kpis/                 — Get all KPI data
GET /product/products/         — Get all products
GET /transaction/transactions/ — Get transactions (latest 20)
```

### Company Auth (New)
```
POST /api/company/register     — Register company
POST /api/company/login        — Login company, returns JWT
GET  /api/company/me           — Get company profile [Protected]
PUT  /api/company/profile      — Update company profile [Protected]
```

### Company Finance (New)
```
GET  /api/finance/overview                  — KPI summary [Protected]
GET  /api/finance/trends?months=12          — Monthly trend data [Protected]
GET  /api/finance/records                   — All records [Protected]
GET  /api/finance/records/:year/:month      — Specific month [Protected]
POST /api/finance/record                    — Add new financial record [Protected]
PUT  /api/finance/record/:year/:month       — Update record [Protected]
GET  /api/finance/expenses/breakdown        — Expense category breakdown [Protected]
```

### ML Forecast (New)
```
GET  /api/ml/forecast   — Get pre-generated revenue forecast file [Protected]
```
> ⚠️ This reads from a static `.json` file — NOT computed on demand.

---

## 6. 🖥️ Frontend Pages & Components

### Pages (Scenes)

| Route | Component | Auth Required |
|---|---|---|
| `/login` | `Login` | No |
| `/register` | `Register` | No |
| `/` | `Dashboard` (Row1+2+3) | Yes (user token) |
| `/predictions` | `Predictions` | Yes (user token) |
| `/prediction-history` | `PredictionHistory` | Yes (user token) |
| `/company/login` | `CompanyLogin` | No |
| `/company/dashboard` | `CompanyDashboard` | Yes (company token) |

### Dashboard Layout (Grid)
The old dashboard uses CSS grid areas (`a` to `j`):
- **Row1 (a, b, c):** Revenue/Expenses area chart, Profit/Revenue dual-axis line, Revenue bar chart
- **Row2 (d, e, f):** Operational vs non-operational expenses, Campaign pie chart (hardcoded data!), Product price vs expense scatter
- **Row3 (g, h, i, j):** Products table, Transactions table, Expense category pie charts, Summary (placeholder Lorem Ipsum text!)

### Reusable Components
- `DashboardBox` — Styled container with grid-area support
- `BoxHeader` — Title + subtitle + side text bar
- `FlexBetween` — Row with space-between flex
- `ProtectedRoute` — Redirects to `/login` if no token
- `ProtectedCompanyRoute` — Redirects to `/company/login` if no company token

### State Management
- RTK Query for the old user system (KPI, products, transactions, auth, predictions)
- Raw `fetch()` in `useEffect` for the company dashboard
- Tokens stored in `localStorage` (not in Redux store)

---

## 7. 🤖 Machine Learning Details

### Model 1: Random Forest (Primary — `profit_model.pkl`, 5MB)
- **Features:** revenue, expenses, marketing_spend, operational_costs
- **Target:** profit
- **Data:** 1000 rows synthetic + `finance_history.csv` (if present)
- **Accuracy:** R² = 0.9784 (97.84%)
- **Invoker:** `child_process.spawn("python", ["predict.py", ...args])`

### Model 2: Linear Regression (`linear_model.pkl`)
- Same features as RF but lighter (~1KB model)
- Trained in `train_linear.py`

### Model 3: XGBoost (`xgboost_model.pkl`, 695KB)
- Trained in `train_xgboost.py`

### Model 4: Revenue Forecasting (per company)
- Files: `forecast_model_{CompanyName}.pkl` + `forecast_scaler_{CompanyName}.pkl`
- Algorithm: LinearRegression on time-series features (time_index, month_of_year, quarter, revenue_ma3, revenue_ma6)
- Output: `forecast_{CompanyName}.json` — static pre-generated files

### Model Comparison Script
`compare_models.py` — Outputs `model_comparison_report.json` and metrics JSON files

### How ML is Invoked
Node.js spawns a Python child process for every prediction request. Output is captured from stdout and parsed as JSON. This approach has:
- ✅ Works cross-platform
- ⚠️ Cold-start latency every request (Python interpreter starts each time)
- ⚠️ Not scalable for high traffic

---

## 8. 🔐 Security Analysis

| Aspect | Status | Notes |
|---|---|---|
| Password hashing | ✅ bcrypt (10 rounds) | Good |
| JWT auth | ✅ 7-day expiry | Stored in localStorage (XSS risk) |
| CORS | ⚠️ Open (`cors()`) | Should whitelist origins in production |
| Helmet | ✅ Enabled | Good defaults |
| Rate limiting | ❌ Missing | API abuse risk |
| Input validation | ⚠️ Partial | Only basic checks, no sanitizer |
| HTTPS | ❌ Not set up | Needed for production |
| Secrets | ⚠️ Fallback `"your-secret-key"` | Must enforce real secret |

---

## 9. ⚠️ Critical Issues & Technical Debt

1. **Hardcoded Data** — `Row2.tsx` "Campaigns and Targets" pie chart uses hardcoded values (`{ name: "Group A", value: 600 }`)
2. **Lorem Ipsum placeholder** — `Row3.tsx` "Overall Summary" box has fake Latin placeholder text
3. **YAxis domain hardcoded** — `domain={[8000, 23000]}` in Row1 area chart, `domain={[12000, 26000]}` in Predictions chart — breaks if real data differs
4. **Static forecast files** — The ML forecast is read from a pre-generated JSON file; there's no on-demand forecasting
5. **`python-shell` dependency** — Installed but not used; actual calls use `child_process.spawn`
6. **CompanyDashboard hardcodes API base URL** — `"http://localhost:9000/..."` instead of using environment variable
7. **No error boundary** — Frontend has no React error boundary; a render error in one box crashes the whole page
8. **`/api/company/me` and `/api/company/profile` routes** — Not protected by middleware (the middleware is missing in `companyAuth.js` route handlers for those two endpoints)
9. **Transaction sort bug** — Sort uses `createdOn` but Mongoose adds `createdAt`
10. **No pagination** — Prediction history and transactions are limited but not paginated
11. **The `regression` library** — Client-side regression is duplicated; server already has Python ML — both doing similar things for different purposes
12. **Two separate login systems** — UX-confusing; a user doesn't know which portal to use

---

## 10. 📐 Theme & Design System

- Dark mode only
- Color palette: primary (teal/cyan `#12efc8`), secondary (amber `#f2b455`), tertiary (purple `#8884d8`)
- Font: Inter (Google Fonts)
- Component library: Material UI v5
- Charts: Recharts
- Missing: animations, transitions, responsive mobile layout

---

## 11. 🎯 Enhancement Ideas for Final Year Project

### Architecture Improvements
- [ ] Unify the two auth systems into one (Company = Entity, employees of company can log in)
- [ ] Move API base URL to environment variable in company dashboard
- [ ] Add React error boundaries
- [ ] Replace child_process prediction with a FastAPI/Flask microservice for better performance
- [ ] Add proper input validation (express-validator or Joi)

### Feature Additions
- [ ] **Real-time financial record entry** — Form to add monthly data from the company dashboard
- [ ] **Report generation** — Export financial data as PDF/CSV
- [ ] **Goal tracking** — Set revenue/profit targets and track progress
- [ ] **Multi-user roles** — Admin vs Employee within a company
- [ ] **Notifications/alerts** — Alert when expenses exceed budget
- [ ] **Comparative analysis** — Compare two time periods or multiple metrics side-by-side
- [ ] **On-demand ML forecasting** — Trigger forecast on button click instead of reading static file
- [ ] **Model selection UI** — Let users pick Linear/XGBoost/RandomForest and see different predictions
- [ ] **Explainability** — Show which features drove the prediction (feature importance)
- [ ] **Audit log** — Track who changed financial records and when

### UI/UX Improvements
- [ ] **Replace hardcoded charts** — Campaign chart and Summary box need real data
- [ ] **Dynamic YAxis** — Auto-scale axis based on actual data range
- [ ] **Responsive design** — Mobile-friendly layout
- [ ] **Loading skeletons** — Replace generic CircularProgress with skeleton screens
- [ ] **Animations** — Chart entry animations, page transitions
- [ ] **Dark/light mode toggle**

### Academic/Research Elements
- [ ] **Model comparison dashboard** — Visualize R², MAE across models
- [ ] **Confidence intervals** — Show prediction uncertainty range on charts
- [ ] **Data ingestion page** — Upload CSV of historical data to retrain model
- [ ] **Explainability charts** — SHAP values or feature importance bar charts
- [ ] **Blockchain integration** — The `blockchainHash` field already exists on FinancialRecord — implement data integrity verification

---

## 12. 📋 File Index

| File | Role |
|---|---|
| `server/index.js` | Express server entry, route registration, DB connect & auto-seed |
| `server/models/KPI.js` | Mongoose schema for KPIs with currency type |
| `server/models/Company.js` | Company entity schema |
| `server/models/FinancialRecord.js` | Monthly financial data per company |
| `server/models/Prediction.js` | Stores each ML prediction made |
| `server/models/User.js` | Legacy individual user model |
| `server/models/Product.js` | Product with price/expense |
| `server/models/Transaction.js` | Transaction with buyer/amount |
| `server/routes/auth.js` | User register/login |
| `server/routes/companyAuth.js` | Company register/login/profile |
| `server/routes/finance.js` | Company financial record CRUD + analytics |
| `server/routes/ml.js` | Reads pre-generated forecast JSON |
| `server/routes/prediction.js` | Runs Python ML + saves to DB |
| `server/routes/kpi.js` | Fetches KPI collection |
| `server/routes/product.js` | Fetches products |
| `server/routes/transaction.js` | Fetches transactions |
| `server/middleware/auth.js` | JWT verification for user tokens |
| `server/middleware/companyAuth.js` | JWT verification for company tokens |
| `server/ml/train_model.py` | Trains Random Forest profit model |
| `server/ml/train_linear.py` | Trains Linear Regression model |
| `server/ml/train_xgboost.py` | Trains XGBoost model |
| `server/ml/train_lstm.py` | LSTM model (experimental) |
| `server/ml/compare_models.py` | Benchmarks all 3 models |
| `server/ml/predict.py` | Inference script called per request |
| `server/ml/forecast_revenue.py` | Per-company time-series forecasting script |
| `server/ml/generate_company_data.py` | Synthetic company data generator |
| `server/scripts/seedData.js` | Seeds DB with KPI/products/transactions |
| `server/scripts/seedCompanies.js` | Seeds DB with company + financial records |
| `server/data/data.js` | Raw KPI/product/transaction seed data |
| `client/src/App.tsx` | Top-level router, theme provider |
| `client/src/theme.ts` | MUI theme palette + typography tokens |
| `client/src/state/api.ts` | RTK Query API slice |
| `client/src/state/types.ts` | TypeScript interfaces for API responses |
| `client/src/scenes/dashboard/index.tsx` | Dashboard grid layout |
| `client/src/scenes/dashboard/Row1.tsx` | Revenue/profit charts |
| `client/src/scenes/dashboard/Row2.tsx` | Operational expenses + pie + scatter |
| `client/src/scenes/dashboard/Row3.tsx` | Product/transaction tables + expense pie |
| `client/src/scenes/predictions/index.tsx` | ML prediction form + regression chart |
| `client/src/scenes/predictionHistory/index.tsx` | History data grid |
| `client/src/scenes/company/CompanyLogin.tsx` | Company portal login form |
| `client/src/scenes/company/CompanyDashboard.tsx` | Company-specific dashboard |
| `client/src/scenes/login/index.tsx` | Legacy user login |
| `client/src/scenes/register/index.tsx` | Legacy user register |
| `client/src/scenes/navbar/index.tsx` | App navigation bar |
| `client/src/components/DashboardBox.tsx` | Grid-area styled box |
| `client/src/components/BoxHeader.tsx` | Chart title header |
| `client/src/components/FlexBetween.tsx` | Flex row utility |
| `client/src/components/ProtectedRoute.tsx` | User auth guard |
| `client/src/components/ProtectedCompanyRoute.tsx` | Company auth guard |
