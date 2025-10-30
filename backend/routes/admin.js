const express = require("express");
const { verifyToken } = require("../middleware/auth");
const {
  getFirestore,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../config/firebase");

const router = express.Router();

// Admin middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await getUser(req.user.id);
    if (!user || !user.role || user.role.toLowerCase() !== "admin") {
      return res.status(403).json({
        error: "Access denied. Admin privileges required.",
      });
    }
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({
      error: "Failed to verify admin status",
    });
  }
};

// Get all users (Admin only)
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", status = "all" } = req.query;
    const db = getFirestore();

    let query = db.collection("users");

    // Filter by status
    if (status !== "all") {
      if (status === "active") {
        query = query.where("isActive", "==", true);
      } else if (status === "inactive") {
        query = query.where("isActive", "==", false);
      }
    }

    const snapshot = await query.get();
    let users = snapshot.docs.map((doc) => {
      const data = doc.data();
      const { password, ...safeData } = data;
      return { id: doc.id, ...safeData };
    });

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.profile?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.json({
      users: paginatedUsers,
      pagination: {
        total: users.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(users.length / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
});

// Get platform statistics (Admin only)
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = getFirestore();

    // Get total users
    const usersSnapshot = await db.collection("users").get();
    const totalUsers = usersSnapshot.size;
    const activeUsers = usersSnapshot.docs.filter(
      (doc) => doc.data().isActive
    ).length;

    // Get total matches
    const matchesSnapshot = await db.collection("matches").get();
    const totalMatches = matchesSnapshot.size;
    const activeMatches = matchesSnapshot.docs.filter(
      (doc) => doc.data().status === "accepted"
    ).length;

    // Get total sessions
    const sessionsSnapshot = await db.collection("sessions").get();
    const totalSessions = sessionsSnapshot.size;
    const completedSessions = sessionsSnapshot.docs.filter(
      (doc) => doc.data().status === "completed"
    ).length;

    // Get total messages
    const messagesSnapshot = await db.collection("messages").get();
    const totalMessages = messagesSnapshot.size;

    // Calculate growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = usersSnapshot.docs.filter((doc) => {
      const createdAt = doc.data().createdAt;
      return createdAt && new Date(createdAt) > thirtyDaysAgo;
    }).length;

    const newSessions = sessionsSnapshot.docs.filter((doc) => {
      const createdAt = doc.data().createdAt;
      return createdAt && new Date(createdAt) > thirtyDaysAgo;
    }).length;

    res.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          newLast30Days: newUsers,
        },
        matches: {
          total: totalMatches,
          active: activeMatches,
          pending: matchesSnapshot.docs.filter(
            (doc) => doc.data().status === "pending"
          ).length,
        },
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          scheduled: sessionsSnapshot.docs.filter(
            (doc) => doc.data().status === "scheduled"
          ).length,
          newLast30Days: newSessions,
        },
        messages: {
          total: totalMessages,
        },
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      error: "Failed to fetch statistics",
    });
  }
});

// Get user activity logs (Admin only)
router.get("/activity", verifyToken, isAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const db = getFirestore();

    // Get recent sessions
    const sessionsSnapshot = await db
      .collection("sessions")
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit))
      .get();

    const activities = sessionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: "session",
        action: `Session ${data.status}`,
        userId: data.participants?.[0]?.id,
        timestamp: data.createdAt,
        details: data,
      };
    });

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      activities: activities.slice(0, parseInt(limit)),
    });
  } catch (error) {
    console.error("Get activity error:", error);
    res.status(500).json({
      error: "Failed to fetch activity logs",
    });
  }
});

// Update user (Admin only)
router.patch("/users/:userId", verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Don't allow changing password or critical fields via this endpoint
    delete updates.password;
    delete updates.id;

    await updateUser(userId, updates);

    const updatedUser = await getUser(userId);
    const { password, ...safeUser } = updatedUser;

    res.json({
      message: "User updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      error: "Failed to update user",
    });
  }
});

// Delete/Deactivate user (Admin only)
router.delete("/users/:userId", verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { permanent = false } = req.query;

    if (permanent === "true") {
      // Permanent deletion (use with caution)
      const db = getFirestore();
      await db.collection("users").doc(userId).delete();
    } else {
      // Soft delete (deactivate)
      await updateUser(userId, {
        isActive: false,
        deactivatedAt: new Date().toISOString(),
        deactivatedBy: req.user.id,
      });
    }

    res.json({
      message:
        permanent === "true"
          ? "User deleted permanently"
          : "User deactivated successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      error: "Failed to delete user",
    });
  }
});

// Get reported content (Admin only)
router.get("/reports", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status = "pending", limit = 50 } = req.query;
    const db = getFirestore();

    let query = db.collection("reports");

    if (status !== "all") {
      query = query.where("status", "==", status);
    }

    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit))
      .get();

    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      reports,
      total: reports.length,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      error: "Failed to fetch reports",
    });
  }
});

// Handle report (Admin only)
router.patch("/reports/:reportId", verifyToken, isAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, action, notes } = req.body;

    const db = getFirestore();
    await db.collection("reports").doc(reportId).update({
      status,
      action,
      notes,
      resolvedBy: req.user.id,
      resolvedAt: new Date().toISOString(),
    });

    res.json({
      message: "Report handled successfully",
    });
  } catch (error) {
    console.error("Handle report error:", error);
    res.status(500).json({
      error: "Failed to handle report",
    });
  }
});

// Get system health (Admin only)
router.get("/health", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = getFirestore();

    // Check database connection
    const dbHealth = await db
      .collection("_health")
      .get()
      .then(() => "healthy")
      .catch(() => "unhealthy");

    // Get error logs count
    const errorLogsSnapshot = await db
      .collection("errorLogs")
      .where(
        "createdAt",
        ">",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .get();

    res.json({
      health: {
        database: dbHealth,
        server: "healthy",
        errorLogsLast24h: errorLogsSnapshot.size,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      error: "Failed to check system health",
      health: {
        database: "unhealthy",
        server: "degraded",
      },
    });
  }
});

// Bulk actions (Admin only)
router.post("/bulk-action", verifyToken, isAdmin, async (req, res) => {
  try {
    const { action, userIds } = req.body;

    if (!action || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        error: "Invalid request. Action and userIds array required.",
      });
    }

    const results = [];

    for (const userId of userIds) {
      try {
        if (action === "deactivate") {
          await updateUser(userId, {
            isActive: false,
            deactivatedAt: new Date().toISOString(),
            deactivatedBy: req.user.id,
          });
          results.push({ userId, status: "success" });
        } else if (action === "activate") {
          await updateUser(userId, {
            isActive: true,
            reactivatedAt: new Date().toISOString(),
            reactivatedBy: req.user.id,
          });
          results.push({ userId, status: "success" });
        }
      } catch (error) {
        results.push({ userId, status: "failed", error: error.message });
      }
    }

    res.json({
      message: `Bulk action ${action} completed`,
      results,
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    res.status(500).json({
      error: "Failed to perform bulk action",
    });
  }
});

module.exports = router;
