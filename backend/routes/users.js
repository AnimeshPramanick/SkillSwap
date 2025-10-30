const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  getUser,
  updateUser,
  searchUsers,
  createUser,
} = require("../config/firebase");
const { verifyToken } = require("../middleware/auth");
const { uploadImage } = require("../config/cloudinary");

const router = express.Router();

// Get user profile by ID
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Don't send sensitive data
    const { password, email, ...userProfile } = user;

    res.json({
      user: userProfile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      error: "Failed to get user profile",
    });
  }
});

// Update user profile
router.put(
  "/profile",
  verifyToken,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be 2-50 characters long"),
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio cannot exceed 500 characters"),
    body("location")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location cannot exceed 100 characters"),
    body("timezone")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Timezone cannot exceed 50 characters"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { name, bio, location, timezone } = req.body;

      // Get current user to preserve other profile fields
      const user = await getUser(req.user.id);
      const updatedProfile = { ...user.profile };

      let hasUpdates = false;

      if (name !== undefined) {
        updatedProfile.name = name;
        hasUpdates = true;
      }
      if (bio !== undefined) {
        updatedProfile.bio = bio;
        hasUpdates = true;
      }
      if (location !== undefined) {
        updatedProfile.location = location;
        hasUpdates = true;
      }
      if (timezone !== undefined) {
        updatedProfile.timezone = timezone;
        hasUpdates = true;
      }

      if (!hasUpdates) {
        return res.status(400).json({
          error: "No valid fields to update",
        });
      }

      await updateUser(req.user.id, { profile: updatedProfile });

      const updatedUser = await getUser(req.user.id);
      const { password, ...userProfile } = updatedUser;

      res.json({
        message: "Profile updated successfully",
        user: userProfile,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        error: "Failed to update profile",
      });
    }
  }
);

// Upload profile image
router.post("/upload-avatar", verifyToken, async (req, res) => {
  try {
    // Note: This would typically use multer to handle file uploads
    // For now, we'll assume the frontend sends the image as base64 or URL

    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({
        error: "Image data is required",
      });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadImage(imageData, "avatars");

    // Get current user to preserve other profile fields
    const user = await getUser(req.user.id);
    const updatedProfile = {
      ...user.profile,
      avatar: imageUrl,
    };

    // Update user avatar
    await updateUser(req.user.id, {
      profile: updatedProfile,
    });

    res.json({
      message: "Avatar uploaded successfully",
      avatarUrl: imageUrl,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      error: "Failed to upload avatar",
    });
  }
});

// Update notification preferences
router.put(
  "/preferences/notifications",
  verifyToken,
  [
    body("email")
      .optional()
      .isBoolean()
      .withMessage("Email preference must be boolean"),
    body("push")
      .optional()
      .isBoolean()
      .withMessage("Push preference must be boolean"),
    body("matches")
      .optional()
      .isBoolean()
      .withMessage("Matches preference must be boolean"),
    body("messages")
      .optional()
      .isBoolean()
      .withMessage("Messages preference must be boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { email, push, matches, messages } = req.body;

      // Get current user to preserve other preferences
      const user = await getUser(req.user.id);
      const updatedPreferences = {
        ...user.preferences,
        notifications: {
          ...user.preferences?.notifications,
        },
      };

      let hasUpdates = false;

      if (email !== undefined) {
        updatedPreferences.notifications.email = email;
        hasUpdates = true;
      }
      if (push !== undefined) {
        updatedPreferences.notifications.push = push;
        hasUpdates = true;
      }
      if (matches !== undefined) {
        updatedPreferences.notifications.matches = matches;
        hasUpdates = true;
      }
      if (messages !== undefined) {
        updatedPreferences.notifications.messages = messages;
        hasUpdates = true;
      }

      if (!hasUpdates) {
        return res.status(400).json({
          error: "No valid notification preferences to update",
        });
      }

      await updateUser(req.user.id, { preferences: updatedPreferences });

      res.json({
        message: "Notification preferences updated successfully",
      });
    } catch (error) {
      console.error("Update notification preferences error:", error);
      res.status(500).json({
        error: "Failed to update notification preferences",
      });
    }
  }
);

// Update privacy preferences
router.put(
  "/preferences/privacy",
  verifyToken,
  [
    body("showOnline")
      .optional()
      .isBoolean()
      .withMessage("Show online preference must be boolean"),
    body("showLocation")
      .optional()
      .isBoolean()
      .withMessage("Show location preference must be boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { showOnline, showLocation } = req.body;

      // Get current user to preserve other preferences
      const user = await getUser(req.user.id);
      const updatedPreferences = {
        ...user.preferences,
        privacy: {
          ...user.preferences?.privacy,
        },
      };

      let hasUpdates = false;

      if (showOnline !== undefined) {
        updatedPreferences.privacy.showOnline = showOnline;
        hasUpdates = true;
      }
      if (showLocation !== undefined) {
        updatedPreferences.privacy.showLocation = showLocation;
        hasUpdates = true;
      }

      if (!hasUpdates) {
        return res.status(400).json({
          error: "No valid privacy preferences to update",
        });
      }

      await updateUser(req.user.id, { preferences: updatedPreferences });

      res.json({
        message: "Privacy preferences updated successfully",
      });
    } catch (error) {
      console.error("Update privacy preferences error:", error);
      res.status(500).json({
        error: "Failed to update privacy preferences",
      });
    }
  }
);

// Search users (for discovering potential matches)
router.get("/search/discover", verifyToken, async (req, res) => {
  try {
    const { skills, isOnline, location, limit = 20, offset = 0 } = req.query;

    // Build search filters
    const filters = {};

    if (skills) {
      filters.skills = Array.isArray(skills) ? skills : [skills];
    }

    if (isOnline !== undefined) {
      filters.isOnline = isOnline === "true";
    }

    filters.limit = parseInt(limit);

    // Search users
    const users = await searchUsers(filters);

    // Remove current user from results
    const filteredUsers = users
      .filter((user) => user.id !== req.user.id)
      .map((user) => {
        const { password, email, ...safeUser } = user;
        return safeUser;
      });

    res.json({
      users: filteredUsers,
      total: filteredUsers.length,
      filters: {
        skills: filters.skills || [],
        isOnline: filters.isOnline,
      },
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      error: "Failed to search users",
    });
  }
});

// Get user statistics
router.get("/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      stats: user.stats || {
        totalSessions: 0,
        totalHours: 0,
        averageRating: 0,
        totalReviews: 0,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      error: "Failed to get user stats",
    });
  }
});

// Deactivate account
router.delete("/account", verifyToken, async (req, res) => {
  try {
    await updateUser(req.user.id, {
      isActive: false,
      deactivatedAt: new Date().toISOString(),
    });

    res.json({
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({
      error: "Failed to deactivate account",
    });
  }
});

// Reactivate account (for demo purposes)
router.post(
  "/reactivate",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { email, password } = req.body;
      const bcrypt = require("bcryptjs");
      const { getFirestore } = require("../config/firebase");

      // Find user by email
      const db = getFirestore();
      const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const userDoc = snapshot.docs[0];
      const user = userDoc.data();

      if (user.isActive) {
        return res.status(400).json({
          error: "Account is already active",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Invalid password",
        });
      }

      // Reactivate account
      await updateUser(user.id, {
        isActive: true,
        deactivatedAt: null,
        reactivatedAt: new Date().toISOString(),
      });

      res.json({
        message: "Account reactivated successfully",
      });
    } catch (error) {
      console.error("Reactivate account error:", error);
      res.status(500).json({
        error: "Failed to reactivate account",
      });
    }
  }
);

module.exports = router;
