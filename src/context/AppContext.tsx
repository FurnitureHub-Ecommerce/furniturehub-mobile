import {
  addToCartApi,
  addToWishlistApi,
  deleteCartItemApi,
  getCartApi,
  getProductVariantsApi,
  getWishlistApi,
  removeFromWishlistApi,
  updateCartItemQtyApi,
} from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartItem {
  _id?: string;
  id?: string;
  productId?: string;
  product?: any;
  quantity: number;
  qty?: number;
  price?: number;
  unitPrice?: number;
  selectedColor?: any;
  selectedOption?: any;
  productVariant?: any;
}

interface AppContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  refreshCart: () => Promise<void>;
  addToCart: (
    product: any,
    quantity?: number,
    selectedColor?: any,
    selectedOption?: any
  ) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  wishlistIds: Set<string>;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const refreshCart = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const items = await getCartApi(token || undefined);
      if (Array.isArray(items)) {
        setCart(items);
      }
    } catch (err) {
      console.warn("Lỗi đồng bộ giỏ hàng từ Server:", err);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const cartCount = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.quantity ?? item.qty ?? 1),
      0,
    );
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item: any) => {
      const price = Number(
        item.price ??
          item.productVariant?.price ??
          item.product?.price ??
          item.unitPrice ??
          0,
      );
      const quantity = Number(item.quantity ?? item.qty ?? 1);
      return sum + price * quantity;
    }, 0);
  }, [cart]);

  const shipping = 0;
  const total = subtotal + shipping;

// Thêm vào giỏ hàng - Gọi 100% API Real Backend (Không Mock Data / Không Giả Lập)
  const addToCart = useCallback(
    async (
      product: any,
      quantity = 1,
      selectedColor?: any,
      selectedOption?: any,
    ): Promise<{ success: boolean; message?: string }> => {
      const prodId = product?._id || product?.id;
      if (!prodId) {
        return { success: false, message: "Sản phẩm không tồn tại trên hệ thống." };
      }

      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          return {
            success: false,
            message: "Vui lòng đăng nhập để thực hiện thêm vào giỏ hàng.",
          };
        }

        // 1. LẤY BỘ MẢNG VARIANTS THẬT TỪ API SERVER NESTJS
        let variants = product?.variantStocks || product?.variants || [];
        if (!Array.isArray(variants) || variants.length === 0) {
          try {
            const fetchedVariants = await getProductVariantsApi(prodId);
            variants = Array.isArray(fetchedVariants) ? fetchedVariants : [];
          } catch (err: any) {
            console.warn("[API Error] Không thể lấy danh sách Variant từ Server:", err?.message);
          }
        }

        // 2. TÌM VARIANT PHÙ HỢP HOẶC LẤY VARIANT ĐẦU TIÊN TỪ SERVER
        let matchedVariant = variants.find((v: any) => {
          const matchColor =
            !selectedColor ||
            v.colorId === selectedColor?.id ||
            v.colorId === selectedColor?._id ||
            v.color?._id === selectedColor?.id;

          const matchOption =
            !selectedOption ||
            v.optionId === selectedOption?.id ||
            v.optionId === selectedOption?._id ||
            v.option?._id === selectedOption?.id;

          return matchColor && matchOption;
        }) || variants[0];

        // Lấy chính xác ObjectId 24 ký tự của Variant
        const variantId =
          matchedVariant?._id ||
          matchedVariant?.id ||
          matchedVariant?.variantId ||
          product?.variantId;

        if (!variantId || String(variantId) === String(prodId)) {
          return {
            success: false,
            message: "Sản phẩm này chưa được cấu hình biến thể (Variant) trên Server.",
          };
        }

        // 3. GỌI TRỰC TIẾP API POST /api/cart/items LÊN BACKEND THẬT
        const apiRes = await addToCartApi(
          String(variantId),
          Number(quantity) || 1,
          token
        );

        // 4. CẬP NHẬT LẠI GIỎ HÀNG THẬT TỪ SERVER VỀ STATE
        await refreshCart();

        return {
          success: true,
          message: apiRes?.message || "Đã thêm sản phẩm vào giỏ hàng thành công!",
        };
      } catch (error: any) {
        // Bóc tách chính xác thông báo lỗi nguyên bản từ Server NestJS/Railway
        const serverErrorMessage =
          error?.message ||
          error?.response?.data?.message ||
          "Không thể kết nối đến máy chủ giỏ hàng.";

        console.warn("[Real API Error - Add To Cart]:", serverErrorMessage);

        return {
          success: false,
          message: serverErrorMessage,
        };
      }
    },
    [refreshCart]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      setCart((prev) =>
        prev.filter((item) => {
          const id =
            item._id ||
            item.id ||
            item.productId ||
            item.product?._id ||
            item.product?.id;
          return id !== itemId;
        }),
      );

      try {
        const token = await AsyncStorage.getItem("token");
        await deleteCartItemApi(itemId, token || undefined);
        await refreshCart();
      } catch (err) {
        console.warn("Lỗi xóa sản phẩm qua API:", err);
      }
    },
    [refreshCart],
  );

  const updateQuantity = useCallback(
    async (itemId: string, newQty: number) => {
      if (newQty <= 0) {
        await removeFromCart(itemId);
        return;
      }

      setCart((prev) =>
        prev.map((item) => {
          const id = item._id || item.id || item.productId;
          return id === itemId ? { ...item, quantity: newQty } : item;
        }),
      );

      try {
        const token = await AsyncStorage.getItem("token");
        await updateCartItemQtyApi(itemId, newQty, token || undefined);
        await refreshCart();
      } catch (err) {
        console.warn("Lỗi cập nhật số lượng qua API:", err);
      }
    },
    [removeFromCart, refreshCart],
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Tải danh sách Wishlist thật từ Server khi đăng nhập/khởi chạy
 // Tải danh sách Wishlist từ Server khi mở App hoặc chuyển màn hình
  const refreshWishlist = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await getWishlistApi(token);
      const list = Array.isArray(res)
        ? res
        : res?.data || res?.wishlist || res?.items || [];

      const ids = new Set<string>();
      list.forEach((item: any) => {
        const pObj = item.productId || item.product || item;
        const id = typeof pObj === "string" ? pObj : pObj?._id || pObj?.id;
        if (id) ids.add(String(id));
      });

      setWishlistIds(ids);
    } catch (err) {
      console.warn("Chưa đăng nhập hoặc lỗi tải Wishlist:", err);
    }
  }, []);

  // Bấm trái tim -> Gửi API lên Server kèm Token
  const toggleWishlist = useCallback(async (productId: string) => {
    if (!productId) return;

    const token = await AsyncStorage.getItem("token");

    setWishlistIds((prev) => {
      const next = new Set(prev);
      const isExist = next.has(productId);

      if (isExist) {
        next.delete(productId);
        removeFromWishlistApi(productId, token || undefined).catch((err) => {
          console.warn("Lỗi xóa Wishlist API:", err);
        });
      } else {
        next.add(productId);
        addToWishlistApi(productId, token || undefined).catch((err) => {
          console.warn("Lỗi thêm Wishlist API:", err);
        });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);


  

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds],
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      subtotal,
      shipping,
      total,
      refreshCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      wishlistIds,
      toggleWishlist,
      isWishlisted,
    }),
    [
      cart,
      cartCount,
      subtotal,
      shipping,
      total,
      refreshCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      wishlistIds,
      toggleWishlist,
      isWishlisted,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
