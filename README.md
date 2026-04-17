# Finsight — Smart Finance Dashboard

An AI-powered personal finance management and stock market simulation platform built with the MERN stack and Machine Learning.

## ✨ Features

- 🔐 **User Authentication** — Secure JWT-based login/register
- 💰 **Personal Finance Management** — Track income, expenses, and multiple accounts
- 📊 **Interactive Dashboard** — Beautiful charts for spending trends and category breakdowns
- 📈 **Live Stock Market** — Real-time stock data powered by Yahoo Finance
- 🎯 **Simulated Trading** — Buy/sell stocks with $100,000 virtual balance
- 💼 **Portfolio Tracking** — Track holdings, realized P&L, and trade history
- 🤖 **AI Stock Predictions** — ML-powered price forecasting using Random Forest & Gradient Boosting
- 📉 **Feature Importance** — Explainable AI showing what drives each prediction
- 🎨 **Premium Dark UI** — Glassmorphism design with micro-animations

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, JavaScript, Material-UI, Redux Toolkit (RTK Query), Recharts, Framer Motion |
| **Backend** | Node.js, Express, MongoDB, Mongoose |
| **ML/AI** | Python, scikit-learn, XGBoost, yfinance |
| **Auth** | JWT, bcrypt |

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- MongoDB (local or Atlas)

### Installation

**1. Backend:**
```bash
cd server
npm install
cd ml
pip install -r requirements.txt
cd ..
# Create .env file with:
# MONGO_URL=mongodb+srv://...
# JWT_SECRET=your-secret-key
npm run dev
```

**2. Frontend (new terminal):**
```bash
cd client
npm install
# Create .env file with:
# VITE_BASE_URL=http://localhost:9000/
npm run dev
```

**3. Open** http://localhost:5173

## 📁 Project Structure

```
finance-app/
├── client/                    # React frontend
│   └── src/
│       ├── scenes/           # Pages
│       │   ├── dashboard/    # Main dashboard
│       │   ├── markets/      # Stock market & trading
│       │   ├── portfolio/    # Portfolio & trade history
│       │   ├── transactions/ # Income/expense management
│       │   ├── predictions/  # AI stock predictions
│       │   ├── login/        # Login page
│       │   ├── register/     # Register page
│       │   └── navbar/       # Navigation bar
│       ├── components/       # Reusable UI components
│       └── state/            # Redux + RTK Query
└── server/                   # Node.js backend
    ├── models/               # MongoDB schemas
    ├── routes/               # REST API endpoints
    ├── middleware/            # JWT auth
    └── ml/                   # Python ML scripts
        ├── stock_data.py     # Yahoo Finance data fetcher
        └── stock_predict.py  # ML prediction engine
```

## 🤖 Machine Learning

The platform uses **dual ML models** trained on-demand for each stock:

| Model | Algorithm | Purpose |
|---|---|---|
| Random Forest | Ensemble (100 trees) | Price prediction |
| Gradient Boosting | Sequential boosting | Price prediction |

**Features used:** Close price, Returns, MA5/MA20/MA50, RSI, MACD, Volatility, Volume

The system automatically selects the better-performing model based on R² score.

## 🎓 Academic Contribution

- Full-stack MERN development with real-world financial data
- Comparative ML model analysis (Random Forest vs Gradient Boosting)
- Feature importance visualization (Explainable AI)
- Technical indicators (RSI, MACD, Moving Averages) as ML features
- Simulated trading system with P&L tracking
