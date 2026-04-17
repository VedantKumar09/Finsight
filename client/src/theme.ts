export const tokens = {
  grey: {
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  primary: {
    // Indigo — modern, premium
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
  },
  secondary: {
    // Emerald — gains / positive
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  tertiary: {
    // Rose — losses / alerts
    500: "#f43f5e",
  },
  accent: {
    amber: "#f59e0b",
    sky: "#38bdf8",
    violet: "#8b5cf6",
    cyan: "#06b6d4",
  },
  background: {
    darkest: "#0a0b0f",
    dark: "#12131a",
    card: "#1a1b25",
    elevated: "#242536",
  },
};

// MUI theme settings
export const themeSettings = {
  palette: {
    primary: {
      ...tokens.primary,
      main: tokens.primary[500],
      light: tokens.primary[400],
    },
    secondary: {
      ...tokens.secondary,
      main: tokens.secondary[500],
    },
    tertiary: {
      ...tokens.tertiary,
    },
    grey: {
      ...tokens.grey,
      main: tokens.grey[500],
    },
    background: {
      default: tokens.background.darkest,
      paper: tokens.background.card,
      light: tokens.background.elevated,
    },
    text: {
      primary: tokens.grey[100],
      secondary: tokens.grey[400],
    },
    success: {
      main: tokens.secondary[500],
    },
    error: {
      main: "#f43f5e",
    },
    warning: {
      main: "#f59e0b",
    },
    info: {
      main: "#38bdf8",
    },
  },
  typography: {
    fontFamily: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"].join(","),
    fontSize: 13,
    h1: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 32,
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 20,
      fontWeight: 700,
      color: tokens.grey[100],
    },
    h4: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 16,
      fontWeight: 600,
      color: tokens.grey[200],
    },
    h5: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 13,
      fontWeight: 500,
      color: tokens.grey[400],
    },
    h6: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 11,
      fontWeight: 400,
      color: tokens.grey[500],
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          padding: "8px 20px",
        },
        contained: {
          background: `linear-gradient(135deg, ${tokens.primary[500]}, ${tokens.primary[700]})`,
          boxShadow: `0 4px 14px rgba(99, 102, 241, 0.3)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${tokens.primary[400]}, ${tokens.primary[600]})`,
            boxShadow: `0 6px 20px rgba(99, 102, 241, 0.4)`,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: tokens.grey[400],
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: tokens.grey[100],
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.08)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.15)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.primary[500],
            borderWidth: 1,
          },
        },
        input: {
          color: tokens.grey[100],
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: tokens.grey[100],
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: tokens.background.card,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.background.card,
          backgroundImage: "none",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: 16,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: tokens.grey[400],
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: tokens.background.elevated,
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(99, 102, 241, 0.1)",
          },
        },
      },
    },
  },
};
