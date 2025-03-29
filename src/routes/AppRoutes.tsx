import { Routes, Route } from "react-router-dom";
import PublicRoute from "../components/PublicRoute";
import Layout from "../pages/Layout";
import HomePage from "../pages/HomePage";
import LearnPhrase from "../pages/LearnPhrase";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

interface AppRoutesProps {
  isLoggedIn: boolean;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ isLoggedIn }) => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute isLoggedIn={isLoggedIn}>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute isLoggedIn={isLoggedIn}>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute isLoggedIn={isLoggedIn}>
              <Register />
            </PublicRoute>
          }
        />
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />}></Route>
          <Route path="/learn-phrase/:lessonId" element={<LearnPhrase/>}></Route>
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;
