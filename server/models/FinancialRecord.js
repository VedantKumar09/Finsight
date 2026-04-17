import mongoose from "mongoose";

const FinancialRecordSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true, // Index for fast company-based queries
        },
        year: {
            type: Number,
            required: true,
            min: 2000,
            max: 2100,
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        // Core Financial Metrics
        revenue: {
            type: Number,
            required: true,
            min: 0,
        },
        expenses: {
            type: Number,
            required: true,
            min: 0,
        },
        profit: {
            type: Number,
            required: true,
        },
        // Expense Breakdown
        salaries: {
            type: Number,
            default: 0,
            min: 0,
        },
        rent: {
            type: Number,
            default: 0,
            min: 0,
        },
        marketing: {
            type: Number,
            default: 0,
            min: 0,
        },
        utilities: {
            type: Number,
            default: 0,
            min: 0,
        },
        supplies: {
            type: Number,
            default: 0,
            min: 0,
        },
        otherExpenses: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Additional Metrics
        cashFlow: {
            type: Number,
            default: 0,
        },
        assets: {
            type: Number,
            default: 0,
            min: 0,
        },
        liabilities: {
            type: Number,
            default: 0,
            min: 0,
        },
        employeeCount: {
            type: Number,
            min: 0,
        },
        // Metadata
        notes: {
            type: String,
            maxlength: 500,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        blockchainHash: {
            type: String, // For Phase 2: Blockchain integration
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
FinancialRecordSchema.index({ companyId: 1, year: -1, month: -1 });

// Ensure one record per company per month
FinancialRecordSchema.index(
    { companyId: 1, year: 1, month: 1 },
    { unique: true }
);

const FinancialRecord = mongoose.model("FinancialRecord", FinancialRecordSchema);

export default FinancialRecord;
