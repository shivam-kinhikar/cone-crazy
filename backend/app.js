const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorMiddleware } = require('./src/middlewares/error.middleware');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const categoryRoutes = require('./src/routes/category.routes');
const productRoutes = require('./src/routes/product.routes');
const uploadRoutes = require('./src/routes/upload.routes');
const inventoryRoutes = require('./src/routes/inventory.routes');
const customerRoutes = require('./src/routes/customer.routes');
const orderRoutes = require('./src/routes/order.routes');
const invoiceRoutes = require('./src/routes/invoice.routes');
const offerRoutes = require('./src/routes/offer.routes');
const userRoutes = require('./src/routes/user.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const reportRoutes = require('./src/routes/report.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');

const app = express();

// Serve static files (like PDF invoices)
app.use(express.static('public'));

// Global Middlewares
app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173', // Vite local development
  'http://localhost:3000', // React CRA local development
  process.env.FRONTEND_URL // Production frontend URL
].filter(Boolean); // Remove undefined/null

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(url => origin.startsWith(url))) {
      callback(null, true);
    } else {
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running normally' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to the ICPMS API' });
});

// 404 Route Not Found
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
