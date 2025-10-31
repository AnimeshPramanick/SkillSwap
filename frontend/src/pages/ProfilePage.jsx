import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiService, convertToBase64 } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ImageCropperModal from "../components/ui/ImageCropperModal";
import {
  UserIcon,
  CameraIcon,
  PlusIcon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const ProfilePage = () => {
  const { userId } = useParams(); // Get userId from URL params
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [viewedUser, setViewedUser] = useState(null); // For viewing other users
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    timezone: "UTC",
  });
  const [teachableSkills, setTeachableSkills] = useState([]);
  const [desiredSkills, setDesiredSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [skillType, setSkillType] = useState("teachable");
  const [imageForCrop, setImageForCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const isOwnProfile = !userId || userId === user?.uid;

  useEffect(() => {
    if (userId && userId !== user?.uid) {
      // Fetch other user's profile
      fetchUserProfile(userId);
    } else if (user) {
      // Show own profile
      setProfileData({
        name: user.profile?.name || "",
        bio: user.profile?.bio || "",
        location: user.profile?.location || "",
        timezone: user.profile?.timezone || "UTC",
      });
      setTeachableSkills(user.skills?.teachable || []);
      setDesiredSkills(user.skills?.desired || []);
    }
  }, [user, userId]);

  const fetchUserProfile = async (targetUserId) => {
    try {
      setLoading(true);
      const response = await apiService.users.getProfile(targetUserId);
      const userData = response.data.user;
      setViewedUser(userData);
      setProfileData({
        name: userData.profile?.name || userData.username || "",
        bio: userData.profile?.bio || "",
        location: userData.profile?.location || "",
        timezone: userData.profile?.timezone || "UTC",
      });
      setTeachableSkills(userData.skills?.teachable || []);
      setDesiredSkills(userData.skills?.desired || []);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.users.updateProfile(profileData);
      toast.success("Profile updated successfully!");
      setEditing(false);
      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Create URL for cropper
    const imageUrl = URL.createObjectURL(file);
    setImageForCrop(imageUrl);
    setShowCropper(true);
  };

  const handleCroppedImage = async (croppedImageBase64) => {
    setShowCropper(false);
    setUploading(true);

    try {
      // Upload avatar
      await apiService.users.uploadAvatar(croppedImageBase64);
      toast.success("Avatar updated successfully!");

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
      // Clean up
      if (imageForCrop) {
        URL.revokeObjectURL(imageForCrop);
        setImageForCrop(null);
      }
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    if (imageForCrop) {
      URL.revokeObjectURL(imageForCrop);
      setImageForCrop(null);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      toast.error("Please enter a skill");
      return;
    }

    const skillsList =
      skillType === "teachable" ? teachableSkills : desiredSkills;

    if (skillsList.includes(newSkill.trim())) {
      toast.error("Skill already added");
      return;
    }

    try {
      if (skillType === "teachable") {
        await apiService.skills.addTeachableSkills([newSkill.trim()]);
        setTeachableSkills([...teachableSkills, newSkill.trim()]);
      } else {
        await apiService.skills.addDesiredSkills([newSkill.trim()]);
        setDesiredSkills([...desiredSkills, newSkill.trim()]);
      }

      toast.success(`Skill added to ${skillType} list`);
      setNewSkill("");

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skill, type) => {
    try {
      if (type === "teachable") {
        await apiService.skills.removeTeachableSkill(skill);
        setTeachableSkills(teachableSkills.filter((s) => s !== skill));
      } else {
        await apiService.skills.removeDesiredSkill(skill);
        setDesiredSkills(desiredSkills.filter((s) => s !== skill));
      }

      toast.success("Skill removed");

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error removing skill:", error);
      toast.error("Failed to remove skill");
    }
  };

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Kolkata",
    "Asia/Dubai",
    "Australia/Sydney",
  ];

  if (!user || (userId && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const displayUser = viewedUser || user;
  const displayAvatar = displayUser.profile?.avatar;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {!isOwnProfile && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
            )}
            <h1 className="text-h1 mb-2">
              {isOwnProfile
                ? "My Profile"
                : `${profileData.name || displayUser.username}'s Profile`}
            </h1>
            <p className="text-neutral-600">
              {isOwnProfile
                ? "Manage your profile information and skills"
                : "View profile and connect"}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Avatar & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Avatar Card */}
              <div className="card text-center">
                <div className="relative inline-block mb-4">
                  <div className="avatar avatar-2xl">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={profileData.name || displayUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                        <UserIcon className="w-16 h-16 text-primary-500" />
                      </div>
                    )}
                    {displayUser.isOnline && (
                      <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Upload Button - Only show for own profile */}
                  {isOwnProfile && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-colors"
                    >
                      {uploading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <CameraIcon className="w-4 h-4" />
                      )}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-xl font-bold text-neutral-900 mb-1">
                  {profileData.name || displayUser.username}
                </h2>
                <p className="text-sm text-neutral-500 mb-4">
                  @{displayUser.username}
                </p>

                {profileData.location && (
                  <div className="flex items-center justify-center text-sm text-neutral-600 mb-2">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {profileData.location}
                  </div>
                )}

                {profileData.timezone && (
                  <div className="flex items-center justify-center text-sm text-neutral-600 mb-2">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {profileData.timezone}
                  </div>
                )}

                {/* Action buttons for other user's profile */}
                {!isOwnProfile && (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => navigate(`/messages/${userId}`)}
                      className="btn btn-primary w-full"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                      Send Message
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Card */}
              <div className="card">
                <h3 className="text-h3 mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-neutral-600">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span className="text-sm">Total Sessions</span>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      {displayUser.stats?.totalSessions || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-neutral-600">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span className="text-sm">Total Hours</span>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      {displayUser.stats?.totalHours || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-neutral-600">
                      <StarIcon className="w-4 h-4 mr-2" />
                      <span className="text-sm">Average Rating</span>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      {user.stats?.averageRating > 0
                        ? user.stats.averageRating.toFixed(1)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-h3">Basic Information</h3>
                  {!editing && isOwnProfile && (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn btn-outline btn-sm"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {editing && isOwnProfile ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="input w-full"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        className="input w-full"
                        rows={4}
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        {profileData.bio.length}/500 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            location: e.target.value,
                          })
                        }
                        className="input w-full"
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Timezone
                      </label>
                      <select
                        value={profileData.timezone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            timezone: e.target.value,
                          })
                        }
                        className="input w-full"
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          // Reset form
                          setProfileData({
                            name: user.profile?.name || "",
                            bio: user.profile?.bio || "",
                            location: user.profile?.location || "",
                            timezone: user.profile?.timezone || "UTC",
                          });
                        }}
                        className="btn btn-outline flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary flex-1"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-neutral-500">
                        Full Name
                      </label>
                      <p className="text-neutral-900">
                        {user.profile?.name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-500">Bio</label>
                      <p className="text-neutral-900">
                        {user.profile?.bio || "No bio added yet"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-500">
                        Location
                      </label>
                      <p className="text-neutral-900">
                        {user.profile?.location || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-500">
                        Timezone
                      </label>
                      <p className="text-neutral-900">
                        {user.profile?.timezone || "UTC"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills I Can Teach */}
              <div className="card">
                <h3 className="text-h3 mb-4">Skills I Can Teach</h3>

                {/* Add Skill Form - Only for own profile */}
                {isOwnProfile && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={skillType === "teachable" ? newSkill : ""}
                      onChange={(e) => {
                        setNewSkill(e.target.value);
                        setSkillType("teachable");
                      }}
                      onFocus={() => setSkillType("teachable")}
                      className="input flex-1"
                      placeholder="Add a skill you can teach..."
                    />
                    <button
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim() || skillType !== "teachable"}
                      className="btn btn-primary"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Skills List */}
                <div className="flex flex-wrap gap-2">
                  {teachableSkills.length > 0 ? (
                    teachableSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                      >
                        {skill}
                        {isOwnProfile && (
                          <button
                            onClick={() =>
                              handleRemoveSkill(skill, "teachable")
                            }
                            className="ml-2 hover:text-primary-900"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-neutral-500 text-sm">
                      No teachable skills added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Skills I Want to Learn */}
              <div className="card">
                <h3 className="text-h3 mb-4">Skills I Want to Learn</h3>

                {/* Add Skill Form - Only for own profile */}
                {isOwnProfile && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={skillType === "desired" ? newSkill : ""}
                      onChange={(e) => {
                        setNewSkill(e.target.value);
                        setSkillType("desired");
                      }}
                      onFocus={() => setSkillType("desired")}
                      className="input flex-1"
                      placeholder="Add a skill you want to learn..."
                    />
                    <button
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim() || skillType !== "desired"}
                      className="btn btn-primary"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Skills List */}
                <div className="flex flex-wrap gap-2">
                  {desiredSkills.length > 0 ? (
                    desiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                      >
                        {skill}
                        {isOwnProfile && (
                          <button
                            onClick={() => handleRemoveSkill(skill, "desired")}
                            className="ml-2 hover:text-blue-900"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-neutral-500 text-sm">
                      No desired skills added yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && imageForCrop && (
        <ImageCropperModal
          image={imageForCrop}
          onSave={handleCroppedImage}
          onCancel={handleCancelCrop}
        />
      )}
    </div>
  );
};

export default ProfilePage;
