import express from "express";
import { verifyCompanyToken } from "../middleware/companyAuth.js";
import FinancialRecord from "../models/FinancialRecord.js";
import Company from "../models/Company.js";

const router = express.Router();

// Get company dashboard overview (protected)
router.get("/overview", verifyCompanyToken, async (req, res) => {
    try {
        const companyId = req.companyId;

        // Get all financial records for this company
        const records = await FinancialRecord.find({ companyId }).sort({ year: -1, month: -1 });

        if (records.length === 0) {
            return res.status(200).json({
                message: "No financial records found",
                overview: {
                    totalRevenue: 0,
                    totalExpenses: 0,
                    totalProfit: 0,
                    recordCount: 0,
                },
            });
        }

        // Calculate totals
        const totalRevenue = records.reduce((sum, r) => sum + r.revenue, 0);
        const totalExpenses = records.reduce((sum, r) => sum + r.expenses, 0);
        const totalProfit = records.reduce((sum, r) => sum + r.profit, 0);
        const avgMonthlyRevenue = totalRevenue / records.length;
        const avgMonthlyProfit = totalProfit / records.length;

        // Get latest month data
        const latestRecord = records[0];

        // Calculate month-over-month growth
        const previousRecord = records[1];
        let revenueGrowth = 0;
        let profitGrowth = 0;

        if (previousRecord) {
            revenueGrowth = ((latestRecord.revenue - previousRecord.revenue) / previousRecord.revenue) * 100;
            profitGrowth = ((latestRecord.profit - previousRecord.profit) / previousRecord.profit) * 100;
        }

        res.status(200).json({
            overview: {
                totalRevenue,
                totalExpenses,
                totalProfit,
                avgMonthlyRevenue,
                avgMonthlyProfit,
                recordCount: records.length,
                latestMonth: {
                    year: latestRecord.year,
                    month: latestRecord.month,
                    revenue: latestRecord.revenue,
                    profit: latestRecord.profit,
                    revenueGrowth,
                    profitGrowth,
                },
            },
        });
    } catch (error) {
        console.error("Overview error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get monthly trends (protected)
router.get("/trends", verifyCompanyToken, async (req, res) => {
    try {
        const companyId = req.companyId;
        const { months = 12 } = req.query; // Default to 12 months

        const records = await FinancialRecord.find({ companyId })
            .sort({ year: -1, month: -1 })
            .limit(parseInt(months));

        // Reverse to get chronological order
        const trendData = records.reverse().map((record) => ({
            year: record.year,
            month: record.month,
            date: `${record.year}-${String(record.month).padStart(2, "0")}`,
            revenue: record.revenue,
            expenses: record.expenses,
            profit: record.profit,
            cashFlow: record.cashFlow,
        }));

        res.status(200).json({ trends: trendData });
    } catch (error) {
        console.error("Trends error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get records for specific year/month (protected)
router.get("/records/:year/:month", verifyCompanyToken, async (req, res) => {
    try {
        const companyId = req.companyId;
        const { year, month } = req.params;

        const record = await FinancialRecord.findOne({
            companyId,
            year: parseInt(year),
            month: parseInt(month),
        });

        if (!record) {
            return res.status(404).json({ message: "Record not found for specified month" });
        }

        res.status(200).json({ record });
    } catch (error) {
        console.error("Get record error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get all records (protected)
router.get("/records", verifyCompanyToken, async (req, res) => {
    try {
        const companyId = req.companyId;

        const records = await FinancialRecord.find({ companyId }).sort({ year: -1, month: -1 });

        res.status(200).json({
            count: records.length,
            records,
        });
    } catch (error) {
        console.error("Get records error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Add new financial record (protected)
router.post("/record", verifyCompanyToken, async (req, res) => {
    try {
        const companyId = req.companyId;
        const {
            year,
            month,
            revenue,
            expenses,
            salaries,
            rent,
            marketing,
            utilities,
            supplies,
            otherExpenses,
            cashFlow,
            assets,
            liabilities,
            employeeCount,
            notes,
        } = req.body;

        // Validation
        if (!year || !month || revenue === undefined || expenses === undefined) {
            return res.status(400).json({
                message: "Please provide year, month, revenue, and expenses",
            });
        }

        // Check if record already exists
        const existingRecord = await FinancialRecord.findOne({
            companyId,
            year,
            month,
        });

        if (existingRecord) {
            return res.status(400).json({
                message: `Record for ${month}/${year} already exists. Use PUT to update.`,
            });
        }

        // Calculate profit
        const profit = revenue - expenses;

        // Create record
        const record = await FinancialRecord.create({
            companyId,
            year,
            month,
            revenue,
            expenses,
            profit,
            salaries: salaries || 0,
            rent: rent || 0,
            marketing: marketing || 0,
            utilities: utilities || 0,
            supplies: supplies || 0,
            otherExpenses: otherExpenses || 0,
            cashFlow: cashFlow || profit,
            assets: assets || 0,
            liabilities: liabilities || 0,
            employeeCount,
            notes,
        });

        res.status(201).json({
            message: "Financial record created successfully",
            record,
        });
    } catch (error) {
        console.error("Create record error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update financial record (protected)
router.put("/record/:year/:month", verifyCompanyToken, async (req, res) => {
    try {
        const companyId = req.companyId;
        const { year, month } = req.params;

        const record = await FinancialRecord.findOne({
            companyId,
            year: parseInt(year),
            month: parseInt(month),
        });

        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        // Update fields
        const updateFields = [
            "revenue",
            "expenses",
            "salaries",
            "rent",
            "marketing",
            "utilities",
            "supplies",
            "otherExpenses",
            "cashFlow",
            "assets",
            "liabilities",
            "employeeCount",
            "notes",
        ];

        updateFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                record[field] = req.body[field];
            }
        });

        // Recalculate profit
        record.profit = record.revenue - record.expenses;

        await record.save();

        res.status(200).json({
            message: "Financial record updated successfully",
            record,
        });
    } catch (error) {
        console.error("Update record error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get expense breakdown (protected)
router.get("/expenses/breakdown", verifyCompanyToken, async (req, res) => {
    try {
        const companyId = req.companyId;
        const { months = 12 } = req.query;

        const records = await FinancialRecord.find({ companyId })
            .sort({ year: -1, month: -1 })
            .limit(parseInt(months));

        // Calculate totals for each expense category
        const breakdown = {
            salaries: records.reduce((sum, r) => sum + (r.salaries || 0), 0),
            rent: records.reduce((sum, r) => sum + (r.rent || 0), 0),
            marketing: records.reduce((sum, r) => sum + (r.marketing || 0), 0),
            utilities: records.reduce((sum, r) => sum + (r.utilities || 0), 0),
            supplies: records.reduce((sum, r) => sum + (r.supplies || 0), 0),
            other: records.reduce((sum, r) => sum + (r.otherExpenses || 0), 0),
        };

        const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

        res.status(200).json({
            breakdown,
            total,
            period: `Last ${months} months`,
        });
    } catch (error) {
        console.error("Expense breakdown error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
