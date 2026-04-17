import { useState } from "react";
import { Box, Typography, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { Add, TrendingUp, TrendingDown, Delete, Close } from "@mui/icons-material";
import { motion } from "framer-motion";
import DashboardBox from "@/components/DashboardBox";
import BoxHeader from "@/components/BoxHeader";
import FlexBetween from "@/components/FlexBetween";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useGetTransactionsQuery, useCreateTransactionMutation, useDeleteTransactionMutation, useGetAccountsQuery, useCreateAccountMutation } from "@/state/api";

const categoryLabels = {
  food: "🍕 Food & Dining", transport: "🚗 Transport", entertainment: "🎬 Entertainment",
  shopping: "🛍️ Shopping", bills: "📄 Bills", rent: "🏠 Rent", healthcare: "🏥 Healthcare",
  education: "📚 Education", travel: "✈️ Travel", subscriptions: "📱 Subscriptions",
  salary: "💰 Salary", freelance: "💻 Freelance", investment_income: "📈 Investments",
  other_income: "💵 Other Income", other_expense: "📦 Other",
};

const expenseCategories = ["food", "transport", "entertainment", "shopping", "bills", "rent", "healthcare", "education", "travel", "subscriptions", "other_expense"];
const incomeCategories = ["salary", "freelance", "investment_income", "other_income"];

const Transactions = () => {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  const [form, setForm] = useState({ accountId: "", type: "expense", category: "food", amount: "", description: "", date: new Date().toISOString().split("T")[0] });
  const [accountForm, setAccountForm] = useState({ name: "", type: "checking", balance: "" });

  const { data, isLoading } = useGetTransactionsQuery({ type: filterType || undefined, limit: 20, page });
  const { data: accounts } = useGetAccountsQuery();
  const [createTransaction, { isLoading: creating }] = useCreateTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [createAccount] = useCreateAccountMutation();

  const handleSubmit = async () => {
    if (!form.accountId || !form.amount) return;
    try {
      await createTransaction({ ...form, amount: parseFloat(form.amount) }).unwrap();
      setDialogOpen(false);
      setForm({ accountId: "", type: "expense", category: "food", amount: "", description: "", date: new Date().toISOString().split("T")[0] });
    } catch (err) { console.error(err); }
  };

  const handleCreateAccount = async () => {
    if (!accountForm.name) return;
    try {
      await createAccount({ ...accountForm, balance: parseFloat(accountForm.balance) || 0 }).unwrap();
      setAccountDialogOpen(false);
      setAccountForm({ name: "", type: "checking", balance: "" });
    } catch (err) { console.error(err); }
  };

  return (
    <Box>
      <FlexBetween component={motion.div} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
        <Box>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9" }}>Transactions</Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>Track your income and expenses</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setAccountDialogOpen(true)}
            sx={{ borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8", textTransform: "none", fontWeight: 600, borderRadius: "10px", "&:hover": { borderColor: "rgba(255,255,255,0.2)" } }}>
            Add Account
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}>
            Add Transaction
          </Button>
        </Box>
      </FlexBetween>

      {/* Accounts Row */}
      <Box sx={{ display: "flex", gap: "0.75rem", mt: "1.25rem", mb: "1.25rem", overflowX: "auto", pb: "4px" }}>
        {(accounts || []).map((acc, i) => (
          <DashboardBox key={acc._id} p="1rem" sx={{ minWidth: 180, flex: "0 0 auto" }}
            component={motion.div} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}>
            <Typography sx={{ fontSize: "0.7rem", color: "#64748b", textTransform: "capitalize" }}>{acc.type.replace("_", " ")}</Typography>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9", mt: "2px" }}>{acc.name}</Typography>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: acc.balance >= 0 ? "#10b981" : "#f43f5e", mt: "4px" }}>
              ${acc.balance.toLocaleString()}
            </Typography>
          </DashboardBox>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: "4px", mb: "1rem" }}>
        {[{ label: "All", value: "" }, { label: "Income", value: "income" }, { label: "Expense", value: "expense" }].map((f) => (
          <Button key={f.value} size="small" onClick={() => { setFilterType(f.value); setPage(1); }}
            sx={{
              px: "14px", py: "4px", borderRadius: "8px", textTransform: "none",
              fontWeight: 600, fontSize: "0.75rem",
              color: filterType === f.value ? "#f1f5f9" : "#64748b",
              background: filterType === f.value ? "rgba(99,102,241,0.12)" : "transparent",
            }}>
            {f.label}
          </Button>
        ))}
      </Box>

      {/* Transactions List */}
      <DashboardBox p="1.25rem" component={motion.div} initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <BoxHeader title="Transaction History" subtitle={`${data?.pagination?.total || 0} total transactions`} />
        <Box sx={{ mt: "0.5rem" }}>
          {isLoading ? <LoadingSkeleton count={8} height="50px" /> : (
            (data?.transactions || []).length > 0 ? (
              data.transactions.map((tx) => (
                <FlexBetween key={tx._id} sx={{ py: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)", "&:hover": { background: "rgba(255,255,255,0.02)" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: "10px",
                      background: tx.type === "income" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                    }}>
                      {tx.type === "income" ? <TrendingUp sx={{ fontSize: 18, color: "#10b981" }} /> : <TrendingDown sx={{ fontSize: 18, color: "#f43f5e" }} />}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#f1f5f9" }}>
                        {categoryLabels[tx.category] || tx.category}
                      </Typography>
                      <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>
                        {tx.description || "No description"} · {new Date(tx.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: tx.type === "income" ? "#10b981" : "#f43f5e" }}>
                      {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                    </Typography>
                    <IconButton size="small" onClick={() => deleteTransaction(tx._id)}
                      sx={{ color: "#475569", "&:hover": { color: "#f43f5e" } }}>
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </FlexBetween>
              ))
            ) : <Typography sx={{ color: "#64748b", textAlign: "center", py: "3rem" }}>No transactions found</Typography>
          )}
        </Box>

        {/* Pagination */}
        {data?.pagination?.pages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: "8px", mt: "1rem" }}>
            {Array.from({ length: data.pagination.pages }, (_, i) => (
              <Button key={i} size="small" onClick={() => setPage(i + 1)}
                sx={{
                  minWidth: 32, borderRadius: "8px", fontWeight: 600, fontSize: "0.75rem",
                  color: page === i + 1 ? "#f1f5f9" : "#64748b",
                  background: page === i + 1 ? "rgba(99,102,241,0.15)" : "transparent",
                }}>
                {i + 1}
              </Button>
            ))}
          </Box>
        )}
      </DashboardBox>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>Add Transaction</Typography>
          <IconButton onClick={() => setDialogOpen(false)} sx={{ color: "#64748b" }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: "1rem !important" }}>
          <Box sx={{ display: "flex", gap: "0.75rem", mb: "1rem" }}>
            <TextField select fullWidth label="Type" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value, category: e.target.value === "income" ? "salary" : "food" })}>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
            <TextField select fullWidth label="Account" value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
              {(accounts || []).map((a) => <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>)}
            </TextField>
          </Box>
          <TextField select fullWidth label="Category" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} sx={{ mb: "1rem" }}>
            {(form.type === "income" ? incomeCategories : expenseCategories).map((c) => (
              <MenuItem key={c} value={c}>{categoryLabels[c] || c}</MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: "flex", gap: "0.75rem", mb: "1rem" }}>
            <TextField fullWidth label="Amount" type="number" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <TextField fullWidth label="Date" type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Box>
          <TextField fullWidth label="Description (optional)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: "1rem 1.5rem" }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: "#94a3b8", textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={creating}
            sx={{ textTransform: "none", fontWeight: 600 }}>
            {creating ? "Adding..." : "Add Transaction"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Account Dialog */}
      <Dialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>Add Account</Typography>
          <IconButton onClick={() => setAccountDialogOpen(false)} sx={{ color: "#64748b" }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: "1rem !important" }}>
          <TextField fullWidth label="Account Name" value={accountForm.name}
            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} sx={{ mb: "1rem" }} />
          <TextField select fullWidth label="Type" value={accountForm.type}
            onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })} sx={{ mb: "1rem" }}>
            <MenuItem value="checking">Checking</MenuItem>
            <MenuItem value="savings">Savings</MenuItem>
            <MenuItem value="credit_card">Credit Card</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="investment">Investment</MenuItem>
          </TextField>
          <TextField fullWidth label="Initial Balance" type="number" value={accountForm.balance}
            onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: "1rem 1.5rem" }}>
          <Button onClick={() => setAccountDialogOpen(false)} sx={{ color: "#94a3b8", textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAccount} sx={{ textTransform: "none", fontWeight: 600 }}>Create Account</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;
