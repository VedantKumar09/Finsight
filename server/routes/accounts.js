import express from "express";
import { verifyToken } from "../middleware/auth.js";
import Account from "../models/Account.js";

const router = express.Router();

// Get all accounts for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.userId, isActive: true }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new account
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, type, balance, currency, color, icon } = req.body;

    const account = await Account.create({
      userId: req.userId,
      name,
      type,
      balance: balance || 0,
      currency: currency || "USD",
      color: color || "#12efc8",
      icon: icon || "account_balance",
    });

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update account
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete account (soft delete)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isActive: false },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get total balance across all accounts
router.get("/summary", verifyToken, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.userId, isActive: true });

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const byType = accounts.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + account.balance;
      return acc;
    }, {});

    res.json({
      totalBalance,
      byType,
      accountCount: accounts.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
