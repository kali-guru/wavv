import React, { useState } from "react";
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaCalendarAlt, FaCog } from "react-icons/fa";
import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  const openRegisterModal = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  return (
    <header className="text-textColor w-full">
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        {/* Logo */}
        <div className="text-2xl font-bold cursor-pointer">
          <ScrollLink
            to="home"
            spy={true}
            smooth={true}
            duration={500}
            className="hover:hoverColor transition duration-300"
          >
            wavv
          </ScrollLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <ScrollLink
            to="home"
            spy={true}
            smooth={true}
            duration={500}
            className="text-textColor hover:text-hoverColor transition duration-300 cursor-pointer"
          >
            Home
          </ScrollLink>
          <ScrollLink
            to="discover"
            spy={true}
            smooth={true}
            duration={500}
            className="text-textColor hover:text-hoverColor transition duration-300 cursor-pointer"
          >
            Discover
          </ScrollLink>
          <ScrollLink
            to="services"
            spy={true}
            smooth={true}
            duration={500}
            className="text-textColor hover:text-hoverColor transition duration-300 cursor-pointer"
          >
            Services
          </ScrollLink>
          <RouterLink
            to="/testimonials"
            className="text-textColor hover:text-hoverColor transition duration-300 cursor-pointer"
          >
            Testimonials
          </RouterLink>
          <ScrollLink
            to="contact"
            spy={true}
            smooth={true}
            duration={500}
            className="text-textColor hover:text-hoverColor transition duration-300 cursor-pointer"
          >
            Contact
          </ScrollLink>
        </nav>

        {/* Authentication Buttons / User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-textColor hover:text-hoverColor transition duration-300"
              >
                <FaUser />
                <span>{user?.name || 'User'}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user?.email}
                  </div>
                  <RouterLink
                    to="/dashboard"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaCalendarAlt />
                    <span>Dashboard</span>
                  </RouterLink>
                  <RouterLink
                    to="/profile"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaUser />
                    <span>Profile</span>
                  </RouterLink>
                  {user?.role === 'admin' && (
                    <RouterLink
                      to="/admin"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaCog />
                      <span>Admin Panel</span>
                    </RouterLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={openLoginModal}
                className="text-textColor hover:text-hoverColor transition duration-300"
              >
                Login
              </button>
              <button
                onClick={openRegisterModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="text-textColor hover:text-hoverColor transition duration-300"
              >
                <FaUser size={20} />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user?.name}
                  </div>
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    {user?.email}
                  </div>
                  <RouterLink
                    to="/dashboard"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaCalendarAlt />
                    <span>Dashboard</span>
                  </RouterLink>
                  <RouterLink
                    to="/profile"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaUser />
                    <span>Profile</span>
                  </RouterLink>
                  {user?.role === 'admin' && (
                    <RouterLink
                      to="/admin"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaCog />
                      <span>Admin Panel</span>
                    </RouterLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={openLoginModal}
                className="text-textColor hover:text-hoverColor transition duration-300 text-sm"
              >
                Login
              </button>
              <button
                onClick={openRegisterModal}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition duration-300 text-sm"
              >
                Register
              </button>
            </div>
          )}
          
          <button onClick={toggleMenu} aria-label="Toggle Menu">
            {isOpen ? (
              <FaTimes size={24} className="text-textColor" />
            ) : (
              <FaBars size={24} className="text-textColor" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:hidden text-textColor text-center py-6 space-y-4 transition duration-300`}
      >
        <ScrollLink
          to="home"
          spy={true}
          smooth={true}
          duration={500}
          className="block text-textColor hover:text-hoverColor transition duration-300 cursor-pointer"
          onClick={toggleMenu}
        >
          Home
        </ScrollLink>
        <ScrollLink
          to="discover"
          spy={true}
          smooth={true}
          duration={500}
          className="block text-textColor hover:text-hoverColor transition duration-300 cursor-pointer"
          onClick={toggleMenu}
        >
          Discover
        </ScrollLink>
        <ScrollLink
          to="services"
          spy={true}
          smooth={true}
          duration={500}
          className="block text-textColor hover:text-hoverColor transition duration-300 cursor-pointer"
          onClick={toggleMenu}
        >
          Services
        </ScrollLink>
        <RouterLink
          to="/testimonials"
          className="block text-textColor hover:text-hoverColor transition duration-300 cursor-pointer"
          onClick={toggleMenu}
        >
          Testimonials
        </RouterLink>
        <ScrollLink
          to="contact"
          spy={true}
          smooth={true}
          duration={500}
          className="block text-textColor hover:text-hoverColor transition duration-300 cursor-pointer"
          onClick={toggleMenu}
        >
          Contact
        </ScrollLink>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeModals}
        onSwitchToRegister={openRegisterModal}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={closeModals}
        onSwitchToLogin={openLoginModal}
      />
    </header>
  );
};

export default Header;
