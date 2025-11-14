import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../contexts/SocketContext";
import { useMessages } from "../../contexts/MessagesContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected, onlineUsers } = useSocket();
  const { unreadCount } = useMessages();
  const { mode, toggleMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      current: location.pathname === "/dashboard",
    },
    {
      name: "Discover",
      href: "/discover",
      icon: MagnifyingGlassIcon,
      current: location.pathname === "/discover",
    },
    {
      name: "Matches",
      href: "/matches",
      icon: UserGroupIcon,
      current: location.pathname === "/matches",
    },
    {
      name: "Messages",
      href: "/messages",
      icon: ChatBubbleLeftRightIcon,
      current: location.pathname.startsWith("/messages"),
    },
    {
      name: "Sessions",
      href: "/sessions",
      icon: CalendarIcon,
      current: location.pathname === "/sessions",
    },
  ];

  // Add admin link if user is admin (case-insensitive check)
  if (user?.role && user.role.toLowerCase() === "admin") {
    navigationItems.push({
      name: "Admin",
      href: "/admin",
      icon: ShieldCheckIcon,
      current: location.pathname === "/admin",
    });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md px-4 py-3 transition-colors">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0 mr-4 md:mr-6 hover:opacity-90 transition-opacity">
            <img
              src="/logo.png"
              alt="SkillSwap Logo"
              className="w-10 h-10 object-cover rounded-full shadow-sm"
            />
            <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100 hidden lg:block">
              SkillSwap
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-1 justify-center">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isMessages = item.name === "Messages";
              const hasUnread = isMessages && unreadCount > 0;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link flex items-center space-x-2 relative px-3 py-2 rounded-xl transition-smooth ${
                      item.current
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.name}</span>
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Connection Status */}
            <div className="hidden lg:flex items-center space-x-2">
              <div
                className={`
                  w-2 h-2 rounded-full
                  ${isConnected ? "bg-success" : "bg-neutral-400"}
                `}
                title={isConnected ? "Connected" : "Disconnected"}
              />
              {isConnected && onlineUsers.length > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {onlineUsers.length} online
                </span>
              )}
            </div>

            {/* User Avatar */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors hover:shadow-sm"
              >
                <div className="avatar avatar-md flex-shrink-0">
                  {user?.profile?.avatar ? (
                    <img
                      src={user.profile.avatar}
                      alt={user?.profile?.name || user?.username}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-primary-500" />
                    </div>
                  )}
                  {user?.isOnline && <div className="status-online" />}
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.profile?.name || user?.username}
                </span>
              </button>
            </div>

            {/* Light/Dark Mode Toggle with elegant design */}
            <button
              onClick={toggleMode}
              aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className={
                "p-2 mx-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
              }
            >
              {mode === "light" ? (
                <MoonIcon className="w-5 h-5 text-slate-700" />
              ) : (
                <SunIcon className="w-5 h-5 text-yellow-300" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => navigate("/settings")}
              className="p-2 text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white transition-colors flex-shrink-0 rounded-lg"
              title="Settings"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-red-400 transition-colors rounded-lg dark:hover:bg-red-50/10"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                          item.current
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile only items */}
            <div className="pt-4 border-t border-neutral-200">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              >
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-error hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
