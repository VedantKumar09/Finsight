import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, useTheme, Alert, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useLoginMutation } from "@/state/api";
import { motion } from "framer-motion";

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const result = await login(formData).unwrap();
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setErrorMessage(err?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.08) 0%, #0a0b0f 70%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <Box sx={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)",
        top: -100, right: -100, filter: "blur(60px)",
      }} />
      <Box sx={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)",
        bottom: -50, left: -50, filter: "blur(40px)",
      }} />

      <Box
        component={motion.div}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          width: 420,
          p: "2.5rem",
          background: "rgba(26, 27, 37, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: "2rem" }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: "14px", mx: "auto", mb: "1rem",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.35)",
          }}>
            <Typography sx={{ fontWeight: 900, fontSize: 22, color: "#fff" }}>F</Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: "0.85rem", mt: "4px" }}>
            Sign in to your Finsight account
          </Typography>
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{
            mb: "1rem", borderRadius: "10px",
            background: "rgba(244, 63, 94, 0.1)", color: "#fda4af",
            border: "1px solid rgba(244, 63, 94, 0.2)",
            "& .MuiAlert-icon": { color: "#f43f5e" },
          }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Email" name="email" type="email"
            value={formData.email} onChange={handleChange} required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: "#64748b", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: "1rem" }}
          />
          <TextField
            fullWidth label="Password" name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password} onChange={handleChange} required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "#64748b", fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#64748b" }}>
                    {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: "1.5rem" }}
          />
          <Button
            type="submit" fullWidth variant="contained" disabled={isLoading}
            sx={{
              py: "12px", fontSize: "0.9rem", fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
              borderRadius: "12px",
              "&:hover": {
                background: "linear-gradient(135deg, #818cf8, #6366f1)",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.45)",
              },
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <Typography sx={{ textAlign: "center", mt: "1.5rem", color: "#64748b", fontSize: "0.85rem" }}>
          Don't have an account?{" "}
          <Button
            onClick={() => navigate("/register")}
            sx={{
              color: "#818cf8", textTransform: "none", fontWeight: 600,
              fontSize: "0.85rem", p: 0, minWidth: "auto",
              "&:hover": { color: "#a5b4fc", background: "transparent" },
            }}
          >
            Create one
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
