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

- `GET /api/products` - Get all products
- `POST /api/products` - Add new product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `POST /api/checkout` - Create checkout session
- `GET /api/orders` - Get user orders
- `GET /api/admin/orders` - Get all orders (admin)
- `GET /api/admin/users` - Get all users (admin)

## License

[MIT License](LICENSE)
