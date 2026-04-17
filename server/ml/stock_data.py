"""
Stock Data Fetcher — Fetches real market data using yfinance.
Called by Node.js via child_process.spawn.

Usage:
  python stock_data.py quote AAPL 1mo
  python stock_data.py search apple
"""

import sys
import json

try:
    import yfinance as yf
except ImportError:
    print(json.dumps({"error": "yfinance not installed. Run: pip install yfinance"}))
    sys.exit(1)


def get_quote(ticker, period="1mo"):
    """Get stock quote and historical data."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        # Get historical data
        hist = stock.history(period=period)

        if hist.empty:
            return {"error": f"No data found for {ticker}"}

        # Format historical data for charts
        history = []
        for date, row in hist.iterrows():
            history.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "close": round(row["Close"], 2),
                "volume": int(row["Volume"]),
            })

        # Current price info
        current_price = history[-1]["close"] if history else 0
        prev_close = info.get("previousClose", history[-2]["close"] if len(history) > 1 else current_price)
        change = round(current_price - prev_close, 2)
        change_pct = round((change / prev_close) * 100, 2) if prev_close else 0

        return {
            "ticker": ticker,
            "companyName": info.get("shortName", ticker),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
            "currentPrice": current_price,
            "previousClose": round(prev_close, 2),
            "change": change,
            "changePercent": change_pct,
            "dayHigh": round(info.get("dayHigh", 0), 2),
            "dayLow": round(info.get("dayLow", 0), 2),
            "fiftyTwoWeekHigh": round(info.get("fiftyTwoWeekHigh", 0), 2),
            "fiftyTwoWeekLow": round(info.get("fiftyTwoWeekLow", 0), 2),
            "marketCap": info.get("marketCap", 0),
            "volume": info.get("volume", 0),
            "avgVolume": info.get("averageVolume", 0),
            "pe": round(info.get("trailingPE", 0), 2) if info.get("trailingPE") else None,
            "eps": round(info.get("trailingEps", 0), 2) if info.get("trailingEps") else None,
            "dividend": round(info.get("dividendYield", 0) * 100, 2) if info.get("dividendYield") else 0,
            "history": history,
        }
    except Exception as e:
        return {"error": str(e)}


def search_stocks(query):
    """Search for stocks by name or ticker."""
    # Popular stocks as a basic search fallback
    popular = [
        {"symbol": "AAPL", "name": "Apple Inc."},
        {"symbol": "GOOGL", "name": "Alphabet Inc."},
        {"symbol": "MSFT", "name": "Microsoft Corporation"},
        {"symbol": "AMZN", "name": "Amazon.com Inc."},
        {"symbol": "TSLA", "name": "Tesla Inc."},
        {"symbol": "META", "name": "Meta Platforms Inc."},
        {"symbol": "NVDA", "name": "NVIDIA Corporation"},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
        {"symbol": "V", "name": "Visa Inc."},
        {"symbol": "WMT", "name": "Walmart Inc."},
        {"symbol": "JNJ", "name": "Johnson & Johnson"},
        {"symbol": "PG", "name": "Procter & Gamble Co."},
        {"symbol": "UNH", "name": "UnitedHealth Group Inc."},
        {"symbol": "HD", "name": "The Home Depot Inc."},
        {"symbol": "DIS", "name": "The Walt Disney Company"},
        {"symbol": "NFLX", "name": "Netflix Inc."},
        {"symbol": "ADBE", "name": "Adobe Inc."},
        {"symbol": "CRM", "name": "Salesforce Inc."},
        {"symbol": "PYPL", "name": "PayPal Holdings Inc."},
        {"symbol": "INTC", "name": "Intel Corporation"},
    ]

    query_lower = query.lower()
    results = [
        s for s in popular
        if query_lower in s["symbol"].lower() or query_lower in s["name"].lower()
    ]

    # If direct ticker entered, try to fetch it
    if not results:
        try:
            stock = yf.Ticker(query.upper())
            info = stock.info
            if info.get("shortName"):
                results.append({
                    "symbol": query.upper(),
                    "name": info["shortName"],
                })
        except Exception:
            pass

    return {"results": results[:10]}


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python stock_data.py <command> <args>"}))
        sys.exit(1)

    command = sys.argv[1]

    if command == "quote":
        ticker = sys.argv[2]
        period = sys.argv[3] if len(sys.argv) > 3 else "1mo"
        result = get_quote(ticker, period)
    elif command == "search":
        query = sys.argv[2]
        result = search_stocks(query)
    else:
        result = {"error": f"Unknown command: {command}"}

    print(json.dumps(result))
