# Scouts Payment System

A web application for managing product orders and payments for Scouts events, built with Vue.js, Express, and Stripe.

## Features

- 🛍️ Product management with image uploads
- 💳 Secure payments via Stripe
- 🕒 Time slot reservation system
- 👤 User authentication with Firebase
- 📊 Admin dashboard
- 📱 Responsive design
- 🔒 Secure webhook handling
- 💾 SQLite database with automatic backups

## Prerequisites

- Node.js 18.x
- Firebase account
- Stripe account

## Environment Variables

Create a `.env` file in the root directory:

```env
# App
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:5173

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Stripe
STRIPE_SECRET_KEY_TEST=your-stripe-test-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Optional
FORCE_HTTPS=false
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd betaling-2.0
```

2. Install dependencies:
```bash
npm install
cd client && npm install
```

3. Start the development server:
```bash
# Start backend (from root directory)
npm run start

# Start frontend (from client directory)
npm run dev
```

## Project Structure

```
betaling-2.0/
├── client/               # Vue.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── services/
│   │   └── stores/
│   └── public/
├── server/              # Express backend
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── db/
└── README.md
```

## API Routes

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/products/:id/image` - Get product image

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/session/:sessionId/line-items` - Get line items for order
- `GET /api/orders/timeslots/availability` - Get time slot availability

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/ensure-user` - Ensure user exists in database
- `POST /api/auth/send-verification-email` - Send verification email
- `POST /api/auth/make-admin` - Make user admin (admin only)
- `POST /api/auth/remove-admin` - Remove admin rights (admin only)
- `GET /api/auth/admin-status` - Check admin status
- `POST /api/auth/create-manual-user` - Create user manually (admin only)

### Checkout
- `POST /api/checkout` - Create checkout session

### Admin
- `GET /api/admin/orders` - Get all orders (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/users/:firebaseUid` - Delete user (admin only)

### Webhooks
- `POST /webhook/stripe` - Stripe webhook endpoint

## License

[MIT License](LICENSE)
