# Task 3: Shopping Cart Functionality - Implementation Documentation

## 📋 Overview

This document describes the complete implementation of the shopping cart functionality for Snakzo e-commerce platform. The cart system supports both authenticated users (database-backed) and guest users (localStorage-backed) with seamless cart merging on login.

## ✅ Completed Features

### 1. **Cart API Endpoints**

- ✅ GET `/api/cart` - Fetch user's cart with items
- ✅ POST `/api/cart` - Add items to cart with stock validation
- ✅ PATCH `/api/cart/[id]` - Update item quantity
- ✅ DELETE `/api/cart/[id]` - Remove single item
- ✅ DELETE `/api/cart` - Clear entire cart
- ✅ POST `/api/cart/merge` - Merge guest cart with user cart on login

### 2. **Cart State Management**

- ✅ React Context API with `CartProvider`
- ✅ Custom `useCart` hook for global cart access
- ✅ Auto-fetch cart on component mount
- ✅ Real-time item count tracking
- ✅ Loading states for all operations
- ✅ Error handling with toast notifications

### 3. **Cart UI Components**

- ✅ `CartButton` - Navbar button with item count badge
- ✅ `CartDrawer` - Sliding sheet from right side
- ✅ `CartItem` - Individual item with quantity controls
- ✅ `CartSummary` - Price breakdown and checkout button
- ✅ Cart Page - Full cart view with help section

### 4. **Cart Utilities**

- ✅ Price calculations (subtotal, tax, shipping, total)
- ✅ Free shipping eligibility checks
- ✅ Guest cart localStorage helpers
- ✅ Stock validation utilities
- ✅ INR currency formatting

### 5. **Integration Points**

- ✅ Integrated with navbar
- ✅ Integrated with add-to-cart button on product pages
- ✅ Wrapped app with CartProvider in root layout

## 🏗️ Architecture

### Component Hierarchy

```
app/layout.tsx (CartProvider)
├── components/navbar.tsx
│   └── components/cart/cart-button.tsx
│       └── components/cart/cart-drawer.tsx
│           └── components/cart/cart-item.tsx
├── app/cart/page.tsx
│   ├── components/cart/cart-item.tsx
│   └── components/cart/cart-summary.tsx
└── app/products/[slug]/page.tsx
    └── components/product/add-to-cart-button.tsx (uses useCart)
```

### Data Flow

#### For Authenticated Users:

1. User clicks "Add to Cart" → `useCart().addToCart()`
2. Hook sends POST request to `/api/cart`
3. API validates stock and adds item to database
4. API returns updated cart with full product details
5. Hook updates local state and shows toast notification
6. Cart badge updates automatically

#### For Guest Users:

1. User clicks "Add to Cart" → `useCart().addToCart()`
2. Hook saves item to localStorage as JSON
3. Hook updates local state and shows toast notification
4. Cart badge updates automatically

#### Cart Merge on Login:

1. User logs in with items in guest cart
2. `CartProvider` detects session change
3. Hook calls `mergeGuestCart()` automatically
4. API merges guest items with user's database cart
5. API validates stock for all items
6. LocalStorage guest cart is cleared
7. User sees merged cart with all items

## 📂 File Structure

```
app/
├── api/
│   └── cart/
│       ├── route.ts (GET, POST, DELETE)
│       ├── [id]/
│       │   └── route.ts (PATCH, DELETE)
│       └── merge/
│           └── route.ts (POST)
├── cart/
│   └── page.tsx
└── layout.tsx (CartProvider wrapper)

components/
├── cart/
│   ├── cart-button.tsx
│   ├── cart-drawer.tsx
│   ├── cart-item.tsx
│   └── cart-summary.tsx
├── product/
│   └── add-to-cart-button.tsx
└── navbar.tsx

hooks/
└── use-cart.tsx

lib/
└── cart-utils.ts
```

## 🔧 Implementation Details

### 1. Cart API (`app/api/cart/route.ts`)

**GET /api/cart**

- Requires authentication
- Returns cart with items including:
  - Product details (name, slug, price)
  - First product image
  - Brand information
  - Variant details (if applicable)
- Creates empty cart if none exists

**POST /api/cart**

- Requires authentication
- Request body: `{ productId, quantity, variantId? }`
- Validates:
  - Product exists and is available
  - Sufficient stock
  - Quantity is positive
- Handles duplicate items by updating quantity
- Returns updated cart with all items

**DELETE /api/cart**

- Requires authentication
- Clears all items from cart
- Returns success message

### 2. Cart Item API (`app/api/cart/[id]/route.ts`)

**PATCH /api/cart/[id]**

- Updates item quantity
- Validates stock availability
- Verifies cart ownership
- Returns updated items

**DELETE /api/cart/[id]**

- Removes single item
- Verifies cart ownership
- Returns remaining items

### 3. Cart Merge API (`app/api/cart/merge/route.ts`)

**POST /api/cart/merge**

- Request body: `{ guestCartItems: [{ productId, quantity, variantId? }] }`
- Iterates through guest cart items
- For each item:
  - Validates product availability
  - Checks stock
  - Creates new item or updates existing
- Returns:
  - Updated cart with all items
  - Array of errors for failed items
- Handles partial failures gracefully

### 4. Cart Context (`hooks/use-cart.tsx`)

**State:**

- `cart: Cart | null` - Current cart data
- `isLoading: boolean` - Loading state for operations
- `itemCount: number` - Total items across all cart items

**Methods:**

- `addToCart(productId, quantity, variantId?)` - Add item to cart
- `updateQuantity(itemId, quantity)` - Update item quantity
- `removeFromCart(itemId)` - Remove item from cart
- `clearCart()` - Clear entire cart
- `refreshCart()` - Re-fetch cart from API

**Features:**

- Auto-fetches cart on mount for logged-in users
- Automatically merges guest cart on login
- Handles both user and guest carts seamlessly
- Toast notifications for all operations
- Error handling for API failures

### 5. Cart Utilities (`lib/cart-utils.ts`)

**Price Calculations:**

```typescript
calculateSubtotal(items); // Sum of all items
calculateTax(subtotal); // 18% GST
calculateShipping(subtotal); // ₹50 or free over ₹500
calculateDiscount(subtotal, percentage); // Discount amount
calculateTotal(subtotal, tax, shipping, discount); // Final total
calculateSavings(price, compareAtPrice, quantity); // Savings amount
```

**Cart Helpers:**

```typescript
getCartItemCount(cart); // Total quantity
formatPrice(amount); // Format as INR
validateQuantity(quantity, stock); // Check stock
isFreeShippingEligible(subtotal); // Check if free shipping
amountNeededForFreeShipping(subtotal); // Amount to free shipping
```

**Guest Cart (localStorage):**

```typescript
getGuestCart(); // Get guest cart items
saveGuestCart(items); // Save to localStorage
clearGuestCart(); // Clear localStorage
```

### 6. Cart Components

#### `CartButton` (Client Component)

- Shows shopping cart icon
- Displays badge with item count (hidden if 0)
- Shows "99+" for counts > 99
- Opens CartDrawer on click
- Uses `useCart` hook for item count

#### `CartDrawer` (Client Component)

- Sheet component sliding from right
- Scrollable items list
- Empty state with "Continue Shopping" CTA
- Shows item count in header
- Displays subtotal
- "View Cart" and "Checkout" buttons
- Closes automatically on navigation

#### `CartItem` (Client Component)

- Product image (clickable to product page)
- Product name and brand
- Price and savings display
- Quantity selector with +/- buttons
- Remove button with confirmation
- Stock warning if low stock
- Subtotal calculation
- Loading states for updates

#### `CartSummary` (Client Component)

- Free shipping progress bar
- Price breakdown:
  - Subtotal
  - Tax (18% GST)
  - Shipping (₹50 or FREE)
  - Savings (if any)
  - Total
- "Proceed to Checkout" button
- Trust badges (secure payment, fast delivery, easy returns)

#### Cart Page (`app/cart/page.tsx`)

- Full-page cart view
- Empty state with ShoppingBag icon and CTA
- Loading state with spinner
- Grid layout (responsive)
- Lists all cart items
- Sticky cart summary on desktop
- "Clear Cart" button with confirmation
- "Continue Shopping" button
- Help section with links

## 🎨 UI/UX Features

### Visual Design

- Gradient backgrounds for CTAs
- Smooth animations and transitions
- Loading spinners for async operations
- Hover effects on interactive elements
- Responsive design (mobile-first)

### User Experience

- Optimistic UI updates
- Toast notifications for all actions
- Empty states with helpful CTAs
- Stock warnings for low inventory
- Free shipping progress indicator
- "99+" badge for large cart counts
- Confirmation for destructive actions (clear cart, remove item)

### Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Loading state announcements

## 💰 Pricing Configuration

### Constants

- **Tax Rate:** 18% GST (India)
- **Shipping Cost:** ₹50 flat rate
- **Free Shipping Threshold:** ₹500
- **Currency:** INR (Indian Rupees)
- **Currency Format:** ₹X,XXX.XX (2 decimal places)

### Price Breakdown Example

```
Subtotal: ₹1,200.00
Tax (18%): ₹216.00
Shipping: FREE (over ₹500)
Savings: ₹300.00
─────────────────────
Total: ₹1,116.00
```

## 🧪 Testing Scenarios

### User Flow Tests

1. ✅ Guest user adds items → Items saved to localStorage
2. ✅ Guest user logs in → Cart merges automatically
3. ✅ User adds duplicate items → Quantity increases
4. ✅ User updates quantity → Stock validated, cart updated
5. ✅ User removes item → Item removed, totals recalculated
6. ✅ User clears cart → All items removed
7. ✅ Low stock item → Warning shown, max quantity enforced
8. ✅ Out of stock item → Add to cart disabled
9. ✅ Free shipping threshold → Progress bar updates

### Edge Cases

- ✅ Adding item with insufficient stock → Error toast
- ✅ Multiple tabs/windows → Cart syncs on focus
- ✅ Session expires → Redirects to login
- ✅ API failure → Error handling with retry
- ✅ Large quantity (>99) → Badge shows "99+"

## 🔐 Security Considerations

### Authentication

- All cart API endpoints require authentication (except POST /cart/merge)
- Session validated using NextAuth's `auth()` helper
- Cart ownership verified on all update/delete operations

### Data Validation

- Product ID and variant ID validated
- Quantity validated (positive integer, <= stock)
- Stock checked before adding/updating
- User can only access their own cart

### Input Sanitization

- All user inputs validated
- SQL injection prevented by Prisma ORM
- XSS prevented by React's default escaping

## 📊 Performance Optimizations

### Database

- Single query fetches cart with all relations
- Indexed foreign keys (userId, productId)
- Optimized Prisma queries with includes

### Frontend

- Lazy loading of cart data
- Optimistic UI updates
- Debounced quantity changes (if needed)
- Memoized calculations in components

### Caching

- Guest cart cached in localStorage
- User cart cached in React state
- Auto-refresh on session change

## 🚀 Future Enhancements

### Potential Improvements

- [ ] Add cart expiration for guest users (7 days)
- [ ] Implement saved for later functionality
- [ ] Add product recommendations in cart
- [ ] Support bulk actions (select multiple, remove all)
- [ ] Add undo functionality for remove actions
- [ ] Implement cart sharing (share cart URL)
- [ ] Add gift wrapping options
- [ ] Support multiple shipping addresses
- [ ] Add estimated delivery dates
- [ ] Implement cart abandonment emails

### Technical Debt

- [ ] Add comprehensive unit tests
- [ ] Add E2E tests with Playwright
- [ ] Implement cart analytics tracking
- [ ] Add performance monitoring
- [ ] Optimize images with Next.js Image
- [ ] Add error boundary for cart components

## 🐛 Known Issues

### Current Limitations

- Coupon codes structure ready but validation not implemented
- Cart doesn't sync across devices for guest users
- No cart recovery on browser crash (guest users)
- Limited to 100 items per cart (no limit enforced)

### Browser Compatibility

- Tested on Chrome, Firefox, Safari (latest versions)
- IE11 not supported (uses modern JavaScript)

## 📚 Related Documentation

- [TASKS.md](../TASKS.md) - Complete task list
- [TASK_1_AUTHENTICATION.md](./TASK_1_AUTHENTICATION.md) - Auth system docs
- [TASK_2_PRODUCT_DETAIL.md](./TASK_2_PRODUCT_DETAIL.md) - Product page docs
- [Prisma Schema](../prisma/schema.prisma) - Database schema
- [API Routes](../app/api/) - API implementation

## 🎯 Success Metrics

### Functional Requirements Met

- ✅ Users can add items to cart
- ✅ Users can update item quantities
- ✅ Users can remove items
- ✅ Users can clear entire cart
- ✅ Guest carts persist across sessions
- ✅ Guest carts merge on login
- ✅ Stock validation prevents overselling
- ✅ Real-time cart count in navbar
- ✅ Responsive design on all devices
- ✅ Error handling for all operations

### Technical Requirements Met

- ✅ Type-safe TypeScript implementation
- ✅ Server and client components separated
- ✅ API routes follow RESTful conventions
- ✅ Database operations optimized
- ✅ Loading and error states handled
- ✅ Authentication integrated
- ✅ Toast notifications for user feedback

---

**Implementation Date:** January 2025  
**Status:** ✅ Complete  
**Next Task:** Task 4 - Checkout Process and Order Management
