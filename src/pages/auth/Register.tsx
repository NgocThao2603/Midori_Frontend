import { useState } from "react";
import { useNavigate } from "react-router-dom";
import validator from "validator";
import { toast } from "react-toastify";
import { TextField, Button } from "@mui/material";
import Header from "../../components/Header";
import { checkExist, registerUser } from "../../services/api";

interface FormData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  dob: string;
  phone: string;
}

interface FormErrors {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  dob: string;
  phone: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    dob: "",
    phone: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    dob: "",
    phone: "",
  });

  const validateEmail = (email: string): boolean => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case "username":
        return value ? "" : "Tên người dùng không được để trống.";
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
      case "password_confirmation":
        if (!value) return "Mật khẩu xác nhận không được để trống.";
        return value === formData.password ? "" : "Mật khẩu xác nhận không khớp.";
      case "dob":
        if (!value) return "Ngày sinh không được để trống.";
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return "Ngày sinh phải có định dạng DD/MM/YYYY.";
        const [day, month, year] = value.split("/").map((v) => parseInt(v, 10));
        const date = new Date(year, month - 1, day);
        if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
          return "Ngày sinh không hợp lệ.";
        }
        return "";
      case "phone":
        return validator.isMobilePhone(value, "vi-VN") ? "" : "Số điện thoại không hợp lệ.";
      default:
        return "";
    }
  };
  
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;
    
    setFormData({
      ...formData,
      [fieldName]: value,
    });
    
    // Tạo object tạm để lưu lỗi
    let updatedErrors = { ...formErrors };
    
    // Kiểm tra lỗi validation cơ bản
    const validationError = validateField(fieldName, value);
    
    if (fieldName === "email" && value && !validationError) {
      try {
        await checkExist({ email: value });
        updatedErrors[fieldName] = "";
      } catch (error) {
        updatedErrors[fieldName] = "Email đã tồn tại.";
      }
    } else if (fieldName === "username" && value && !validationError) {
      try {
        await checkExist({ username: value });
        updatedErrors[fieldName] = "";
      } catch (error) {
        updatedErrors[fieldName] = "Tên người dùng đã tồn tại.";
      }
    } else {
      updatedErrors[fieldName] = validationError;
    }

    setFormErrors(updatedErrors);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Kiểm tra tất cả các trường
    const errors: FormErrors = {
      username: validateField("username", formData.username),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      password_confirmation: validateField("password_confirmation", formData.password_confirmation),
      dob: validateField("dob", formData.dob),
      phone: validateField("phone", formData.phone),
    };

    // Kiểm tra email và username trùng
    if (!errors.email) {
      try {
        await checkExist({ email: formData.email });
      } catch (error) {
        errors.email = "Email trung roi";
      }
    }

    if (!errors.username) {
      try {
        await checkExist({ username: formData.username });
      } catch (error) {
        errors.username = "Tên người dùng đã tồn tại";
      }
    }

    // Nếu có lỗi, hiển thị và không submit
    if (Object.values(errors).some((error) => error)) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser(formData);
      toast.success("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green_pastel2 relative z-0">
      <Header isLoggedIn={false} level={""} setLevel={() => {}} />
      <div className="absolute w-16 h-16 bg-green_pastel rounded-full bottom-[35vh] left-[31vw] z-[-1]"></div>
      <main className="bg-white px-12 py-8 rounded-2xl w-[600px] text-center mt-12">
        <h2 className="text-2xl font-bold text-secondary">Đăng ký</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-5">
            <TextField
              label="Email *"
              name="email"
              type="email"
              fullWidth
              onChange={handleChange}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
            />
            <TextField
              label="Tên người dùng *"
              name="username"
              fullWidth
              onChange={handleChange}
              error={Boolean(formErrors.username)}
              helperText={formErrors.username}
            /> 
          </div>
          
          <div className="flex gap-5">
            <TextField
              label="Mật khẩu *"
              name="password"
              type="password"
              fullWidth
              onChange={handleChange}
              error={Boolean(formErrors.password)}
              helperText={formErrors.password}
            />
            <TextField
              label="Ngày sinh * (dd/mm/yyyy)"
              name="dob"
              fullWidth
              value={formData.dob}
              onChange={handleChange}
              error={Boolean(formErrors.dob)}
              helperText={formErrors.dob}
            />
          </div>
          
          <div className="flex gap-5">
            <TextField
              label="Nhập lại mật khẩu *"
              name="password_confirmation"
              type="password"
              fullWidth
              onChange={handleChange}
              error={Boolean(formErrors.password_confirmation)}
              helperText={formErrors.password_confirmation}
            />
            
            <TextField
              label="Số điện thoại *"
              name="phone"
              fullWidth
              onChange={handleChange}
              error={Boolean(formErrors.phone)}
              helperText={formErrors.phone}
            />
          </div>
          
          <Button 
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            className="!bg-primary hover:!bg-secondary !text-white !font-bold !text-xl !py-4 !mt-6 !rounded-lg !focus:outline-none"
            sx={{
              "&:focus": { outline: "none", boxShadow: "none" },
            }}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </form>
        <p className="text-sm mt-4 text-gray-500">
          Bạn đã có tài khoản?{" "}
          <a href="/login" className="text-green_border font-bold hover:underline">
            Đăng nhập ngay
          </a>
        </p>
      </main>
    </div>
  );
};

export default Register;
