import { Box } from "@mui/material";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { themeSettings } from "./theme";
import Navbar from "@/scenes/navbar";
import Dashboard from "@/scenes/dashboard";
import Predictions from "@/scenes/predictions";
import Login from "@/scenes/login";
import Register from "@/scenes/register";
import PredictionHistory from "@/scenes/predictionHistory";
import ProtectedRoute from "@/components/ProtectedRoute";
import CompanyLogin from "@/scenes/company/CompanyLogin";
import CompanyDashboard from "@/scenes/company/CompanyDashboard";
import ProtectedCompanyRoute from "@/components/ProtectedCompanyRoute";

function App() {
  const theme = useMemo(() => createTheme(themeSettings), []);
  const token = localStorage.getItem("token");

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            {/* Company Portal Routes */}
            <Route path="/company/login" element={<CompanyLogin />} />
            <Route
              path="/company/dashboard"
              element={
                <ProtectedCompanyRoute>
                  <CompanyDashboard />
                </ProtectedCompanyRoute>
              }
            />

            {/* Old User Routes (keeping for backwards compatibility) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Box width="100%" height="100%" padding="1rem 2rem 4rem 2rem">
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/predictions" element={<Predictions />} />
                      <Route
                        path="/prediction-history"
                        element={<PredictionHistory />}
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Box>
                </ProtectedRoute>
              }
            />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
