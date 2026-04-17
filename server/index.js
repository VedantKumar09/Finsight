import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import kpiRoutes from "./routes/kpi.js";
import productRoutes from "./routes/product.js";
import transactionRoutes from "./routes/transaction.js";
import authRoutes from "./routes/auth.js";
import predictionRoutes from "./routes/prediction.js";
import companyAuthRoutes from "./routes/companyAuth.js";
import financeRoutes from "./routes/finance.js";
import mlRoutes from "./routes/ml.js";
import KPI from "./models/KPI.js";
import Product from "./models/Product.js";
import Transaction from "./models/Transaction.js";
import { kpis, products, transactions } from "./data/data.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
// Old user routes (keeping for backwards compatibility)
app.use("/auth", authRoutes);
app.use("/predict", predictionRoutes);

// New company routes
app.use("/api/company", companyAuthRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/ml", mlRoutes);

// Original tutorial routes
app.use("/kpi", kpiRoutes);
app.use("/product", productRoutes);
app.use("/transaction", transactionRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 9000;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* Check if data exists, if not, seed it */
    const existingKpis = await KPI.countDocuments();
    if (existingKpis === 0) {
      console.log("No data found. Seeding initial data...");
      try {
        // Convert string currency values to numbers (in cents for mongoose-currency)
        const convertCurrency = (value) => {
          if (typeof value === "string") {
            return Math.round(parseFloat(value.replace("$", "").replace(",", "")) * 100);
          }
          return value;
        };

        const convertKpiData = (kpi) => {
          const converted = { ...kpi };
          if (converted.totalProfit) converted.totalProfit = convertCurrency(converted.totalProfit);
          if (converted.totalRevenue) converted.totalRevenue = convertCurrency(converted.totalRevenue);
          if (converted.totalExpenses) converted.totalExpenses = convertCurrency(converted.totalExpenses);
          if (converted.monthlyData) {
            converted.monthlyData = converted.monthlyData.map((month) => ({
              ...month,
              revenue: convertCurrency(month.revenue),
              expenses: convertCurrency(month.expenses),
              operationalExpenses: convertCurrency(month.operationalExpenses),
              nonOperationalExpenses: convertCurrency(month.nonOperationalExpenses),
            }));
          }
          if (converted.dailyData) {
            converted.dailyData = converted.dailyData.map((day) => ({
              ...day,
              revenue: convertCurrency(day.revenue),
              expenses: convertCurrency(day.expenses),
            }));
          }
          if (converted.expensesByCategory) {
            const expensesMap = new Map();
            Object.entries(converted.expensesByCategory).forEach(([key, value]) => {
              expensesMap.set(key, convertCurrency(value));
            });
            converted.expensesByCategory = expensesMap;
          }
          return converted;
        };

        const convertProductData = (product) => ({
          ...product,
          price: convertCurrency(product.price),
          expense: convertCurrency(product.expense),
        });

        const convertTransactionData = (transaction) => ({
          ...transaction,
          amount: convertCurrency(transaction.amount),
        });

        const convertedKpis = kpis.map(convertKpiData);
        const convertedProducts = products.map(convertProductData);
        const convertedTransactions = transactions.map(convertTransactionData);

        await KPI.insertMany(convertedKpis);
        await Product.insertMany(convertedProducts);
        await Transaction.insertMany(convertedTransactions);
        console.log("Initial data seeded successfully!");
      } catch (error) {
        console.log("Error seeding data:", error.message);
        console.error(error);
      }
    }
  })
  .catch((error) => console.log(`${error} did not connect`));
