const admin = require("firebase-admin");
const { cert, getApps: getAdminApps } = require("firebase-admin/app");
const {
  getFirestore: getAdminFirestore,
  FieldValue,
} = require("firebase-admin/firestore");

const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");

// ============================================================
// Firebase Client Configuration
// ============================================================

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// ============================================================
// Firebase Admin Initialization
// ============================================================

let adminInitialized = false;
let firestore = null;

const connectFirebase = () => {
  if (adminInitialized) {
    return;
  }

  try {
    // Make sure the private key is converted from
    // literal \n characters into real line breaks.
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n",
    ).trim();

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

    // Basic validation so errors are easier to understand.
    if (!projectId) {
      throw new Error(
        "FIREBASE_ADMIN_PROJECT_ID is missing from your .env file",
      );
    }

    if (!clientEmail) {
      throw new Error(
        "FIREBASE_ADMIN_CLIENT_EMAIL is missing from your .env file",
      );
    }

    if (!privateKey) {
      throw new Error(
        "FIREBASE_ADMIN_PRIVATE_KEY is missing from your .env file",
      );
    }

    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      throw new Error(
        "FIREBASE_ADMIN_PRIVATE_KEY does not appear to be a valid PEM private key",
      );
    }

    // Initialize Firebase Admin only once.
    if (getAdminApps().length === 0) {
      admin.initializeApp({
        credential: cert({
          projectId: projectId,
          privateKey: privateKey,
          clientEmail: clientEmail,
        }),

        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
    }

    // Get Firestore using the modern Admin SDK API.
    firestore = getAdminFirestore();

    adminInitialized = true;

    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);

    throw error;
  }
};

// ============================================================
// Firebase Client Initialization
// ============================================================

let clientApp = null;
let clientFirestore = null;
let clientAuth = null;

const initializeFirebaseClient = () => {
  if (clientApp) {
    return;
  }

  try {
    clientApp = initializeApp(firebaseConfig);

    clientFirestore = getFirestore(clientApp);
    clientAuth = getAuth(clientApp);

    console.log("✅ Firebase Client initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Client initialization failed:", error.message);

    throw error;
  }
};

// ============================================================
// Firestore Helper Functions
// ============================================================

const createUser = async (userData) => {
  const userRef = firestore.collection("users").doc();

  await userRef.set({
    ...userData,
    id: userRef.id,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return userRef.id;
};

// ------------------------------------------------------------

const updateUser = async (userId, updates) => {
  const userRef = firestore.collection("users").doc(userId);

  await userRef.update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });
};

// ------------------------------------------------------------

const getUser = async (userId) => {
  const userDoc = await firestore.collection("users").doc(userId).get();

  return userDoc.exists ? userDoc.data() : null;
};

// ------------------------------------------------------------

const searchUsers = async (filters = {}) => {
  let query = firestore.collection("users");

  if (filters.skills && filters.skills.length > 0) {
    query = query.where(
      "skills.teachable",
      "array-contains-any",
      filters.skills,
    );
  }

  if (filters.isOnline !== undefined) {
    query = query.where("isOnline", "==", filters.isOnline);
  }

  const snapshot = await query.limit(filters.limit || 20).get();

  return snapshot.docs.map((doc) => doc.data());
};

// ------------------------------------------------------------

const createMatch = async (matchData) => {
  const matchRef = firestore.collection("matches").doc();

  await matchRef.set({
    ...matchData,
    id: matchRef.id,
    createdAt: FieldValue.serverTimestamp(),
  });

  return matchRef.id;
};

// ------------------------------------------------------------

const updateMatch = async (matchId, updates) => {
  const matchRef = firestore.collection("matches").doc(matchId);

  await matchRef.update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });
};

// ------------------------------------------------------------

const getUserMatches = async (userId) => {
  const snapshot = await firestore
    .collection("matches")
    .where("participants", "array-contains", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data());
};

// ============================================================
// Messaging
// ============================================================

const createMessage = async (messageData) => {
  const messageRef = firestore.collection("messages").doc();

  await messageRef.set({
    ...messageData,
    id: messageRef.id,
    timestamp: FieldValue.serverTimestamp(),
  });

  return messageRef.id;
};

// ------------------------------------------------------------

const getConversationMessages = async (userId1, userId2, limit = 50) => {
  const participantsKey = [userId1, userId2].sort().join("_");

  console.log(`[DEBUG] Fetching messages for participants: ${participantsKey}`);

  try {
    // Try ordered query first.
    const snapshot = await firestore
      .collection("messages")
      .where("participants", "==", participantsKey)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    console.log(`[DEBUG] Found ${snapshot.docs.length} messages in Firestore`);

    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();

      console.log("[DEBUG] Message data:", {
        id: data.id,
        senderId: data.senderId,
        recipientId: data.recipientId,
        message: data.message,
        participants: data.participants,
        hasTimestamp: !!data.timestamp,
      });

      return data;
    });

    return messages;
  } catch (error) {
    console.log(
      "[DEBUG] OrderBy failed, trying without index requirement:",
      error.message,
    );

    const snapshot = await firestore
      .collection("messages")
      .where("participants", "==", participantsKey)
      .get();

    console.log(
      `[DEBUG] Found ${snapshot.docs.length} messages without orderBy`,
    );

    const messages = snapshot.docs.map((doc) => doc.data());

    // Sort messages manually.
    messages.sort((a, b) => {
      const getTime = (timestamp) => {
        if (!timestamp) {
          return 0;
        }

        if (typeof timestamp.toDate === "function") {
          return timestamp.toDate().getTime();
        }

        if (timestamp._seconds) {
          return timestamp._seconds * 1000;
        }

        return new Date(timestamp).getTime() || 0;
      };

      return getTime(b.timestamp) - getTime(a.timestamp);
    });

    return messages.slice(0, limit);
  }
};

// ============================================================
// Sessions
// ============================================================

const createSession = async (sessionData) => {
  const sessionRef = firestore.collection("sessions").doc();

  await sessionRef.set({
    ...sessionData,
    id: sessionRef.id,
    createdAt: FieldValue.serverTimestamp(),
  });

  return sessionRef.id;
};

// ------------------------------------------------------------

const updateSession = async (sessionId, updates) => {
  const sessionRef = firestore.collection("sessions").doc(sessionId);

  await sessionRef.update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });
};

// ------------------------------------------------------------

const getUserSessions = async (userId) => {
  const snapshot = await firestore
    .collection("sessions")
    .where("participants", "array-contains", userId)
    .orderBy("scheduledAt", "asc")
    .get();

  return snapshot.docs.map((doc) => doc.data());
};

// ============================================================
// Conversations
// ============================================================

const getUserConversations = async (userId) => {
  const snapshot = await firestore
    .collection("messages")
    .where("participants", "array-contains", userId)
    .orderBy("timestamp", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data());
};

// ============================================================
// Exports
// ============================================================

module.exports = {
  connectFirebase,
  initializeFirebaseClient,

  // Firebase instances
  getFirestore: () => firestore,
  getFirebaseAdmin: () => admin,

  // Helper functions
  createUser,
  updateUser,
  getUser,
  searchUsers,

  createMatch,
  updateMatch,
  getUserMatches,

  createMessage,
  getConversationMessages,

  createSession,
  updateSession,
  getUserSessions,

  getUserConversations,
};
