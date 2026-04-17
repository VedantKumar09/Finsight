import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import StockHolding from "../models/StockHolding.js";
import StockTrade from "../models/StockTrade.js";
import Watchlist from "../models/Watchlist.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper: Run Python script and return JSON output
const runPython = (scriptName, args = []) => {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(__dirname, "..", "ml", scriptName);
    const process = spawn("python", [pythonPath, ...args]);

    let output = "";
    let error = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      error += data.toString();
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(error || `Python script exited with code ${code}`));
      } else {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${output}`));
        }
      }
    });
  });
};

// ==================== STOCK DATA ====================

// Get stock quote / historical data
router.get("/quote/:ticker", verifyToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    const { period = "1mo" } = req.query; // 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y
    const data = await runPython("stock_data.py", ["quote", ticker.toUpperCase(), period]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search stocks
router.get("/search/:query", verifyToken, async (req, res) => {
  try {
    const data = await runPython("stock_data.py", ["search", req.params.query]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ML prediction for a stock
router.get("/predict/:ticker", verifyToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    const data = await runPython("stock_predict.py", [ticker.toUpperCase()]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== WATCHLIST ====================

// Get user's watchlist
router.get("/watchlist", verifyToken, async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.userId });
    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId: req.userId,
        tickers: [
          { symbol: "AAPL", companyName: "Apple Inc." },
          { symbol: "GOOGL", companyName: "Alphabet Inc." },
          { symbol: "MSFT", companyName: "Microsoft Corporation" },
          { symbol: "TSLA", companyName: "Tesla Inc." },
        ],
      });
    }
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add ticker to watchlist
router.post("/watchlist", verifyToken, async (req, res) => {
  try {
    const { symbol, companyName } = req.body;
    let watchlist = await Watchlist.findOne({ userId: req.userId });

    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId: req.userId,
        tickers: [{ symbol: symbol.toUpperCase(), companyName }],
      });
    } else {
      // Check duplicate
      const exists = watchlist.tickers.find((t) => t.symbol === symbol.toUpperCase());
      if (exists) {
        return res.status(400).json({ message: "Already in watchlist" });
      }
      watchlist.tickers.push({ symbol: symbol.toUpperCase(), companyName });
      await watchlist.save();
    }

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove ticker from watchlist
router.delete("/watchlist/:symbol", verifyToken, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ userId: req.userId });
    if (!watchlist) {
      return res.status(404).json({ message: "Watchlist not found" });
    }

    watchlist.tickers = watchlist.tickers.filter(
      (t) => t.symbol !== req.params.symbol.toUpperCase()
    );
    await watchlist.save();

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== PORTFOLIO / TRADING ====================

// Get portfolio holdings
router.get("/portfolio", verifyToken, async (req, res) => {
  try {
    const holdings = await StockHolding.find({ userId: req.userId, shares: { $gt: 0 } });
    const user = await User.findById(req.userId).select("virtualBalance");
    res.json({ holdings, virtualBalance: user.virtualBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buy stock
router.post("/trade/buy", verifyToken, async (req, res) => {
  try {
    const { ticker, companyName, shares, pricePerShare } = req.body;
    const totalCost = shares * pricePerShare;

    // Check virtual balance
    const user = await User.findById(req.userId);
    if (user.virtualBalance < totalCost) {
      return res.status(400).json({ message: "Insufficient virtual balance" });
    }

    // Deduct balance
    user.virtualBalance -= totalCost;
    await user.save();

    // Update or create holding
    let holding = await StockHolding.findOne({
      userId: req.userId,
      ticker: ticker.toUpperCase(),
    });

    if (holding) {
      const totalShares = holding.shares + shares;
      const totalInvested = holding.totalInvested + totalCost;
      holding.avgBuyPrice = totalInvested / totalShares;
      holding.shares = totalShares;
      holding.totalInvested = totalInvested;
      await holding.save();
    } else {
      holding = await StockHolding.create({
        userId: req.userId,
        ticker: ticker.toUpperCase(),
        companyName: companyName || "",
        shares,
        avgBuyPrice: pricePerShare,
        totalInvested: totalCost,
      });
    }

    // Log trade
    await StockTrade.create({
      userId: req.userId,
      ticker: ticker.toUpperCase(),
      companyName: companyName || "",
      type: "buy",
      shares,
      pricePerShare,
      totalAmount: totalCost,
    });

    res.json({
      holding,
      virtualBalance: user.virtualBalance,
      message: `Bought ${shares} shares of ${ticker.toUpperCase()} at $${pricePerShare}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sell stock
router.post("/trade/sell", verifyToken, async (req, res) => {
  try {
    const { ticker, shares, pricePerShare } = req.body;

    const holding = await StockHolding.findOne({
      userId: req.userId,
      ticker: ticker.toUpperCase(),
    });

    if (!holding || holding.shares < shares) {
      return res.status(400).json({ message: "Insufficient shares" });
    }

    const totalSaleAmount = shares * pricePerShare;
    const costBasis = shares * holding.avgBuyPrice;
    const profitLoss = totalSaleAmount - costBasis;

    // Add back to virtual balance
    const user = await User.findById(req.userId);
    user.virtualBalance += totalSaleAmount;
    await user.save();

    // Update holding
    holding.shares -= shares;
    holding.totalInvested -= costBasis;
    if (holding.shares === 0) {
      holding.totalInvested = 0;
    }
    await holding.save();

    // Log trade
    await StockTrade.create({
      userId: req.userId,
      ticker: ticker.toUpperCase(),
      companyName: holding.companyName || "",
      type: "sell",
      shares,
      pricePerShare,
      totalAmount: totalSaleAmount,
      profitLoss,
    });

    res.json({
      holding,
      virtualBalance: user.virtualBalance,
      profitLoss,
      message: `Sold ${shares} shares of ${ticker.toUpperCase()} at $${pricePerShare} (P&L: $${profitLoss.toFixed(2)})`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trade history
router.get("/trades", verifyToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const trades = await StockTrade.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const totalPL = trades
      .filter((t) => t.type === "sell")
      .reduce((sum, t) => sum + t.profitLoss, 0);

    res.json({ trades, totalRealizedPL: totalPL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
