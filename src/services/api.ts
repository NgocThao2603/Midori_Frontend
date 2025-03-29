import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Thay thế bằng URL thực tế của backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

// Đăng nhập người dùng
export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};
