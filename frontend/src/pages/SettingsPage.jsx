import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const SettingsPage = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notifications");
  const [loading, setLoading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    matches: true,
    messages: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showOnline: true,
    showLocation: false,
  });

  useEffect(() => {
    if (user?.preferences) {
      setNotificationSettings({
        email: user.preferences.notifications?.email ?? true,
        push: user.preferences.notifications?.push ?? true,
        matches: user.preferences.notifications?.matches ?? true,
        messages: user.preferences.notifications?.messages ?? true,
      });
      setPrivacySettings({
        showOnline: user.preferences.privacy?.showOnline ?? true,
        showLocation: user.preferences.privacy?.showLocation ?? false,
      });
    }
  }, [user]);

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      await apiService.users.updateNotificationPreferences(
        notificationSettings
      );
      toast.success("Notification settings updated!");
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error("Failed to update notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    try {
      await apiService.users.updatePrivacyPreferences(privacySettings);
      toast.success("Privacy settings updated!");
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate your account? You can reactivate it later by logging in."
      )
    ) {
      return;
    }

    try {
      await apiService.users.deactivateAccount();
      toast.success("Account deactivated successfully");
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error deactivating account:", error);
      toast.error("Failed to deactivate account");
    }
  };

  const tabs = [
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "privacy", label: "Privacy", icon: ShieldCheckIcon },
    { id: "account", label: "Account", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-h1 mb-2">Settings</h1>
            <p className="text-neutral-600">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Tabs */}
            <div className="md:w-64">
              <div className="card">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary-50 text-primary-700"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="card">
                  <div className="flex items-center space-x-3 mb-6">
                    <BellIcon className="w-6 h-6 text-primary-500" />
                    <h2 className="text-h2">Notification Preferences</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        Email Notifications
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-900">
                              Email notifications
                            </div>
                            <div className="text-sm text-neutral-600">
                              Receive notifications via email
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.email}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                email: e.target.checked,
                              })
                            }
                            className="toggle"
                          />
                        </label>
                      </div>
                    </div>

                    <hr className="border-neutral-200" />

                    {/* Push Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        Push Notifications
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-900">
                              Push notifications
                            </div>
                            <div className="text-sm text-neutral-600">
                              Receive push notifications in your browser
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.push}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                push: e.target.checked,
                              })
                            }
                            className="toggle"
                          />
                        </label>
                      </div>
                    </div>

                    <hr className="border-neutral-200" />

                    {/* Activity Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        Activity Notifications
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-900">
                              New matches
                            </div>
                            <div className="text-sm text-neutral-600">
                              Get notified when you have new matches
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.matches}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                matches: e.target.checked,
                              })
                            }
                            className="toggle"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-900">
                              New messages
                            </div>
                            <div className="text-sm text-neutral-600">
                              Get notified when you receive new messages
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.messages}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                messages: e.target.checked,
                              })
                            }
                            className="toggle"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleNotificationUpdate}
                        disabled={loading}
                        className="btn btn-primary"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="card">
                  <div className="flex items-center space-x-3 mb-6">
                    <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
                    <h2 className="text-h2">Privacy Settings</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        Visibility
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-900">
                              Show online status
                            </div>
                            <div className="text-sm text-neutral-600">
                              Let others see when you're online
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={privacySettings.showOnline}
                            onChange={(e) =>
                              setPrivacySettings({
                                ...privacySettings,
                                showOnline: e.target.checked,
                              })
                            }
                            className="toggle"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-900">
                              Show location
                            </div>
                            <div className="text-sm text-neutral-600">
                              Display your location on your profile
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={privacySettings.showLocation}
                            onChange={(e) =>
                              setPrivacySettings({
                                ...privacySettings,
                                showLocation: e.target.checked,
                              })
                            }
                            className="toggle"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handlePrivacyUpdate}
                        disabled={loading}
                        className="btn btn-primary"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  {/* Account Information */}
                  <div className="card">
                    <div className="flex items-center space-x-3 mb-6">
                      <UserIcon className="w-6 h-6 text-primary-500" />
                      <h2 className="text-h2">Account Information</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-neutral-500">
                          Username
                        </label>
                        <p className="text-neutral-900 font-medium">
                          @{user?.username}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral-500">
                          Email
                        </label>
                        <p className="text-neutral-900 font-medium">
                          {user?.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral-500">Role</label>
                        <p className="text-neutral-900 font-medium capitalize">
                          {user?.role || "User"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-neutral-500">
                          Member Since
                        </label>
                        <p className="text-neutral-900 font-medium">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Link to="/profile" className="btn btn-outline">
                        Edit Profile
                      </Link>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="card border-2 border-red-200 bg-red-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                      <h2 className="text-h2 text-red-900">Danger Zone</h2>
                    </div>

                    <p className="text-sm text-red-700 mb-4">
                      Once you deactivate your account, you will lose access to
                      your profile and data. You can reactivate your account by
                      logging in again.
                    </p>

                    <button
                      onClick={handleDeactivateAccount}
                      className="btn bg-red-600 hover:bg-red-700 text-white"
                    >
                      <TrashIcon className="w-5 h-5 mr-2" />
                      Deactivate Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
