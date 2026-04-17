import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Container, Alert, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const CompanyLogin = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:9000/api/company/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Save token and company data
            localStorage.setItem("companyToken", data.token);
            localStorage.setItem("companyData", JSON.stringify(data.company));

            // Navigate to dashboard
            navigate("/company/dashboard");
        } catch (err: any) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        width: "100%",
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Company Portal
                    </Typography>
                    <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Finance Monitoring Platform
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Company Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>

                        <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.grey[900], borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Demo Accounts:
                            </Typography>
                            <Typography variant="caption" display="block">
                                • admin@technova.in
                            </Typography>
                            <Typography variant="caption" display="block">
                                • admin@greenleaf.in
                            </Typography>
                            <Typography variant="caption" display="block">
                                • admin@urbanflow.in
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Password: <strong>password123</strong>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default CompanyLogin;
