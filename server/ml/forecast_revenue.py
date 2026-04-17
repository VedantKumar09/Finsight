"""
Revenue Forecasting Model for Multi-Company Platform
Uses time series forecasting to predict future revenue for each company
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import joblib
import json
import sys
from datetime import datetime, timedelta

def load_company_data(company_id):
    """
    Load financial data for a specific company from JSON files
    In production, this would query MongoDB directly
    """
    try:
        # Load financial records
        with open('financial_records_data.json', 'r') as f:
            all_records = json.load(f)
        
        # Load company data
        with open('companies_data.json', 'r') as f:
            companies = json.load(f)
        
        # Find company name by "index" (for demo purposes)
        company_names = [c['companyName'] for c in companies]
        
        if company_id >= len(company_names):
            return None, None
        
        company_name = company_names[company_id]
        
        # Filter records for this company
        company_records = [r for r in all_records if r['companyName'] == company_name]
        
        return company_name, company_records
    except Exception as e:
        print(f"Error loading data: {e}")
        return None, None

def prepare_time_series_data(records):
    """
    Prepare time series data for forecasting
    """
    df = pd.DataFrame(records)
    
    # Sort by date
    df = df.sort_values(['year', 'month'])
    
    # Create time index (months from start)
    df['time_index'] = range(len(df))
    
    # Create features
    df['month_of_year'] = df['month']
    df['quarter'] = ((df['month'] - 1) // 3) + 1
    
    # Calculate moving averages
    df['revenue_ma3'] = df['revenue'].rolling(window=3, min_periods=1).mean()
    df['revenue_ma6'] = df['revenue'].rolling(window=6, min_periods=1).mean()
    
    # Calculate revenue growth rate
    df['revenue_growth'] = df['revenue'].pct_change().fillna(0)
    
    return df

def train_revenue_forecast_model(df, company_name):
    """
    Train a revenue forecasting model
    """
    # Features for prediction
    features = ['time_index', 'month_of_year', 'quarter', 'revenue_ma3', 'revenue_ma6']
    
    X = df[features].values
    y = df['revenue'].values
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train model
    model = LinearRegression()
    model.fit(X_scaled, y)
    
    # Calculate R² score
    r2_score = model.score(X_scaled, y)
    
    # Save model and scaler
    model_filename = f'forecast_model_{company_name.replace(" ", "_")}.pkl'
    scaler_filename = f'forecast_scaler_{company_name.replace(" ", "_")}.pkl'
    
    joblib.dump(model, model_filename)
    joblib.dump(scaler, scaler_filename)
    
    return model, scaler, r2_score

def forecast_revenue(model, scaler, last_data, months_ahead=6):
    """
    Forecast revenue for next N months
    """
    forecasts = []
    
    # Get last values
    last_time_index = last_data['time_index'].iloc[-1]
    last_revenue = last_data['revenue'].iloc[-1]
    last_revenue_ma3 = last_data['revenue_ma3'].iloc[-1]
    last_revenue_ma6 = last_data['revenue_ma6'].iloc[-1]
    
    # Get last date
    last_year = last_data['year'].iloc[-1]
    last_month = last_data['month'].iloc[-1]
    
    for i in range(1, months_ahead + 1):
        # Calculate next month
        next_month = last_month + i
        next_year = last_year
        while next_month > 12:
            next_month -= 12
            next_year += 1
        
        # Create features
        time_index = last_time_index + i
        month_of_year = next_month
        quarter = ((next_month - 1) // 3) + 1
        
        # Use last known moving averages (simplified)
        revenue_ma3 = last_revenue_ma3
        revenue_ma6 = last_revenue_ma6
        
        features = np.array([[time_index, month_of_year, quarter, revenue_ma3, revenue_ma6]])
        features_scaled = scaler.transform(features)
        
        # Predict
        predicted_revenue = model.predict(features_scaled)[0]
        
        forecasts.append({
            'year': int(next_year),
            'month': int(next_month),
            'predicted_revenue': float(predicted_revenue),
            'confidence': 0.85  # Simplified confidence score
        })
    
    return forecasts

def main(company_id=0, months_ahead=6):
    """
    Main forecasting function
    """
    print(f"=" * 60)
    print(f"REVENUE FORECASTING for Company ID: {company_id}")
    print(f"=" * 60)
    
    # Load data
    company_name, records = load_company_data(company_id)
    
    if not company_name or not records:
        print("Error: Company not found")
        return
    
    print(f"\nCompany: {company_name}")
    print(f"Historical records: {len(records)} months")
    
    # Prepare data
    df = prepare_time_series_data(records)
    
    # Train model
    print("\nTraining forecasting model...")
    model, scaler, r2_score = train_revenue_forecast_model(df, company_name)
    print(f"[OK] Model trained successfully")
    print(f"  R^2 Score: {r2_score:.4f}")
    
    # Make forecast
    print(f"\nForecasting next {months_ahead} months...")
    forecasts = forecast_revenue(model, scaler, df, months_ahead)
    
    print(f"\n{'Month':<15} {'Predicted Revenue':<20} {'Confidence'}")
    print("-" * 60)
    
    for forecast in forecasts:
        month_str = f"{forecast['month']}/{forecast['year']}"
        revenue_str = f"Rs{forecast['predicted_revenue']/100000:.2f} Lakh"
        confidence_str = f"{forecast['confidence']*100:.0f}%"
        print(f"{month_str:<15} {revenue_str:<20} {confidence_str}")
    
    # Save forecasts
    forecast_filename = f'forecast_{company_name.replace(" ", "_")}.json'
    with open(forecast_filename, 'w') as f:
        json.dump({
            'company': company_name,
            'forecasts': forecasts,
            'model_r2': r2_score,
            'generated_at': datetime.now().isoformat()
        }, f, indent=2)
    
    print(f"\n[OK] Forecast saved to {forecast_filename}")
    print("=" * 60)

if __name__ == "__main__":
    # Get company ID from command line or default to 0
    company_id = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    months = int(sys.argv[2]) if len(sys.argv) > 2 else 6
    
    main(company_id, months)
