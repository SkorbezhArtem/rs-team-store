# rs-team-store

Team project: online store (RS School).

## Scripts

- `npm install` — install dependencies
- `npm run dev` — start the dev server
- `npm run build` — build for production
- `npm test` — run unit tests

## Code rules

- The cart is stored in one place; the catalog and the cart page read it from there.
- The cart is not reset when the user switches pages.
- Filtering never mutates the original products array.
- The total price is calculated only in `calculateTotal`; the logic is not duplicated.
