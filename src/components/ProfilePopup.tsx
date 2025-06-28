import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Avatar,
  Grid
} from "@mui/material";
import { useEffect, useState } from "react";
import validator from "validator";

type ProfilePopupProps = {
  open: boolean;
  onClose: () => void;
  user: {
    email: string;
    username: string;
    dob: string;
    phone: string;
    avatarUrl: string;
  };
  onSave: (data: {
    dob: string;
    phone: string;
    password?: string;
    currentPassword?: string;
    avatarUrl: string;
  }) => void;
};

const avatarGroups = {
  "Mặc định": ["/avatars/avatar.svg"],
  "Hoa quả": Array.from({ length: 26 }, (_, i) => `/avatars/fruits/fruit${i + 1}.jpg`),
  "Động vật": Array.from({ length: 15 }, (_, i) => `/avatars/animals/animal${i + 1}.svg`),
  "Cây cối": Array.from({ length: 5 }, (_, i) => `/avatars/plants/plant${i + 1}.svg`),
};

export default function ProfilePopup({ open, onClose, user, onSave }: ProfilePopupProps) {
  const [form, setForm] = useState({ email: "", username: "", dob: "", phone: "", avatarUrl: "", password: "", currentPassword: "" });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
    const formatDob = (dob: string) => {
    if (!dob) return "";
    const date = new Date(dob);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  useEffect(() => {
    setForm({
      email: user.email ?? "",
      username: user.username ?? "",
      dob: formatDob(user.dob ?? ""),
      phone: user.phone ?? "",
      avatarUrl: user.avatarUrl ?? "",
      password: "",
      currentPassword: ""
    });
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // validate ngay khi thay đổi
    if (["dob", "phone"].includes(name)) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleAvatarSelect = (url: string) => {
    setForm({ ...form, avatarUrl: url });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(form);
  };

  const [formErrors, setFormErrors] = useState({
    password: "",
    currentPassword: "",
    dob: "",
    phone: "",
  });

  const validateField = (name: string, value: string): string => {
    switch (name) {
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

  const validateForm = () => {
    const errors = {
      currentPassword: "",
      password: "",
      dob: validateField("dob", form.dob),
      phone: validateField("phone", form.phone),
    };

    // Nếu nhập mật khẩu mới thì phải nhập mật khẩu hiện tại
    if (form.password) {
      if (!form.currentPassword) {
        errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
      }
      if (form.password === form.currentPassword) {
        errors.password = "Mật khẩu mới không được trùng với mật khẩu hiện tại.";
      } else if (
        !validator.isStrongPassword(form.password, {
          minLength: 6,
          minNumbers: 1,
          minSymbols: 1,
        })
      ) {
        errors.password = "Mật khẩu mới phải mạnh: ≥6 ký tự, có số và ký tự đặc biệt.";
      }
    }

    setFormErrors(errors);
    return !Object.values(errors).some((e) => e);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          paddingX: 6,
          paddingY: 2,
        },
      }}
    >
      <DialogContent className="flex flex-col overflow-auto scrollbar-hide">
        <div className="text-secondary font-bold text-2xl mb-4 text-center uppercase">
          Thông tin cá nhân
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-4 mb-2">
          {/* Avatar trái */}
          <div className="flex flex-col items-center md:w-1/3">
            <Avatar src={form.avatarUrl} alt="Avatar" sx={{ width: 200, height: 200 }} />
            <div className="!mt-4 !font-semibold !text-lg text-secondary">{form.username}</div>
            <div color="text.secondary">
              {form.email}
            </div>
          </div>

          {/* Form phải */}
          <form onSubmit={handleSubmit} className="space-y-3 flex-1">
            <div className="flex items-center gap-4">
              <TextField
                label="Ngày sinh (dd/mm/yyyy)"
                name="dob"
                value={form.dob ?? ""}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.dob}
                helperText={formErrors.dob}
              />
              <TextField
                label="Số điện thoại"
                name="phone"
                value={form.phone ?? ""}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </div>

            {/* Đổi mật khẩu */}
            {!showPasswordFields ? (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPasswordFields(true)}
                className="!bg-primary hover:!bg-secondary !text-white !font-bold !mt-4"
                sx={{
                  "&:focus": { outline: "none", boxShadow: "none" },
                }}
              >
                Đổi mật khẩu
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <TextField
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  type="password"
                  value={form.currentPassword}
                  onChange={handleChange}
                  fullWidth
                  error={!!formErrors.currentPassword}
                  helperText={formErrors.currentPassword}
                />
                <TextField
                  label="Mật khẩu mới"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  fullWidth
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              </div>
            )}

            {/* Collection avatar */}
            <div className="text-cyan_text text-xl font-bold !mt-6 !mb-4 text-center uppercase">
              avatar
            </div>
            <div className="overflow-y-auto max-h-[50vh] pr-2">
              {Object.entries(avatarGroups).map(([groupName, avatars]) => (
                <div key={groupName} className="mb-4">
                  <div className="font-semibold mb-2 text-cyan_text">
                    {groupName}
                  </div>
                  <Grid container spacing={2}>
                    {avatars.map((url) => (
                      <Grid item key={url}>
                        <Avatar
                          src={url}
                          alt={groupName}
                          sx={{
                            width: 96,
                            height: 96,
                            border: form.avatarUrl === url ? "3px solid #1976d2" : "2px solid transparent",
                            cursor: "pointer",
                            transition: "border 0.2s",
                          }}
                          onClick={() => handleAvatarSelect(url)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <Button
                variant="contained"
                type="submit"
                className="!bg-primary hover:!bg-secondary !text-white !font-bold"
                sx={{
                  "&:focus": { outline: "none", boxShadow: "none" },
                }}
              >
                Lưu thay đổi
              </Button>
              <Button
                variant="contained"
                onClick={onClose}
                className="!bg-black hover:!bg-secondary !text-white !font-bold"
              >
                Đóng
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
