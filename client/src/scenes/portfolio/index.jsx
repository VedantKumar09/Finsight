import { Box, Typography } from "@mui/material";
import { TrendingUp, TrendingDown, ShowChart } from "@mui/icons-material";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import DashboardBox from "@/components/DashboardBox";
import BoxHeader from "@/components/BoxHeader";
import FlexBetween from "@/components/FlexBetween";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useGetPortfolioQuery, useGetTradeHistoryQuery } from "@/state/api";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#38bdf8", "#f43f5e", "#8b5cf6", "#06b6d4", "#ec4899"];

const Portfolio = () => {
  const { data: portfolio, isLoading } = useGetPortfolioQuery();
  const { data: tradeData, isLoading: tradesLoading } = useGetTradeHistoryQuery();

  const totalInvested = portfolio?.holdings?.reduce((s, h) => s + h.totalInvested, 0) || 0;
  const pieData = (portfolio?.holdings || []).filter(h => h.shares > 0).map((h) => ({
    name: h.ticker, value: h.totalInvested,
  }));

  return (
    <Box>
      <Box component={motion.div} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", mb: "0.25rem" }}>Portfolio</Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: "1.25rem" }}>Your investment positions and trade history</Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: "1rem", mb: "1.5rem" }}>
        {[
          { label: "Total Invested", value: totalInvested, color: "#6366f1" },
          { label: "Virtual Balance", value: portfolio?.virtualBalance || 0, color: "#10b981" },
          { label: "Realized P&L", value: tradeData?.totalRealizedPL || 0, color: tradeData?.totalRealizedPL >= 0 ? "#10b981" : "#f43f5e" },
        ].map((s, i) => (
          <DashboardBox key={s.label} p="1.25rem" sx={{ flex: 1 }}
            component={motion.div} initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: "4px" }}>{s.label}</Typography>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>
              {s.value >= 0 ? "" : "-"}${Math.abs(s.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Typography>
          </DashboardBox>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Holdings */}
        <DashboardBox p="1.25rem" component={motion.div} initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <BoxHeader title="Holdings" subtitle={`${portfolio?.holdings?.filter(h => h.shares > 0).length || 0} active positions`}
            icon={<ShowChart sx={{ fontSize: 20 }} />} />
          <Box sx={{ display: "flex", gap: "1rem", mt: "1rem" }}>
            <Box sx={{ flex: 1 }}>
              {isLoading ? <LoadingSkeleton count={4} height="50px" /> : (
                (portfolio?.holdings || []).filter(h => h.shares > 0).length > 0 ? (
                  portfolio.holdings.filter(h => h.shares > 0).map((h, i) => (
                    <FlexBetween key={h._id} sx={{ py: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Box sx={{
                          width: 40, height: 40, borderRadius: "10px",
                          background: `${COLORS[i % COLORS.length]}15`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: COLORS[i % COLORS.length] }}>{h.ticker}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#f1f5f9" }}>{h.companyName || h.ticker}</Typography>
                          <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>{h.shares} shares · Avg ${h.avgBuyPrice.toFixed(2)}</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9" }}>${h.totalInvested.toLocaleString()}</Typography>
                    </FlexBetween>
                  ))
                ) : <Typography sx={{ color: "#64748b", fontSize: "0.85rem", py: "2rem", textAlign: "center" }}>No holdings yet</Typography>
              )}
            </Box>
            {pieData.length > 0 && (
              <Box sx={{ width: 160, height: 160 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`}
                      contentStyle={{ background: "rgba(26,27,37,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        </DashboardBox>

        {/* Trade History */}
        <DashboardBox p="1.25rem" component={motion.div} initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <BoxHeader title="Trade History" subtitle="Recent buy & sell orders" />
          <Box sx={{ mt: "0.5rem", maxHeight: 400, overflow: "auto" }}>
            {tradesLoading ? <LoadingSkeleton count={6} height="45px" /> : (
              (tradeData?.trades || []).length > 0 ? (
                tradeData.trades.map((t) => (
                  <FlexBetween key={t._id} sx={{ py: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: "10px",
                        background: t.type === "buy" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {t.type === "buy" ? <TrendingUp sx={{ fontSize: 16, color: "#10b981" }} /> : <TrendingDown sx={{ fontSize: 16, color: "#f43f5e" }} />}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#f1f5f9" }}>
                          {t.type.toUpperCase()} {t.ticker}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6rem", color: "#64748b" }}>
                          {t.shares} shares @ ${t.pricePerShare.toFixed(2)} · {new Date(t.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#f1f5f9" }}>${t.totalAmount.toLocaleString()}</Typography>
                      {t.type === "sell" && (
                        <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: t.profitLoss >= 0 ? "#10b981" : "#f43f5e" }}>
                          {t.profitLoss >= 0 ? "+" : ""}${t.profitLoss.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  </FlexBetween>
                ))
              ) : <Typography sx={{ color: "#64748b", fontSize: "0.85rem", py: "2rem", textAlign: "center" }}>No trades yet</Typography>
            )}
          </Box>
        </DashboardBox>
      </Box>
    </Box>
  );
};

export default Portfolio;
