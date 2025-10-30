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
    fetchUsers();
    fetchSkillCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.users.searchUsers({});
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
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

    setFilteredUsers(filtered);
  };

  const handleFindMatches = async () => {
    try {
      setDiscovering(true);
      const response = await apiService.matches.findMatches();
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setFilteredUsers(response.data.suggestions);
        toast.success(
          `Found ${response.data.suggestions.length} potential matches!`
        );
      } else {
        toast.info("No new matches found at this time");
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
      await apiService.matches.createMatch(userId);
      toast.success("Match created successfully!");
      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error(error.response?.data?.error || "Failed to create match");
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
          <div className="flex gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, username, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? "btn-primary" : "btn-outline"}`}
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
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
              className="btn btn-primary"
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
                onMatch={handleCreateMatch}
                showMatchButton={true}
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
