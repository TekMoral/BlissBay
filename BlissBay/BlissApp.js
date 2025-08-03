import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import adminRoutes from './adminRoutes/index.js';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Import cache control middleware
import { preventCache, enableCache } from './middlewares/cacheControl.js';

// Middleware to prevent caching
app.use(preventCache);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    exposedHeaders: ['Cache-Control'],
}));

// Ensure avatar upload directory exists
const avatarDir = path.join(__dirname, 'uploads/avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// ✅ Ensure product upload directory exists
const productUploadDir = path.join(__dirname, 'uploads/products');
if (!fs.existsSync(productUploadDir)) {
  fs.mkdirSync(productUploadDir, { recursive: true });
}

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `avatar_${timestamp}${extension}`);
  }
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});





// Expose uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make upload middleware globally accessible
app.locals.upload = {
  avatar: uploadAvatar,
};

// Body parser middleware
app.use(express.json());

// Database connection
connectDB();

// Routes
import healthRoutes from './routes/healthRoute.js';
import usersRoutes from './routes/usersRoutes.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import discountRoutes from './routes/discountRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

app.use('/api/admin', adminRoutes);
app.use('/api', healthRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', enableCache(3600), productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', enableCache(7200), categoryRoutes);

// Middleware for unmatched routes
app.use((req, res, next) => {
    console.log('No route matched:', req.method, req.url);
    next();
});

// Error handler
app.use(errorHandler);

// Root route
app.get('/', (req, res) => {
    res.send('Hello World! Gabriel, You will conquer');
});

// Start the server
app.listen(5000, '0.0.0.0', () => {
    console.log('BlissApp is running on port 5000');
});
