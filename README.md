# Finance Dashboard App

Build A MERN Finance Dashboard App with ML-based Profit Prediction

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- MongoDB (local or Atlas)

### Installation & Run

**1. Backend Setup:**
```bash
cd server
npm install
cd ml
pip install -r requirements.txt
python train_model.py
cd ..
# Create .env file (see SETUP.md)
npm run dev
```

**2. Frontend Setup (new terminal):**
```bash
cd client
npm install
# Create .env file with VITE_BASE_URL=http://localhost:9000
npm run dev
```

**3. Access Application:**
Open http://localhost:5173 in your browser

## ✨ Features

- ✅ **User Authentication** (JWT-based login/register)
- ✅ **Multiple ML Models** (Linear Regression, XGBoost, Random Forest)
- ✅ **ML-based Profit Prediction** with 97.8% accuracy
- ✅ **Prediction History** tracking per user
- ✅ **Financial Dashboard** with interactive charts and KPIs
- ✅ **Protected Routes** for authenticated users

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Quick start installation guide
- **[docs/thesis.md](./docs/thesis.md)** - Complete academic thesis
- **[docs/database-design.md](./docs/database-design.md)** - Database architecture
- **[docs/er-diagram.md](./docs/er-diagram.md)** - Entity relationship diagrams
- **[docs/ml-guide.md](./docs/ml-guide.md)** - ML model training guide
- **[docs/implementation.md](./docs/implementation.md)** - Implementation details
- **[docs/project-review.md](./docs/project-review.md)** - Project review and status


## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Material-UI, Redux Toolkit, Recharts
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **ML:** Python, scikit-learn (Linear Regression, Random Forest, XGBoost)
- **Auth:** JWT, bcrypt

## 📊 Project Status

✅ **Fully Functional** - All features working and tested

- Multiple ML models trained and compared
- Linear Regression model achieves 97.8% accuracy (R² = 0.9784)
- Predictions working with model selection support
- Dashboard displaying financial data
- User authentication and history tracking functional

## 🎯 Quick Commands

```bash
# View database contents
cd server && npm run view-data

# Seed database
cd server && npm run seed

# Start backend
cd server && npm run dev

# Start frontend
cd client && npm run dev

# Train ML models
cd server/ml && python train_xgboost.py
cd server/ml && python train_linear.py
cd server/ml && python compare_models.py
```

## 📖 Original Tutorial

Video: https://www.youtube.com/watch?v=uoJ0Tv-BFcQ

For all related questions and discussions about this project, check out the discord: https://discord.gg/2FfPeEk2mX

## 📁 Project Structure

```
finance-app/
├── README.md                    # This file
├── SETUP.md                     # Installation guide
├── docs/                        # Documentation
│   ├── thesis.md               # Academic thesis
│   ├── database-design.md      # Database architecture
│   ├── er-diagram.md           # ER diagrams
│   ├── ml-guide.md             # ML training guide
│   ├── implementation.md       # Implementation details
│   └── project-review.md       # Project status
├── client/                      # React frontend
│   ├── src/
│   │   ├── scenes/             # Pages (dashboard, predictions, etc.)
│   │   ├── components/         # Reusable components
│   │   └── state/              # Redux state management
│   └── package.json
└── server/                      # Node.js backend
    ├── models/                 # MongoDB models
    ├── routes/                 # API routes
    ├── middleware/             # Auth middleware
    ├── ml/                     # Machine Learning
    │   ├── train_model.py      # Random Forest
    │   ├── train_xgboost.py    # XGBoost
    │   ├── train_linear.py     # Linear Regression
    │   ├── compare_models.py   # Model comparison
    │   └── *.pkl               # Trained models
    └── package.json
```

## 🎓 Academic Contribution

This project demonstrates:
- **Full-stack development** with MERN stack
- **Machine learning integration** with comparative analysis
- **Systematic model evaluation** (R², MAE metrics)
- **JWT authentication** and secure data handling
- **Research methodology** in ML model selection

