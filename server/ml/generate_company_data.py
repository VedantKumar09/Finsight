"""
Generate realistic financial data for 5 companies
Each company gets 24 months of financial records with industry-specific patterns
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

# Set random seed for reproducibility
np.random.seed(42)

# Define 5 companies with realistic profiles
COMPANIES = [
    {
        "companyName": "TechNova Solutions Pvt. Ltd.",
        "email": "admin@technova.in",
        "industry": "Software Development",
        "foundedDate": "2018-03-15",
        "employees": 45,
        "location": "Bangalore, Karnataka",
        "description": "Leading software development company specializing in enterprise solutions and cloud services",
        "contactPerson": "Rajesh Kumar",
        "phone": "+91-80-4567-8900",
        "website": "www.technova.in",
        "baseRevenue": 5500000,  # ₹55 lakh/month
        "growthRate": 0.15,  # 15% annual growth
        "seasonality": 0.1,
    },
    {
        "companyName": "GreenLeaf Organic Foods",
        "email": "admin@greenleaf.in",
        "industry": "Food & Beverage",
        "foundedDate": "2015-06-20",
        "employees": 120,
        "location": "Pune, Maharashtra",
        "description": "Organic food manufacturer and distributor serving premium markets across India",
        "contactPerson": "Priya Sharma",
        "phone": "+91-20-6789-1234",
        "website": "www.greenleaf.in",
        "baseRevenue": 25000000,  # ₹2.5 crore/month
        "growthRate": 0.08,  # 8% annual growth
        "seasonality": 0.2,  # High seasonality (festivals)
    },
    {
        "companyName": "UrbanFlow Logistics",
        "email": "admin@urbanflow.in",
        "industry": "Transportation & Logistics",
        "foundedDate": "2019-01-10",
        "employees": 200,
        "location": "Mumbai, Maharashtra",
        "description": "Modern logistics solution provider with pan-India delivery network",
        "contactPerson": "Arjun Mehta",
        "phone": "+91-22-8901-2345",
        "website": "www.urbanflow.in",
        "baseRevenue": 60000000,  # ₹6 crore/month
        "growthRate": 0.22,  # 22% annual growth (startup phase)
        "seasonality": 0.15,
    },
    {
        "companyName": "EduMentor Academy",
        "email": "admin@edumentor.in",
        "industry": "Education Technology",
        "foundedDate": "2020-08-01",
        "employees": 30,
        "location": "Hyderabad, Telangana",
        "description": "Online learning platform offering skill development courses and certifications",
        "contactPerson": "Kavita Reddy",
        "phone": "+91-40-3456-7890",
        "website": "www.edumentor.in",
        "baseRevenue": 2750000,  # ₹27.5 lakh/month
        "growthRate": 0.30,  # 30% annual growth (EdTech boom)
        "seasonality": 0.25,  # High seasonality (exam seasons)
    },
    {
        "companyName": "HealthFirst Clinics",
        "email": "admin@healthfirst.in",
        "industry": "Healthcare",
        "foundedDate": "2012-11-05",
        "employees": 85,
        "location": "Delhi, NCR",
        "description": "Chain of multi-specialty clinics providing quality healthcare services",
        "contactPerson": "Dr. Amit Singh",
        "phone": "+91-11-2345-6789",
        "website": "www.healthfirst.in",
        "baseRevenue": 17500000,  # ₹1.75 crore/month
        "growthRate": 0.05,  # 5% annual growth (stable)
        "seasonality": 0.12,  # Moderate seasonality
    },
]

def generate_monthly_revenue(base, growth_rate, seasonality, month_index):
    """
    Generate realistic monthly revenue with:
    - Growth trend
    - Seasonal variation
    - Random noise
    """
    # Growth component (compound)
    growth_factor = (1 + growth_rate) ** (month_index / 12.0)
    
    # Seasonal component (sine wave with random phase)
    seasonal_factor = 1 + seasonality * np.sin(2 * np.pi * month_index / 12.0)
    
    # Random noise (±5%)
    noise_factor = 1 + np.random.uniform(-0.05, 0.05)
    
    revenue = base * growth_factor * seasonal_factor * noise_factor
    
    return max(revenue, 0)

def generate_expenses(revenue, industry):
    """
    Generate realistic expenses based on revenue and industry
    Different industries have different cost structures
    """
    # Industry-specific expense ratios
    expense_ratios = {
        "Software Development": {
            "salaries": 0.45,  # Tech salaries are high
            "rent": 0.08,
            "marketing": 0.12,
            "utilities": 0.03,
            "supplies": 0.02,
            "other": 0.05,
        },
        "Food & Beverage": {
            "salaries": 0.25,
            "rent": 0.10,
            "marketing": 0.08,
            "utilities": 0.05,
            "supplies": 0.30,  # High raw material costs
            "other": 0.07,
        },
        "Transportation & Logistics": {
            "salaries": 0.30,
            "rent": 0.05,
            "marketing": 0.06,
            "utilities": 0.15,  # Fuel, maintenance
            "supplies": 0.10,
            "other": 0.09,
        },
        "Education Technology": {
            "salaries": 0.40,
            "rent": 0.05,
            "marketing": 0.20,  # High marketing spend
            "utilities": 0.04,
            "supplies": 0.02,
            "other": 0.04,
        },
        "Healthcare": {
            "salaries": 0.35,
            "rent": 0.12,
            "marketing": 0.05,
            "utilities": 0.06,
            "supplies": 0.18,  # Medical supplies
            "other": 0.09,
        },
    }
    
    ratios = expense_ratios.get(industry, expense_ratios["Software Development"])
    
    # Add some randomness to ratios
    expenses = {}
    for category, ratio in ratios.items():
        noise = np.random.uniform(0.9, 1.1)  # ±10% variance
        expenses[category] = revenue * ratio * noise
    
    return expenses

def generate_financial_records():
    """
    Generate 24 months of financial data for all companies
    """
    all_records = []
    
    # Start from 2 years ago
    start_date = datetime.now() - timedelta(days=730)
    
    for company in COMPANIES:
        print(f"\nGenerating data for: {company['companyName']}")
        
        for month_offset in range(24):
            # Calculate year and month
            record_date = start_date + timedelta(days=30 * month_offset)
            year = record_date.year
            month = record_date.month
            
            # Generate revenue
            revenue = generate_monthly_revenue(
                company['baseRevenue'],
                company['growthRate'],
                company['seasonality'],
                month_offset
            )
            
            # Generate expenses
            expenses_breakdown = generate_expenses(revenue, company['industry'])
            
            total_expenses = sum(expenses_breakdown.values())
            
            # Calculate profit
            profit = revenue - total_expenses
            
            # Cash flow (simplified: profit + depreciation)
            cash_flow = profit + np.random.uniform(50000, 200000)
            
            # Assets and liabilities (rough estimates)
            assets = revenue * np.random.uniform(3, 6)
            liabilities = assets * np.random.uniform(0.3, 0.6)
            
            # Employee count (with some fluctuation)
            employee_variation = np.random.randint(-3, 4)
            employee_count = max(1, company['employees'] + employee_variation)
            
            record = {
                "companyName": company['companyName'],  # For reference
                "year": year,
                "month": month,
                "revenue": round(revenue, 2),
                "expenses": round(total_expenses, 2),
                "profit": round(profit, 2),
                "salaries": round(expenses_breakdown['salaries'], 2),
                "rent": round(expenses_breakdown['rent'], 2),
                "marketing": round(expenses_breakdown['marketing'], 2),
                "utilities": round(expenses_breakdown['utilities'], 2),
                "supplies": round(expenses_breakdown['supplies'], 2),
                "otherExpenses": round(expenses_breakdown['other'], 2),
                "cashFlow": round(cash_flow, 2),
                "assets": round(assets, 2),
                "liabilities": round(liabilities, 2),
                "employeeCount": employee_count,
                "notes": f"Auto-generated financial record for {month}/{year}",
            }
            
            all_records.append(record)
            
            print(f"  Month {month}/{year}: Revenue: ₹{revenue/100000:.2f}L, Profit: ₹{profit/100000:.2f}L")
    
    return all_records

def save_data():
    """
    Generate and save company data and financial records
    """
    print("=" * 60)
    print("GENERATING REALISTIC COMPANY FINANCIAL DATA")
    print("=" * 60)
    
    # Save company profiles
    companies_output = []
    for company in COMPANIES:
        company_data = {k: v for k, v in company.items() if k not in ['baseRevenue', 'growthRate', 'seasonality']}
        companies_output.append(company_data)
    
    with open('companies_data.json', 'w') as f:
        json.dump(companies_output, f, indent=2)
    
    print(f"\n✓ Saved {len(companies_output)} companies to companies_data.json")
    
    # Generate and save financial records
    financial_records = generate_financial_records()
    
    with open('financial_records_data.json', 'w') as f:
        json.dump(financial_records, f, indent=2)
    
    print(f"\n✓ Saved {len(financial_records)} financial records to financial_records_data.json")
    
    # Create summary statistics
    print("\n" + "=" * 60)
    print("DATA GENERATION SUMMARY")
    print("=" * 60)
    
    for company in COMPANIES:
        company_records = [r for r in financial_records if r['companyName'] == company['companyName']]
        total_revenue = sum(r['revenue'] for r in company_records)
        avg_profit = sum(r['profit'] for r in company_records) / len(company_records)
        
        print(f"\n{company['companyName']}:")
        print(f"  Industry: {company['industry']}")
        print(f"  Total Revenue (24 months): ₹{total_revenue/10000000:.2f} Crore")
        print(f"  Avg Monthly Profit: ₹{avg_profit/100000:.2f} Lakh")
        print(f"  Records: {len(company_records)} months")
    
    print("\n" + "=" * 60)
    print("✅ DATA GENERATION COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Run seedCompanies.js to populate MongoDB")
    print("2. Test company login with credentials")
    print("3. View company dashboards")

if __name__ == "__main__":
    save_data()
