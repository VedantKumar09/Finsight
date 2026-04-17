"""
Train a Linear Regression model for profit prediction
This is our BASELINE model - the simplest approach

WHAT IS LINEAR REGRESSION?
- Simplest machine learning model
- Assumes a straight-line relationship: profit = a*revenue + b*expenses + c*marketing + d
- Fast to train, easy to interpret
- Used as a baseline to see if complex models (Random Forest, XGBoost) are worth it
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib
import os
import json
from datetime import datetime

def train_linear_model():
    """Train Linear Regression model and save performance metrics"""
    
    # Load the same data used for other models
    data_file = 'finance_history.csv'
    if not os.path.exists(data_file):
        print("ERROR: finance_history.csv not found!")
        print("Please run train_model.py first to generate data.")
        return None
    
    print("=" * 60)
    print("TRAINING LINEAR REGRESSION MODEL (BASELINE)")
    print("=" * 60)
    print(f"Loading data from {data_file}...")
    df = pd.read_csv(data_file)
    print(f"✓ Loaded {len(df)} samples")
    
    # Prepare features and target
    X = df[['revenue', 'expenses', 'marketing_spend', 'operational_costs']]
    y = df['profit']
    
    # Split data (same split as other models for fair comparison)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Train Linear Regression model
    print("\nTraining Linear Regression model...")
    print("Parameters:")
    print("  - None (Linear Regression has no hyperparameters)")
    print("  - Finds best-fit line through data")
    
    model = LinearRegression()
    
    # Record training time
    start_time = datetime.now()
    model.fit(X_train, y_train)
    training_time = (datetime.now() - start_time).total_seconds()
    
    print(f"✓ Training completed in {training_time:.4f} seconds (very fast!)")
    
    # Show learned coefficients (interpretability)
    print("\nLearned Coefficients (what model learned):")
    feature_names = ['revenue', 'expenses', 'marketing_spend', 'operational_costs']
    for name, coef in zip(feature_names, model.coef_):
        print(f"  - {name:20s}: {coef:+.4f}")
    print(f"  - intercept (base):     {model.intercept_:+.4f}")
    
    # Evaluate model
    print("\nEvaluating model performance...")
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    print("\n" + "=" * 60)
    print("MODEL PERFORMANCE METRICS")
    print("=" * 60)
    print(f"Mean Absolute Error (MAE):  ${mae:,.2f}")
    print(f"Root Mean Squared Error:     ${rmse:,.2f}")
    print(f"R² Score:                    {r2:.4f}")
    print(f"Training Time:               {training_time:.4f} seconds")
    print("\nINTERPRETATION:")
    print(f"- On average, predictions are off by ${mae:,.2f}")
    print(f"- R² = {r2:.4f} means the model explains {r2*100:.2f}% of variance")
    print(f"- This is our BASELINE - other models should beat this!")
    print("=" * 60)
    
    # Save model
    model_path = 'linear_model.pkl'
    joblib.dump(model, model_path)
    print(f"\n✓ Model saved to {model_path}")
    
    # Save performance metrics for comparison
    metrics = {
        'model_name': 'Linear Regression',
        'mae': float(mae),
        'rmse': float(rmse),
        'r2_score': float(r2),
        'training_time': float(training_time),
        'timestamp': datetime.now().isoformat(),
        'coefficients': {
            name: float(coef) for name, coef in zip(feature_names, model.coef_)
        },
        'intercept': float(model.intercept_)
    }
    
    with open('linear_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"✓ Metrics saved to linear_metrics.json")
    
    return model, metrics

if __name__ == "__main__":
    train_linear_model()
