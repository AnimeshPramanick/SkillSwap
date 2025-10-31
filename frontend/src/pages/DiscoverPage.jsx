import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import UserProfileCard from "../components/ui/UserProfileCard";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

const DiscoverPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    skills: [],
    isOnline: false,
    location: "",
  });
  const [availableSkills, setAvailableSkills] = useState([]);

  useEffect(() => {
    if (user) {
      // Only fetch users after the current user is loaded
      fetchUsers();
      fetchSkillCategories();
    }
  }, [user?.id]); // Add dependency on user.id to refetch when user loads

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, users]);

  const fetchUsers = async () => {
    if (!user) {
      console.log("User not loaded yet, skipping fetch");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.users.searchUsers({});

      console.log("=== DEBUG INFO ===");
      console.log("Current user ID:", user?.id, "Type:", typeof user?.id);
      console.log("Current username:", user?.username);
      console.log("All users from API:", response.data.users);

      // Filter out the current user from the list using multiple comparison methods
      const otherUsers = (response.data.users || []).filter((u) => {
        // Compare both ID and username to be safe (handle type mismatch)
        const isSameId = String(u.id) === String(user?.id);
        const isSameUsername = u.username === user?.username;
        const shouldFilter = isSameId || isSameUsername;

        if (shouldFilter) {
          console.log(`Filtering out user: ${u.username} (ID: ${u.id})`);
        }

        return !shouldFilter;
      });

      console.log("Filtered users count:", otherUsers.length);
      console.log("=================");

      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillCategories = async () => {
    try {
      const response = await apiService.skills.getCategories();
      const allSkills =
        response.data.categories?.flatMap((cat) => cat.skills) || [];
      setAvailableSkills(allSkills);
    } catch (error) {
      console.error("Error fetching skill categories:", error);
    }
  };

  const applyFilters = () => {
    let filtered = users;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username?.toLowerCase().includes(query) ||
          u.profile?.name?.toLowerCase().includes(query) ||
          u.skills?.teachable?.some((s) => s.toLowerCase().includes(query)) ||
          u.skills?.desired?.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter((u) =>
        filters.skills.some(
          (skill) =>
            u.skills?.teachable?.includes(skill) ||
            u.skills?.desired?.includes(skill)
        )
      );
    }

    // Online status filter
    if (filters.isOnline) {
      filtered = filtered.filter((u) => u.isOnline);
    }

    // Location filter
    if (filters.location.trim()) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter((u) =>
        u.profile?.location?.toLowerCase().includes(location)
      );
    }

    // Always filter out current user as a final safety check
    filtered = filtered.filter((u) => {
      const isSameId = String(u.id) === String(user?.id);
      const isSameUsername = u.username === user?.username;
      return !isSameId && !isSameUsername;
    });

    setFilteredUsers(filtered);
  };

  const handleFindMatches = async () => {
    try {
      setDiscovering(true);
      const response = await apiService.matches.findMatches();
      console.log("Find matches response:", response.data);

      if (response.data.matches && response.data.matches.length > 0) {
        // Filter out the current user from suggestions using multiple comparison methods
        const suggestions = response.data.matches.filter((s) => {
          const isSameId = String(s.id) === String(user?.id);
          const isSameUsername = s.username === user?.username;
          return !isSameId && !isSameUsername;
        });
        setFilteredUsers(suggestions);
        toast.success(`Found ${suggestions.length} potential matches!`);
      } else {
        toast("No new matches found at this time", { icon: "ℹ️" });
      }
    } catch (error) {
      console.error("Error finding matches:", error);
      toast.error("Failed to find matches");
    } finally {
      setDiscovering(false);
    }
  };

  const handleCreateMatch = async (userId) => {
    try {
      // Check if trying to match with self (compare both as strings)
      if (String(userId) === String(user?.id) || userId === user?.username) {
        toast.error("You cannot create a match with yourself");
        return;
      }

      await apiService.matches.createMatch(userId);
      toast.success("Match created successfully!");
      // Refresh users list to remove the matched user
      await fetchUsers();
    } catch (error) {
      console.error("Error creating match:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create match";

      // Don't show duplicate error messages
      if (errorMessage.toLowerCase().includes("yourself")) {
        toast.error("You cannot match with yourself");
      } else if (errorMessage.toLowerCase().includes("already exists")) {
        toast("You already have a match with this user", { icon: "ℹ️" });
      } else if (errorMessage.toLowerCase().includes("compatibility")) {
        toast.error("No skill compatibility found with this user");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const toggleSkillFilter = (skill) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const clearFilters = () => {
    setFilters({
      skills: [],
      isOnline: false,
      location: "",
    });
    setSearchQuery("");
  };

  const hasActiveFilters =
    searchQuery.trim() ||
    filters.skills.length > 0 ||
    filters.isOnline ||
    filters.location.trim();

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
          <h1 className="text-h1 mb-2">Discover Users</h1>
          <p className="text-neutral-600">
            Find people with complementary skills to exchange knowledge
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search by name, username, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${
                showFilters ? "btn-primary" : "btn-outline"
              } whitespace-nowrap`}
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                  {filters.skills.length +
                    (filters.isOnline ? 1 : 0) +
                    (filters.location ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Smart Match Button */}
            <button
              onClick={handleFindMatches}
              disabled={discovering}
              className="btn btn-primary whitespace-nowrap"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              {discovering ? "Finding..." : "Smart Match"}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-h3 flex items-center">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-500 hover:text-primary-600"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Skills Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.desired?.slice(0, 10).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkillFilter(skill)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.skills.includes(skill)
                          ? "bg-primary-500 text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Online Status Filter */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isOnline}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        isOnline: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-neutral-700">
                    Show only online users
                  </span>
                </label>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="input w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-neutral-600">
            Showing{" "}
            <span className="font-semibold">{filteredUsers.length}</span> user
            {filteredUsers.length !== 1 ? "s" : ""}
            {hasActiveFilters && " matching your filters"}
          </p>
          <Link
            to="/matches"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            View Your Matches →
          </Link>
        </div>

        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((discoveredUser) => (
              <UserProfileCard
                key={discoveredUser.id}
                user={discoveredUser}
                onCreateMatch={handleCreateMatch}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <MagnifyingGlassIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-h3 mb-2">No users found</h3>
            <p className="text-neutral-600 mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "No users available at the moment"}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn btn-outline">
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
