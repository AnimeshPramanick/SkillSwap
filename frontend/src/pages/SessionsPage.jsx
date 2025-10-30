import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { format, addDays, startOfDay, isBefore, parseISO } from "date-fns";

const SessionsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState("upcoming"); // upcoming, past, all
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    participantId: location.state?.matchId || "",
    skill: "",
    sessionType: "video",
    scheduledAt: "",
    duration: 60,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === "upcoming") {
        params.upcoming = true;
      } else if (filter === "past") {
        params.past = true;
      }

      const response = await apiService.sessions.getUserSessions(params);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      await apiService.sessions.createSession(formData);
      toast.success("Session scheduled successfully!");
      setShowCreateModal(false);
      setFormData({
        participantId: "",
        skill: "",
        sessionType: "video",
        scheduledAt: "",
        duration: 60,
        description: "",
      });
      await fetchSessions();
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error(error.response?.data?.error || "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this session?"))
      return;

    try {
      await apiService.sessions.cancelSession(
        sessionId,
        "User requested cancellation"
      );
      toast.success("Session cancelled successfully");
      await fetchSessions();
    } catch (error) {
      console.error("Error cancelling session:", error);
      toast.error("Failed to cancel session");
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await apiService.sessions.completeSession(sessionId, {
        rating: 5,
        feedback: "Great session!",
      });
      toast.success("Session marked as complete");
      await fetchSessions();
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to complete session");
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const sessionDate = parseISO(session.scheduledAt);
    const now = new Date();

    if (filter === "upcoming") {
      return (
        isBefore(now, sessionDate) &&
        session.status !== "completed" &&
        session.status !== "cancelled"
      );
    } else if (filter === "past") {
      return (
        isBefore(sessionDate, now) ||
        session.status === "completed" ||
        session.status === "cancelled"
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: "bg-blue-100 text-blue-800",
      inProgress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-h1 mb-2">Learning Sessions</h1>
            <p className="text-neutral-600">
              Manage your skill exchange sessions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Schedule Session
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-2">
          {["upcoming", "past", "all"].map((filterOption) => (
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
            </button>
          ))}
        </div>

        {/* Sessions List */}
        {filteredSessions.length > 0 ? (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const otherParticipant =
                session.participants?.find((p) => p.id !== user?.id) || {};
              const isPast = isBefore(
                parseISO(session.scheduledAt),
                new Date()
              );

              return (
                <div key={session.id} className="card">
                  <div className="flex items-start justify-between">
                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {session.skill || "General Session"}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                            session.status
                          )}`}
                        >
                          {session.status}
                        </span>
                      </div>

                      {/* Participant */}
                      <div className="flex items-center space-x-2 mb-3">
                        <UserIcon className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-600">
                          with{" "}
                          {otherParticipant.profile?.name ||
                            otherParticipant.username ||
                            "Unknown User"}
                        </span>
                      </div>

                      {/* Date and Time */}
                      <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-2">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {format(
                            parseISO(session.scheduledAt),
                            "EEEE, MMMM d, yyyy"
                          )}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {format(parseISO(session.scheduledAt), "h:mm a")} (
                          {session.duration} min)
                        </div>
                      </div>

                      {/* Description */}
                      {session.description && (
                        <p className="text-sm text-neutral-600 mt-2">
                          {session.description}
                        </p>
                      )}

                      {/* Session Type */}
                      <div className="mt-2">
                        <span className="inline-flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          {session.sessionType === "video" && (
                            <VideoCameraIcon className="w-3 h-3 mr-1" />
                          )}
                          {session.sessionType}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {session.status === "scheduled" && !isPast && (
                        <>
                          <button
                            onClick={() =>
                              window.open(session.meetingLink, "_blank")
                            }
                            className="btn btn-primary btn-sm"
                          >
                            <VideoCameraIcon className="w-4 h-4 mr-1" />
                            Join
                          </button>
                          <button
                            onClick={() => handleCancelSession(session.id)}
                            className="btn btn-outline btn-sm"
                          >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </>
                      )}

                      {session.status === "scheduled" && isPast && (
                        <button
                          onClick={() => handleCompleteSession(session.id)}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckIcon className="w-4 h-4 mr-1" />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12">
            <CalendarIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-h3 mb-2">
              {filter === "upcoming"
                ? "No upcoming sessions"
                : filter === "past"
                ? "No past sessions"
                : "No sessions yet"}
            </h3>
            <p className="text-neutral-600 mb-6">
              {filter === "upcoming"
                ? "Schedule your first learning session"
                : "No session history to display"}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Schedule Session
            </button>
          </div>
        )}

        {/* Create Session Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h2">Schedule Session</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Skill *
                  </label>
                  <input
                    type="text"
                    value={formData.skill}
                    onChange={(e) =>
                      setFormData({ ...formData, skill: e.target.value })
                    }
                    className="input w-full"
                    placeholder="e.g., JavaScript, Guitar"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Session Type *
                  </label>
                  <select
                    value={formData.sessionType}
                    onChange={(e) =>
                      setFormData({ ...formData, sessionType: e.target.value })
                    }
                    className="input w-full"
                    required
                  >
                    <option value="video">Video Call</option>
                    <option value="audio">Audio Call</option>
                    <option value="chat">Chat Only</option>
                    <option value="inPerson">In Person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                    className="input w-full"
                    min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="input w-full"
                    required
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input w-full"
                    rows={3}
                    placeholder="What would you like to learn or teach?"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary flex-1"
                  >
                    {submitting ? "Scheduling..." : "Schedule Session"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
