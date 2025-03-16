import { Routes, Route } from "react-router-dom";
import Layout from "../pages/Layout";
import HomePage from "../pages/HomePage";
import LearnPhrase from "../pages/LearnPhrase";

const AppRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/learn-phrase" element={<LearnPhrase/>}></Route>
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;
