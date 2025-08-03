import axios from "axios";

// Create the Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// Function to check if token is valid with debugging
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = tokenData.exp * 1000;
    const currentTime = Date.now();
    const isValid = expirationTime > currentTime;
    
    // Debug log
    console.debug('Token validation:', {
      expiresAt: new Date(expirationTime).toLocaleString(),
      currentTime: new Date(currentTime).toLocaleString(),
      minutesRemaining: Math.round((expirationTime - currentTime) / 60000),
      isValid
    });
    
    return isValid;
  } catch (e) {
    console.error("Error parsing token:", e);
    return false;
  }
};

// Add a request interceptor to include the token in every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Only add token if it exists and is valid
    if (token && isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors if not on login or register page
    if (error.response?.status === 401 && 
        !window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/register')) {
      
      // Check if we have a token and it's invalid
      const token = localStorage.getItem('token');
      if (token && !isTokenValid(token)) {
        // Clear auth data only if token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Store error message
        const errorMessage = 'Your session has expired. Please log in again.';
        sessionStorage.setItem('authError', errorMessage);
        
        // Use React Router compatible navigation
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
