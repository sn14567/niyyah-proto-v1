// MIGRATION: Merge explanations into conversation documents
// Run with: npm run migrate:explanations

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
dotenv.config();

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
});
const db = getFirestore(app);

interface MigrationResult {
  topic: string;
  subTopic: string;
  mergedInto: string;
  status: "success" | "error";
  error?: string;
}

async function migrateExplanations() {
  const results: MigrationResult[] = [];
  const batch = db.batch();
  let batchCount = 0;
  const BATCH_LIMIT = 500; // Firestore batch limit

  try {
    console.log("🔄 Starting explanation migration...");

    // Get all explanation documents
    const explanationsSnapshot = await db.collection("explanations").get();

    for (const explanationDoc of explanationsSnapshot.docs) {
      const { topic, subTopic, text } = explanationDoc.data();

      // Build target conversation path
      const conversationPath = `journeys/${topic}/subtopics/${subTopic}/conversations/0`;
      const conversationRef = db.doc(conversationPath);

      try {
        // Add to batch
        batch.set(
          conversationRef,
          {
            "learn.explanation": text,
          },
          { merge: true }
        );

        // Delete original explanation
        batch.delete(explanationDoc.ref);

        batchCount += 2; // Count both write and delete operations

        // Commit batch if we're at the limit
        if (batchCount >= BATCH_LIMIT) {
          await batch.commit();
          batchCount = 0;
        }

        results.push({
          topic,
          subTopic,
          mergedInto: conversationPath,
          status: "success",
        });
      } catch (error) {
        results.push({
          topic,
          subTopic,
          mergedInto: conversationPath,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Commit any remaining operations
    if (batchCount > 0) {
      await batch.commit();
    }

    // Print results table
    console.table(results);

    // Print summary
    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    console.log("\n📊 Migration Summary:");
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed migrations: ${errorCount}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateExplanations();
