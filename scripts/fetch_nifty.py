import yfinance as yf
import json

ticker = yf.Ticker("^NSEI")
hist = ticker.history(period="10y")

data = [
    {
        "date": str(idx.date()),
        "close": float(row["Close"])
    }
    for idx, row in hist.iterrows()
]

with open("nifty50_cache.json", "w") as f:
    json.dump(data, f)
