import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, useTheme, Button, Avatar, IconButton } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  ShowChart as StocksIcon,
  AccountBalanceWallet as PortfolioIcon,
  Receipt as TransactionsIcon,
  Psychology as PredictIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import FlexBetween from "@/components/FlexBetween";
import { motion } from "framer-motion";

const navItems = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
  { label: "Markets", path: "/markets", icon: <StocksIcon sx={{ fontSize: 18 }} /> },
  { label: "Portfolio", path: "/portfolio", icon: <PortfolioIcon sx={{ fontSize: 18 }} /> },
  { label: "Transactions", path: "/transactions", icon: <TransactionsIcon sx={{ fontSize: 18 }} /> },
  { label: "AI Predict", path: "/predictions", icon: <PredictIcon sx={{ fontSize: 18 }} /> },
];

const Navbar = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      component={motion.div}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: "1.5rem",
        p: "0.75rem 1.25rem",
        borderRadius: "16px",
        background: "rgba(26, 27, 37, 0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      {/* Logo */}
      <FlexBetween gap="0.6rem" sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: 16, color: "#fff" }}>F</Typography>
        </Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.1rem",
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}
        >
          Finsight
        </Typography>
      </FlexBetween>

      {/* Nav Links */}
      <Box sx={{ display: "flex", gap: "4px" }}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            component={Link}
            to={item.path}
            startIcon={item.icon}
            sx={{
              color: isActive(item.path) ? "#f1f5f9" : "#64748b",
              fontSize: "0.8rem",
              fontWeight: isActive(item.path) ? 600 : 500,
              px: "14px",
              py: "6px",
              borderRadius: "10px",
              background: isActive(item.path)
                ? "rgba(99, 102, 241, 0.12)"
                : "transparent",
              textTransform: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "#f1f5f9",
                background: isActive(item.path)
                  ? "rgba(99, 102, 241, 0.15)"
                  : "rgba(255, 255, 255, 0.04)",
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* User Section */}
      <FlexBetween gap="0.75rem">
        {user && (
          <>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#f1f5f9" }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>
                {user.email}
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: 14,
                fontWeight: 700,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              {user.firstName?.charAt(0)}
            </Avatar>
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "#64748b",
                "&:hover": { color: "#f43f5e", background: "rgba(244, 63, 94, 0.1)" },
              }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </>
        )}
      </FlexBetween>
    </Box>
  );
};

export default Navbar;
