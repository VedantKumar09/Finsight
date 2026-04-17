import express from "express";
import { verifyToken } from "../middleware/auth.js";
import PersonalTransaction from "../models/PersonalTransaction.js";
import Account from "../models/Account.js";

const router = express.Router();

// Get transactions with filters
router.get("/", verifyToken, async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 50, page = 1 } = req.query;

    const filter = { userId: req.userId };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await PersonalTransaction.countDocuments(filter);

    const transactions = await PersonalTransaction.find(filter)
      .populate("accountId", "name type color")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create transaction
router.post("/", verifyToken, async (req, res) => {
  try {
    const { accountId, type, category, amount, description, date } = req.body;

    // Verify account belongs to user
    const account = await Account.findOne({ _id: accountId, userId: req.userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Update account balance
    if (type === "income") {
      account.balance += amount;
    } else {
      account.balance -= amount;
    }
    await account.save();

    const transaction = await PersonalTransaction.create({
      userId: req.userId,
      accountId,
      type,
      category,
      amount,
      description: description || "",
      date: date || new Date(),
    });

    const populated = await transaction.populate("accountId", "name type color");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete transaction (reverses balance effect)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const transaction = await PersonalTransaction.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Reverse balance
    const account = await Account.findById(transaction.accountId);
    if (account) {
      if (transaction.type === "income") {
        account.balance -= transaction.amount;
      } else {
        account.balance += transaction.amount;
      }
      await account.save();
    }

    await PersonalTransaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Monthly summary for charts
router.get("/summary/monthly", verifyToken, async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const pipeline = [
      {
        $match: {
          userId: req.userId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ];

    // Fix: userId needs to be ObjectId for aggregation
    const mongoose = (await import("mongoose")).default;
    pipeline[0].$match.userId = new mongoose.Types.ObjectId(req.userId);

    const result = await PersonalTransaction.aggregate(pipeline);

    // Transform into chart-friendly format
    const monthlyData = {};
    result.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { month: key, income: 0, expense: 0 };
      }
      if (item._id.type === "income") {
        monthlyData[key].income = item.total;
      } else {
        monthlyData[key].expense = item.total;
      }
    });

    res.json(Object.values(monthlyData));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Category breakdown
router.get("/summary/categories", verifyToken, async (req, res) => {
  try {
    const { type = "expense", months = 1 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const mongoose = (await import("mongoose")).default;

    const result = await PersonalTransaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          type,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
