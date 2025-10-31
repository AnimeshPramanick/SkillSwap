import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../contexts/SocketContext";
import { useMessages } from "../../contexts/MessagesContext";
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
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected, onlineUsers } = useSocket();
  const { unreadCount } = useMessages();
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
    <nav className="navbar">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="SkillSwap Logo"
              className="w-10 h-10 object-cover rounded-full"
            />
            <span className="text-xl font-bold text-neutral-900 hidden sm:block">
              SkillSwap
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isMessages = item.name === "Messages";
              const hasUnread = isMessages && unreadCount > 0;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    nav-link
                    ${item.current ? "nav-link active" : ""}
                    flex items-center space-x-2 relative
                  `}
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
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="hidden sm:flex items-center space-x-2">
              <div
                className={`
                  w-2 h-2 rounded-full
                  ${isConnected ? "bg-success" : "bg-neutral-400"}
                `}
                title={isConnected ? "Connected" : "Disconnected"}
              />
              {isConnected && onlineUsers.length > 0 && (
                <span className="text-sm text-neutral-500">
                  {onlineUsers.length} online
                </span>
              )}
            </div>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
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
                <span className="hidden sm:block text-sm font-medium text-neutral-700">
                  {user?.profile?.name || user?.username}
                </span>
              </button>
            </div>

            {/* Settings */}
            <button
              onClick={() => navigate("/settings")}
              className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors"
              title="Settings"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-500 hover:text-error transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-500 hover:text-neutral-700"
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
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium
                    ${
                      item.current
                        ? "bg-primary-50 text-primary-700"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                    }
                  `}
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
