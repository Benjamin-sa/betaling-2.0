# Copilot Instructions for Scouts Payment System

This document provides context and instructions for GitHub Copilot to better assist in the development of the "Scouts Payment System" project.

## 1. Project Overview

The project is a web application for managing product sales and payments for a Scouts group ("Scouts Lod Lavki"). It's a full-stack JavaScript application with a Vue.js frontend and a Node.js (Express) backend.

The primary goal is to allow users to order products (like for a spaghetti night fundraiser), pay for them securely online, and for admins to manage these products, orders, and users.

- **Frontend**: A Single Page Application (SPA) built with Vue.js 3 (Composition API), Vite, Pinia for state management, and Tailwind CSS for styling.
- **Backend**: A RESTful API built with Express.js.
- **Authentication**: Handled by Firebase Authentication (both email/password and Google OAuth).
- **Payments**: Processed through Stripe, including credit cards, iDEAL, and Bancontact.
- **Database**: User, product, and order data is stored in Firebase Firestore.
- **Image Storage**: Product images are uploaded to Firebase Storage.

## 2. Core Technologies & Libraries

When generating code, please adhere to the patterns and styles of these technologies:

- **Frontend**:

  - **Vue.js 3**: Use the `<script setup>` syntax (Composition API).
  - **Pinia**: For global state management (`auth`, `notifications`). Stores are located in `client/src/stores/`.
  - **Vue Router**: For navigation. Routes are defined in `client/src/router/index.js`.
  - **Axios/fetch**: The `client/src/services/api.js` file uses `fetch` for API communication. Continue using this pattern.
  - **Tailwind CSS**: For all styling. Custom theme colors are defined in `client/tailwind.config.js`.

- **Backend**:
  - **Node.js / Express.js**: The server framework.
  - **Firebase Admin SDK**: Used for authentication verification and database access (`server/config/firebaseAdmin.js`, `server/core/services/firebase.service.js`).
  - **Stripe Node.js Library**: Used for creating products, customers, and checkout sessions (`server/core/services/stripe.service.js`).
  - **Multer**: For handling file uploads in memory (`server/features/products/product.routes.js`).

## 3. Project Structure

The project is a monorepo with `client` and `server` workspaces.

```
/
├── client/              # Vue.js frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components (auth, products, ui, etc.)
│   │   ├── views/       # Page-level components (Home, Admin, Orders)
│   │   ├── stores/      # Pinia state management (auth.js, notifications.js)
│   │   ├── services/    # API client (api.js)
│   │   ├── router/      # Vue Router configuration
│   │   └── config/      # Firebase client configuration
│   └── vite.config.js   # Vite config with proxy to the backend
├── server/              # Express backend
│   ├── features/        # Feature-sliced structure (admin, auth, products, orders)
│   │   ├── [feature]/
│   │   │   ├── [feature].controller.js
│   │   │   └── [feature].routes.js
│   ├── core/
│   │   ├── services/    # Core services (firebase.service.js, stripe.service.js)
│   │   └── routes/      # Main API and webhook routers
│   ├── middleware/      # Authentication middleware (auth.js)
│   ├── config/          # Firebase Admin SDK configuration
│   └── index.js         # Server entry point
└── README.md
```

## 4. Key Features & Logic

### 4.1. Authentication

- **Flow**: User registers/logs in on the client -> Firebase Auth handles it -> Client sends ID token to backend -> Backend verifies token (`server/middleware/auth.js`) -> Backend creates a corresponding user entry in Firestore with a Stripe Customer ID (`server/features/auth/auth.controller.js`).
- **State Management**: The `auth.js` Pinia store (`client/src/stores/auth.js`) manages the user's authentication state, token, and admin status.
- **Admin Access**: Admin routes on both client and server are protected. The backend middleware `authorizeAdmin` checks the `isAdmin` flag in the user's Firestore document.

### 4.2. Product Management

- Products are created by admins in the "Admin Dashboard".
- Creating a product involves:
  1.  (Optional) Uploading an image to Firebase Storage via `imageManager.service.js`.
  2.  Creating a corresponding product and price object in Stripe via `stripe.service.js`.
  3.  Saving the product details, including the Stripe product/price IDs and public image URL, to Firestore via `firebase.service.js`.
- This logic is orchestrated in `server/features/products/product.controller.js`.

### 4.3. Ordering & Checkout

- Unauthenticated users can add items to their cart, but they must log in to check out.
- The user's cart (quantities) is maintained on the client.
- On checkout, the client sends the selected items to the backend (`/api/orders/checkout`).
- The backend creates a Stripe Checkout session, linking it to the user's Stripe Customer ID.
- Stripe handles the payment flow and redirects the user to a success/cancel page.
- A Stripe webhook (`/api/webhooks/stripe`) listens for the `checkout.session.completed` event to finalize the order.

### 4.4. Webhooks

- The Stripe webhook is crucial. When a payment succeeds, it triggers the `webhook.service.js`.
- This service takes the session data, finds the corresponding user (via Stripe Customer ID), and creates a new order document in the `orders` collection in Firestore.

## 5. Environment & Configuration

- The project uses `.env` files for environment variables (`README.md`).
- **Client-side**: Vite uses `VITE_` prefixed variables (e.g., `VITE_FIREBASE_API_KEY`).
- **Server-side**: The Express server uses standard variables (e.g., `STRIPE_SECRET_KEY_TEST`).
- The backend has separate Firebase configurations for authentication (`firebaseAdmin.js`) and image storage (`firebaseImages.js`), allowing for potentially different service accounts or buckets.
- In production, Firebase service account keys are expected to be Base64 encoded environment variables, which are decoded by a utility function (`server/utils/utils.js`).

## 6. Coding Style and Conventions

- Use **Composition API** with `<script setup>` in Vue components.
- Use **async/await** for all asynchronous operations.
- Structure backend logic in a **feature-sliced** manner (routes -> controller -> service).
- Use the provided field name constants from `server/models/webstore.model.js` when interacting with Firestore data to ensure consistency.
- All user-facing text should be in **Dutch** (Nederlands), as seen in the Vue components. Comments and code can be in English.
- Follow the existing formatting and ESLint/Prettier rules if they are set up.
