import { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import {
  TrendingUp, TrendingDown, AccountBalanceWallet, Savings, CreditCard, ShowChart,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import DashboardBox from "@/components/DashboardBox";
import BoxHeader from "@/components/BoxHeader";
import FlexBetween from "@/components/FlexBetween";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import {
  useGetAccountSummaryQuery,
  useGetMonthlySummaryQuery,
  useGetCategoryBreakdownQuery,
  useGetTransactionsQuery,
  useGetPortfolioQuery,
} from "@/state/api";

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#38bdf8", "#f43f5e", "#8b5cf6", "#06b6d4", "#ec4899"];

const categoryLabels = {
  food: "Food & Dining", transport: "Transport", entertainment: "Entertainment",
  shopping: "Shopping", bills: "Bills & Utilities", rent: "Rent", healthcare: "Healthcare",
  education: "Education", travel: "Travel", subscriptions: "Subscriptions",
  salary: "Salary", freelance: "Freelance", investment_income: "Investments",
  other_income: "Other Income", other_expense: "Other",
};

const StatCard = ({ title, value, icon, color, trend, delay = 0 }) => (
  <Box
    component={motion.div}
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.4, delay }}
    sx={{
      p: "1.25rem", borderRadius: "16px",
      background: "rgba(26, 27, 37, 0.7)", backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.06)",
      flex: 1, minWidth: 200,
    }}
  >
    <FlexBetween>
      <Box>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, mb: "4px" }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
          ${typeof value === "number" ? value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
        </Typography>
        {trend !== undefined && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "4px", mt: "4px" }}>
            {trend >= 0 ? <TrendingUp sx={{ fontSize: 14, color: "#10b981" }} /> : <TrendingDown sx={{ fontSize: 14, color: "#f43f5e" }} />}
            <Typography sx={{ fontSize: "0.7rem", color: trend >= 0 ? "#10b981" : "#f43f5e", fontWeight: 600 }}>
              {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{
        width: 44, height: 44, borderRadius: "12px",
        background: `${color}15`, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </Box>
    </FlexBetween>
  </Box>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        p: "10px 14px", borderRadius: "10px",
        background: "rgba(26, 27, 37, 0.95)", backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", mb: "4px" }}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} sx={{ fontSize: "0.75rem", color: p.color, fontWeight: 600 }}>
            {p.name}: ${Number(p.value).toLocaleString()}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const Dashboard = () => {
  const { palette } = useTheme();
  const { data: summary, isLoading: summaryLoading } = useGetAccountSummaryQuery();
  const { data: monthly, isLoading: monthlyLoading } = useGetMonthlySummaryQuery(12);
  const { data: categories, isLoading: catLoading } = useGetCategoryBreakdownQuery({ type: "expense", months: 1 });
  const { data: txData, isLoading: txLoading } = useGetTransactionsQuery({ limit: 5 });
  const { data: portfolio, isLoading: portLoading } = useGetPortfolioQuery();

  const totalIncome = useMemo(() => {
    if (!monthly) return 0;
    return monthly.reduce((s, m) => s + (m.income || 0), 0);
  }, [monthly]);

  const totalExpense = useMemo(() => {
    if (!monthly) return 0;
    return monthly.reduce((s, m) => s + (m.expense || 0), 0);
  }, [monthly]);

  const portfolioValue = useMemo(() => {
    if (!portfolio?.holdings) return 0;
    return portfolio.holdings.reduce((s, h) => s + h.totalInvested, 0);
  }, [portfolio]);

  const pieData = useMemo(() => {
    if (!categories) return [];
    return categories.map((c) => ({
      name: categoryLabels[c._id] || c._id,
      value: c.total,
    }));
  }, [categories]);

  return (
    <Box>
      {/* Stats Row */}
      <Box sx={{ display: "flex", gap: "1rem", mb: "1.5rem", flexWrap: "wrap" }}>
        <StatCard title="Total Balance" value={summary?.totalBalance || 0}
          icon={<AccountBalanceWallet sx={{ color: "#6366f1", fontSize: 22 }} />}
          color="#6366f1" delay={0} />
        <StatCard title="Total Income" value={totalIncome}
          icon={<TrendingUp sx={{ color: "#10b981", fontSize: 22 }} />}
          color="#10b981" trend={12.5} delay={0.1} />
        <StatCard title="Total Expenses" value={totalExpense}
          icon={<CreditCard sx={{ color: "#f43f5e", fontSize: 22 }} />}
          color="#f43f5e" trend={-3.2} delay={0.2} />
        <StatCard title="Portfolio" value={portfolioValue}
          icon={<ShowChart sx={{ color: "#f59e0b", fontSize: 22 }} />}
          color="#f59e0b" delay={0.3} />
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", mb: "1.5rem" }}>
        {/* Income vs Expense Chart */}
        <DashboardBox p="1.25rem"
          component={motion.div} initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <BoxHeader title="Income vs Expenses" subtitle="Monthly trend over the past year"
            icon={<TrendingUp sx={{ fontSize: 20 }} />} />
          <Box sx={{ height: 250, mt: "0.5rem" }}>
            {monthlyLoading ? <LoadingSkeleton height="100%" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly || []}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" fill="url(#expenseGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Box>
        </DashboardBox>

        {/* Expense Breakdown Pie */}
        <DashboardBox p="1.25rem"
          component={motion.div} initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <BoxHeader title="Spending Breakdown" subtitle="This month's expenses by category"
            icon={<Savings sx={{ fontSize: 20 }} />} />
          <Box sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {catLoading ? <LoadingSkeleton width="200px" height="200px" borderRadius="50%" /> : (
              pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`}
                      contentStyle={{ background: "rgba(26,27,37,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }}
                      itemStyle={{ color: "#f1f5f9" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ color: "#64748b", fontSize: "0.85rem" }}>No expense data yet</Typography>
              )
            )}
          </Box>
        </DashboardBox>
      </Box>

      {/* Bottom Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Recent Transactions */}
        <DashboardBox p="1.25rem"
          component={motion.div} initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <BoxHeader title="Recent Transactions" subtitle="Your latest activity" />
          <Box sx={{ mt: "0.5rem" }}>
            {txLoading ? <LoadingSkeleton count={5} height="40px" /> : (
              (txData?.transactions || []).length > 0 ? (
                txData.transactions.map((tx, i) => (
                  <FlexBetween key={tx._id} sx={{
                    py: "10px", borderBottom: i < txData.transactions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: "10px",
                        background: tx.type === "income" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {tx.type === "income" ? <TrendingUp sx={{ fontSize: 16, color: "#10b981" }} /> : <TrendingDown sx={{ fontSize: 16, color: "#f43f5e" }} />}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#f1f5f9" }}>
                          {categoryLabels[tx.category] || tx.category}
                        </Typography>
                        <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>
                          {tx.description || tx.category}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{
                      fontSize: "0.85rem", fontWeight: 700,
                      color: tx.type === "income" ? "#10b981" : "#f43f5e",
                    }}>
                      {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                    </Typography>
                  </FlexBetween>
                ))
              ) : (
                <Typography sx={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", py: "2rem" }}>
                  No transactions yet. Add your first one!
                </Typography>
              )
            )}
          </Box>
        </DashboardBox>

        {/* Portfolio Holdings */}
        <DashboardBox p="1.25rem"
          component={motion.div} initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
          <BoxHeader title="Portfolio Holdings" subtitle="Your stock investments"
            sideText={portfolio ? `$${portfolio.virtualBalance?.toLocaleString()} available` : ""} />
          <Box sx={{ mt: "0.5rem" }}>
            {portLoading ? <LoadingSkeleton count={4} height="44px" /> : (
              (portfolio?.holdings || []).length > 0 ? (
                portfolio.holdings.map((h, i) => (
                  <FlexBetween key={h._id} sx={{
                    py: "10px", borderBottom: i < portfolio.holdings.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: "10px",
                        background: "rgba(245,158,11,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#f59e0b" }}>{h.ticker}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#f1f5f9" }}>{h.companyName || h.ticker}</Typography>
                        <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>{h.shares} shares · Avg ${h.avgBuyPrice.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9" }}>
                      ${h.totalInvested.toLocaleString()}
                    </Typography>
                  </FlexBetween>
                ))
              ) : (
                <Typography sx={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", py: "2rem" }}>
                  No holdings yet. Start trading!
                </Typography>
              )
            )}
          </Box>
        </DashboardBox>
      </Box>
    </Box>
  );
};

export default Dashboard;
