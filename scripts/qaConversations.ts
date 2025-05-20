// QA: Check content quality and relevance
// Run with: npm run qa

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
dotenv.config();

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
});
const db = getFirestore(app);

interface QAResult {
  topic: string;
  subtopic: string;
  step: number;
  verseRef: string;
  overlap: number;
  status: "OK" | "REGEN";
}

function extractVerseReference(verse: string): string {
  const match = verse.match(/\(Quran (\d+:\d+)\)/);
  return match ? match[1] : "unknown";
}

function calculateOverlap(verse: string, explanation: string): number {
  // Normalize text: lowercase, remove punctuation, split into words
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3); // Only consider words longer than 3 chars

  const verseWords = new Set(normalize(verse));
  const explanationWords = normalize(explanation);

  // Count common words
  const commonWords = explanationWords.filter((word) => verseWords.has(word));

  // Calculate overlap ratio
  return verseWords.size > 0 ? commonWords.length / verseWords.size : 0;
}

async function qaConversations() {
  try {
    console.log("🔍 Starting QA check of conversations...");
    const results: QAResult[] = [];

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

        console.log(
          `Found ${conversationsSnapshot.size} conversations in ${topic}/${subtopic}`
        );

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

          const verseRef = extractVerseReference(verse);
          const overlap = calculateOverlap(verse, explanation);
          const status = overlap >= 0.2 ? "OK" : "REGEN"; // 20% overlap threshold

          results.push({
            topic,
            subtopic,
            step: parseInt(conversationDoc.id),
            verseRef,
            overlap,
            status,
          });
        }
      }
    }

    // Print results table
    console.table(results);

    // Print summary
    const total = results.length;
    const needsRegen = results.filter((r) => r.status === "REGEN").length;

    console.log("\n📊 QA Summary:");
    console.log(`Total conversations: ${total}`);
    console.log(`✅ Content OK: ${total - needsRegen}`);
    console.log(`🔄 Needs regeneration: ${needsRegen}`);
  } catch (error) {
    console.error("❌ QA check failed:", error);
    process.exit(1);
  }
}

// Run the QA check
qaConversations();
