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
  const [filter, setFilter] = useState("all"); // all, pending, accepted
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await apiService.matches.getUserMatches();

      // Filter out invalid matches
      const validMatches = (response.data.matches || []).filter((m) => {
        // Filter out rejected matches
        if (m.status === "rejected") return false;

        // Filter out matches where user is matching with themselves
        const otherParticipant = m.otherParticipant;
        if (!otherParticipant || !otherParticipant.id) return false;

        // Check if other participant is actually a different user
        const isSameUser =
          String(otherParticipant.id) === String(user?.uid) ||
          String(otherParticipant.id) === String(user?.id) ||
          otherParticipant.username === user?.username;

        if (isSameUser) {
          console.warn("Filtering out self-match:", m);
          return false;
        }

        return true;
      });

      setMatches(validMatches);
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
      if (status === "accepted") {
        toast.success("Match accepted! You can now start messaging.");
      } else {
        toast.success("Match declined.");
      }
      await fetchMatches();
    } catch (error) {
      console.error("Error updating match status:", error);
      toast.error(
        error.response?.data?.error || "Failed to update match status"
      );
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
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
            {["all", "pending", "accepted"].map((filterOption) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => {
              const otherUser = match.otherParticipant || {};
              const matchedSkills = match.matchedSkills || [];
              const isPending = match.status === "pending";

              // Check both uid and id for compatibility
              const currentUserId = user?.uid || user?.id;
              const isRecipient = match.recipientId === currentUserId;
              const isSender = match.createdBy === currentUserId;

              // Debug logging
              console.log("Match Debug:", {
                matchId: match.id,
                status: match.status,
                isPending,
                recipientId: match.recipientId,
                createdBy: match.createdBy,
                currentUserId,
                isRecipient,
                isSender,
              });

              return (
                <div
                  key={match.id}
                  className="card hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* User Info - Make it clickable to view profile */}
                  <div
                    className="flex flex-col items-center text-center cursor-pointer"
                    onClick={() => handleViewProfile(otherUser.id)}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Avatar */}
                    <div className="avatar avatar-lg mb-2 relative">
                      {otherUser.profile?.avatar ? (
                        <img
                          src={otherUser.profile.avatar}
                          alt={otherUser.profile?.name || otherUser.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-500 font-semibold text-xl">
                            {(
                              otherUser.profile?.name ||
                              otherUser.username ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                      {otherUser.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-base font-semibold text-neutral-900 mb-1">
                      {otherUser.profile?.name ||
                        otherUser.username ||
                        "Unknown User"}
                    </h3>

                    {/* Status Badge */}
                    {isPending && isRecipient && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
                        New Match Request
                      </span>
                    )}
                    {isPending && isSender && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                        Waiting for Response
                      </span>
                    )}
                    {match.status === "accepted" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                        Connected
                      </span>
                    )}

                    {/* Bio - Optional, can be hidden if too long */}
                    {otherUser.profile?.bio && (
                      <p className="text-xs text-neutral-600 mb-2 line-clamp-1 px-2">
                        {otherUser.profile.bio}
                      </p>
                    )}

                    {/* Matched Skills */}
                    {matchedSkills.length > 0 && (
                      <div className="mb-2 w-full px-2">
                        <p className="text-xs text-neutral-500 mb-1">
                          Matched Skills:
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {matchedSkills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="skill-tag text-xs">
                              {skill}
                            </span>
                          ))}
                          {matchedSkills.length > 3 && (
                            <span className="text-xs text-neutral-500">
                              +{matchedSkills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Match Date */}
                    <div className="flex items-center text-xs text-neutral-500 mt-2">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {(() => {
                        try {
                          if (!match.createdAt) return "Recently";

                          const date = match.createdAt.seconds
                            ? new Date(match.createdAt.seconds * 1000)
                            : new Date(match.createdAt);

                          if (isNaN(date.getTime())) return "Recently";

                          return format(date, "MMM d");
                        } catch (error) {
                          return "Recently";
                        }
                      })()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    {/* Show Accept/Reject only if user is the recipient and match is pending */}
                    {isPending && isRecipient && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateMatchStatus(match.id, "accepted");
                          }}
                          className="btn btn-primary btn-sm flex-1"
                        >
                          <CheckIcon className="w-4 h-4 mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateMatchStatus(match.id, "rejected");
                          }}
                          className="btn btn-outline btn-sm flex-1"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          Decline
                        </button>
                      </div>
                    )}

                    {/* Show messaging options for accepted matches */}
                    {match.status === "accepted" && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessageUser(otherUser.id);
                          }}
                          className="btn btn-primary btn-sm w-full"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                          Message
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScheduleSession(match.id);
                          }}
                          className="btn btn-outline btn-sm w-full"
                        >
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          Schedule
                        </button>
                      </div>
                    )}

                    {/* Show waiting status for sender with pending match */}
                    {isPending && isSender && (
                      <div className="text-xs text-neutral-500 text-center py-2">
                        Waiting for their response
                      </div>
                    )}
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
