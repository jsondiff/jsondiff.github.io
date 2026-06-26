import { createTheme } from "@mui/material/styles";

const PRIMARY_BLUE = "#005c99";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: PRIMARY_BLUE,
      contrastText: "#ffffff",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 13,
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: "8px 24px" },
        outlined: {
          borderColor: PRIMARY_BLUE,
          "&:hover": { borderColor: "#004270", backgroundColor: "#f0f7ff" },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: { padding: "2px 6px" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600, fontSize: 12 },
      },
    },
  },
});

export default theme;
