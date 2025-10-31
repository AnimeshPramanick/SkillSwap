require("dotenv").config();
const { connectFirebase, getFirestore } = require("./config/firebase");

async function debugMessages() {
  try {
    // Connect to Firebase
    connectFirebase();
    const db = getFirestore();

    console.log("\n=== Debugging Messages ===\n");

    // Get all messages
    const messagesSnapshot = await db.collection("messages").get();

    console.log(`Total messages in database: ${messagesSnapshot.size}\n`);

    if (messagesSnapshot.size === 0) {
      console.log("❌ No messages found in database!");
      return;
    }

    messagesSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n--- Message ${index + 1} ---`);
      console.log("ID:", data.id);
      console.log("Sender ID:", data.senderId);
      console.log("Recipient ID:", data.recipientId);
      console.log("Message:", data.message);
      console.log("Participants:", data.participants);
      console.log("Timestamp:", data.timestamp);
      console.log("Is Read:", data.isRead);
    });

    console.log("\n\n=== Testing Query ===\n");

    // Test a specific query
    const testUserId1 = process.argv[2];
    const testUserId2 = process.argv[3];

    if (testUserId1 && testUserId2) {
      const participantsKey = [testUserId1, testUserId2].sort().join("_");
      console.log(`Looking for messages with participants: ${participantsKey}`);

      const conversationSnapshot = await db
        .collection("messages")
        .where("participants", "==", participantsKey)
        .get();

      console.log(
        `Found ${conversationSnapshot.size} messages for this conversation`
      );

      conversationSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n--- Conversation Message ${index + 1} ---`);
        console.log("Message:", data.message);
        console.log("From:", data.senderId);
        console.log("To:", data.recipientId);
      });
    } else {
      console.log("💡 Tip: Run with user IDs to test specific conversation:");
      console.log("node debug-messages.js <userId1> <userId2>");
    }

    console.log("\n✅ Debug complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

debugMessages();
