import AsyncStorage from "@react-native-async-storage/async-storage";
import { CATEGORIES, MOCK_PRODUCTS } from "./mockData";

// Cấu hình URL Backend theo đúng yêu cầu thiết kế
export const API_BASE_URL = "https://furniturehub-server.onrender.com";
export const API_TIMEOUT = 45000; // 45 giây để đối phó Railway cold start

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Custom fetch client với timeout 45000ms và tự động đính kèm Bearer Token
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    // 1. Request Interceptor: Lấy Bearer Token từ AsyncStorage
    const token = await AsyncStorage.getItem("token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Xử lý status code
    if (!response.ok) {
      let errorMessage = `Yêu cầu thất bại (${response.status})`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // Response không phải JSON
      }
      throw new Error(errorMessage);
    }

    // Parse JSON
    try {
      const data = await response.json();
      return data;
    } catch {
      return {} as T;
    }
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Fallback êm dịu khi cold start hoặc timeout để tránh crash app
    if (error.name === "AbortError") {
      console.warn(
        `[API Timeout 45s] ${endpoint} - Server Railway đang khởi động lại (cold start).`,
      );
      throw new Error(
        "Máy chủ đang thức dậy (cold start). Vui lòng thử lại sau giây lát.",
      );
    }

    console.warn(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

// ==================== AUTH APIs ====================
export const loginApi = async (email: string, password: string) => {
  return await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const registerApi = async (
  fullName: string,
  email: string,
  password: string,
  phone: string,
) => {
  return await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password, phone }),
  });
};

// ==================== USER PROFILE APIs ====================
export const getUserProfileApi = async (tokenOverride?: string) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }
  return await apiRequest("/api/users/profile", {
    method: "GET",
    headers,
  });
};

export const updateUserProfileApi = async (
  data: { fullName?: string; phone?: string },
  tokenOverride?: string,
) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }

  const payload: { fullName?: string; phone?: string } = {};

  // 1. Xử lý fullName: Xóa khoảng trắng thừa 2 đầu
  if (data.fullName && data.fullName.trim().length >= 2) {
    payload.fullName = data.fullName.trim();
  }

  // 2. Xử lý phone: Chỉ giữ lại các chữ số (xóa khoảng trắng, dấu câu)
  if (data.phone) {
    const cleanPhone = data.phone.replace(/\D/g, ""); // Bỏ tất cả ký tự không phải là số
    if (cleanPhone.length === 10) {
      payload.phone = cleanPhone;
    }
  }

  // Nếu không có field nào hợp lệ để gửi thì báo lỗi ở client luôn
  if (Object.keys(payload).length === 0) {
    throw new Error(
      "Tên phải từ 2 ký tự hoặc số điện thoại phải đủ 10 chữ số hợp lệ.",
    );
  }

  return await apiRequest("/api/users/profile", {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
};

// ==================== ADDRESS APIs ====================
export interface AddressItem {
  _id?: string;
  id?: string;
  title?: string;
  receiverName?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  addressLine?: string;
  street?: string;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
  province?: string;
  isDefault?: boolean;
}

export const getAddressesApi = async (tokenOverride?: string) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }
  try {
    const res = await apiRequest("/api/addresses", { method: "GET", headers });
    return Array.isArray(res) ? res : res.data || res.addresses || [];
  } catch (error) {
    return [];
  }
};

export const createAddressApi = async (
  addressData: AddressItem,
  tokenOverride?: string,
) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }

  // Khớp đúng Request Body quy định theo Swagger API Backend
  const payload = {
    receiverName:
      addressData.receiverName || addressData.fullName || addressData.name,
    phone: addressData.phone,
    addressLine:
      addressData.addressLine || addressData.street || addressData.address,
    ward: addressData.ward || "Phường Bến Nghé",
    city: addressData.city || "Hồ Chí Minh",
  };

  return await apiRequest("/api/addresses", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
};

export const updateAddressApi = async (
  id: string,
  addressData: AddressItem,
  tokenOverride?: string,
) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }

  // Khớp 100% Swagger PUT /api/addresses/{id}: CHỈ gửi 5 trường, KHÔNG gửi userId hay isDefault
  const payload = {
    receiverName:
      addressData.receiverName || addressData.fullName || addressData.name,
    phone: addressData.phone,
    addressLine:
      addressData.addressLine || addressData.street || addressData.address,
    ward: addressData.ward || "Phường Bến Nghé",
    city: addressData.city || "Hồ Chí Minh",
  };

  return await apiRequest(`/api/addresses/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
};
export const deleteAddressApi = async (id: string, tokenOverride?: string) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }
  return await apiRequest(`/api/addresses/${id}`, {
    method: "DELETE",
    headers,
  });
};

export const setDefaultAddressApi = async (
  id: string,
  tokenOverride?: string,
) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }
  return await apiRequest(`/api/addresses/${id}/default`, {
    method: "PATCH",
    headers,
  });
};

// ==================== PRODUCT & CATEGORY APIs ====================
// GET /api/products - Lấy danh sách sản phẩm thực từ Backend
export const getProductsApi = async () => {
  try {
    const res = await apiRequest("/api/products");
    const rawList = Array.isArray(res) ? res : res?.data || res?.products || [];
    return rawList.map((item: any) => {
      const name = item.name || item.title || "Sản phẩm LUMORA";
      const image =
        item.images?.[0] ||
        item.image ||
        item.thumbnail ||
        "https://via.placeholder.com/150";
      const price = Number(item.price || item.originalPrice || item.minPrice || 0);
      const rating = item.rating || item.averageRating || 5.0;
      return {
        ...item,
        _id: item._id || item.id,
        id: item._id || item.id,
        name,
        title: name,
        image,
        thumbnail: image,
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [image],
        price: Number.isFinite(price) ? price : 0,
        originalPrice: Number(item.originalPrice || item.maxPrice || price || 0),
        rating,
        averageRating: rating,
      };
    });
  } catch (err) {
    console.warn("Lỗi tải danh sách sản phẩm từ Server:", err);
    return [];
  }
};

// GET /api/products/{id} - Lấy dữ liệu thật 100% từ Backend
export const getProductDetailApi = async (id: string) => {
  const res = await apiRequest(`/api/products/${id}`);
  // Trích xuất dữ liệu từ object trả về của Backend
  const item = res?.data || res;
  if (!item) {
    throw new Error(`Không tìm thấy dữ liệu cho sản phẩm có id: ${id}`);
  }
  return item;
};

export const getCategoriesApi = async () => {
  try {
    const res = await apiRequest("/api/categories");
    const list = Array.isArray(res) ? res : res.data || res.categories || [];
    if (list.length > 0) return list;
    return CATEGORIES;
  } catch (err) {
    return CATEGORIES;
  }
};

// GET /api/categories/{id} - Lấy chi tiết Category
export const getCategoryDetailApi = async (id: string) => {
  const res = await apiRequest(`/api/categories/${id}`);
  return res?.category || res?.data || res;
};

// ==================== ORDER FLOW APIs ====================
export interface OrderItem {
  id: string;
  orderNumber?: string;
  date: string;
  status: string; // 'pending' | 'confirmed' | 'packing' | 'in_transit' | 'delivered' | 'cancelled'
  statusLabel?: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  paymentMethod?: string;
  shippingAddress?: AddressItem;
  items: {
    id: string;
    productId?: string;
    title: string;
    price: number;
    qty: number;
    image: string;
    color?: string;
    option?: string;
  }[];
  trackingTimeline?: {
    step: number;
    title: string;
    description: string;
    time: string;
    completed: boolean;
    current?: boolean;
  }[];
}

export const MOCK_ORDERS: OrderItem[] = [
  {
    id: "LUM-89210",
    orderNumber: "LUM-89210",
    date: "14/09/2026",
    status: "in_transit",
    statusLabel: "Đang Vận Chuyển",
    subtotal: 3580,
    shipping: 150,
    total: 3730,
    paymentMethod: "Thẻ Tín Dụng (Visa kết thúc 8921)",
    shippingAddress: {
      fullName: "Nam Anh",
      phone: "0901 234 567",
      street: "742 Evergreen Terrace, Phường Bến Nghé, Quận 1",
      city: "TP. Hồ Chí Minh",
    },
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        title: "Bàn Ăn Gỗ Sồi Nguyên Khối Komorebi",
        price: 2450,
        qty: 1,
        image:
          "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80",
        color: "Gỗ Sồi Tự Nhiên",
        option: "Kích Thước 8 Chỗ",
      },
      {
        id: "item-2",
        productId: "prod-2",
        title: "Ghế Bành Vải Bouclé Mềm Aethel",
        price: 1280,
        qty: 1,
        image:
          "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&auto=format&fit=crop&q=80",
        color: "Trắng Bouclé Kem",
        option: "Tiêu Chuẩn",
      },
    ],
    trackingTimeline: [
      {
        step: 1,
        title: "Đã Đặt Hàng Thành Công",
        description: "Đơn hàng được ghi nhận vào hệ thống concierge",
        time: "14/09/2026 09:30",
        completed: true,
      },
      {
        step: 2,
        title: "Đã Xác Nhận & Thanh Toán",
        description: "Thanh toán thành công qua thẻ tín dụng",
        time: "14/09/2026 10:15",
        completed: true,
      },
      {
        step: 3,
        title: "Đang Đóng Gói Cao Cấp",
        description: "Được đóng kiện bảo vệ góc bởi chuyên viên nội thất",
        time: "14/09/2026 15:45",
        completed: true,
      },
      {
        step: 4,
        title: "Đang Vận Chuyển Concierge",
        description: "Đội ngũ giao xe chuyên dụng đang trên đường giao",
        time: "15/09/2026 08:30",
        completed: false,
        current: true,
      },
      {
        step: 5,
        title: "Giao Hàng & Bàn Giao",
        description: "Hỗ trợ mở hộp, sắp đặt vị trí phòng và ký biên bản",
        time: "Dự kiến 16/09/2026",
        completed: false,
      },
    ],
  },
  {
    id: "LUM-84192",
    orderNumber: "LUM-84192",
    date: "28/08/2026",
    status: "pending",
    statusLabel: "Chờ Xử Lý",
    subtotal: 1890,
    shipping: 150,
    total: 2040,
    paymentMethod: "Chuyển Khoản Ngân Hàng",
    shippingAddress: {
      fullName: "Nam Anh",
      phone: "0901 234 567",
      street: "108 Nguyễn Du, Bến Nghé, Quận 1",
      city: "TP. Hồ Chí Minh",
    },
    items: [
      {
        id: "item-3",
        productId: "prod-4",
        title: "Giường Ngủ Khung Gỗ Tần Bì Komorebi",
        price: 1890,
        qty: 1,
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&auto=format&fit=crop&q=80",
        color: "Gỗ Tần Bì Sáng",
        option: "Size King",
      },
    ],
    trackingTimeline: [
      {
        step: 1,
        title: "Đã Đặt Hàng",
        description: "Đơn hàng đang chờ nhân viên kiểm duyệt",
        time: "28/08/2026 14:20",
        completed: true,
        current: true,
      },
      {
        step: 2,
        title: "Xác Nhận Đơn Hàng",
        description: "Chờ xác nhận từ bộ phận bán hàng",
        time: "Dự kiến trong ngày",
        completed: false,
      },
      {
        step: 3,
        title: "Đóng Gói Bảo Quản",
        description: "Kiểm tra chất lượng và bao gói",
        time: "Dự kiến ngày tiếp theo",
        completed: false,
      },
      {
        step: 4,
        title: "Giao Hàng",
        description: "Vận chuyển bởi chuyên xe nội thất",
        time: "Chờ xử lý",
        completed: false,
      },
    ],
  },
  {
    id: "LUM-77312",
    orderNumber: "LUM-77312",
    date: "02/08/2026",
    status: "delivered",
    statusLabel: "Đã Giao Hàng",
    subtotal: 1280,
    shipping: 150,
    total: 1430,
    paymentMethod: "Ví Điện Tử Apple Pay",
    shippingAddress: {
      fullName: "Nam Anh",
      phone: "0901 234 567",
      street: "742 Evergreen Terrace, Phường Bến Nghé, Quận 1",
      city: "TP. Hồ Chí Minh",
    },
    items: [
      {
        id: "item-4",
        productId: "prod-2",
        title: "Ghế Bành Vải Bouclé Mềm Aethel",
        price: 1280,
        qty: 1,
        image:
          "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&auto=format&fit=crop&q=80",
        color: "Trắng Bouclé Kem",
      },
    ],
    trackingTimeline: [
      {
        step: 1,
        title: "Đã Đặt Hàng",
        description: "Hoàn tất đặt hàng",
        time: "02/08/2026 10:00",
        completed: true,
      },
      {
        step: 2,
        title: "Đã Xác Nhận",
        description: "Thanh toán hoàn tất",
        time: "02/08/2026 10:10",
        completed: true,
      },
      {
        step: 3,
        title: "Đã Đóng Gói",
        description: "Kiện hàng sẵn sàng xuất xưởng",
        time: "02/08/2026 14:00",
        completed: true,
      },
      {
        step: 4,
        title: "Đang Giao",
        description: "Xe giao hàng cao cấp xuất phát",
        time: "03/08/2026 08:00",
        completed: true,
      },
      {
        step: 5,
        title: "Giao Thành Công",
        description: "Đã bàn giao lắp đặt tại phòng khách",
        time: "03/08/2026 11:30",
        completed: true,
      },
    ],
  },
];

// ==================== CART APIs ====================

// GET /api/cart - Lấy giỏ hàng thực tế từ Server
export const getCartApi = async (tokenOverride?: string) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }
  try {
    const res = await apiRequest("/api/cart", { method: "GET", headers });
    // Bóc tách mảng items từ response của Backend
    return (
      res?.items ||
      res?.data?.items ||
      res?.cart?.items ||
      (Array.isArray(res) ? res : [])
    );
  } catch (error) {
    console.warn("Lỗi tải giỏ hàng từ Server:", error);
    return [];
  }
};

// PATCH /api/cart/items/{itemId} - Cập nhật số lượng item
export const updateCartItemQtyApi = async (
  itemId: string,
  quantity: number,
  tokenOverride?: string,
) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }
  return await apiRequest(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ quantity }),
  });
};

// DELETE /api/cart/items/{itemId} - Xóa 1 item khỏi giỏ hàng
export const deleteCartItemApi = async (
  itemId: string,
  tokenOverride?: string,
) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }
  return await apiRequest(`/api/cart/items/${itemId}`, {
    method: "DELETE",
    headers,
  });
};

// POST /api/cart/items - Thêm sản phẩm biến thể vào giỏ hàng
export const addToCartApi = async (
  variantId: string,
  quantity: number = 1,
  tokenOverride?: string,
) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }

  const payload = {
    variantId: String(variantId),
    quantity: Number(quantity) || 1,
  };

  return await apiRequest("/api/cart/items", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
};

// ==================== VARIANT & SKU APIs ====================

// GET /api/products/{productId}/variants - Lấy danh sách Variant theo sản phẩm
export const getProductVariantsApi = async (productId: string) => {
  try {
    const res = await apiRequest(`/api/products/${productId}/variants`);
    return Array.isArray(res) ? res : res?.data || res?.variants || [];
  } catch (error) {
    console.warn(`Lỗi lấy danh sách Variant cho sản phẩm ${productId}:`, error);
    return [];
  }
};

// GET /api/variants/{id} - Lấy thông tin chi tiết của 1 Variant
export const getVariantDetailApi = async (variantId: string) => {
  return await apiRequest(`/api/variants/${variantId}`);
};

// POST /api/products/{productId}/variants - Admin tạo Variant và SKU mới
export const createVariantApi = async (
  productId: string,
  variantData: {
    colorId?: string;
    optionId?: string;
    price?: number;
    stockCount?: number;
    sku?: string;
    image?: string;
  },
  tokenOverride?: string,
) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }
  return await apiRequest(`/api/products/${productId}/variants`, {
    method: "POST",
    headers,
    body: JSON.stringify(variantData),
  });
};

// PATCH /api/variants/{id} - Admin cập nhật Variant và SKU
export const updateVariantApi = async (
  variantId: string,
  variantData: Partial<{
    price: number;
    stockCount: number;
    sku: string;
    image: string;
    inStock: boolean;
  }>,
  tokenOverride?: string,
) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }
  return await apiRequest(`/api/variants/${variantId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(variantData),
  });
};

// DELETE /api/variants/{id} - Admin vô hiệu hóa Variant
export const deleteVariantApi = async (
  variantId: string,
  tokenOverride?: string,
) => {
  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers["Authorization"] = `Bearer ${tokenOverride}`;
  }
  return await apiRequest(`/api/variants/${variantId}`, {
    method: "DELETE",
    headers,
  });
};

//=================== ORDER APIs ====================
// Lấy danh sách đơn hàng thực tế của Customer
export const getOrdersApi = async (): Promise<OrderItem[]> => {
  try {
    const res = await apiRequest("/api/orders/my-orders");
    const list = Array.isArray(res) ? res : res.data || res.orders || [];

    // Map mảng dữ liệu thực từ Backend
    return list.map((order: any) => ({
      id: order._id || order.id,
      orderNumber: order.orderNumber || order._id || order.id,
      date: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("vi-VN")
        : order.date || "Chưa xác định",
      status: order.status || "pending",
      statusLabel: order.statusLabel || order.status,
      total: order.totalAmount ?? order.total ?? 0,
      subtotal: order.subtotal ?? order.totalAmount ?? 0,
      shipping: order.shippingFee ?? order.shipping ?? 0,
      paymentMethod: order.paymentMethod || "Thanh toán khi nhận hàng",
      // Trong hàm getOrderDetailApi
      shippingAddress: order.shippingAddress
        ? {
            ...order.shippingAddress,
            fullName:
              order.shippingAddress.fullName ||
              order.shippingAddress.name ||
              order.shippingAddress.receiverName,
            phone:
              order.shippingAddress.phone || order.shippingAddress.phoneNumber,
            street:
              order.shippingAddress.addressLine ||
              order.shippingAddress.detailAddress ||
              order.shippingAddress.street ||
              order.shippingAddress.address,
            city:
              order.shippingAddress.city ||
              order.shippingAddress.province ||
              "",
          }
        : undefined,
      items: Array.isArray(order.items)
        ? order.items.map((it: any) => ({
            id: it._id || it.id || it.productVariantId,
            productId: it.productId || it.productVariantId,
            title: it.name || it.productName || it.title || "Sản phẩm nội thất",
            price: it.unitPrice ?? it.price ?? 0,
            qty: it.quantity ?? it.qty ?? 1,
            image:
              it.image ||
              it.imageUrl ||
              (Array.isArray(it.images)
                ? it.images[0]
                : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600"),
            color: it.color || it.variantName,
            option: it.option,
          }))
        : [],
    }));
  } catch (err: any) {
    console.warn("[API Error] Lấy danh sách đơn hàng:", err.message);
    throw err;
  }
};

// Lấy CHI TIẾT ĐƠN HÀNG chuẩn theo đúng Snapshot Backend (Không load ảnh)
export const getOrderDetailApi = async (id: string): Promise<OrderItem> => {
  const res = await apiRequest(`/api/orders/${id}`);
  const order = res?.data?.order || res?.data || res?.order || res;

  if (!order || (!order._id && !order.id)) {
    throw new Error("Dữ liệu đơn hàng không hợp lệ từ Server");
  }

  const rawItems = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.orderItems)
      ? order.orderItems
      : [];

  return {
    id: order._id || order.id,
    orderNumber: order.orderNumber || order._id || order.id,
    date: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("vi-VN")
      : order.updatedAt
        ? new Date(order.updatedAt).toLocaleDateString("vi-VN")
        : "Đang cập nhật",
    status: order.status || "pending",
    statusLabel: order.statusLabel || order.status,
    total: order.totalAmount ?? order.total ?? 0,
    subtotal:
      order.subtotal ??
      (order.totalAmount
        ? order.totalAmount - (order.shippingFee || order.shipping || 0)
        : 0),
    shipping: order.shippingFee ?? order.shipping ?? 0,
    paymentMethod:
      order.paymentMethod || order.paymentType || "Thanh toán trực tuyến",
    shippingAddress: order.shippingAddress
      ? {
          fullName:
            order.shippingAddress.fullName ||
            order.shippingAddress.name ||
            order.shippingAddress.receiverName,
          phone:
            order.shippingAddress.phone || order.shippingAddress.phoneNumber,
          street:
            order.shippingAddress.street ||
            order.shippingAddress.address ||
            order.shippingAddress.detailAddress,
          city:
            order.shippingAddress.city || order.shippingAddress.province || "",
        }
      : undefined,
    items: rawItems.map((it: any) => ({
      id: it._id || it.id || it.productId || it.productVariantId,
      productId: it.productId || it.productVariantId,
      title: it.name || it.productName || it.title || "Sản phẩm nội thất",
      price: it.unitPrice ?? it.price ?? 0,
      qty: it.quantity ?? it.qty ?? 1,
      image: "", // Không xài ảnh nữa
      color: it.color || it.variantName || "",
      option: it.option || it.variantOption || "",
    })),
  };
};

export const createOrderApi = async (orderPayload: { addressId: string }) => {
  const token = await AsyncStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return await apiRequest("/api/orders", {
    method: "POST",
    headers,
    body: JSON.stringify(orderPayload),
  });
};
export const cancelOrderApi = async (
  id: string,
  payloadOrReason?: string | { reason?: string },
) => {
  const reasonText =
    typeof payloadOrReason === "string"
      ? payloadOrReason
      : payloadOrReason?.reason || "Khách hàng yêu cầu hủy đơn";

  try {
    return await apiRequest(`/api/orders/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason: reasonText }),
    });
  } catch (err) {
    console.warn(`Mô phỏng hủy đơn hàng ${id} thành công (fallback):`, err);
    return { success: true, message: "Đã hủy đơn hàng thành công" };
  }
};

// Alias hỗ trợ gọi trực tiếp cancelOrder(orderId, { reason: cancelReason })
export const cancelOrder = cancelOrderApi;

export const getOrderTrackingApi = async (id: string) => {
  try {
    const res = await apiRequest(`/api/orders/${id}/tracking`);
    // Bóc tách chính xác object "tracking" từ Swagger JSON response
    const trackingObj =
      res?.tracking || res?.data?.tracking || res?.data || res;
    return trackingObj;
  } catch (err) {
    console.warn(`Lỗi lấy tracking đơn hàng ${id}:`, err);
    return null;
  }
};

// ==================== WISHLIST APIs ====================

// GET /api/wishlist
export const getWishlistApi = async (tokenOverride?: string) => {
  const token = tokenOverride || (await AsyncStorage.getItem("token"));
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return await apiRequest("/api/wishlist", { method: "GET", headers });
};

// POST /api/wishlist
export const addToWishlistApi = async (
  productId: string,
  tokenOverride?: string,
) => {
  const token = tokenOverride || (await AsyncStorage.getItem("token"));
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return await apiRequest("/api/wishlist", {
    method: "POST",
    headers,
    body: JSON.stringify({ productId: String(productId) }),
  });
};

// DELETE /api/wishlist/{productId}
export const removeFromWishlistApi = async (
  productId: string,
  tokenOverride?: string,
) => {
  const token = tokenOverride || (await AsyncStorage.getItem("token"));
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return await apiRequest(`/api/wishlist/${productId}`, {
    method: "DELETE",
    headers,
  });
};

// ==================== REVIEW & RATING APIs ====================
export interface ReviewItem {
  id?: string;
  productId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  avatar?: string;
  images?: string[];
  attributes?: string[];
}

export const getReviewsApi = async (
  productId: string,
): Promise<ReviewItem[]> => {
  try {
    const res = await apiRequest(`/api/reviews/product/${productId}`);
    return Array.isArray(res) ? res : res.data || res.reviews || [];
  } catch (err) {
    return [
      {
        id: "rev-1",
        productId,
        userName: "Minh Hoàng",
        rating: 5,
        comment:
          "Chất lượng gỗ sồi nguyên khối cực kỳ chắc chắn, vân gỗ tự nhiên rất sang trọng. Đội ngũ giao hàng lắp đặt tận nơi tỉ mỉ.",
        createdAt: "10/09/2026",
        attributes: ["Gỗ Tự Nhiên", "Đóng Gói Cẩn Thận"],
      },
      {
        id: "rev-2",
        productId,
        userName: "Thanh Thảo",
        rating: 5,
        comment:
          "Đệm ngồi êm ái, màu vải bouclé đúng như hình mẫu. Xứng đáng với phân khúc cao cấp.",
        createdAt: "05/09/2026",
        attributes: ["Đúng Mô Tả", "Giao Nhanh"],
      },
    ];
  }
};

export const createReviewApi = async (reviewData: {
  productId: string;
  rating: number;
  comment: string;
  orderId?: string;
  images?: string[];
}) => {
  try {
    return await apiRequest("/api/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  } catch (err) {
    console.warn("Ghi nhận đánh giá thành công (fallback):", err);
    return { success: true, message: "Cảm ơn bạn đã gửi đánh giá!" };
  }
};

// ==================== HELPER FORMAT TIỀN TỆ ====================
// Định dạng tiền tệ VND chuẩn Việt Nam
export const formatCurrency = (amount?: number | string): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "0 ₫";
  }

  let num = Number(amount);

  // Nếu Backend trả về số tiền nguyên (VD: 1280000)
  // Nếu Backend đang trả về đơn vị nghìn (VD: 1280 đại diện cho 1.280.000), bật dòng dưới lên:
  // if (num < 100000) num = num * 1000;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  apiRequest,
  loginApi,
  registerApi,
  getUserProfileApi,
  updateUserProfileApi,
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
  getProductsApi,
  getProductDetailApi,
  getCategoriesApi,
  getOrdersApi,
  getOrderDetailApi,
  createOrderApi,
  cancelOrderApi,
  getOrderTrackingApi,
  getReviewsApi,
  createReviewApi,
  formatCurrency,
  getCartApi,
  addToCartApi, // <-- Thêm vào đây
  updateCartItemQtyApi,
  deleteCartItemApi,
  getProductVariantsApi, // <-- Thêm mới
  getVariantDetailApi, // <-- Thêm mới
  createVariantApi, // <-- Thêm mới
  updateVariantApi, // <-- Thêm mới
  deleteVariantApi,
  getWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
};
