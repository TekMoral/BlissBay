# BlissBay Frontend

A modern, responsive e-commerce frontend application built with React and Vite, designed to provide customers with a seamless shopping experience for trendy fashion items including clothing and accessories.

## 🚀 Features

- **Modern React Architecture**: Built with React 18 and Vite for optimal performance
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Shopping Cart**: Full cart functionality with real-time updates
- **User Authentication**: Secure login and registration system
- **Product Catalog**: Browse and search through fashion items
- **Wishlist**: Save favorite items for later
- **Order Management**: Track orders and purchase history
- **Admin Panel**: Administrative interface for product and order management
- **Payment Integration**: Secure payment processing
- **Image Optimization**: Responsive image handling and zoom functionality
- **Toast Notifications**: User-friendly feedback system

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**:
  - Lucide React (Icons)
  - React Icons
  - Framer Motion (Animations)
- **Image Handling**: React Image File Resizer, React Medium Image Zoom
- **Notifications**: React Hot Toast, React Toastify
- **SEO**: React Helmet Async
- **Utilities**: Lodash, Date-fns

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- BlissBay Backend API running

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BlissBayProject/blissbay-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Configure your environment variables in the `.env` file.

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5175`

### Available Scripts

- `npm run dev` - Start development server on port 5175
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm test` - Run tests (to be implemented)

## 🐳 Docker Support

The frontend can be run using Docker as part of the full BlissBay stack:

```bash
# From the project root
docker-compose up frontend
```

## 📁 Project Structure

```
src/
├── admin/          # Admin panel components
├── api/            # API service functions
├── assets/         # Static assets
├── components/     # Reusable UI components
├── context/        # React Context providers
├── data/           # Static data and constants
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries
├── pages/          # Page components
├── routes/         # Route configurations
├── Services/       # Business logic services
├── styles/         # Global styles
└── utils/          # Helper functions
```

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS with custom configurations including:
- Line clamp plugin for text truncation
- Custom color schemes
- Responsive breakpoints

### Vite Configuration
- React plugin for Fast Refresh
- Port configuration (5175)
- Development optimizations

### ESLint
Configured with React-specific rules for code quality and consistency.

## 🌐 API Integration

The frontend communicates with the BlissBay backend API for:
- User authentication and management
- Product catalog and search
- Shopping cart operations
- Order processing
- Payment handling
- Admin operations

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🔒 Security Features

- Secure authentication flow
- Protected routes for authenticated users
- Admin-only sections
- Input validation and sanitization
- CORS configuration

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Variables
Ensure all production environment variables are properly configured:
- API endpoints
- Authentication keys
- Payment gateway credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Adewale Gabriel** - [@TekMoral2025](https://github.com/GabiDev2025)

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

*Built with ❤️ to make fashion shopping easier and more enjoyable.*
