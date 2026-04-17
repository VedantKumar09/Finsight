import { useState } from "react";
import { Box, Typography, TextField, Button, Chip, CircularProgress } from "@mui/material";
import { Psychology, TrendingUp, TrendingDown, Search } from "@mui/icons-material";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import DashboardBox from "@/components/DashboardBox";
import BoxHeader from "@/components/BoxHeader";
import FlexBetween from "@/components/FlexBetween";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useGetStockPredictionQuery } from "@/state/api";

const signalColors = {
  "STRONG BUY": "#10b981", "BUY": "#34d399", "HOLD": "#f59e0b", "SELL": "#fb7185", "STRONG SELL": "#f43f5e",
};
const signalBg = {
  "STRONG BUY": "rgba(16,185,129,0.1)", "BUY": "rgba(52,211,153,0.1)", "HOLD": "rgba(245,158,11,0.1)",
  "SELL": "rgba(251,113,133,0.1)", "STRONG SELL": "rgba(244,63,94,0.1)",
};

const Predictions = () => {
  const [ticker, setTicker] = useState("AAPL");
  const [activeTicker, setActiveTicker] = useState("AAPL");

  const { data: prediction, isLoading, error } = useGetStockPredictionQuery(activeTicker);

  const handleSearch = () => {
    if (ticker.trim()) setActiveTicker(ticker.trim().toUpperCase());
  };

  const popularTickers = ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "META", "AMZN"];

  return (
    <Box>
      <Box component={motion.div} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", mb: "0.25rem" }}>
          AI Stock Predictions
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: "1.25rem" }}>
          ML-powered price forecasting using Random Forest & Gradient Boosting
        </Typography>
      </Box>

      {/* Search */}
      <DashboardBox p="1.25rem" sx={{ mb: "1.5rem" }}
        component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Box sx={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <TextField size="small" placeholder="Enter stock ticker (e.g., AAPL)"
            value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{ flex: 1 }} />
          <Button variant="contained" onClick={handleSearch} startIcon={<Psychology />}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", px: "20px" }}>
            Predict
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: "6px", mt: "0.75rem", flexWrap: "wrap" }}>
          {popularTickers.map((t) => (
            <Chip key={t} label={t} size="small" onClick={() => { setTicker(t); setActiveTicker(t); }}
              sx={{
                fontSize: "0.7rem", fontWeight: 600,
                background: activeTicker === t ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                color: activeTicker === t ? "#818cf8" : "#94a3b8",
                cursor: "pointer", "&:hover": { background: "rgba(99,102,241,0.1)" },
              }} />
          ))}
        </Box>
      </DashboardBox>

      {isLoading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <DashboardBox p="1.25rem"><LoadingSkeleton count={6} height="30px" /></DashboardBox>
          <DashboardBox p="1.25rem"><LoadingSkeleton count={6} height="30px" /></DashboardBox>
        </Box>
      ) : prediction && !prediction.error ? (
        <>
          {/* Signal + Price Row */}
          <Box sx={{ display: "flex", gap: "1rem", mb: "1.5rem" }}>
            <DashboardBox p="1.25rem" sx={{ flex: 1 }}
              component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: "4px" }}>Current Price</Typography>
              <Typography sx={{ fontSize: "2rem", fontWeight: 800, color: "#f1f5f9" }}>${prediction.currentPrice}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: "4px" }}>{activeTicker}</Typography>
            </DashboardBox>

            <DashboardBox p="1.25rem" sx={{ flex: 1 }}
              component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: "4px" }}>AI Signal</Typography>
              <Chip label={prediction.signal} sx={{
                fontSize: "1rem", fontWeight: 800, py: "20px", px: "8px",
                background: signalBg[prediction.signal], color: signalColors[prediction.signal],
                border: `1px solid ${signalColors[prediction.signal]}30`,
              }} />
              <Typography sx={{ fontSize: "0.7rem", color: "#64748b", mt: "8px" }}>Model: {prediction.modelUsed}</Typography>
            </DashboardBox>

            <DashboardBox p="1.25rem" sx={{ flex: 1 }}
              component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: "4px" }}>Model Accuracy</Typography>
              <Typography sx={{ fontSize: "2rem", fontWeight: 800, color: "#6366f1" }}>{prediction.accuracy.r2Score}%</Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748b", mt: "4px" }}>R² Score · MAE: ${prediction.accuracy.meanAbsoluteError}</Typography>
            </DashboardBox>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* 5-Day Forecast Chart */}
            <DashboardBox p="1.25rem"
              component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}>
              <BoxHeader title="5-Day Price Forecast" subtitle="Predicted closing prices"
                icon={<TrendingUp sx={{ fontSize: 20 }} />} />
              <Box sx={{ height: 250, mt: "0.5rem" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { day: "Today", price: prediction.currentPrice },
                    ...prediction.predictions.map((p) => ({ day: `Day ${p.day}`, price: p.predictedPrice })),
                  ]}>
                    <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ background: "rgba(26,27,37,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}
                      formatter={(v) => [`$${Number(v).toFixed(2)}`, "Price"]} />
                    <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1", r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </DashboardBox>

            {/* Feature Importance */}
            <DashboardBox p="1.25rem"
              component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}>
              <BoxHeader title="Feature Importance" subtitle="What drives the prediction"
                icon={<Psychology sx={{ fontSize: 20 }} />} />
              <Box sx={{ height: 250, mt: "0.5rem" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prediction.featureImportance} layout="vertical">
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="feature" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip contentStyle={{ background: "rgba(26,27,37,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}
                      formatter={(v) => [`${v}%`, "Importance"]} />
                    <Bar dataKey="importance" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </DashboardBox>

            {/* Model Comparison */}
            <DashboardBox p="1.25rem"
              component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}>
              <BoxHeader title="Model Comparison" subtitle="Random Forest vs Gradient Boosting" />
              <Box sx={{ mt: "1rem" }}>
                {Object.entries(prediction.modelComparison).map(([name, metrics]) => (
                  <Box key={name} sx={{ p: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", mb: "8px" }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#f1f5f9", textTransform: "capitalize", mb: "6px" }}>
                      {name.replace(/([A-Z])/g, " $1").trim()}
                      {prediction.modelUsed.toLowerCase().includes(name.toLowerCase().split(/(?=[A-Z])/).join(" ").toLowerCase()) &&
                        <Chip label="Selected" size="small" sx={{ ml: "8px", fontSize: "0.6rem", background: "rgba(99,102,241,0.12)", color: "#818cf8" }} />
                      }
                    </Typography>
                    <FlexBetween>
                      <Box>
                        <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>R² Score</Typography>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#10b981" }}>{metrics.r2}%</Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>Mean Abs. Error</Typography>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#f59e0b" }}>${metrics.mae}</Typography>
                      </Box>
                    </FlexBetween>
                  </Box>
                ))}
              </Box>
            </DashboardBox>

            {/* Predicted Changes */}
            <DashboardBox p="1.25rem"
              component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}>
              <BoxHeader title="Predicted Changes" subtitle="Day-by-day forecast breakdown" />
              <Box sx={{ mt: "0.5rem" }}>
                {prediction.predictions.map((p) => (
                  <FlexBetween key={p.day} sx={{ py: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: "10px",
                        background: p.change >= 0 ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {p.change >= 0 ? <TrendingUp sx={{ fontSize: 16, color: "#10b981" }} /> : <TrendingDown sx={{ fontSize: 16, color: "#f43f5e" }} />}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#f1f5f9" }}>Day {p.day}</Typography>
                        <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>Predicted close</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9" }}>${p.predictedPrice}</Typography>
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: p.changePercent >= 0 ? "#10b981" : "#f43f5e" }}>
                        {p.changePercent >= 0 ? "+" : ""}{p.changePercent}%
                      </Typography>
                    </Box>
                  </FlexBetween>
                ))}
              </Box>
            </DashboardBox>
          </Box>
        </>
      ) : (
        <DashboardBox p="3rem" sx={{ textAlign: "center" }}>
          <Psychology sx={{ fontSize: 48, color: "#334155", mb: "1rem" }} />
          <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>
            {error ? "Failed to generate prediction. Try another ticker." : "Enter a stock ticker and click Predict to get AI-powered forecasts."}
          </Typography>
        </DashboardBox>
      )}
    </Box>
  );
};

export default Predictions;
