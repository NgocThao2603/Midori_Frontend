import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AudioProvider } from "./contexts/AudioContext";
import { LessonLevelProvider } from "./contexts/LessonLevelContext";
import { UserActivityProvider } from "./contexts/UserActivityContext";

const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "&:hover:not(.Mui-focused) fieldset": {
              borderColor: "#139139",
            },
          },
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <LessonLevelProvider>
            <UserActivityProvider>
              <AudioProvider>
                <AppRoutes/>
                <ToastContainer />
              </AudioProvider>
            </UserActivityProvider>
          </LessonLevelProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
