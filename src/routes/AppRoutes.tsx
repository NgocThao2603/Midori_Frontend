import { Routes, Route } from "react-router-dom";
import PublicRoute from "../components/PublicRoute";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../pages/Layout";
import HomePage from "../pages/HomePage";
import LearnPhrase from "../pages/LearnPhrase";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import { useAuth } from "../contexts/AuthContext";

const  AppRoutes = () => {
  const isLoggedIn = useAuth();

  return (
    <>
      <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<HomePage />}></Route>
          <Route path="/learn-phrase/:lessonId" element={<LearnPhrase/>}></Route>
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;
