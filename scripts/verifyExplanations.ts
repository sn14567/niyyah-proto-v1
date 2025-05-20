// VERIFY: Check explanation content against verses
// Run with: ts-node scripts/verifyExplanations.ts

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
dotenv.config();

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
});
const db = getFirestore(app);

async function verifyExplanations() {
  try {
    console.log("🔍 Verifying explanations...");

    // Get all topics
    const topicsRef = db.collection("journeys");
    const topicsSnapshot = await topicsRef.get();

    for (const topicDoc of topicsSnapshot.docs) {
      const topic = topicDoc.id;
      console.log(`\n📚 Checking topic: ${topic}`);

      // Get all subtopics
      const subtopicsRef = db.collection(`journeys/${topic}/subtopics`);
      const subtopicsSnapshot = await subtopicsRef.get();

      for (const subtopicDoc of subtopicsSnapshot.docs) {
        const subtopic = subtopicDoc.id;
        console.log(`\n📖 Checking subtopic: ${subtopic}`);

        // Get all conversations
        const conversationsRef = db.collection(
          `journeys/${topic}/subtopics/${subtopic}/conversations`
        );
        const conversationsSnapshot = await conversationsRef.get();

        for (const conversationDoc of conversationsSnapshot.docs) {
          const data = conversationDoc.data();
          const verse = data.learn?.verse;
          const explanation = data.learn?.explanation;

          if (!verse || !explanation) {
            console.log(
              `❌ Missing verse or explanation in ${conversationDoc.id}`
            );
            continue;
          }

          console.log("\n📝 Verse:", verse);
          console.log("💭 Explanation:", explanation);
          console.log("---");
        }
      }
    }
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

// Run the verification
verifyExplanations();
