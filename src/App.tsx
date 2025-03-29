import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập trong localStorage
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);
  return (
    <BrowserRouter>
      <AppRoutes isLoggedIn={isLoggedIn}/>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
