import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

const MatchesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, accepted, rejected
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await apiService.matches.getUserMatches();
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMatchStatus = async (matchId, status) => {
    try {
      await apiService.matches.updateMatchStatus(matchId, status);
      toast.success(`Match ${status} successfully!`);
      await fetchMatches();
    } catch (error) {
      console.error("Error updating match status:", error);
      toast.error("Failed to update match status");
    }
  };

  const handleMessageUser = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const handleScheduleSession = (matchId) => {
    navigate("/sessions", { state: { matchId } });
  };

  const filteredMatches = matches.filter((match) => {
    if (filter === "all") return true;
    return match.status === filter;
  });

  const matchStatusCounts = {
    all: matches.length,
    pending: matches.filter((m) => m.status === "pending").length,
    accepted: matches.filter((m) => m.status === "accepted").length,
    rejected: matches.filter((m) => m.status === "rejected").length,
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-neutral-100 text-neutral-800";
  };

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
          <h1 className="text-h1 mb-2">Your Matches</h1>
          <p className="text-neutral-600">
            Manage your skill exchange connections
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-2">
            {["all", "pending", "accepted", "rejected"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filter === filterOption
                    ? "bg-primary-500 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {filterOption}
                <span className="ml-2 text-sm">
                  ({matchStatusCounts[filterOption]})
                </span>
              </button>
            ))}
          </div>

          <Link to="/discover" className="btn btn-primary">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Find More Matches
          </Link>
        </div>

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match) => {
              const otherUser = match.otherParticipant || {};
              const matchedSkills = match.matchedSkills || [];

              return (
                <div
                  key={match.id}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    {/* User Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar */}
                      <div className="avatar avatar-lg">
                        {otherUser.profile?.avatar ? (
                          <img
                            src={otherUser.profile.avatar}
                            alt={otherUser.profile?.name || otherUser.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-500 font-semibold text-lg">
                              {(
                                otherUser.profile?.name ||
                                otherUser.username ||
                                "U"
                              ).charAt(0)}
                            </span>
                          </div>
                        )}
                        {otherUser.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-neutral-900">
                            {otherUser.profile?.name ||
                              otherUser.username ||
                              "Unknown User"}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                              match.status
                            )}`}
                          >
                            {match.status}
                          </span>
                        </div>

                        {otherUser.profile?.bio && (
                          <p className="text-sm text-neutral-600 mb-2">
                            {otherUser.profile.bio}
                          </p>
                        )}

                        {/* Matched Skills */}
                        {matchedSkills.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-neutral-500 mb-1">
                              Matched Skills:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {matchedSkills.map((skill, idx) => (
                                <span key={idx} className="skill-tag text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Match Date */}
                        <div className="flex items-center text-xs text-neutral-500">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          Matched{" "}
                          {match.createdAt
                            ? format(
                                new Date(
                                  match.createdAt.seconds
                                    ? match.createdAt.seconds * 1000
                                    : match.createdAt
                                ),
                                "MMM d, yyyy"
                              )
                            : "recently"}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {match.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateMatchStatus(match.id, "accepted")
                            }
                            className="btn btn-primary btn-sm"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateMatchStatus(match.id, "rejected")
                            }
                            className="btn btn-outline btn-sm"
                          >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Decline
                          </button>
                        </>
                      )}

                      {match.status === "accepted" && (
                        <>
                          <button
                            onClick={() => handleMessageUser(otherUser.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                            Message
                          </button>
                          <button
                            onClick={() => handleScheduleSession(match.id)}
                            className="btn btn-outline btn-sm"
                          >
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            Schedule
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-h3 mb-2">
              {filter === "all" ? "No matches yet" : `No ${filter} matches`}
            </h3>
            <p className="text-neutral-600 mb-6">
              {filter === "all"
                ? "Start by discovering people with complementary skills"
                : `You don't have any ${filter} matches at the moment`}
            </p>
            <div className="flex space-x-4 justify-center">
              <Link to="/discover" className="btn btn-primary">
                Find Matches
              </Link>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="btn btn-outline"
                >
                  View All Matches
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
