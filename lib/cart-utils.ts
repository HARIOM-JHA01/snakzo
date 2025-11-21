// Cart utility functions

export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice: number | null;
  };
  variantId: string | null;
}

interface Cart {
  id: string;
  items: CartItem[];
}

// Calculate subtotal (sum of all items)
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
}

// Calculate tax (assuming 18% GST for India)
export function calculateTax(subtotal: number, taxRate: number = 0.18): number {
  return subtotal * taxRate;
}

// Calculate shipping cost
export function calculateShipping(
  subtotal: number,
  freeShippingThreshold: number = 500
): number {
  if (subtotal >= freeShippingThreshold) {
    return 0;
  }
  return 50; // Fixed shipping cost of ₹50
}

// Calculate discount
export function calculateDiscount(
  subtotal: number,
  discountPercent: number = 0
): number {
  return subtotal * (discountPercent / 100);
}

// Calculate total
export function calculateTotal(
  subtotal: number,
  tax: number,
  shipping: number,
  discount: number = 0
): number {
  return subtotal + tax + shipping - discount;
}

// Get total item count in cart
export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

// Format price to Indian Rupee
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Check if cart has items
export function isCartEmpty(cart: Cart | null): boolean {
  return !cart || !cart.items || cart.items.length === 0;
}

// Get savings amount from compare prices
export function calculateSavings(items: CartItem[]): number {
  return items.reduce((savings, item) => {
    if (
      item.product.comparePrice &&
      item.product.comparePrice > item.product.price
    ) {
      const itemSavings =
        (item.product.comparePrice - item.product.price) * item.quantity;
      return savings + itemSavings;
    }
    return savings;
  }, 0);
}

// Validate cart item quantity against stock
export function validateQuantity(
  requestedQuantity: number,
  availableStock: number
): { isValid: boolean; maxQuantity: number; message?: string } {
  if (requestedQuantity < 1) {
    return {
      isValid: false,
      maxQuantity: 1,
      message: 'Quantity must be at least 1',
    };
  }

  if (requestedQuantity > availableStock) {
    return {
      isValid: false,
      maxQuantity: availableStock,
      message: `Only ${availableStock} items available in stock`,
    };
  }

  return {
    isValid: true,
    maxQuantity: availableStock,
  };
}

// Merge guest cart from localStorage with user cart
export interface GuestCartItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const guestCart = localStorage.getItem('guestCart');
    return guestCart ? JSON.parse(guestCart) : [];
  } catch (error) {
    console.error('Error reading guest cart:', error);
    return [];
  }
}

// Clear guest cart from localStorage
export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('guestCart');
  } catch (error) {
    console.error('Error clearing guest cart:', error);
  }
}

// Save guest cart to localStorage
export function saveGuestCart(items: GuestCartItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('guestCart', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
}

// Check if free shipping threshold is met
export function isFreeShippingEligible(
  subtotal: number,
  threshold: number = 500
): boolean {
  return subtotal >= threshold;
}

// Calculate how much more needed for free shipping
export function amountNeededForFreeShipping(
  subtotal: number,
  threshold: number = 500
): number {
  if (subtotal >= threshold) return 0;
  return threshold - subtotal;
}
