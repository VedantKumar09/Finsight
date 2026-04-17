import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { verifyCompanyToken } from "../middleware/companyAuth.js";
import Company from "../models/Company.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get revenue forecast for logged-in company
router.get("/forecast", verifyCompanyToken, async (req, res) => {
    try {
        const companyId = req.companyId;

        // Get company details
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        // Read pre-generated forecast file
        const mlPath = path.join(__dirname, "../ml");
        const forecastFile = path.join(
            mlPath,
            `forecast_${company.companyName.replace(/ /g, "_")}.json`
        );

        // Check if forecast file exists
        if (!fs.existsSync(forecastFile)) {
            return res.status(404).json({
                message: "Forecast not available for this company",
                hint: "Run: python server/ml/forecast_revenue.py to generate forecasts",
            });
        }

        // Read and return forecast data
        const forecastData = JSON.parse(fs.readFileSync(forecastFile, "utf-8"));

        res.status(200).json({
            company: company.companyName,
            forecast: forecastData.forecasts,
            model_accuracy: forecastData.model_r2,
            generated_at: forecastData.generated_at,
        });
    } catch (error) {
        console.error("Forecast error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
