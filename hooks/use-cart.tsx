"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getGuestCart, saveGuestCart, clearGuestCart } from "@/lib/cart-utils";

interface CartItem {
  id: string;
  quantity: number;
  variantId: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    quantity: number;
    images: {
      url: string;
      altText: string | null;
    }[];
    brand: {
      name: string;
    } | null;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  addToCart: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const itemCount =
    cart?.items.reduce((count, item) => count + item.quantity, 0) || 0;

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    if (status === "loading") return;

    if (!session) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  // Merge guest cart with user cart on login
  const mergeGuestCart = useCallback(async () => {
    const guestCartItems = getGuestCart();

    if (guestCartItems.length === 0) return;

    try {
      const response = await fetch("/api/cart/merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guestCartItems }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
        clearGuestCart();

        if (data.errors && data.errors.length > 0) {
          toast.warning("Some items couldn't be added to cart", {
            description: data.errors[0],
          });
        } else {
          toast.success("Cart items merged successfully");
        }
      }
    } catch (error) {
      console.error("Error merging cart:", error);
    }
  }, []);

  // Initial load and merge
  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      // Merge guest cart if exists
      const guestCartItems = getGuestCart();
      if (guestCartItems.length > 0) {
        mergeGuestCart();
      } else {
        fetchCart();
      }
    } else {
      setIsLoading(false);
    }
  }, [session, status, fetchCart, mergeGuestCart]);

  // Add to cart
  const addToCart = async (
    productId: string,
    quantity: number,
    variantId?: string
  ) => {
    if (!session) {
      // Add to guest cart (localStorage)
      const guestCart = getGuestCart();
      const existingItemIndex = guestCart.findIndex(
        (item: any) =>
          item.productId === productId && item.variantId === variantId
      );

      if (existingItemIndex >= 0) {
        guestCart[existingItemIndex].quantity += quantity;
      } else {
        guestCart.push({
          productId,
          variantId: variantId || null,
          quantity,
        });
      }

      saveGuestCart(guestCart);
      toast.success("Added to cart");
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
          variantId: variantId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }

      await fetchCart();
      toast.success("Added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add to cart"
      );
      throw error;
    }
  };

  // Update quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!session) {
      toast.error("Please login to manage your cart");
      return;
    }

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update quantity");
      }

      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update quantity"
      );
      throw error;
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId: string) => {
    if (!session) {
      toast.error("Please login to manage your cart");
      return;
    }

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      await fetchCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
      throw error;
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!session) {
      clearGuestCart();
      toast.success("Cart cleared");
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      await fetchCart();
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
