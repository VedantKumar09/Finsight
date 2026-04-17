import { Box } from "@mui/material";

const LoadingSkeleton = ({ width = "100%", height = "20px", borderRadius = "8px", count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width,
            height,
            borderRadius,
            background: "linear-gradient(90deg, #1a1b25 25%, #242536 50%, #1a1b25 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            mb: i < count - 1 ? "8px" : 0,
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "-200% 0" },
              "100%": { backgroundPosition: "200% 0" },
            },
          }}
        />
      ))}
    </>
  );
};

export default LoadingSkeleton;
