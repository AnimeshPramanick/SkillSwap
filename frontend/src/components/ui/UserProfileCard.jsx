import React from "react";
import { Link } from "react-router-dom";
import {
  StarIcon,
  ChatBubbleLeftIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

const UserProfileCard = ({
  user,
  matchScore,
  skillAlignment,
  onSendMessage,
  onRequestVideoCall,
  onCreateMatch,
  isCurrentUser = false,
  className = "",
}) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-yellow-400 opacity-50" />
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="w-4 h-4 text-neutral-300" />
        );
      }
    }

    return stars;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (onSendMessage) {
      onSendMessage(user.id);
    }
  };

  const handleVideoCall = (e) => {
    e.preventDefault();
    if (onRequestVideoCall) {
      onRequestVideoCall(user.id);
    }
  };

  const handleCreateMatch = (e) => {
    e.preventDefault();
    if (onCreateMatch) {
      onCreateMatch(user.id);
    }
  };

  return (
    <div className={`card card-interactive ${className} rounded-xl shadow-card p-4 hover:shadow-lg transition-transform duration-300 dark:bg-neutral-50 dark:border dark:border-neutral-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="avatar avatar-lg relative rounded-xl overflow-hidden border border-neutral-50">
            {user.profile?.avatar ? (
              <img
                src={user.profile.avatar}
                alt={user.profile?.name || user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-500 font-semibold text-lg">
                  {(user.profile?.name || user.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            )}
            {user.isOnline && <div className="status-online" />}
          </div>

          {/* User Info */}
          <div>
            <h3 className="text-h3 text-neutral-900 dark:text-neutral-100">{user.profile?.name || user.username}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-small text-neutral-500">
                @{user.username}
              </span>
              {user.stats?.averageRating > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {renderStars(user.stats.averageRating)}
                  </div>
                  <span className="text-small text-neutral-500">
                    ({user.stats.totalReviews})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match Score */}
        {matchScore && (
          <div className="text-right">
            <div className="text-sm font-medium text-primary-500">
              {Math.round(matchScore.total * 100)}% Match
            </div>
            {matchScore.total > 0.7 && (
              <div className="text-xs text-success">Great Match!</div>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      {user.profile?.bio && (
        <p className="text-body text-neutral-700 mb-4 line-clamp-2">
          {user.profile.bio}
        </p>
      )}

      {/* Skills Section */}
      <div className="space-y-4">
        {/* Teachable Skills */}
        {user.skills?.teachable && user.skills.teachable.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">
              Can Teach
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.skills.teachable.slice(0, 5).map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
              {user.skills.teachable.length > 5 && (
                <span className="text-sm text-neutral-500">
                  +{user.skills.teachable.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Desired Skills */}
        {user.skills?.desired && user.skills.desired.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">
              Wants to Learn
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.skills.desired.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="skill-tag bg-neutral-100 text-neutral-700"
                >
                  {skill}
                </span>
              ))}
              {user.skills.desired.length > 5 && (
                <span className="text-sm text-neutral-500">
                  +{user.skills.desired.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Skill Alignment (for matches) */}
      {skillAlignment && (
        <div className="mt-4 p-3 bg-gradient-subtle rounded-lg dark:bg-neutral-100">
          <h5 className="text-sm font-medium text-primary-900 dark:text-primary-700 mb-2">
            Skill Exchange Opportunity
          </h5>
          {skillAlignment.theyCanTeachMe.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-primary-700 font-medium">
                They can teach you:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                  {skillAlignment.theyCanTeachMe.map((skill, index) => (
                    <span key={index} className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">{skill}</span>
                  ))}
              </div>
            </div>
          )}
          {skillAlignment.theyWantToLearn.length > 0 && (
            <div>
              <span className="text-xs text-primary-700 font-medium">
                They want to learn:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {skillAlignment.theyWantToLearn.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Location */}
      {user.profile?.location && (
        <div className="mt-3 text-sm text-neutral-500">📍 {user.profile.location}</div>
      )}

      {/* Stats */}
      {user.stats && (
        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-neutral-900">
              {user.stats.totalSessions || 0}
            </div>
            <div className="text-xs text-neutral-500">Sessions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-neutral-900">
              {user.stats.totalHours || 0}h
            </div>
            <div className="text-xs text-neutral-500">Total Hours</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-neutral-900">
              {user.stats.averageRating > 0
                ? user.stats.averageRating.toFixed(1)
                : "N/A"}
            </div>
            <div className="text-xs text-neutral-500">Rating</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isCurrentUser && (
        <div className="mt-6 flex flex-wrap gap-3">
          {onSendMessage && (
            <button
              onClick={handleSendMessage}
              className="flex-1 btn btn-outline flex items-center justify-center space-x-2 rounded-md"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>Message</span>
            </button>
          )}

          {onRequestVideoCall && (
            <button
              onClick={handleVideoCall}
              className="flex-1 btn btn-outline flex items-center justify-center space-x-2 rounded-md"
              disabled={!user.isOnline}
            >
              <VideoCameraIcon className="w-4 h-4" />
              <span>Call</span>
            </button>
          )}

          {onCreateMatch && !matchScore && (
            <button onClick={handleCreateMatch} className="flex-1 min-w-full btn btn-primary rounded-md">
              Match
            </button>
          )}
        </div>
      )}

      {/* Quick Actions for Current User */}
      {isCurrentUser && (
        <div className="mt-6">
          <Link
            to="/profile"
            className="w-full btn btn-outline flex items-center justify-center"
          >
            Edit Profile
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;
