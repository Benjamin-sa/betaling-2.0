# Copilot Instructions

## General Project Context

This project is a web application for selling products and/or products linked to a shift of an event (e.g., product "large spaghetti" for shift 1).

- **Technical Stack**:
  - **Frontend**: Vue.js 3 (Composition API) with Vite.
  - **Backend**: Node.js with Express.js.
  - **Database & Authentication**: Firebase (Firestore & Authentication).
  - **Payments**: Stripe.
- **Code Style**:
  - Use camelCase for variables and function names.
  - Follow the existing project structure for new files.
  - Write clear and concise comments where the code is complex.
  - Adhere to the ESLint rules configured in the project.

## Backend (Server) Instructions

- **Framework**: Node.js with Express.js.
- **Architecture**: The logic is split into `features`. Each feature (e.g., `products`, `events`) has its own `controller` and `routes`.
- **Database**: All interactions with Firestore must go through the **`FirebaseCachedService`** (`/server/core/services/firebase-cached.service.js`). This service adds a caching layer on top of the standard `FirebaseService` to improve performance.
- **Authentication**: Secured routes use the `isAuthenticated` and `isAdmin` middleware found in `/server/middleware/auth.js`.
- **Services**: Use the existing services in `/server/core/services` for interactions with external systems like Stripe (`stripe.service.js`).

---

## Field Constants and Data Models

This is the core of our application. Understand these models well when generating code.

### Field Constants (from webstore.model.js)

Use these constants when working with data fields. Always use these field constants instead of hardcoded strings to ensure consistency across the application. Data validation and transformation is handled by factory functions in `webstore.model.js`.

**ProductFields:**

- `NAME` (string), `DESCRIPTION` (string), `PRICE` (number), `STRIPE_PRODUCT_ID` (string), `STRIPE_PRICE_ID` (string), `REQUIRES_TIMESLOT` (boolean), `IMAGE` (string), `EVENT_ID` (string), `CREATED_AT` (timestamp)

**UserFields:**

- `FIREBASE_UID` (string), `EMAIL` (string), `STRIPE_CUSTOMER_ID` (string), `IS_ADMIN` (boolean), `CREATED_AT` (timestamp)

**OrderFields:**

- `USER_ID` (string), `AMOUNT_TOTAL` (number), `CURRENCY` (string), `PAYMENT_METHOD` (string), `TIME_SLOT` (string), `EVENT_ID` (string), `SHIFT_ID` (string), `SHIFT_NAME` (string), `MANUAL_PAYMENT_CONFIRMED_AT` (timestamp), `MANUAL_PAYMENT_CONFIRMED_BY` (string), `CREATED_AT` (timestamp)

**OrderItemFields:**

- `PRODUCT_NAME` (string), `QUANTITY` (number), `AMOUNT_TOTAL` (number), `UNIT_PRICE` (number)

**EventFields:**

- `ID` (string), `TYPE` (string), `NAME` (string), `DESCRIPTION` (string), `ISACTIVE` (boolean), `START_DATE` (timestamp), `END_DATE` (timestamp), `CREATED_AT` (timestamp), `CREATED_BY` (string)

**ShiftFields:**

- `ID` (string), `NAME` (string), `START_TIME` (timestamp), `END_TIME` (timestamp), `MAX_CAPACITY` (number), `AVAILABLE` (number)

---

## 🎨 Design & Styling Guidelines

**IMPORTANT**: Before making any design or styling changes, always refer to the comprehensive **[Design Guide](../DESIGN_GUIDE.md)** located in the project root.

### Key Design Principles

- **Professional First**: Every element should look trustworthy and polished
- **Mobile-First**: Design for mobile, enhance for desktop
- **User-Friendly**: Intuitive interactions with clear feedback
- **Consistency**: Follow established patterns and components

### Quick Reference

- **Colors**: Use the established green theme (`--primary: #10b981`)
- **Components**: Check existing components before creating new ones
- **Spacing**: Follow Tailwind spacing scale (4, 6, 8, 12, 16)
- **Animation**: Use `duration-200` for interactions, `duration-300` for transitions
- **Typography**: Bold for headers, semibold for labels, normal for body text

### Before Making Design Changes

1. ✅ Check if existing components can be reused or extended
2. ✅ Review the color palette and spacing guidelines
3. ✅ Ensure mobile-first responsive design
4. ✅ Test accessibility (keyboard navigation, screen readers)
5. ✅ Follow established animation and interaction patterns

### Shopping Cart System

The current cart system follows a professional slide-out drawer pattern:

- **Floating Widget**: Bottom-right corner with bounce animation
- **Cart Drawer**: Professional slide-out with item management
- **Mobile Responsive**: Full-screen modal on mobile devices

For detailed specifications, component examples, and best practices, see **[DESIGN_GUIDE.md](../DESIGN_GUIDE.md)**.

---
