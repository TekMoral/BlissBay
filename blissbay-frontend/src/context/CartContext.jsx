// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from '../lib/axiosInstance'; // Updated import
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { debounce } from 'lodash';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const SHIPPING_RATES = {
  standard: { name: 'Standard Shipping', price: 5.99, estimatedDays: '5-7 business days' },
  overnight: { name: 'Overnight Shipping', price: 29.99, estimatedDays: '1 business day' },
};

const FREE_SHIPPING_THRESHOLD = 100;

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState([]);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [shippingAddress, setShippingAddress] = useState(null);

 useEffect(() => {
  if (isAuthenticated && user?.token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    fetchCart();
    fetchShippingAddress();
  } else {
    resetCart();
  }
}, [isAuthenticated, user?.id]);

  const fetchCart = async () => {
    try {
      const { data } = await axiosInstance.get('/api/carts');
      setCartItems(data.cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const updateShippingMethod = (method) => {
    if (SHIPPING_RATES[method]) {
      setShippingMethod(method);
    } else {
      throw new Error('Invalid shipping method');
    }
  };


const fetchShippingAddress = async () => {
  try {
        if (!isAuthenticated || !user?.token) return;

    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;

    const { data } = await axiosInstance.get('/api/addresses/default');
    if (data.success) {
      setShippingAddress(data.address);
    }
  } catch (error) {
    console.error('Error fetching shipping address:', error);
  }
};

const updateShippingAddress = async (address) => {
  try {
    // If updating an existing address
    if (address._id) {
      const { data } = await axiosInstance.put(`/api/addresses/${address._id}`, address);
      if (data.success) {
        setShippingAddress(data.address);
        showToast('Shipping address updated successfully!', 'success');
      }
    } 
    // If creating a new address
    else {
      const { data } = await axiosInstance.post('/api/addresses', {
        ...address,
        isDefault: true
      });
      if (data.success) {
        setShippingAddress(data.address);
        showToast('Shipping address added successfully!', 'success');
      }
    }
  } catch (error) {
    console.error('Error updating address:', error);
    showToast('Failed to update shipping address.', 'error');
  }
};

  const getCartTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATES[shippingMethod].price;

    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    };
  };

  const getEstimatedDelivery = () => SHIPPING_RATES[shippingMethod]?.estimatedDays || '';

  const getAvailableShippingMethods = () => {
    if (!shippingAddress) return [];
    return Object.entries(SHIPPING_RATES).map(([key, value]) => ({
      id: key,
      ...value,
      available: true,
    }));
  };

  // Debounced function for updating quantity on server
  const debouncedUpdateQuantityOnServer = debounce(async (productId, quantity) => {
    try {
      await axiosInstance.put('/api/cart/update', { productId, quantity });
    } catch (error) {
      console.error('Error updating quantity on server:', error);
      showToast('Failed to update quantity.', 'error');
    }
  }, 2500);

  const addToCart = (product) => setCartItems(prev => [...prev, product]);
  const removeFromCart = (productId) => setCartItems(prev => prev.filter(item => item._id !== productId));
  const updateQuantity = (productId, quantity) => {
    setCartItems(prev => 
      prev.map(item => item._id === productId ? { ...item, quantity } : item)
    );
    debouncedUpdateQuantityOnServer(productId, quantity); 
  };
  
  const clearCart = () => setCartItems([]);
  const resetCart = () => { setCartItems([]); setShippingAddress(null); };

  const isInCart = (productId) => cartItems.some(item => item._id === productId);
  const getItemQuantity = (productId) => cartItems.find(item => item._id === productId)?.quantity || 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        shippingMethod,
        shippingAddress,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotals,
        isInCart,
        getItemQuantity,
        updateShippingMethod,
        updateShippingAddress,
        getEstimatedDelivery,
        getAvailableShippingMethods,
        SHIPPING_RATES,
        FREE_SHIPPING_THRESHOLD,
        cartItemCount: cartItems.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;