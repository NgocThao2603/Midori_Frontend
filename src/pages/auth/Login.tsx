import { useState } from "react";
import { useNavigate } from "react-router-dom";
import validator from "validator";
import { toast } from 'react-toastify';
import { TextField, Button } from "@mui/material";
import Header from "../../components/Header";
import { loginUser } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "",
    password: "",
  });

  const validateEmail = (email: string): boolean => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "email":
        if (!value) return "Email không được để trống.";
        if (!validateEmail(value)) return "Email không hợp lệ.";
        return "";
      case "password":
        if (!value) return "Mật khẩu không được để trống.";
        if (!validator.isStrongPassword(value, { minLength: 6, minNumbers: 1, minSymbols: 1 })) {
          return "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ cái viết hoa, viết thường, số và ký tự đặc biệt.";
        }
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setFormErrors({
      ...formErrors,
      [name]: error
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setFormErrors({
      ...formErrors,
      [name]: "",
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);
    
    if (emailError || passwordError) {
      setFormErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginUser(formData);
      const token = response?.token;
    
      if (token) {
        localStorage.setItem("token", token);
        toast.success("Đăng nhập thành công!");
        login(token);
        navigate("/home");
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green_pastel2 relative z-0">
      <Header isLoggedIn={false} level={""} setLevel={function (): void {
        throw new Error("Function not implemented.");
      } }/>
      <div className="absolute w-16 h-16 bg-green_pastel rounded-full bottom-[35vh] left-[37vw] z-[-1]"></div>
      <main className="bg-white px-12 py-8 rounded-2xl w-[400px] text-center">
        <h2 className="text-2xl font-bold text-secondary">Đăng nhập</h2>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <TextField
            label="Email *"
            variant="outlined"
            fullWidth
            margin="normal"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(formErrors.email)}
            helperText={formErrors.email}
            className="bg-white"
          />
          <TextField
            label="Mật khẩu *"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(formErrors.password)}
            helperText={formErrors.password}
            className="bg-white"
          />
          
          <div className="flex justify-between items-center text-sm text-secondary mt-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Ghi nhớ tôi
            </label>
            <a href="#" className="text-secondary hover:underline">Quên mật khẩu?</a>
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="!bg-primary hover:!bg-secondary !text-white !font-bold !text-xl !py-4 !mt-6 !rounded-lg !focus:outline-none"
            sx={{
              "&:focus": { outline: "none", boxShadow: "none" },
            }}
          >
            Đăng nhập
          </Button>
        </form>

        <p className="text-sm mt-4 text-gray-500">
          Bạn chưa có tài khoản?{" "}
          <a href="/register" className="text-green_border font-bold hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </main>
    </div>
  );
};

export default Login;
