// SETUP: Refresh verse explanations and clear stale GPT cache
// Run with: ts-node scripts/refreshExplanations.ts

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { OpenAI } from "openai";
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Topic = "navigate_emotions" | "improve_salah";
type EmotionSubTopic = "positivity" | "negativity";
type SalahSubTopic = "focus" | "consistency";

interface Conversation {
  stepIndex: number;
  learn: {
    verse: string;
    explanationPrompt: string;
  };
  reflect: {
    questionPrompt: string;
  };
  act: {
    actionPrompt: string;
  };
}

async function getNewExplanation(
  verse: string,
  topic: string,
  subTopic: string
): Promise<string> {
  const systemPrompt = `
You are a Quranic teacher. Your job is to explain a verse of the Qur'an in a way that is short (3–5 sentences), highly relevant to the user's context, and spiritually uplifting.

The user is currently exploring the sub-topic: "${subTopic}" under the broader topic: "${topic}". Provide a tafsir-style explanation of the verse that helps them understand how it relates to this theme.

Do NOT include the verse again. Just the explanation. Make it warm, grounded, and based in traditional meaning but phrased in modern language.
`.trim();

  const userPrompt = `Please generate an explanation for the verse: "${verse}"`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  return chat.choices[0].message.content?.trim() || "Explanation unavailable.";
}

async function refreshConversation(conversationPath: string): Promise<void> {
  try {
    console.log(`🔄 Refreshing conversation at: ${conversationPath}`);

    // Get the conversation document
    const conversationRef = doc(db, conversationPath);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      console.error(`❌ Conversation not found at: ${conversationPath}`);
      return;
    }

    const data = conversationDoc.data() as Conversation;
    const { verse } = data.learn;

    // Extract topic and subtopic from path
    const pathParts = conversationPath.split("/");
    const topic = pathParts[1];
    const subTopic = pathParts[3];

    // Get new explanation
    console.log(`📝 Generating new explanation for verse: ${verse}`);
    const newExplanation = await getNewExplanation(verse, topic, subTopic);

    // Update the document
    await updateDoc(conversationRef, {
      "learn.explanation": newExplanation,
      // Clear any cached GPT responses
      generated: {},
      actionOptionsByReflection: {},
    });

    console.log(`✅ Updated conversation at: ${conversationPath}`);
  } catch (error) {
    console.error(
      `❌ Error refreshing conversation at ${conversationPath}:`,
      error
    );
  }
}

async function refreshAllConversations() {
  try {
    console.log("🔄 Starting refresh of all conversations...");

    // Get all topics
    const topicsRef = collection(db, "journeys");
    const topicsSnapshot = await getDocs(topicsRef);

    for (const topicDoc of topicsSnapshot.docs) {
      const topic = topicDoc.id;
      console.log(`\n📚 Processing topic: ${topic}`);

      // Get all subtopics
      const subtopicsRef = collection(db, "journeys", topic, "subtopics");
      const subtopicsSnapshot = await getDocs(subtopicsRef);

      for (const subtopicDoc of subtopicsSnapshot.docs) {
        const subtopic = subtopicDoc.id;
        console.log(`\n📖 Processing subtopic: ${subtopic}`);

        // Get all conversations
        const conversationsRef = collection(
          db,
          "journeys",
          topic,
          "subtopics",
          subtopic,
          "conversations"
        );
        const conversationsSnapshot = await getDocs(conversationsRef);

        for (const conversationDoc of conversationsSnapshot.docs) {
          const conversationPath = `journeys/${topic}/subtopics/${subtopic}/conversations/${conversationDoc.id}`;
          await refreshConversation(conversationPath);
        }
      }
    }

    console.log("\n✨ All conversations refreshed successfully!");
  } catch (error) {
    console.error("❌ Error refreshing conversations:", error);
    process.exit(1);
  }
}

// Run the refresh
refreshAllConversations();
