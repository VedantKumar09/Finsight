import { Box } from "@mui/material";
import { styled } from "@mui/system";

const DashboardBox = styled(Box)(({ theme }) => ({
  background: "rgba(26, 27, 37, 0.7)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "rgba(99, 102, 241, 0.15)",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3), 0 0 40px rgba(99, 102, 241, 0.08)",
  },
}));

export default DashboardBox;
