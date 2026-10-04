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

// Lấy thông tin hồ sơ của Customer đang đăng nhập
export const getUserProfileApi = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải thông tin hồ sơ.");
  }
  return data;
};

// Cập nhật tên và số điện thoại của Customer
export const updateUserProfileApi = async (token: string, name: string, phone: string) => {
  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể cập nhật hồ sơ.");
  }
  return data;
};

// Lấy danh sách địa chỉ giao hàng
export const getAddressesApi = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/addresses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải danh sách địa chỉ.");
  }
  return data;
};

// Tạo địa chỉ giao hàng mới
export const createAddressApi = async (token: string, addressData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tạo địa chỉ mới.");
  }
  return data;
};

// Cập nhật địa chỉ theo ID
export const updateAddressApi = async (token: string, id: string, addressData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể cập nhật địa chỉ.");
  }
  return data;
};

// Xóa địa chỉ theo ID
export const deleteAddressApi = async (token: string, id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể xóa địa chỉ.");
  }
  return data;
};

// Đặt địa chỉ làm mặc định
export const setDefaultAddressApi = async (token: string, id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/addresses/${id}/default`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể đặt địa chỉ mặc định.");
  }
  return data;
};

// Lấy danh sách sản phẩm đang hoạt động
export const getProductsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải danh sách sản phẩm.");
  }
  return data;
};

// Lấy danh sách danh mục (Category) đang hoạt động
export const getCategoriesApi = async () => {
  const response = await fetch(`${API_BASE_URL}/api/categories`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải danh sách danh mục.");
  }
  return data;
};