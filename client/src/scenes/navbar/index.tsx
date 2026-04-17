import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PixIcon from "@mui/icons-material/Pix";
import LogoutIcon from "@mui/icons-material/Logout";
import { Box, Typography, useTheme, Button } from "@mui/material";
import FlexBetween from "@/components/FlexBetween";

type Props = {};

const Navbar = (props: Props) => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState("dashboard");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Set selected based on current path
    if (location.pathname === "/") {
      setSelected("dashboard");
    } else if (location.pathname === "/predictions") {
      setSelected("predictions");
    } else if (location.pathname === "/prediction-history") {
      setSelected("history");
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <FlexBetween mb="0.25rem" p="0.5rem 0rem" color={palette.grey[300]}>
      {/* LEFT SIDE */}
      <FlexBetween gap="0.75rem">
        <PixIcon sx={{ fontSize: "28px" }} />
        <Typography variant="h4" fontSize="16px">
          Finanseer
        </Typography>
      </FlexBetween>

      {/* RIGHT SIDE */}
      <FlexBetween gap="2rem">
        <Box sx={{ "&:hover": { color: palette.primary[100] } }}>
          <Link
            to="/"
            onClick={() => setSelected("dashboard")}
            style={{
              color: selected === "dashboard" ? "inherit" : palette.grey[700],
              textDecoration: "inherit",
            }}
          >
            dashboard
          </Link>
        </Box>
        <Box sx={{ "&:hover": { color: palette.primary[100] } }}>
          <Link
            to="/predictions"
            onClick={() => setSelected("predictions")}
            style={{
              color: selected === "predictions" ? "inherit" : palette.grey[700],
              textDecoration: "inherit",
            }}
          >
            predictions
          </Link>
        </Box>
        <Box sx={{ "&:hover": { color: palette.primary[100] } }}>
          <Link
            to="/prediction-history"
            onClick={() => setSelected("history")}
            style={{
              color: selected === "history" ? "inherit" : palette.grey[700],
              textDecoration: "inherit",
            }}
          >
            history
          </Link>
        </Box>
        {user && (
          <Box display="flex" alignItems="center" gap="1rem">
            <Typography variant="h6" fontSize="14px">
              {user.firstName} {user.lastName}
            </Typography>
            <Button
              onClick={handleLogout}
              sx={{
                color: palette.grey[300],
                "&:hover": { color: palette.primary[100] },
              }}
            >
              <LogoutIcon />
            </Button>
          </Box>
        )}
      </FlexBetween>
    </FlexBetween>
  );
};

export default Navbar;
