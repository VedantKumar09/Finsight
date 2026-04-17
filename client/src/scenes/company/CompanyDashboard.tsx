import { useState, useEffect } from "react";
import { Box, Typography, useTheme, Button, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import DashboardBox from "@/components/DashboardBox";
import BoxHeader from "@/components/BoxHeader";

const CompanyDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [company, setCompany] = useState<any>(null);
    const [overview, setOverview] = useState<any>(null);
    const [trends, setTrends] = useState<any[]>([]);
    const [expenseBreakdown, setExpenseBreakdown] = useState<any>(null);
    const [forecast, setForecast] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6699"];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("companyToken");
            const companyData = localStorage.getItem("companyData");

            if (!token) {
                navigate("/company/login");
                return;
            }

            if (companyData) {
                setCompany(JSON.parse(companyData));
            }

            // Fetch overview
            const overviewRes = await fetch("http://localhost:9000/api/finance/overview", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const overviewData = await overviewRes.json();
            setOverview(overviewData.overview);

            // Fetch trends
            const trendsRes = await fetch("http://localhost:9000/api/finance/trends?months=12", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const trendsData = await trendsRes.json();
            setTrends(trendsData.trends);

            // Fetch expense breakdown
            const expenseRes = await fetch("http://localhost:9000/api/finance/expenses/breakdown?months=12", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const expenseData = await expenseRes.json();
            setExpenseBreakdown(expenseData.breakdown);

            // Fetch ML forecast
            try {
                const forecastRes = await fetch("http://localhost:9000/api/ml/forecast?months=6", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const forecastData = await forecastRes.json();
                setForecast(forecastData.forecast || []);
            } catch (err) {
                console.error("Forecast error:", err);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("companyToken");
        localStorage.removeItem("companyData");
        navigate("/company/login");
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    const expensePieData = expenseBreakdown
        ? [
            { name: "Salaries", value: expenseBreakdown.salaries },
            { name: "Rent", value: expenseBreakdown.rent },
            { name: "Marketing", value: expenseBreakdown.marketing },
            { name: "Utilities", value: expenseBreakdown.utilities },
            { name: "Supplies", value: expenseBreakdown.supplies },
            { name: "Other", value: expenseBreakdown.other },
        ]
        : [];

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h3" fontWeight="bold">
                        {company?.companyName}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {company?.industry} • {company?.location}
                    </Typography>
                </Box>
                <Button variant="outlined" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                            Total Revenue
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            ₹{((overview?.totalRevenue || 0) / 10000000).toFixed(2)} Cr
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                            Total Profit
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="success.main">
                            ₹{((overview?.totalProfit || 0) / 10000000).toFixed(2)} Cr
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                            Avg Monthly Revenue
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            ₹{((overview?.avgMonthlyRevenue || 0) / 100000).toFixed(2)} L
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                            Avg Monthly Profit
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            ₹{((overview?.avgMonthlyProfit || 0) / 100000).toFixed(2)} L
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={2}>
                {/* Revenue Trend */}
                <Grid item xs={12} md={8}>
                    <DashboardBox>
                        <BoxHeader title="Revenue & Profit Trend (12 Months)" subtitle="Monthly performance" sideText="" />
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[800]} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => {
                                        const [year, month] = value.split("-");
                                        return `${month}/${year.slice(2)}`;
                                    }}
                                    stroke={theme.palette.grey[500]}
                                />
                                <YAxis
                                    stroke={theme.palette.grey[500]}
                                    tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme.palette.background.paper,
                                        borderColor: theme.palette.divider,
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={theme.palette.primary.main}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="profit"
                                    stroke={theme.palette.success.main}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </DashboardBox>
                </Grid>

                {/* Expense Breakdown */}
                <Grid item xs={12} md={4}>
                    <DashboardBox>
                        <BoxHeader title="Expense Breakdown" subtitle="Last 12 months" sideText="" />
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expensePieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {expensePieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme.palette.background.paper,
                                        borderColor: theme.palette.divider,
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </DashboardBox>
                </Grid>

                {/* ML Revenue Forecast */}
                {forecast.length > 0 && (
                    <Grid item xs={12}>
                        <DashboardBox>
                            <BoxHeader
                                title="🤖 AI Revenue Forecast"
                                subtitle={`Next ${forecast.length} months prediction`}
                                sideText="ML Powered"
                            />
                            <Box sx={{ p: 2 }}>
                                <Grid container spacing={2}>
                                    {forecast.map((f, idx) => (
                                        <Grid item xs={6} sm={4} md={2} key={idx}>
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    textAlign: "center",
                                                    backgroundColor: theme.palette.primary.dark,
                                                    backgroundImage: "linear-gradient(135deg, rgba(66, 165, 245, 0.1), rgba(33, 150, 243, 0.2))",
                                                }}
                                            >
                                                <Typography variant="caption" color="text.secondary">
                                                    {f.month}/{f.year}
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                                    ₹{(f.predicted_revenue / 100000).toFixed(1)}L
                                                </Typography>
                                                <Typography variant="caption" color="success.light">
                                                    {(f.confidence * 100).toFixed(0)}% confidence
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </DashboardBox>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default CompanyDashboard;
