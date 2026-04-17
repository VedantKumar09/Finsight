import { Box, Typography } from "@mui/material";
import FlexBetween from "./FlexBetween";

const BoxHeader = ({ title, subtitle, icon, sideText }) => {
  return (
    <FlexBetween
      mb="0.5rem"
      sx={{ "& .MuiTypography-root": { lineHeight: 1.4 } }}
    >
      <FlexBetween gap="0.75rem">
        {icon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.1)",
              color: "#6366f1",
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#f1f5f9" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="h6" sx={{ color: "#64748b", mt: "2px" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </FlexBetween>
      {sideText && (
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "#94a3b8" }}
        >
          {sideText}
        </Typography>
      )}
    </FlexBetween>
  );
};

export default BoxHeader;
