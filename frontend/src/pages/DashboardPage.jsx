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
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1 mb-2">
            Welcome back, {user?.profile?.name || user?.username}! 👋
          </h1>
          <p className="text-xl text-neutral-600">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-neutral-50`}>
                    <IconComponent className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-neutral-500">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-h3 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className="card card-hover group"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-h3 group-hover:text-primary-600 transition-colors">
                      {action.title}
                    </h3>
                  </div>
                  <p className="text-neutral-600">{action.description}</p>
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
                <h2 className="text-h3">Recent Matches</h2>
                <Link
                  to="/matches"
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  View all
                </Link>
              </div>

              {recentMatches.length > 0 ? (
                <div className="space-y-4">
                  {recentMatches.slice(0, 3).map((match, index) => (
                    <div key={index} className="card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="avatar avatar-md">
                            {match.otherParticipant?.avatar ? (
                              <img
                                src={match.otherParticipant.avatar}
                                alt={match.otherParticipant.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-500 font-semibold">
                                  {match.otherParticipant?.name?.charAt(0) ||
                                    "U"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">
                              {match.otherParticipant?.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-neutral-500">
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
                          className="btn btn-outline btn-sm"
                        >
                          Message
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-8">
                  <UserGroupIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    No matches yet
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Start by discovering people with complementary skills
                  </p>
                  <Link to="/discover" className="btn btn-primary">
                    Find Matches
                  </Link>
                </div>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3">Upcoming Sessions</h2>
                <Link
                  to="/sessions"
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  View all
                </Link>
              </div>

              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div key={index} className="card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CalendarIcon className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">
                              {session.skill} Session
                            </div>
                            <div className="text-sm text-neutral-500">
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
                          <div className="text-sm font-medium text-neutral-900">
                            {session.duration} min
                          </div>
                          <div className="text-xs text-neutral-500 capitalize">
                            {session.sessionType}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    No upcoming sessions
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Schedule your first learning session
                  </p>
                  <Link to="/sessions" className="btn btn-primary">
                    Schedule Session
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* User Profile Summary */}
            <div className="card">
              <h3 className="text-h3 mb-4">Your Profile</h3>
              <div className="text-center">
                <div className="avatar avatar-xl mx-auto mb-4">
                  {user?.profile?.avatar ? (
                    <img
                      src={user.profile.avatar}
                      alt={user.profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-500 font-semibold text-xl">
                        {user?.profile?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                  {user?.profile?.name || user?.username}
                </h4>
                <p className="text-sm text-neutral-600 mb-4">
                  {user?.profile?.bio || "No bio added yet"}
                </p>

                {/* Skills Preview */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-neutral-700 mb-2">
                    Your Skills
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {user?.skills?.teachable
                      ?.slice(0, 3)
                      .map((skill, index) => (
                        <span key={index} className="skill-tag text-xs">
                          {skill}
                        </span>
                      ))}
                    {user?.skills?.teachable?.length > 3 && (
                      <span className="text-xs text-neutral-500">
                        +{user.skills.teachable.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <Link to="/profile" className="btn btn-outline w-full">
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Skill Suggestions */}
            {skillSuggestions.length > 0 && (
              <div className="card">
                <h3 className="text-h3 mb-4">Skill Suggestions</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Based on your interests, you might want to learn:
                </p>
                <div className="space-y-3">
                  {skillSuggestions.slice(0, 5).map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-neutral-700">{skill}</span>
                      <button className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
                <Link to="/profile" className="btn btn-outline w-full mt-4">
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
