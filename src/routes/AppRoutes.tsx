import { Routes, Route } from "react-router-dom";
import PublicRoute from "../components/PublicRoute";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../pages/Layout";
import HomePage from "../pages/HomePage";
import LearnPhrase from "../pages/LearnPhrase";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import PracticePhrase from "../pages/PracticePhrase";
import Translate from "../pages/Translate";
import Listen from "../pages/Listen";
import PracticeTranslate from "../pages/PracticeTranslate";
import PracticeListen from "../pages/PracticeListen";

const  AppRoutes = () => {
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
          <Route path="/translate/:lessonId" element={<Translate/>}></Route>
          <Route path="/listen/:lessonId" element={<Listen/>}></Route>
        </Route>
        <Route path="/practice-phrase/:lessonId" element={<ProtectedRoute><PracticePhrase/></ProtectedRoute>} />
        <Route path="/practice-translate/:lessonId" element={<ProtectedRoute><PracticeTranslate/></ProtectedRoute>} />
        <Route path="/practice-listen/:lessonId" element={<ProtectedRoute><PracticeListen/></ProtectedRoute>} />
      </Routes>
    </>
  );
};

export default AppRoutes;
