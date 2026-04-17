"""
Train an XGBoost model for profit prediction
XGBoost is a gradient boosting algorithm known for high accuracy

WHAT IS XGBOOST?
- XGBoost = eXtreme Gradient Boosting
- It builds many small decision trees, each correcting errors from previous trees
- Very popular in machine learning competitions for its accuracy
- Faster and more accurate than Random Forest in many cases
"""
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib
import os
import json
from datetime import datetime

def train_xgboost_model():
    """Train XGBoost model and save performance metrics"""
    
    # Load the same data used for Random Forest
    data_file = 'finance_history.csv'
    if not os.path.exists(data_file):
        print("ERROR: finance_history.csv not found!")
        print("Please run train_model.py first to generate data.")
        return None
    
    print("=" * 60)
    print("TRAINING XGBOOST MODEL")
    print("=" * 60)
    print(f"Loading data from {data_file}...")
    df = pd.read_csv(data_file)
    print(f"✓ Loaded {len(df)} samples")
    
    # Prepare features and target
    X = df[['revenue', 'expenses', 'marketing_spend', 'operational_costs']]
    y = df['profit']
    
    # Split data (same split as Random Forest for fair comparison)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Train XGBoost model
    print("\nTraining XGBoost model...")
    print("Parameters:")
    print("  - n_estimators: 200 (number of trees)")
    print("  - max_depth: 6 (tree depth)")
    print("  - learning_rate: 0.1 (how fast model learns)")
    print("  - objective: reg:squarederror (for regression)")
    
    model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        objective='reg:squarederror',
        random_state=42,
        n_jobs=-1
    )
    
    # Record training time
    start_time = datetime.now()
    model.fit(X_train, y_train)
    training_time = (datetime.now() - start_time).total_seconds()
    
    print(f"✓ Training completed in {training_time:.2f} seconds")
    
    # Evaluate model
    print("\nEvaluating model performance...")
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    # Calculate mean and std of predictions for confidence estimation
    pred_std = np.std(y_pred)
    
    print("\n" + "=" * 60)
    print("MODEL PERFORMANCE METRICS")
    print("=" * 60)
    print(f"Mean Absolute Error (MAE):  ${mae:,.2f}")
    print(f"Root Mean Squared Error:     ${rmse:,.2f}")
    print(f"R² Score:                    {r2:.4f}")
    print(f"Training Time:               {training_time:.2f} seconds")
    print("\nINTERPRETATION:")
    print(f"- On average, predictions are off by ${mae:,.2f}")
    print(f"- R² = {r2:.4f} means the model explains {r2*100:.2f}% of variance")
    print(f"- Higher R² is better (max = 1.0)")
    print("=" * 60)
    
    # Save model
    model_path = 'xgboost_model.pkl'
    joblib.dump(model, model_path)
    print(f"\n✓ Model saved to {model_path}")
    
    # Save performance metrics for comparison
    metrics = {
        'model_name': 'XGBoost',
        'mae': float(mae),
        'rmse': float(rmse),
        'r2_score': float(r2),
        'training_time': float(training_time),
        'timestamp': datetime.now().isoformat(),
        'n_estimators': 200,
        'max_depth': 6
    }
    
    with open('xgboost_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"✓ Metrics saved to xgboost_metrics.json")
    
    return model, metrics

if __name__ == "__main__":
    train_xgboost_model()
