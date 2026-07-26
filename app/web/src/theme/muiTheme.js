import { createTheme } from "@mui/material/styles";

// Korean-style aesthetic theme with soft creams, muted sage, and dusty rose
export const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "hsl(150, 25%, 45%)",
      light: "hsl(150, 30%, 55%)",
      dark: "hsl(150, 25%, 35%)",
      contrastText: "hsl(40, 40%, 99%)",
    },
    secondary: {
      main: "hsl(25, 30%, 75%)",
      light: "hsl(25, 30%, 85%)",
      dark: "hsl(25, 30%, 65%)",
      contrastText: "hsl(30, 10%, 15%)",
    },
    error: {
      main: "hsl(0, 60%, 50%)",
      contrastText: "hsl(40, 40%, 99%)",
    },
    warning: {
      main: "hsl(350, 30%, 70%)",
      contrastText: "hsl(30, 10%, 15%)",
    },
    info: {
      main: "hsl(150, 25%, 45%)",
      contrastText: "hsl(40, 40%, 99%)",
    },
    success: {
      main: "hsl(150, 30%, 50%)",
      contrastText: "hsl(40, 40%, 99%)",
    },
    background: {
      default: "hsl(40, 33%, 96%)",
      paper: "hsl(40, 40%, 99%)",
    },
    text: {
      primary: "hsl(30, 10%, 15%)",
      secondary: "hsl(30, 10%, 45%)",
      disabled: "hsl(30, 10%, 60%)",
    },
    divider: "hsl(40, 20%, 88%)",
    action: {
      hover: "hsla(150, 25%, 45%, 0.08)",
      selected: "hsla(150, 25%, 45%, 0.12)",
      focus: "hsla(150, 25%, 45%, 0.12)",
    },
  },

  typography: {
    fontFamily: "'Noto Sans KR', sans-serif",
    h1: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    h2: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    h3: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 500,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "8px 20px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px -2px hsla(150, 25%, 45%, 0.2)",
          },
        },
        containedPrimary: {
          background: "hsl(150, 25%, 45%)",
          "&:hover": {
            background: "hsl(150, 25%, 40%)",
          },
        },
        outlined: {
          borderColor: "hsl(40, 20%, 88%)",
          "&:hover": {
            borderColor: "hsl(150, 25%, 45%)",
            background: "hsla(150, 25%, 45%, 0.05)",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            "0 2px 20px -5px hsla(150, 25%, 45%, 0.08), 0 4px 12px -4px hsla(30, 10%, 60%, 0.05)",
          border: "1px solid hsl(40, 20%, 88%)",
          background: "hsl(40, 40%, 99%)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow:
            "0 2px 20px -5px hsla(150, 25%, 45%, 0.08), 0 4px 12px -4px hsla(30, 10%, 60%, 0.05)",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
        filled: {
          background: "hsl(40, 20%, 92%)",
          "&:hover": {
            background: "hsla(150, 25%, 45%, 0.1)",
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            background: "hsla(40, 20%, 92%, 0.5)",
            "& fieldset": {
              borderColor: "hsl(40, 20%, 88%)",
            },
            "&:hover fieldset": {
              borderColor: "hsla(150, 25%, 45%, 0.5)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "hsl(150, 25%, 45%)",
            },
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          "&:hover": {
            background: "hsla(150, 25%, 45%, 0.08)",
          },
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(135deg, hsla(150, 25%, 45%, 0.2), hsla(350, 30%, 70%, 0.2))",
          color: "hsl(30, 10%, 15%)",
          fontWeight: 500,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "hsla(40, 40%, 99%, 0.8)",
          backdropFilter: "blur(12px)",
          boxShadow: "none",
          borderBottom: "1px solid hsl(40, 20%, 88%)",
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          background: "hsl(350, 30%, 70%)",
          color: "hsl(30, 10%, 15%)",
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "hsl(40, 20%, 88%)",
        },
      },
    },
  },
});

// Dark theme variant
export const muiThemeDark = createTheme({
  ...muiTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "hsl(150, 30%, 55%)",
      light: "hsl(150, 30%, 65%)",
      dark: "hsl(150, 30%, 45%)",
      contrastText: "hsl(30, 15%, 10%)",
    },
    secondary: {
      main: "hsl(25, 20%, 25%)",
      light: "hsl(25, 20%, 35%)",
      dark: "hsl(25, 20%, 15%)",
      contrastText: "hsl(40, 30%, 95%)",
    },
    error: {
      main: "hsl(0, 60%, 45%)",
      contrastText: "hsl(40, 30%, 95%)",
    },
    warning: {
      main: "hsl(350, 25%, 55%)",
      contrastText: "hsl(40, 30%, 95%)",
    },
    background: {
      default: "hsl(30, 15%, 10%)",
      paper: "hsl(30, 15%, 13%)",
    },
    text: {
      primary: "hsl(40, 30%, 95%)",
      secondary: "hsl(40, 15%, 60%)",
      disabled: "hsl(40, 15%, 40%)",
    },
    divider: "hsl(30, 15%, 20%)",
  },
});
