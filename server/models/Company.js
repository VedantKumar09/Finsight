import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        industry: {
            type: String,
            required: true,
            enum: [
                "Software Development",
                "Food & Beverage",
                "Transportation & Logistics",
                "Education Technology",
                "Healthcare",
                "Manufacturing",
                "Retail",
                "Finance",
                "Other",
            ],
        },
        foundedDate: {
            type: Date,
            required: true,
        },
        employees: {
            type: Number,
            required: true,
            min: 1,
        },
        location: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        contactPerson: {
            type: String,
        },
        phone: {
            type: String,
        },
        website: {
            type: String,
        },
        logo: {
            type: String, // URL to logo image
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

const Company = mongoose.model("Company", CompanySchema);

export default Company;
