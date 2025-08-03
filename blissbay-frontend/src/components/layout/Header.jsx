import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import webIcon from "../../assets/images/webicon.jpg";
import { Link } from "react-router-dom";
import { Menu, Search, ShoppingCart, User, ChevronDown, X } from "lucide-react";
import PropTypes from "prop-types";
import { useClickOutside } from "../../hooks/UseClickoutside";

const Header = ({ cartItemCount = 0 }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setIsAccountDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Create refs for the elements
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const accountButtonRef = useRef(null);

  // Use the click outside hook for mobile menu
  useClickOutside([mobileMenuRef, mobileMenuButtonRef], isMobileMenuOpen, () =>
    setIsMobileMenuOpen(false)
  );

  // Use the click outside hook for account dropdown
  useClickOutside(
    [accountDropdownRef, accountButtonRef],
    isAccountDropdownOpen,
    () => setIsAccountDropdownOpen(false)
  );

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const toggleAccountDropdown = () => setIsAccountDropdownOpen((prev) => !prev);
  const toggleSearch = () => setIsSearchOpen((open) => !open);

  return (
    <header className="bg-white shadow-md fixed top-0 w-full z-50">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-1.5">
        {isSearchOpen ? (
          // MOBILE SEARCH ONLY VIEW
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search products, brands or categories..."
              className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              Go
            </button>
            <button onClick={toggleSearch} className="ml-2 text-gray-600">
              <X />
            </button>
          </div>
        ) : (
          // FULL HEADER VIEW
          <div className="flex justify-between items-center">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center space-x-4">
              <button ref={mobileMenuButtonRef} onClick={toggleMobileMenu}>
                <Menu className="text-gray-700" />
              </button>
              <Link to="/" className="flex items-center space-x-1">
                <img
                  src={webIcon}
                  alt="BlissBay Logo"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-2xl font-bold text-blue-600">
                  BlissBay
                </span>
              </Link>
            </div>

            {/* Center: Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // handle search
                }}
                className="flex w-full"
              >
                <input
                  type="text"
                  placeholder="Search products, brands or categories..."
                  className="flex-1 px-4 py-2 border border-r-0 rounded-l-md focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search Icon */}
              <div className="md:hidden">
                <button onClick={toggleSearch}>
                  <Search className="text-gray-700 hover:text-blue-500" />
                </button>
              </div>

              {/* Account */}
              {!isSearchOpen && (
                <div className="relative">
                  <button
                    ref={accountButtonRef}
                    onClick={toggleAccountDropdown}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600"
                  >
                    <User />
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown size={18} />
                  </button>
                  {isAccountDropdownOpen && (
                    <div
                      ref={accountDropdownRef}
                      className="absolute right-0 mt-2 w-48 bg-white border shadow rounded-md z-10"
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        My Wishlist
                      </Link>
                      {isAuthenticated && user?.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 hover:bg-gray-100 text-blue-600 font-medium"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      {isAuthenticated && (
                        <button
                          onClick={handleLogoutClick}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        >
                          Logout
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Login/Logout */}
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="hidden md:inline text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={handleLogoutClick}
                  className="hidden md:inline text-gray-700 hover:text-blue-600 flex items-center"
                >
                  <span>Logout</span>
                </button>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative">
                <ShoppingCart className="text-gray-700 hover:text-blue-600" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && !isSearchOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-full left-2 w-30 bg-white px-4 py-3 border-t shadow-lg space-y-2 z-50"
        >
          <Link to="/" className="block text-gray-700">
            Home
          </Link>
          <Link to="/products" className="block text-gray-700">
            Shop
          </Link>
          <Link to="/about" className="block text-gray-700">
            About
          </Link>
          <Link to="/Wishlist" className="block text-gray-700">
            Wishlist
          </Link>
          {/* Add more categories */}
        </div>
      )}
    </header>
  );
};

Header.propTypes = {
  cartItemCount: PropTypes.number.isRequired,
};

export default Header;
