import { useState } from "react";
import { Box, Typography, TextField, InputAdornment, Button, Chip, IconButton, CircularProgress } from "@mui/material";
import { Search, Add, Remove, TrendingUp, TrendingDown } from "@mui/icons-material";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DashboardBox from "@/components/DashboardBox";
import BoxHeader from "@/components/BoxHeader";
import FlexBetween from "@/components/FlexBetween";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import {
  useGetStockQuoteQuery, useSearchStocksQuery,
  useGetWatchlistQuery, useAddToWatchlistMutation, useRemoveFromWatchlistMutation,
  useBuyStockMutation, useSellStockMutation, useGetPortfolioQuery,
} from "@/state/api";

const periods = [
  { label: "1D", value: "1d" }, { label: "5D", value: "5d" },
  { label: "1M", value: "1mo" }, { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" }, { label: "1Y", value: "1y" },
];

const Markets = () => {
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [period, setPeriod] = useState("1mo");
  const [searchQuery, setSearchQuery] = useState("");
  const [tradeShares, setTradeShares] = useState(1);

  const { data: quote, isLoading: quoteLoading } = useGetStockQuoteQuery({ ticker: selectedTicker, period });
  const { data: searchResults } = useSearchStocksQuery(searchQuery, { skip: searchQuery.length < 2 });
  const { data: watchlist } = useGetWatchlistQuery();
  const { data: portfolio } = useGetPortfolioQuery();
  const [addToWatchlist] = useAddToWatchlistMutation();
  const [removeFromWatchlist] = useRemoveFromWatchlistMutation();
  const [buyStock, { isLoading: buying }] = useBuyStockMutation();
  const [sellStock, { isLoading: selling }] = useSellStockMutation();

  const isInWatchlist = watchlist?.tickers?.some((t) => t.symbol === selectedTicker);
  const holding = portfolio?.holdings?.find((h) => h.ticker === selectedTicker);
  const isPositive = quote?.change >= 0;

  const handleBuy = async () => {
    if (!quote) return;
    try {
      await buyStock({ ticker: selectedTicker, companyName: quote.companyName, shares: tradeShares, pricePerShare: quote.currentPrice }).unwrap();
    } catch (err) { console.error(err); }
  };

  const handleSell = async () => {
    if (!quote) return;
    try {
      await sellStock({ ticker: selectedTicker, shares: tradeShares, pricePerShare: quote.currentPrice }).unwrap();
    } catch (err) { console.error(err); }
  };

  return (
    <Box>
      <Box component={motion.div} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", mb: "0.25rem" }}>
          Stock Market
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: "1.25rem" }}>
          Track stocks, analyze trends, and simulate trades
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "280px 1fr 300px", gap: "1.5rem" }}>
        {/* Left — Watchlist & Search */}
        <Box>
          <DashboardBox p="1rem" sx={{ mb: "1rem" }}>
            <TextField fullWidth size="small" placeholder="Search stocks..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: "#64748b", fontSize: 18 }} /></InputAdornment> }}
              sx={{ mb: "0.75rem" }}
            />
            {searchQuery.length >= 2 && searchResults?.results?.length > 0 && (
              <Box sx={{ mb: "0.75rem" }}>
                {searchResults.results.slice(0, 5).map((s) => (
                  <Box key={s.symbol} onClick={() => { setSelectedTicker(s.symbol); setSearchQuery(""); }}
                    sx={{ p: "8px", borderRadius: "8px", cursor: "pointer", "&:hover": { background: "rgba(255,255,255,0.04)" } }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#f1f5f9" }}>{s.symbol}</Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>{s.name}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DashboardBox>

          <DashboardBox p="1rem">
            <BoxHeader title="Watchlist" subtitle={`${watchlist?.tickers?.length || 0} stocks`} />
            <Box sx={{ mt: "0.5rem" }}>
              {(watchlist?.tickers || []).map((t) => (
                <FlexBetween key={t.symbol} sx={{
                  py: "8px", cursor: "pointer", borderRadius: "8px", px: "6px",
                  background: t.symbol === selectedTicker ? "rgba(99,102,241,0.08)" : "transparent",
                  "&:hover": { background: "rgba(255,255,255,0.04)" },
                }} onClick={() => setSelectedTicker(t.symbol)}>
                  <Box>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: t.symbol === selectedTicker ? "#818cf8" : "#f1f5f9" }}>
                      {t.symbol}
                    </Typography>
                    <Typography sx={{ fontSize: "0.6rem", color: "#64748b" }}>{t.companyName}</Typography>
                  </Box>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeFromWatchlist(t.symbol); }}
                    sx={{ color: "#64748b", "&:hover": { color: "#f43f5e" } }}>
                    <Remove sx={{ fontSize: 14 }} />
                  </IconButton>
                </FlexBetween>
              ))}
            </Box>
          </DashboardBox>
        </Box>

        {/* Center — Chart */}
        <DashboardBox p="1.25rem" component={motion.div} initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
          {quoteLoading ? (
            <Box sx={{ p: "2rem" }}><LoadingSkeleton count={3} height="30px" /><Box sx={{ mt: "1rem" }}><LoadingSkeleton height="250px" /></Box></Box>
          ) : quote && !quote.error ? (
            <>
              <FlexBetween sx={{ mb: "1rem" }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Typography sx={{ fontSize: "1.3rem", fontWeight: 800, color: "#f1f5f9" }}>{quote.companyName}</Typography>
                    <Chip label={quote.ticker} size="small" sx={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", fontWeight: 700, fontSize: "0.7rem" }} />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: "0.75rem", mt: "4px" }}>
                    <Typography sx={{ fontSize: "2rem", fontWeight: 800, color: "#f1f5f9" }}>${quote.currentPrice}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {isPositive ? <TrendingUp sx={{ fontSize: 18, color: "#10b981" }} /> : <TrendingDown sx={{ fontSize: 18, color: "#f43f5e" }} />}
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: isPositive ? "#10b981" : "#f43f5e" }}>
                        {isPositive ? "+" : ""}{quote.change} ({isPositive ? "+" : ""}{quote.changePercent}%)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Button size="small" variant={isInWatchlist ? "outlined" : "contained"} startIcon={isInWatchlist ? <Remove /> : <Add />}
                  onClick={() => isInWatchlist ? removeFromWatchlist(selectedTicker) : addToWatchlist({ symbol: selectedTicker, companyName: quote.companyName })}
                  sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, fontSize: "0.75rem",
                    ...(isInWatchlist ? { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" } : {}),
                  }}>
                  {isInWatchlist ? "Remove" : "Watch"}
                </Button>
              </FlexBetween>

              {/* Period Selector */}
              <Box sx={{ display: "flex", gap: "4px", mb: "1rem" }}>
                {periods.map((p) => (
                  <Button key={p.value} size="small" onClick={() => setPeriod(p.value)}
                    sx={{
                      minWidth: 40, py: "4px", fontSize: "0.7rem", fontWeight: 600,
                      borderRadius: "8px", textTransform: "none",
                      color: period === p.value ? "#f1f5f9" : "#64748b",
                      background: period === p.value ? "rgba(99,102,241,0.15)" : "transparent",
                      "&:hover": { background: "rgba(255,255,255,0.04)" },
                    }}>
                    {p.label}
                  </Button>
                ))}
              </Box>

              {/* Chart */}
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quote.history || []}>
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis domain={["auto", "auto"]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ background: "rgba(26,27,37,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }}
                      formatter={(v) => [`$${Number(v).toFixed(2)}`, "Price"]} />
                    <Line type="monotone" dataKey="close" stroke={isPositive ? "#10b981" : "#f43f5e"} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {/* Stats Grid */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", mt: "1rem" }}>
                {[
                  { label: "Day High", value: `$${quote.dayHigh}` },
                  { label: "Day Low", value: `$${quote.dayLow}` },
                  { label: "52W High", value: `$${quote.fiftyTwoWeekHigh}` },
                  { label: "Volume", value: quote.volume ? `${(quote.volume / 1e6).toFixed(1)}M` : "N/A" },
                ].map((s) => (
                  <Box key={s.label} sx={{ p: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                    <Typography sx={{ fontSize: "0.6rem", color: "#64748b" }}>{s.label}</Typography>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#f1f5f9" }}>{s.value}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Typography sx={{ color: "#f43f5e", p: "2rem" }}>Error loading stock data</Typography>
          )}
        </DashboardBox>

        {/* Right — Trade Panel */}
        <DashboardBox p="1.25rem" component={motion.div} initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <BoxHeader title="Trade" subtitle="Simulated trading" />
          <Box sx={{ mt: "1rem" }}>
            <Typography sx={{ fontSize: "0.7rem", color: "#64748b", mb: "4px" }}>Virtual Balance</Typography>
            <Typography sx={{ fontSize: "1.3rem", fontWeight: 800, color: "#10b981", mb: "1rem" }}>
              ${portfolio?.virtualBalance?.toLocaleString() || "100,000"}
            </Typography>

            {holding && (
              <Box sx={{ p: "10px", borderRadius: "10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)", mb: "1rem" }}>
                <Typography sx={{ fontSize: "0.7rem", color: "#f59e0b", fontWeight: 600 }}>Current Position</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#f1f5f9", fontWeight: 700 }}>
                  {holding.shares} shares · Avg ${holding.avgBuyPrice.toFixed(2)}
                </Typography>
              </Box>
            )}

            <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mb: "6px" }}>Shares</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "1rem" }}>
              <IconButton size="small" onClick={() => setTradeShares(Math.max(1, tradeShares - 1))}
                sx={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <TextField size="small" type="number" value={tradeShares}
                onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
                sx={{ width: 80, "& input": { textAlign: "center", fontSize: "0.9rem", fontWeight: 700 } }} />
              <IconButton size="small" onClick={() => setTradeShares(tradeShares + 1)}
                sx={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {quote && (
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: "1rem" }}>
                Est. cost: <span style={{ color: "#f1f5f9", fontWeight: 700 }}>${(tradeShares * quote.currentPrice).toLocaleString()}</span>
              </Typography>
            )}

            <Box sx={{ display: "flex", gap: "8px" }}>
              <Button fullWidth variant="contained" onClick={handleBuy} disabled={buying}
                sx={{
                  py: "10px", fontWeight: 700, borderRadius: "10px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
                  "&:hover": { background: "linear-gradient(135deg, #34d399, #10b981)" },
                }}>
                {buying ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Buy"}
              </Button>
              <Button fullWidth variant="contained" onClick={handleSell} disabled={selling || !holding}
                sx={{
                  py: "10px", fontWeight: 700, borderRadius: "10px",
                  background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                  boxShadow: "0 4px 14px rgba(244,63,94,0.25)",
                  "&:hover": { background: "linear-gradient(135deg, #fb7185, #f43f5e)" },
                  "&.Mui-disabled": { background: "rgba(244,63,94,0.15)", color: "rgba(255,255,255,0.3)" },
                }}>
                {selling ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Sell"}
              </Button>
            </Box>
          </Box>
        </DashboardBox>
      </Box>
    </Box>
  );
};

export default Markets;
