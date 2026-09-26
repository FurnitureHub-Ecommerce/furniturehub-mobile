import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Product, ProductVariantColor, ProductVariantOption, MOCK_PRODUCTS } from '@/services/mockData';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: ProductVariantColor;
  selectedOption?: ProductVariantOption;
}

interface AppContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addToCart: (
    product: Product,
    quantity?: number,
    selectedColor?: ProductVariantColor,
    selectedOption?: ProductVariantOption
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  wishlistIds: Set<string>;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize initial cart with 2 products
  const [cart, setCart] = useState<CartItem[]>([
    { product: MOCK_PRODUCTS[0], quantity: 1, selectedColor: MOCK_PRODUCTS[0].colors?.[0] },
    { product: MOCK_PRODUCTS[2], quantity: 1, selectedColor: MOCK_PRODUCTS[2].colors?.[0] },
  ]);

  // Initialize wishlist with default IDs
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(
    new Set(['prod-1', 'prod-3'])
  );

  const shipping = 150;

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const optionExtra = item.selectedOption?.priceAdjustment || 0;
      return sum + (item.product.price + optionExtra) * item.quantity;
    }, 0);
  }, [cart]);

  const total = useMemo(() => {
    return subtotal > 0 ? subtotal + shipping : 0;
  }, [subtotal, shipping]);

  const addToCart = useCallback(
    (
      product: Product,
      quantity: number = 1,
      selectedColor?: ProductVariantColor,
      selectedOption?: ProductVariantOption
    ) => {
      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.selectedColor?.id === selectedColor?.id &&
            item.selectedOption?.id === selectedOption?.id
        );
        if (existingIndex > -1) {
          const updated = [...prevCart];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        } else {
          return [...prevCart, { product, quantity, selectedColor, selectedOption }];
        }
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds]
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      subtotal,
      shipping,
      total,
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
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      wishlistIds,
      toggleWishlist,
      isWishlisted,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
