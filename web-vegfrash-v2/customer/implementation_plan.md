# Checkout Flow Modernization

We need to make the checkout experience seamless and premium, matching the new Home Page.

## Proposed Changes

### 1. Link the Stick
#### [MODIFY] [components/ui/CartSummary.tsx](file:///c:/Users/RITESH/Documents/VegFrash/web-customer/components/ui/CartSummary.tsx)
-   Wrap the "View Cart" button in a `Link` to `/cart`.

### 2. Modernize Cart Page
#### [MODIFY] [app/cart/page.tsx](file:///c:/Users/RITESH/Documents/VegFrash/web-customer/app/cart/page.tsx)
-   Replace `<Header />` with `<ModernHeader />`.
-   Update UI to be cleaner (remove "Step 1 of 2").
-   Ensure "Proceed to Checkout" button is prominent.

### 3. Modernize Checkout Page
#### [MODIFY] [app/checkout/page.tsx](file:///c:/Users/RITESH/Documents/VegFrash/web-customer/app/checkout/page.tsx)
-   Replace `<Header />` with `<ModernHeader />`.
-   Ensure `AddressSelector` looks good (might need a quick peek/refactor).
-   Add a "Confetti" effect on success for that "Wow" factor.

### 4. Address Selector Check
-   I will verify `components/features/AddressSelector.tsx` handles "No Address" gracefully or allows adding one.

## Execution Order
1.  **Link**: Fix `CartSummary`.
2.  **Cart**: Update `app/cart/page.tsx`.
3.  **Checkout**: Update `app/checkout/page.tsx`.
4.  **Verify**: Perform a full "Add -> Cart -> Checkout -> Success" run.
