import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Company from "../models/Company.js";
import FinancialRecord from "../models/FinancialRecord.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PASSWORD = "password123"; // All companies will use this for demo

async function seedCompanies() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✓ Connected to MongoDB");

        // Read generated data
        const companiesData = JSON.parse(
            fs.readFileSync(path.join(__dirname, "../ml/companies_data.json"), "utf-8")
        );

        const financialData = JSON.parse(
            fs.readFileSync(path.join(__dirname, "../ml/financial_records_data.json"), "utf-8")
        );

        console.log("\n📊 Seeding Database with Company Data...\n");

        // Clear existing data
        await Company.deleteMany({});
        await FinancialRecord.deleteMany({});
        console.log("✓ Cleared existing data\n");

        // Hash password
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        // Insert companies and get their IDs
        const companyMap = new Map();

        for (const companyData of companiesData) {
            const company = await Company.create({
                ...companyData,
                password: hashedPassword,
            });

            companyMap.set(companyData.companyName, company._id);

            console.log(`✓ Created company: ${company.companyName}`);
            console.log(`  Email: ${company.email}`);
            console.log(`  Password: ${DEFAULT_PASSWORD}`);
            console.log(`  Industry: ${company.industry}`);
            console.log(`  Employees: ${company.employees}`);
            console.log("");
        }

        // Insert financial records with company IDs
        console.log("\n📈 Inserting Financial Records...\n");

        for (const record of financialData) {
            const companyId = companyMap.get(record.companyName);

            if (!companyId) {
                console.error(`⚠️  Company not found: ${record.companyName}`);
                continue;
            }

            await FinancialRecord.create({
                companyId,
                year: record.year,
                month: record.month,
                revenue: record.revenue,
                expenses: record.expenses,
                profit: record.profit,
                salaries: record.salaries,
                rent: record.rent,
                marketing: record.marketing,
                utilities: record.utilities,
                supplies: record.supplies,
                otherExpenses: record.otherExpenses,
                cashFlow: record.cashFlow,
                assets: record.assets,
                liabilities: record.liabilities,
                employeeCount: record.employeeCount,
                notes: record.notes,
            });
        }

        console.log(`✓ Inserted ${financialData.length} financial records\n`);

        // Summary statistics
        console.log("=" + "=".repeat(59));
        console.log("SEEDING COMPLETE - DATABASE SUMMARY");
        console.log("=" + "=".repeat(59));

        const companies = await Company.find();
        for (const company of companies) {
            const recordCount = await FinancialRecord.countDocuments({
                companyId: company._id,
            });

            const records = await FinancialRecord.find({ companyId: company._id });
            const totalRevenue = records.reduce((sum, r) => sum + r.revenue, 0);
            const avgProfit = records.reduce((sum, r) => sum + r.profit, 0) / records.length;

            console.log(`\n${company.companyName}`);
            console.log(`  Login: ${company.email} / ${DEFAULT_PASSWORD}`);
            console.log(`  Records: ${recordCount} months`);
            console.log(`  Total Revenue: ₹${(totalRevenue / 10000000).toFixed(2)} Cr`);
            console.log(`  Avg Profit: ₹${(avgProfit / 100000).toFixed(2)} L/month`);
        }

        console.log("\n" + "=" + "=".repeat(59));
        console.log("✅ Database seeded successfully!");
        console.log("=" + "=".repeat(59));
        console.log("\n🎯 Next Steps:");
        console.log("1. Start backend server: npm run dev");
        console.log("2. Test company login with any of the above credentials");
        console.log("3. View company-specific dashboards\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
}

seedCompanies();
