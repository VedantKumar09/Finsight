import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Alert, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock, Person } from "@mui/icons-material";
import { useRegisterMutation } from "@/state/api";
import { motion } from "framer-motion";

const Register = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (formData.password.length < 5) {
      setErrorMessage("Password must be at least 5 characters");
      return;
    }
    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData).unwrap();
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setErrorMessage(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <Box sx={{
      width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.08) 0%, #0a0b0f 70%)",
      position: "relative", overflow: "hidden",
    }}>
      <Box sx={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)",
        top: -100, left: -100, filter: "blur(60px)",
      }} />

      <Box
        component={motion.div}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          width: 420, p: "2.5rem",
          background: "rgba(26, 27, 37, 0.7)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4)", position: "relative", zIndex: 1,
        }}
      >
        <Box sx={{ textAlign: "center", mb: "1.5rem" }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: "14px", mx: "auto", mb: "1rem",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)",
          }}>
            <Typography sx={{ fontWeight: 900, fontSize: 22, color: "#fff" }}>F</Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "#f1f5f9" }}>
            Create Account
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: "0.85rem", mt: "4px" }}>
            Start your financial journey with Finsight
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
          <Box sx={{ display: "flex", gap: "0.75rem", mb: "1rem" }}>
            <TextField fullWidth label="First Name" name="firstName" value={formData.firstName}
              onChange={handleChange} required InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: "#64748b", fontSize: 20 }} /></InputAdornment> }} />
            <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName}
              onChange={handleChange} required />
          </Box>
          <TextField fullWidth label="Email" name="email" type="email" value={formData.email}
            onChange={handleChange} required sx={{ mb: "1rem" }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: "#64748b", fontSize: 20 }} /></InputAdornment> }} />
          <TextField fullWidth label="Password" name="password"
            type={showPassword ? "text" : "password"} value={formData.password}
            onChange={handleChange} required sx={{ mb: "1rem" }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock sx={{ color: "#64748b", fontSize: 20 }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#64748b" }}>{showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}</IconButton></InputAdornment>,
            }} />
          <TextField fullWidth label="Confirm Password" name="confirmPassword"
            type="password" value={formData.confirmPassword}
            onChange={handleChange} required sx={{ mb: "1.5rem" }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: "#64748b", fontSize: 20 }} /></InputAdornment> }} />
          <Button type="submit" fullWidth variant="contained" disabled={isLoading}
            sx={{
              py: "12px", fontSize: "0.9rem", fontWeight: 700,
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)", borderRadius: "12px",
              "&:hover": { background: "linear-gradient(135deg, #34d399, #10b981)", boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)" },
            }}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <Typography sx={{ textAlign: "center", mt: "1.5rem", color: "#64748b", fontSize: "0.85rem" }}>
          Already have an account?{" "}
          <Button onClick={() => navigate("/login")}
            sx={{ color: "#818cf8", textTransform: "none", fontWeight: 600, fontSize: "0.85rem", p: 0, minWidth: "auto", "&:hover": { color: "#a5b4fc", background: "transparent" } }}>
            Sign in
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
