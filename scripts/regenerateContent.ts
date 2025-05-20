// REGEN: Regenerate content for conversations
// Run with: npm run regen [--all]

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

// Initialize Firebase Admin
console.log("🔑 Initializing Firebase Admin...");
console.log(
  "Checking credentials path:",
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);

const app = initializeApp({
  credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
});
const db = getFirestore(app);

// Test connection
async function testConnection() {
  try {
    console.log("🔍 Testing Firestore connection...");
    const testRef = db.collection("journeys");
    const testSnapshot = await testRef.get();
    console.log("✅ Firestore connection successful");
    console.log("📊 Collection stats:", {
      exists: testRef !== null,
      path: testRef.path,
      size: testSnapshot.size,
    });
  } catch (error) {
    console.error("❌ Firestore connection failed:", error);
    process.exit(1);
  }
}

// Run connection test before starting regeneration
async function main() {
  // Test connection first
  await testConnection();

  // Then run regeneration
  await regenerateContent();
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RegenerationResult {
  topic: string;
  subtopic: string;
  step: number;
  verseRef: string;
  status: "SUCCESS" | "FAILED";
  error?: string;
}

// Validation helpers
function validateExplanation(text: string): boolean {
  const words = text.split(/\s+/);
  return words.length <= 100;
}

function validateReflectionQuestion(text: string): boolean {
  const words = text.split(/\s+/);
  return words.length <= 25 && text.endsWith("?");
}

function validateReflectionOption(text: string): boolean {
  const words = text.split(/\s+/);
  return words.length <= 25 && !text.match(/^\d+\./);
}

function validateActionOption(text: string): boolean {
  const words = text.split(/\s+/);
  return (
    words.length <= 40 && !text.match(/^\d+\./) && !text.startsWith("Verse:")
  );
}

// GPT helpers
async function getExplanation(
  verse: string,
  topic: string,
  subtopic: string
): Promise<string> {
  const systemPrompt = `
You are a Quranic teacher. Your job is to explain a verse of the Qur'an in a way that is short (no more than 100 words), highly relevant to the user's context, and spiritually uplifting.

The user is currently exploring the sub-topic: "${subtopic}" under the broader topic: "${topic}". Provide a tafsir-style explanation of the verse that helps them understand how it relates to this theme.

Do NOT include the verse again. Just the explanation. Make it warm, grounded, and based in traditional meaning but phrased in modern language. STRICT LIMIT: 100 words or less.
`.trim();

  const userPrompt = `Please generate an explanation for the verse: "${verse}" (max 100 words)`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  const output = chat.choices[0].message.content?.trim() || "";
  console.log("[GPT Explanation Output]", output);
  return output;
}

async function getReflectionQuestion(verse: string): Promise<string> {
  const systemPrompt = `
Generate a single reflection question (no more than 25 words, must end with a question mark) that helps the user connect personally with this Quranic verse. The question should be open-ended and encourage self-reflection. STRICT LIMIT: 25 words or less. Must end with a question mark. No numbering or bullets.
`.trim();

  const userPrompt = `Verse: "${verse}"`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  const output = chat.choices[0].message.content?.trim() || "";
  console.log("[GPT Reflection Question Output]", output);
  return output;
}

async function getReflectionOptions(verse: string): Promise<string[]> {
  const systemPrompt = `
Generate 3 different emotional responses (no more than 25 words each, no numbering or bullets) that a person might have when reflecting on this Quranic verse. Each response should be a complete sentence starting with "I feel". STRICT LIMIT: 25 words or less per response. No numbering or bullets.
`.trim();

  const userPrompt = `Verse: "${verse}"`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  const response = chat.choices[0].message.content?.trim() || "";
  console.log("[GPT Reflection Options Output]", response);
  return response
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function getActionOptions(
  verse: string,
  reflectionOption: string
): Promise<string[]> {
  const systemPrompt = `
Generate 3 practical action suggestions (no more than 40 words each, no numbering or bullets) that someone could take based on their reflection: "${reflectionOption}" on this Quranic verse. Each suggestion should be a complete sentence in imperative form, without numbers or bullet points. STRICT LIMIT: 40 words or less per suggestion. No numbering or bullets.
`.trim();

  const userPrompt = `Verse: "${verse}"`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  const response = chat.choices[0].message.content?.trim() || "";
  console.log("[GPT Action Options Output]", response);
  return response
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function regenerateContent() {
  try {
    console.log("🔄 Starting content regeneration...");
    const results: RegenerationResult[] = [];
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_LIMIT = 500;

    // Use a collection group query to get all conversations
    console.log(
      "\n🔍 Fetching all conversations using collection group query..."
    );
    const conversationsSnapshot = await db
      .collectionGroup("conversations")
      .get();
    console.log(`Found ${conversationsSnapshot.size} conversations in total`);

    if (conversationsSnapshot.empty) {
      console.error(
        "❌ No conversations found in Firestore. Please run setup-journeys first."
      );
      process.exit(1);
    }

    for (const conversationDoc of conversationsSnapshot.docs) {
      const data = conversationDoc.data();
      console.log(`\n📄 Processing conversation ${conversationDoc.id}:`, data);

      // Extract topic, subtopic, and stepIndex from the document path
      // Path: journeys/{topic}/subtopics/{subtopic}/conversations/{stepIndex}
      const pathSegments = conversationDoc.ref.path.split("/");
      const topic = pathSegments[1];
      const subtopic = pathSegments[3];
      const stepIndex = parseInt(conversationDoc.id);

      const verse = data.learn?.verse;
      const verseRef = verse?.match(/\(Quran (\d+:\d+)\)/)?.[1] || "unknown";

      if (!verse) {
        console.error(`❌ Missing verse in conversation ${conversationDoc.id}`);
        continue;
      }

      try {
        console.log(`\n📝 Processing verse: ${verseRef}`);

        // Generate new content
        console.log("🤖 Generating explanation...");
        const explanation = await getExplanation(verse, topic, subtopic);
        console.log("🤖 Generating reflection question...");
        const reflectionQuestion = await getReflectionQuestion(verse);
        console.log("🤖 Generating reflection options...");
        const reflectionOptions = await getReflectionOptions(verse);

        // Validate content
        console.log("🔍 Validating generated content...");
        if (
          !validateExplanation(explanation) ||
          !validateReflectionQuestion(reflectionQuestion) ||
          !reflectionOptions.every(validateReflectionOption)
        ) {
          throw new Error("Generated content failed validation");
        }

        // Generate action options for each reflection
        const actionOptionsByReflection: Record<string, string[]> = {};
        for (const reflection of reflectionOptions) {
          console.log(`\n🤔 Generating actions for reflection: ${reflection}`);
          const actions = await getActionOptions(verse, reflection);
          if (!actions.every(validateActionOption)) {
            throw new Error("Generated actions failed validation");
          }
          actionOptionsByReflection[reflection] = actions;
        }

        // Update document
        const conversationRef = db.doc(conversationDoc.ref.path);
        console.log(`📝 Updating document at ${conversationRef.path}...`);
        batch.set(
          conversationRef,
          {
            "learn.explanation": explanation,
            "reflect.question": reflectionQuestion,
            "reflect.options": reflectionOptions,
            actionOptionsByReflection: actionOptionsByReflection,
          },
          { merge: true }
        );

        batchCount++;

        // Commit batch if we're at the limit
        if (batchCount >= BATCH_LIMIT) {
          console.log("📦 Committing batch...");
          await batch.commit();
          batchCount = 0;
        }

        results.push({
          topic,
          subtopic,
          step: stepIndex,
          verseRef,
          status: "SUCCESS",
        });

        console.log(`✅ Successfully regenerated content for ${verseRef}`);
      } catch (error) {
        console.error(
          `❌ Failed to regenerate content for ${verseRef}:`,
          error
        );
        results.push({
          topic,
          subtopic,
          step: stepIndex,
          verseRef,
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Commit any remaining operations
    if (batchCount > 0) {
      console.log("📦 Committing final batch...");
      await batch.commit();
    }

    // Print results table
    console.table(results);

    // Print summary
    const total = results.length;
    const successCount = results.filter((r) => r.status === "SUCCESS").length;
    const failCount = results.filter((r) => r.status === "FAILED").length;

    console.log("\n📊 Regeneration Summary:");
    console.log(`Total conversations: ${total}`);
    console.log(`✅ Successfully regenerated: ${successCount}`);
    console.log(`❌ Failed regenerations: ${failCount}`);
  } catch (error) {
    console.error("❌ Regeneration failed:", error);
    process.exit(1);
  }
}

// Run everything
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
