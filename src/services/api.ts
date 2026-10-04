// Định nghĩa Base URL của bạn ở đây
const API_BASE_URL = "https://api-furniturehub-minhdevops.up.railway.app";

// Hàm gọi API Đăng nhập
export const loginApi = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Đăng nhập thất bại.");
  }
  return data;
};

// Hàm gọi API Đăng ký
export const registerApi = async (
  fullName: string,
  email: string,
  password: string,
  phone: string,
) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName,
      email,
      password,
      phone,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Đăng ký thất bại.");
  }
  return data;
};
