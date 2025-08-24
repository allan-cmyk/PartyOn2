# Next Session: Shopping Cart & Checkout Implementation

## Where We Left Off
- ✅ Shopify integration complete
- ✅ Product catalog with elegant theme
- ✅ Individual product pages
- ✅ Cart hooks ready (useCart)
- 🚧 Need to build cart UI

## Priority Tasks for Next Session

### 1. Shopping Cart Component
Create an elegant slide-out cart that matches the theme:
```tsx
// Components needed:
- /components/shopify/Cart.tsx (slide-out drawer)
- /components/shopify/CartItem.tsx (individual items)
- /components/shopify/CartButton.tsx (header cart icon)
```

### 2. Age Verification Modal
Before allowing cart access:
```tsx
// Components needed:
- /components/AgeVerification.tsx
- Store verification in localStorage
- Block cart access if not verified
```

### 3. Checkout Flow
```
Cart → Age Verify → Delivery Info → Shopify Checkout
```

### 4. Context Providers
Set up global state management:
```tsx
// Providers needed:
- CartProvider (wrap entire app)
- AgeVerificationProvider
```

## Code to Start With

### Cart Context Setup
```tsx
// src/contexts/CartContext.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { useCart } from '@/lib/shopify/hooks/useCart';

const CartContext = createContext<ReturnType<typeof useCart> | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used within CartProvider');
  return context;
};
```

### Update layout.tsx
```tsx
// Wrap the app with providers
<CartProvider>
  <AgeVerificationProvider>
    {children}
  </AgeVerificationProvider>
</CartProvider>
```

## Key Decisions Needed
1. Cart as slide-out drawer vs full page?
2. Age verification on first visit or before cart?
3. Custom checkout page or redirect to Shopify?
4. Delivery scheduling UI design

## Files to Reference
- `/lib/shopify/hooks/useCart.ts` - Cart functionality
- `/components/OldFashionedNavigation.tsx` - Add cart button here
- `/app/products/[handle]/page.tsx` - Already has add to cart

## Test Data
- Products are loading from Shopify
- Cart persists in localStorage
- All API connections working

## Recommendation
**Continue in this session** - We have good momentum and the context is valuable. The cart UI is the next logical step and shouldn't require too much additional context.