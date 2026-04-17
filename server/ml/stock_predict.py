"""
Stock Price Predictor — Uses ML to predict stock price trends.
Uses Random Forest + feature engineering on historical price data.

Usage:
  python stock_predict.py AAPL
"""

import sys
import json
import warnings
warnings.filterwarnings("ignore")

try:
    import yfinance as yf
    import numpy as np
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, r2_score
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {e}. Run: pip install yfinance numpy scikit-learn"}))
    sys.exit(1)


def predict_stock(ticker):
    """Train on historical data and predict next 5 days."""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="2y")

        if hist.empty or len(hist) < 60:
            return {"error": f"Insufficient data for {ticker}. Need at least 60 trading days."}

        # Feature Engineering
        df = hist.copy()
        df["Returns"] = df["Close"].pct_change()
        df["MA5"] = df["Close"].rolling(window=5).mean()
        df["MA20"] = df["Close"].rolling(window=20).mean()
        df["MA50"] = df["Close"].rolling(window=50).mean()
        df["Volatility"] = df["Returns"].rolling(window=20).std()
        df["RSI"] = compute_rsi(df["Close"])
        df["MACD"] = df["Close"].ewm(span=12).mean() - df["Close"].ewm(span=26).mean()
        df["Signal"] = df["MACD"].ewm(span=9).mean()
        df["Volume_MA"] = df["Volume"].rolling(window=20).mean()
        df["Price_to_MA20"] = df["Close"] / df["MA20"]
        df["Price_to_MA50"] = df["Close"] / df["MA50"]

        # Target: next day closing price
        df["Target"] = df["Close"].shift(-1)
        df = df.dropna()

        features = [
            "Close", "Returns", "MA5", "MA20", "MA50",
            "Volatility", "RSI", "MACD", "Signal",
            "Volume_MA", "Price_to_MA20", "Price_to_MA50"
        ]

        X = df[features].values
        y = df["Target"].values

        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, shuffle=False
        )

        # Train Random Forest
        rf_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        rf_model.fit(X_train, y_train)

        # Train Gradient Boosting
        gb_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        gb_model.fit(X_train, y_train)

        # Evaluate
        rf_pred = rf_model.predict(X_test)
        gb_pred = gb_model.predict(X_test)

        rf_r2 = r2_score(y_test, rf_pred)
        gb_r2 = r2_score(y_test, gb_pred)
        rf_mae = mean_absolute_error(y_test, rf_pred)
        gb_mae = mean_absolute_error(y_test, gb_pred)

        # Use the better model for prediction
        best_model = rf_model if rf_r2 > gb_r2 else gb_model
        best_name = "Random Forest" if rf_r2 > gb_r2 else "Gradient Boosting"
        best_r2 = max(rf_r2, gb_r2)
        best_mae = rf_mae if rf_r2 > gb_r2 else gb_mae

        # Predict next 5 days iteratively
        last_row = X[-1:].copy()
        predictions = []
        current_price = float(df["Close"].iloc[-1])

        for day in range(1, 6):
            pred_price = float(best_model.predict(last_row)[0])
            predictions.append({
                "day": day,
                "predictedPrice": round(pred_price, 2),
                "change": round(pred_price - current_price, 2),
                "changePercent": round(((pred_price - current_price) / current_price) * 100, 2),
            })
            # Update features for next prediction (simplified)
            last_row[0][0] = pred_price  # Update Close price

        # Feature importance
        importances = best_model.feature_importances_
        feature_importance = [
            {"feature": features[i], "importance": round(float(importances[i]) * 100, 2)}
            for i in range(len(features))
        ]
        feature_importance.sort(key=lambda x: x["importance"], reverse=True)

        # Determine signal
        avg_predicted_change = sum(p["changePercent"] for p in predictions) / len(predictions)
        if avg_predicted_change > 1:
            signal = "STRONG BUY"
        elif avg_predicted_change > 0.25:
            signal = "BUY"
        elif avg_predicted_change < -1:
            signal = "STRONG SELL"
        elif avg_predicted_change < -0.25:
            signal = "SELL"
        else:
            signal = "HOLD"

        return {
            "ticker": ticker,
            "currentPrice": round(current_price, 2),
            "signal": signal,
            "predictions": predictions,
            "modelUsed": best_name,
            "accuracy": {
                "r2Score": round(best_r2 * 100, 2),
                "meanAbsoluteError": round(best_mae, 2),
            },
            "modelComparison": {
                "randomForest": {"r2": round(rf_r2 * 100, 2), "mae": round(rf_mae, 2)},
                "gradientBoosting": {"r2": round(gb_r2 * 100, 2), "mae": round(gb_mae, 2)},
            },
            "featureImportance": feature_importance[:6],
        }

    except Exception as e:
        return {"error": str(e)}


def compute_rsi(series, period=14):
    """Compute Relative Strength Index."""
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python stock_predict.py <TICKER>"}))
        sys.exit(1)

    ticker = sys.argv[1].upper()
    result = predict_stock(ticker)
    print(json.dumps(result))
