# BlissBay E-commerce Platform


A full-stack e-commerce platform designed to deliver a seamless shopping experience across a wide range of products — from fashion and accessories to electronics, home essentials, and more. Built for versatility, speed, and user satisfaction.


## 🚀 Features

### Frontend
- **Modern React Architecture**: Built with React 18 and Vite
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Shopping Cart**: Full cart functionality with real-time updates
- **User Authentication**: Secure login and registration system
- **Product Catalog**: Browse and search through fashion items
- **Wishlist**: Save favorite items for later
- **Order Management**: Track orders and purchase history
- **Admin Panel**: Administrative interface for product and order management
- **Payment Integration**: Secure payment processing with Stripe
- **Image Optimization**: Responsive image handling and zoom functionality

### Backend
- **RESTful API**: Express.js-based API with comprehensive endpoints
- **Database**: MongoDB with replica set configuration
- **Authentication**: JWT-based authentication system
- **File Upload**: Multer integration for product and avatar images
- **Payment Processing**: Stripe integration for secure payments
- **Email Service**: SendGrid integration for notifications
- **Caching**: Redis-based caching for improved performance
- **Queue System**: Bull/BullMQ for background job processing
- **Rate Limiting**: Express rate limiting for API protection
- **Validation**: Joi-based request validation

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Lucide React, React Icons, Framer Motion
- **Notifications**: React Hot Toast, React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Payment**: Stripe
- **Email**: SendGrid, Nodemailer
- **Caching**: Redis (ioredis)
- **Queue**: Bull/BullMQ
- **Validation**: Joi
- **Testing**: Mocha, Chai, Supertest

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: MongoDB Replica Set (3 nodes)
- **Cache**: Redis
- **Reverse Proxy**: Nginx (production)

## 📋 Prerequisites

- Node.js (v16 or higher)
- Docker & Docker Compose
- MongoDB (if running locally)
- Redis (if running locally)

## 🚀 Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd BlissBayProject
```

2. Start all services:
```bash
docker-compose up -d
```

3. Access the applications:
   - Frontend: http://localhost:5176
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27027, 27028, 27029

### Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd BlissBay
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the backend:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd blissbay-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the frontend:
```bash
npm run dev
```

## 📁 Project Structure

```
BlissBayProject/
├── BlissBay/                    # Backend API
│   ├── controllers/             # Route controllers
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API routes
│   ├── middlewares/             # Custom middleware
│   ├── services/                # Business logic services
│   ├── utils/                   # Utility functions
│   ├── validators/              # Request validators
│   ├── config/                  # Configuration files
│   ├── uploads/                 # File uploads
│   └── BlissApp.js             # Main application file
├── blissbay-frontend/          # Frontend React app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React Context providers
│   │   ├── api/                # API service functions
│   │   ├── admin/              # Admin panel components
│   │   └── utils/              # Helper functions
│   └── public/                 # Static assets
├── docker-compose.yml          # Docker services configuration
└── README.md                   # This file
```

## 🔧 Available Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
npm run docker:up  # Start Docker services
npm run docker:down # Stop Docker services
```

### Frontend Scripts
```bash
npm run dev        # Start development server (port 5175)
npm run build      # Build for production
npm run serve      # Preview production build
```

### Docker Scripts
```bash
docker-compose up -d              # Start all services in background
docker-compose down               # Stop all services
docker-compose logs backend       # View backend logs
docker-compose logs frontend      # View frontend logs
```

## 🌐 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart & Orders
- `GET /api/carts` - Get user cart
- `POST /api/carts` - Add to cart
- `PUT /api/carts/:id` - Update cart item
- `DELETE /api/carts/:id` - Remove from cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Manage users
- `GET /api/admin/orders` - Manage orders

## 🔒 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blissbay
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
SENDGRID_API_KEY=your_sendgrid_key
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:5175
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
npm test

# Run specific test suite
npm run test:product

# Run tests with coverage
npm run test:coverage

# Run tests in Docker
npm run docker:test
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd blissbay-frontend
npm run build

# Start backend in production
cd ../BlissBay
npm start
```

### Docker Production
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### MongoDB Replica Set
The project uses MongoDB replica set for high availability:
- Primary: mongo1 (port 27027)
- Secondary: mongo2 (port 27028)
- Secondary: mongo3 (port 27029)

### Redis Configuration
Redis is used for:
- Session storage
- Caching frequently accessed data
- Queue management for background jobs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨💻 Author

**Adewale Gabriel** - [@GabiDev2025](https://github.com/GabiDev2025)

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

## 🔄 Version History

- **v2.0.0** - Current version with full-stack implementation
- **v1.0.0** - Initial release

---
