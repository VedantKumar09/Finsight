import { Box } from "@mui/material";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { themeSettings } from "./theme";
import Navbar from "@/scenes/navbar/index";
import Dashboard from "@/scenes/dashboard/index";
import Markets from "@/scenes/markets/index";
import Portfolio from "@/scenes/portfolio/index";
import Transactions from "@/scenes/transactions/index";
import Predictions from "@/scenes/predictions/index";
import Login from "@/scenes/login/index";
import Register from "@/scenes/register/index";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  const theme = useMemo(() => createTheme(themeSettings), []);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Box width="100%" height="100%" padding="1rem 2rem 4rem 2rem">
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/markets" element={<Markets />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/predictions" element={<Predictions />} />
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
