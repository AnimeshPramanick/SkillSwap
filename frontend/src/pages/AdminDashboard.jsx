import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import {
  UsersIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, searchQuery, userFilter, pagination.page]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.admin.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        status: userFilter,
      });
      setUsers(response.data.users);
      setPagination((prev) => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiService.admin.updateUser(userId, {
        isActive: !currentStatus,
      });
      toast.success(
        `User ${currentStatus ? "deactivated" : "activated"} successfully`
      );
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`
      )
    ) {
      return;
    }

    try {
      await apiService.admin.bulkAction(action, selectedUsers);
      toast.success(`Bulk ${action} completed`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast.error("Failed to perform bulk action");
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: ChartBarIcon },
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "reports", label: "Reports", icon: ExclamationTriangleIcon },
    { id: "system", label: "System", icon: ShieldCheckIcon },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-neutral-900">{value}</h3>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheckIcon className="w-8 h-8 text-primary-500" />
            <h1 className="text-h1">Admin Dashboard</h1>
          </div>
          <p className="text-neutral-600">Platform management and monitoring</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-neutral-200">
          <div className="flex space-x-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.users.total}
                icon={UsersIcon}
                color="bg-blue-500"
                subtitle={`+${stats.users.newLast30Days} this month`}
              />
              <StatCard
                title="Active Matches"
                value={stats.matches.active}
                icon={UserGroupIcon}
                color="bg-green-500"
                subtitle={`${stats.matches.pending} pending`}
              />
              <StatCard
                title="Total Sessions"
                value={stats.sessions.total}
                icon={CalendarIcon}
                color="bg-purple-500"
                subtitle={`${stats.sessions.completed} completed`}
              />
              <StatCard
                title="Messages"
                value={stats.messages.total}
                icon={ChatBubbleLeftRightIcon}
                color="bg-yellow-500"
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Status */}
              <div className="card">
                <h3 className="text-h3 mb-4">User Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">Active Users</span>
                    <span className="font-semibold text-green-600">
                      {stats.users.active}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">Inactive Users</span>
                    <span className="font-semibold text-red-600">
                      {stats.users.inactive}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">New This Month</span>
                    <span className="font-semibold text-primary-600">
                      {stats.users.newLast30Days}
                    </span>
                  </div>
                </div>
              </div>

              {/* Session Stats */}
              <div className="card">
                <h3 className="text-h3 mb-4">Session Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">Scheduled</span>
                    <span className="font-semibold text-blue-600">
                      {stats.sessions.scheduled}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">Completed</span>
                    <span className="font-semibold text-green-600">
                      {stats.sessions.completed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">New This Month</span>
                    <span className="font-semibold text-primary-600">
                      {stats.sessions.newLast30Days}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Filter */}
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    className="btn btn-outline btn-sm"
                  >
                    Activate ({selectedUsers.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    className="btn btn-outline btn-sm"
                  >
                    Deactivate ({selectedUsers.length})
                  </button>
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === users.length &&
                          users.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => handleSelectUser(u.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="avatar avatar-sm">
                            {u.profile?.avatar ? (
                              <img src={u.profile.avatar} alt={u.username} />
                            ) : (
                              <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-500 text-xs font-semibold">
                                  {(u.username || "U").charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">
                              {u.profile?.name || u.username}
                            </div>
                            <div className="text-xs text-neutral-500">
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        {u.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {u.createdAt && !isNaN(new Date(u.createdAt).getTime())
                          ? format(new Date(u.createdAt), "MMM d, yyyy")
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            handleToggleUserStatus(u.id, u.isActive)
                          }
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                Showing {users.length} of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="card text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-h3 mb-2">Reports Management</h3>
            <p className="text-neutral-600">
              Content moderation features will be available here
            </p>
          </div>
        )}

        {/* System Tab */}
        {activeTab === "system" && (
          <div className="card text-center py-12">
            <ShieldCheckIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-h3 mb-2">System Monitoring</h3>
            <p className="text-neutral-600">
              System health and monitoring tools will be available here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
