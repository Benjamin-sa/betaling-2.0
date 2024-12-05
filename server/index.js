// index.js
const path = require('path');
const express = require('express');
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, './.env') });
}

const productRoutes = require('./routes/product.routes');
const checkoutRoutes = require('./routes/checkout.routes');
//const webhookService = require('./services/webhook.service');//
const orderRoutes = require('./routes/order.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle SPA (Single Page Application) routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});


app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);


app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = webhookService.constructEvent(req.body, req.headers['stripe-signature']);
    
    if (event.type === 'checkout.session.completed') {
      await webhookService.handleCheckoutSession(event.data.object);
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});