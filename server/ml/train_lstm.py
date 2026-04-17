"""
Train an LSTM (Long Short-Term Memory) model for profit prediction
LSTM is a deep learning model great for time-series and sequential data

WHAT IS LSTM?
- LSTM = Long Short-Term Memory (a type of neural network)
- Originally designed for sequences and time-series data
- Can capture complex non-linear patterns
- More complex than Random Forest or XGBoost
- Requires more data and training time

WHY USE IT HERE?
- Financial data often has patterns over time
- LSTMs can learn these temporal dependencies
- Shows advanced ML knowledge for O grade project
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib
import os
import json
from datetime import datetime

# TensorFlow/Keras imports
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("WARNING: TensorFlow not installed. Install with: pip install tensorflow")

def train_lstm_model():
    """Train LSTM model and save performance metrics"""
    
    if not TENSORFLOW_AVAILABLE:
        print("ERROR: TensorFlow is required for LSTM model.")
        print("Install it with: pip install tensorflow>=2.13.0")
        return None
    
    # Load the same data used for other models
    data_file = 'finance_history.csv'
    if not os.path.exists(data_file):
        print("ERROR: finance_history.csv not found!")
        print("Please run train_model.py first to generate data.")
        return None
    
    print("=" * 60)
    print("TRAINING LSTM MODEL (DEEP LEARNING)")
    print("=" * 60)
    print(f"Loading data from {data_file}...")
    df = pd.read_csv(data_file)
    print(f"✓ Loaded {len(df)} samples")
    
    # Prepare features and target
    X = df[['revenue', 'expenses', 'marketing_spend', 'operational_costs']].values
    y = df['profit'].values
    
    # Split data (same split as other models)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # IMPORTANT: LSTM requires scaled input (normalization)
    print("\nScaling data...")
    print("  - Neural networks work better with normalized data (0 to 1 range)")
    scaler_X = StandardScaler()
    scaler_y = StandardScaler()
    
    X_train_scaled = scaler_X.fit_transform(X_train)
    X_test_scaled = scaler_X.transform(X_test)
    y_train_scaled = scaler_y.fit_transform(y_train.reshape(-1, 1)).flatten()
    y_test_scaled = scaler_y.transform(y_test.reshape(-1, 1)).flatten()
    
    # Reshape for LSTM: LSTM expects 3D input (samples, timesteps, features)
    # We treat each sample as a single timestep
    X_train_lstm = X_train_scaled.reshape((X_train_scaled.shape[0], 1, X_train_scaled.shape[1]))
    X_test_lstm = X_test_scaled.reshape((X_test_scaled.shape[0], 1, X_test_scaled.shape[1]))
    
    print(f"✓ Data reshaped for LSTM: {X_train_lstm.shape}")
    
    # Build LSTM model
    print("\nBuilding LSTM architecture...")
    print("  - Layer 1: LSTM with 50 units")
    print("  - Layer 2: Dropout (20%) to prevent overfitting")
    print("  - Layer 3: LSTM with 30 units")
    print("  - Layer 4: Dense output layer")
    
    model = Sequential([
        LSTM(50, activation='relu', return_sequences=True, input_shape=(1, 4)),
        Dropout(0.2),
        LSTM(30, activation='relu'),
        Dropout(0.2),
        Dense(1)
    ])
    
    # Compile model
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )
    
    print("\n✓ Model compiled")
    print(f"Total parameters: {model.count_params():,}")
    
    # Early stopping to prevent overfitting
    early_stop = EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True
    )
    
    # Train model
    print("\nTraining LSTM model...")
    print("This may take a few minutes...")
    
    start_time = datetime.now()
    
    # Suppress verbose training output
    history = model.fit(
        X_train_lstm, y_train_scaled,
        epochs=100,
        batch_size=32,
        validation_split=0.2,
        callbacks=[early_stop],
        verbose=0  # Silent training
    )
    
    training_time = (datetime.now() - start_time).total_seconds()
    
    print(f"✓ Training completed in {training_time:.2f} seconds")
    print(f"✓ Trained for {len(history.history['loss'])} epochs")
    
    # Evaluate model
    print("\nEvaluating model performance...")
    y_pred_scaled = model.predict(X_test_lstm, verbose=0)
    
    # Inverse transform predictions back to original scale
    y_pred = scaler_y.inverse_transform(y_pred_scaled).flatten()
    
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
    print(f"Training Time:               {training_time:.2f} seconds")
    print(f"Epochs Trained:              {len(history.history['loss'])}")
    print("\nINTERPRETATION:")
    print(f"- On average, predictions are off by ${mae:,.2f}")
    print(f"- R² = {r2:.4f} means the model explains {r2*100:.2f}% of variance")
    print(f"- LSTM is complex; may overfit with limited data")
    print("=" * 60)
    
    # Save model (Keras format)
    model_path = 'lstm_model.h5'
    model.save(model_path)
    print(f"\n✓ Model saved to {model_path}")
    
    # Save scalers
    joblib.dump(scaler_X, 'lstm_scaler_X.pkl')
    joblib.dump(scaler_y, 'lstm_scaler_y.pkl')
    print(f"✓ Scalers saved (needed for predictions)")
    
    # Save performance metrics
    metrics = {
        'model_name': 'LSTM',
        'mae': float(mae),
        'rmse': float(rmse),
        'r2_score': float(r2),
        'training_time': float(training_time),
        'epochs_trained': len(history.history['loss']),
        'timestamp': datetime.now().isoformat(),
        'architecture': {
            'lstm_units_1': 50,
            'lstm_units_2': 30,
            'dropout_rate': 0.2,
            'total_parameters': int(model.count_params())
        }
    }
    
    with open('lstm_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"✓ Metrics saved to lstm_metrics.json")
    
    return model, metrics

if __name__ == "__main__":
    train_lstm_model()
