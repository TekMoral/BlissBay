import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Function to check if token is valid
const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    // Add a 5-minute buffer to prevent edge cases
    return tokenData.exp * 1000 > Date.now() + (5 * 60 * 1000);
  } catch (e) {
    console.error("Error parsing token:", e);
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user & validate token on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken && isTokenValid(savedToken)) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    } else if (savedToken && !isTokenValid(savedToken)) {
      // Clear invalid auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    
    setIsLoading(false);
  }, []);

  // Login function to update state & storage
  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function to clear everything
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
