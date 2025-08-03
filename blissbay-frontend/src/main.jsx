import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";
import ErrorBoundary from "./components/errors/ErrorBoundary";
import { HelmetProvider } from 'react-helmet-async';

import App from "./App";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import ProductGrid from "./components/product/ProductGrid";
import ProductPage from "./pages/ProductPage";
import Categories from "./components/categories/Categories";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/User/Profile";

// Admin pages
import AdminRoutes from './admin/routes/AdminRoutes';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <HelmetProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </HelmetProvider>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/products", element: <ProductGrid /> },
      { path: "/products/:id", element: <ProductPage /> },
      { path: "/categories", element: <Categories /> },

      // Auth routes
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { 
        path: "/profile", 
        element: <ProtectedRoute><Profile /></ProtectedRoute> 
      },

      // Admin routes
      {
        path: "/admin/*",
        element: <ProtectedRoute adminOnly={true}><AdminRoutes /></ProtectedRoute>,
        errorElement: <ErrorBoundary />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);