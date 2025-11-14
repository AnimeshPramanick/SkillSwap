import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../contexts/SocketContext";
import { apiService, silentApi } from "../services/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import UserProfileCard from "../components/ui/UserProfileCard";
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  PlusIcon,
  TrendingUpIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

const DashboardPage = () => {
  const { user } = useAuth();
  const { isConnected, onlineUsers } = useSocket();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    averageRating: 0,
    totalMatches: 0,
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);

  useEffect(() => {
    console.log("DashboardPage: Fetching dashboard data...");
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data in parallel using silentApi to suppress error toasts
      const results = await Promise.allSettled([
        silentApi.get("/matches"),
        silentApi.get("/sessions", { params: { upcoming: true, limit: 5 } }),
        silentApi.get("/skills/recommendations"),
        user
          ? silentApi.get(`/users/${user.id}/stats`)
          : Promise.resolve({ data: {} }),
      ]);

      // Extract data from results, defaulting to empty arrays/objects on failure
      const [matchesResult, sessionsResult, suggestionsResult, statsResult] =
        results;

      setRecentMatches(
        matchesResult.status === "fulfilled"
          ? matchesResult.value?.data?.matches || []
          : []
      );

      setUpcomingSessions(
        sessionsResult.status === "fulfilled"
          ? sessionsResult.value?.data?.sessions || []
          : []
      );

      setSkillSuggestions(
        suggestionsResult.status === "fulfilled"
          ? suggestionsResult.value?.data?.recommendations || []
          : []
      );

      setStats(
        statsResult.status === "fulfilled"
          ? statsResult.value?.data?.stats || statsResult.value?.data || {}
          : {}
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Errors are already logged, no need to show toast
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Find Matches",
      description: "Discover people with complementary skills",
      href: "/discover",
      icon: MagnifyingGlassIcon,
      color: "bg-primary-500",
    },
    {
      title: "View Matches",
      description: "See your current skill matches",
      href: "/matches",
      icon: UserGroupIcon,
      color: "bg-blue-500",
    },
    {
      title: "Messages",
      description: "Chat with your connections",
      href: "/messages",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-green-500",
    },
    {
      title: "Schedule Session",
      description: "Book a learning session",
      href: "/sessions",
      icon: CalendarIcon,
      color: "bg-purple-500",
    },
  ];

  const dashboardStats = [
    {
      label: "Active Matches",
      value: recentMatches.length,
      icon: UserGroupIcon,
      color: "text-primary-500",
    },
    {
      label: "Upcoming Sessions",
      value: upcomingSessions.length,
      icon: CalendarIcon,
      color: "text-blue-500",
    },
    {
      label: "Total Hours",
      value: stats.totalHours || 0,
      icon: ClockIcon,
      color: "text-green-500",
    },
    {
      label: "Average Rating",
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A",
      icon: StarIcon,
      color: "text-yellow-500",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 antialiased">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 dark:from-cyan-700 dark:via-indigo-800 dark:to-indigo-900 text-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.profile?.name || user?.username}! 👋
          </h1>
          <p className="text-lg opacity-95">
            Ready to continue your skill exchange journey?
          </p>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">
                Connected to real-time updates
                {onlineUsers.length > 0 &&
                  ` • ${onlineUsers.length} users online`}
              </span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const IconComponent = stat.icon;
            const gradients = [
              "from-blue-500 to-blue-600",
              "from-cyan-500 to-cyan-600",
              "from-green-500 to-green-600",
              "from-amber-500 to-amber-600",
            ];

            return (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-500 dark:border-blue-400 shadow-sm transition-all duration-300 overflow-hidden group`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${gradients[index]} text-white`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full">
                      Today
                    </span>
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 dark:text-white drop-shadow-sm">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              const colors = [
                "from-blue-500 to-blue-600",
                "from-cyan-500 to-cyan-600",
                "from-green-500 to-green-600",
                "from-purple-500 to-purple-600",
              ];
              return (
                <Link
                  key={index}
                  to={action.href}
                  className="group relative overflow-hidden bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors[index]}`}></div>
                  <div className="p-6">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[index]} text-white w-fit mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-blue-500 transition-all">
                      {action.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Matches */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Recent Matches</h2>
                <Link
                  to="/matches"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm"
                >
                  View all →
                </Link>
              </div>

              {recentMatches.length > 0 ? (
                <div className="space-y-3">
                  {recentMatches.slice(0, 3).map((match, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="avatar avatar-md">
                              {match.otherParticipant?.avatar ? (
                                <img
                                  src={match.otherParticipant.avatar}
                                  alt={match.otherParticipant.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                  <span className="text-white font-semibold text-lg">
                                    {match.otherParticipant?.name?.charAt(0) ||
                                      "U"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 dark:text-white">
                              {match.otherParticipant?.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              Match created{" "}
                              {(() => {
                                try {
                                  if (!match.createdAt) return "recently";
                                  const date = match.createdAt.seconds
                                    ? new Date(match.createdAt.seconds * 1000)
                                    : new Date(match.createdAt);
                                  return isNaN(date.getTime())
                                    ? "recently"
                                    : format(date, "MMM d");
                                } catch (e) {
                                  return "recently";
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/messages/${match.otherParticipant?.id}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                          Message
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-neutral-800 rounded-xl text-center py-12 shadow-md">
                  <UserGroupIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    No matches yet
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Start by discovering people with complementary skills
                  </p>
                  <Link to="/discover" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Find Matches
                  </Link>
                </div>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Upcoming Sessions</h2>
                <Link
                  to="/sessions"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm"
                >
                  View all →
                </Link>
              </div>

              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-cyan-400 to-cyan-600 text-white rounded-lg">
                            <CalendarIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-neutral-900 dark:text-white">
                              {session.skill} Session
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {(() => {
                                try {
                                  if (!session.scheduledAt) return "Date TBD";
                                  const date = session.scheduledAt.seconds
                                    ? new Date(
                                        session.scheduledAt.seconds * 1000
                                      )
                                    : new Date(session.scheduledAt);
                                  return isNaN(date.getTime())
                                    ? "Date TBD"
                                    : format(date, "MMM d, yyyy • h:mm a");
                                } catch (e) {
                                  return "Date TBD";
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-block px-3 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                              {session.duration} min
                            </div>
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 capitalize mt-1">
                            {session.sessionType}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-neutral-800 rounded-xl text-center py-12 shadow-md">
                  <CalendarIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    No upcoming sessions
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Schedule your first learning session
                  </p>
                  <Link to="/sessions" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Schedule Session
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* User Profile Summary */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <div className="px-6 py-4 text-center -mt-10 relative z-10">
                <div className="avatar avatar-xl mx-auto mb-3 border-4 border-white dark:border-neutral-800">
                  {user?.profile?.avatar ? (
                    <img
                      src={user.profile.avatar}
                      alt={user.profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-2xl">
                        {user?.profile?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                  {user?.profile?.name || user?.username}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                  {user?.profile?.bio || "No bio added yet"}
                </p>

                {/* Skills Preview */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wider">
                    Your Skills
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {user?.skills?.teachable
                      ?.slice(0, 3)
                      .map((skill, index) => (
                        <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    {user?.skills?.teachable?.length > 3 && (
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                        +{user.skills.teachable.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <Link to="/profile" className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Skill Suggestions */}
            {skillSuggestions.length > 0 && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Skill Suggestions</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Based on your interests, you might want to learn:
                </p>
                <div className="space-y-3 mb-4">
                  {skillSuggestions.slice(0, 5).map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{skill}</span>
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
                <Link to="/profile" className="block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white rounded-lg font-medium text-center transition-colors">
                  Update Skills
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
