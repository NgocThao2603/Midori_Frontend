import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Avatar, IconButton, Menu, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import point from "../assets/point.png";
import { logoutUser, fetchUserPoint, getProfile, updateProfile } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import ProfilePopup from "./ProfilePopup";
import { toast } from "react-toastify";

interface HeaderProps {
  level: string;
  setLevel: (level: string) => void; // Nhận function từ Layout
  isLoggedIn: boolean;
  profileUpdated?: number; 
  setProfileUpdated?: (updater: (prev: number) => number) => void;
}
const Header = ({ level, setLevel, isLoggedIn, profileUpdated, setProfileUpdated }: HeaderProps) => {
  const [points, setPoints] = React.useState<number | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState({ username: "", email: "", dob: "", phone: "", avatarUrl: "" });

  const handleChange = (event: SelectChangeEvent<string>) => {
    setLevel(event.target.value);
    localStorage.setItem("midori_level", event.target.value);
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = async () => {
    handleClose();
    const res = await getProfile();
    const userData = res.user;
    setUser({
      username: userData.username,
      email: userData.email,
      avatarUrl: userData.avatar_url,
      dob: userData.dob,
      phone: userData.phone,
    });
    setProfileOpen(true);
  };

  const handleLogoutClick = async () => {
    handleClose();
    try {
      await logoutUser();
      logout(); 
      navigate("/");
    } catch (error) {
      console.error("Logout thất bại:", error);
    }
  };

  useEffect(() => {
    const loadPoint = async () => {
      try {
        const data = await fetchUserPoint();
        setPoints(data.point);
      } catch (error) {
        console.error("Không thể lấy điểm:", error);
      }
    };

    loadPoint();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getProfile();
        const userData = res.user;
        setUser({
          username: userData.username ?? "",
          email: userData.email ?? "",
          avatarUrl: userData.avatar_url ?? "",
          dob: userData.dob ?? "",
          phone: userData.phone ?? "",
        });
      } catch (e) {
        console.error("Không thể lấy thông tin người dùng:", e);
      }
    };
    fetchUser();
  }, [profileUpdated]);

  const handleProfileSave = async (formData: any) => {
    try {
      // Chuẩn hóa dữ liệu gửi lên backend
      const payload: any = {
        dob: formData.dob,
        phone: formData.phone,
        avatar_url: formData.avatarUrl,
      };
      if (formData.password) {
        payload.current_password = formData.currentPassword;
        payload.password = formData.password;
      }
      await updateProfile(payload);
      toast.success("Cập nhật thông tin thành công!");

      // Lấy lại thông tin user mới nhất
      const res = await getProfile();
      const userData = res.user;
      setUser({
        username: userData.username,
        email: userData.email,
        avatarUrl: userData.avatar_url,
        dob: userData.dob,
        phone: userData.phone,
      });
      if (setProfileUpdated) {
        setProfileUpdated(prev => prev + 1);
      }
      setProfileOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Cập nhật thất bại!");
    }
  };

  if (!isLoggedIn) {
    // Header cho người chưa đăng nhập (Landing Page)
    return (
      <header className="w-full h-56 text-xl py-4 fixed z-50 top-0 left-0 right-0 bg-green_pastel2">
        <div className="flex gap-2 justify-end items-center mr-20">
          <button
            onClick={() => navigate("/register")}
            disabled={isRegisterPage}
            className={`text-secondary px-6 py-2 rounded-lg font-bold focus:outline-none transition ${
              isRegisterPage
                ? "border-green_border bg-white hover:border-green_border"
                : "hover:border-green_border hover:bg-white"
            }`}
          >
            Đăng ký
          </button>
          <button
            onClick={() => navigate("/login")}
            disabled={isLoginPage}
            className={`text-secondary px-6 py-2 rounded-lg font-bold focus:outline-none transition ${
              isLoginPage
                ? "border-green_border bg-white hover:border-green_border"
                : "hover:border-green_border hover:bg-white"
            }`}
          >
            Đăng nhập
          </button>
        </div>
        <div className="text-center text-secondary">
          <div className="absolute w-28 h-28 bg-green_pastel rounded-full top-10 left-64"></div>
          <div className="absolute w-10 h-10 bg-green_pastel rounded-full top-32 left-96"></div>
          <div className="absolute w-10 h-10 bg-green_pastel rounded-full bottom-8 right-52"></div>
          <div className="absolute w-6 h-6 bg-green_pastel rounded-full bottom-2 right-64"></div>
          <h2 
            className="inline text-6xl font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            Midori
          </h2>
          <p className="mt-2 text-lg">
            Ôn tập tiếng Nhật theo giáo trình Mimikara Oboeru
          </p>
          <p className="mt-2 font-bold text-xl">N3, N2, N1</p>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 w-full flex justify-end items-center gap-12 p-6 bg-white z-100 text-lg">
      <div className="relative">
        <FormControl
          sx={{
            minWidth: 120,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#139139",
                borderRadius: "8px",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: "#139139",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#139139",
                borderWidth: "1px",
              },
              "& .MuiSelect-select": {
                padding: "8px 18px",
                height: "2em",
                minHeight: "1.2em",
                display: "flex",
                alignItems: "center"
              },
            },
            "& .MuiInputLabel-outlined": {
              color: "#008000",
              fontWeight: "bold",
              "&.Mui-focused": {
                color: "#008000",
              },
            },
          }}
        >
          <InputLabel id="custom-select-label">Cấp độ</InputLabel>
          <Select
            labelId="custom-select-label"
            value={level}
            onChange={handleChange}
            label="Cấp độ"
            MenuProps={{
              PaperProps: {
                sx: {
                  "& .MuiMenuItem-root": {
                    "&:hover, &:focus": {
                      backgroundColor: "#E8F5E9",
                    },
                  },
                },
              },
            }}
            sx={{
              color: "#008000",
              fontWeight: "bold",
              "& .MuiSelect-icon": {
                color: "#008000"
              },
              "& .hover":{
                backgroundColor: "#E8F5E9"
              }
            }}
          >
            {["N3", "N2", "N1"].map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="flex min-w-[60px] items-center gap-3 text-secondary font-bold">
        <img src={point} alt=" " className="w-8 h-8"/>
        {points !== null ? points : "..."}
      </div>

      <div>
      {/* Nút IconButton chứa Avatar */}
      <IconButton
        onClick={handleClick}
        size="medium"
        sx={{
          "&:focus": {
            outline: "none",
          },
        }}
      >
        <Avatar src={user.avatarUrl} alt="Avatar" />
      </IconButton>

      {/* Menu dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem 
          onClick={handleProfileClick}
          sx={{
            "&:hover": {
              backgroundColor: "#E8F5E9",
            },
          }}
        >
          Cá nhân
        </MenuItem>
        <MenuItem 
          onClick={handleLogoutClick}
          sx={{
            "&:hover": {
              backgroundColor: "#E8F5E9",
            },
          }}
        >
          Đăng xuất
        </MenuItem>
      </Menu>

      <ProfilePopup
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onSave={handleProfileSave}
      />
    </div>
    </header>
  );
};

export default Header;
