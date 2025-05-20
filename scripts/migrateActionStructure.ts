// Migration: Add actionOptionsByReflection to all conversations in Firestore
// Run with: ts-node scripts/migrateActionStructure.ts

import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc, doc } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

console.log("🔧 Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? "✅ Set" : "❌ Missing",
  authDomain: firebaseConfig.authDomain ? "✅ Set" : "❌ Missing",
  projectId: firebaseConfig.projectId ? "✅ Set" : "❌ Missing",
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type Topic = "navigate_emotions" | "improve_salah";
type EmotionSubTopic = "positivity" | "negativity";
type SalahSubTopic = "focus" | "consistency";

// Topics and subtopics to update
const topics: Record<Topic, string[]> = {
  navigate_emotions: ["positivity", "negativity"],
  improve_salah: ["focus", "consistency"],
};

async function migrateActionOptions() {
  try {
    // Validate Firebase config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error(
        "Firebase configuration is missing. Please check your .env file."
      );
    }

    console.log("🔄 Starting migration...");

    for (const topic in topics) {
      const typedTopic = topic as Topic;
      for (const subTopic of topics[typedTopic]) {
        for (let i = 0; i < 3; i++) {
          const ref = doc(
            db,
            "journeys",
            typedTopic,
            "subtopics",
            subTopic,
            "conversations",
            i.toString()
          );

          console.log(`📝 Updating document at: ${ref.path}`);
          await updateDoc(ref, {
            "generated.actionOptionsByReflection": {}, // create blank object
          });

          console.log(
            `✅ Updated ${typedTopic}/${subTopic}/step ${i} with actionOptionsByReflection`
          );
        }
      }
    }

    console.log("🎉 Migration complete!");
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

migrateActionOptions();
