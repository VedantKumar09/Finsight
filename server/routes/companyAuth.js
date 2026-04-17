import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Company from "../models/Company.js";

const router = express.Router();

// Company Registration
router.post("/register", async (req, res) => {
    try {
        const {
            companyName,
            email,
            password,
            industry,
            foundedDate,
            employees,
            location,
            description,
            contactPerson,
            phone,
            website,
        } = req.body;

        // Validation
        if (!companyName || !email || !password || !industry || !foundedDate || !employees || !location) {
            return res.status(400).json({
                message: "Please provide all required fields: companyName, email, password, industry, foundedDate, employees, location",
            });
        }

        // Check if company already exists
        const existingCompany = await Company.findOne({
            $or: [{ email: email.toLowerCase() }, { companyName }],
        });

        if (existingCompany) {
            return res.status(400).json({
                message: existingCompany.email === email.toLowerCase()
                    ? "Email already registered"
                    : "Company name already taken",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create company
        const company = await Company.create({
            companyName,
            email: email.toLowerCase(),
            password: hashedPassword,
            industry,
            foundedDate,
            employees,
            location,
            description,
            contactPerson,
            phone,
            website,
        });

        // Generate JWT token
        const token = jwt.sign(
            { companyId: company._id, email: company.email },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Company registered successfully",
            token,
            company: {
                id: company._id,
                companyName: company.companyName,
                email: company.email,
                industry: company.industry,
                employees: company.employees,
                location: company.location,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error during registration", error: error.message });
    }
});

// Company Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // Find company
        const company = await Company.findOne({ email: email.toLowerCase() });

        if (!company) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, company.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { companyId: company._id, email: company.email },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            company: {
                id: company._id,
                companyName: company.companyName,
                email: company.email,
                industry: company.industry,
                employees: company.employees,
                location: company.location,
                foundedDate: company.foundedDate,
                description: company.description,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
});

// Get current company profile (protected route)
router.get("/me", async (req, res) => {
    try {
        // This will be protected by middleware
        const company = await Company.findById(req.companyId).select("-password");

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({ company });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update company profile (protected route)
router.put("/profile", async (req, res) => {
    try {
        const {
            companyName,
            industry,
            employees,
            location,
            description,
            contactPerson,
            phone,
            website,
        } = req.body;

        const company = await Company.findById(req.companyId);

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        // Update fields if provided
        if (companyName) company.companyName = companyName;
        if (industry) company.industry = industry;
        if (employees !== undefined) company.employees = employees;
        if (location) company.location = location;
        if (description !== undefined) company.description = description;
        if (contactPerson !== undefined) company.contactPerson = contactPerson;
        if (phone !== undefined) company.phone = phone;
        if (website !== undefined) company.website = website;

        await company.save();

        res.status(200).json({
            message: "Profile updated successfully",
            company: {
                id: company._id,
                companyName: company.companyName,
                email: company.email,
                industry: company.industry,
                employees: company.employees,
                location: company.location,
                description: company.description,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
