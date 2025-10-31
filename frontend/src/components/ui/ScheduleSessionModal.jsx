import React, { useState } from "react";
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { apiService } from "../../services/api";

const ScheduleSessionModal = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
}) => {
  const [formData, setFormData] = useState({
    skill: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Combine date and time
      const scheduledAt = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      // Check if date is in the future
      if (scheduledAt <= new Date()) {
        toast.error("Please select a future date and time");
        return;
      }

      const sessionData = {
        participantId: recipientId,
        skill: formData.skill,
        scheduledAt: scheduledAt.toISOString(),
        duration: parseInt(formData.duration),
        sessionType: "video",
        description: formData.description,
      };

      await apiService.sessions.create(sessionData);

      toast.success(`Session scheduled with ${recipientName}`);
      onClose();

      // Reset form
      setFormData({
        skill: "",
        scheduledDate: "",
        scheduledTime: "",
        duration: 60,
        description: "",
      });
    } catch (error) {
      console.error("Error scheduling session:", error);
      toast.error(error.response?.data?.error || "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-neutral-900">
            Schedule Session with {recipientName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-neutral-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Skill */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Skill/Topic *
            </label>
            <input
              type="text"
              required
              value={formData.skill}
              onChange={(e) =>
                setFormData({ ...formData, skill: e.target.value })
              }
              placeholder="e.g., JavaScript, Guitar, Cooking"
              className="input w-full"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Date *
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
                className="input w-full pl-10"
              />
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Time *
            </label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="time"
                required
                value={formData.scheduledTime}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledTime: e.target.value })
                }
                className="input w-full pl-10"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Duration *
            </label>
            <select
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              className="input w-full"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="What would you like to learn or teach?"
              rows="3"
              className="input w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Scheduling..." : "Schedule Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;
