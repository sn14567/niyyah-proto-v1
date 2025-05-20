// lib/gpt.ts

import { OpenAI } from "openai";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Constants from "expo-constants";
import { getConversationDocPath } from "./firestorePaths";

const openai = new OpenAI({
  apiKey: Constants.expoConfig?.extra?.OPENAI_API_KEY,
});

type GetExplanationParams = {
  topic: string;
  subTopic: string;
};

export async function getExplanation({
  topic,
  subTopic,
}: GetExplanationParams): Promise<string> {
  const id = `${topic.toLowerCase()}__${subTopic.toLowerCase()}`;
  const ref = doc(db, "explanations", id);

  const cached = await getDoc(ref);
  if (cached.exists()) {
    const data = cached.data();
    if (data?.text) return data.text;
  }

  const systemPrompt = `
You are a Quranic teacher. Your job is to explain a verse of the Qur'an in a way that is short (3–5 sentences), highly relevant to the user's context, and spiritually uplifting.

The user is currently exploring the sub-topic: "${subTopic}" under the broader topic: "${topic}". Provide a tafsir-style explanation of the verse that helps them understand how it relates to this theme.

Do NOT include the verse again. Just the explanation. Make it warm, grounded, and based in traditional meaning but phrased in modern language.
  `.trim();

  const userPrompt = `Please generate an explanation for the verse selected for the "${subTopic}" journey.`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  const explanation =
    chat.choices[0].message.content?.trim() || "Explanation unavailable.";

  await setDoc(ref, { topic, subTopic, text: explanation });

  return explanation;
}

export async function getOrGenerateActionOptions({
  topic,
  subTopic,
  stepIndex,
  reflectionAnswer,
}: {
  topic: string;
  subTopic: string;
  stepIndex: number;
  reflectionAnswer: string;
}): Promise<string[]> {
  try {
    // Normalize IDs to match Firestore paths
    const normalizedTopic = topic.toLowerCase();
    const normalizedSubTopic = subTopic.toLowerCase();

    // Use the shared helper for the nested path
    const conversationPath = getConversationDocPath(
      normalizedTopic,
      normalizedSubTopic,
      stepIndex
    );

    console.log("🔍 Looking up conversation at path:", conversationPath);

    const conversationRef = doc(db, conversationPath);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      console.error(
        "❌ Conversation document not found at path:",
        conversationPath
      );
      throw new Error("Conversation not found");
    }

    const conversationData = conversationDoc.data();
    console.log("📄 Found conversation data:", conversationData);

    // Check for cached action options
    const cachedOptions =
      conversationData.actionOptionsByReflection?.[reflectionAnswer];
    if (cachedOptions) {
      console.log(
        "✅ Using cached action options for reflection:",
        reflectionAnswer
      );
      return cachedOptions;
    }

    console.log(
      "🤖 Generating new action options for reflection:",
      reflectionAnswer
    );

    // Generate new options using GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an Islamic spiritual guide helping users apply Quranic wisdom to their lives. 
          The user has just reflected on a verse and shared their emotional state: "${reflectionAnswer}".
          Generate 3 practical, actionable steps they can take to apply the verse's wisdom to their situation.
          Each step should be specific, achievable, and directly related to their reflection.
          Format each step as a complete sentence starting with a verb.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const generatedText = completion.choices[0]?.message?.content;
    if (!generatedText) {
      throw new Error("No response from GPT");
    }

    // Parse the generated text into an array of options
    const options = generatedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 3);

    console.log("✨ Generated action options:", options);

    // Cache the generated options
    await updateDoc(conversationRef, {
      [`actionOptionsByReflection.${reflectionAnswer}`]: options,
    });

    console.log("💾 Cached action options in Firestore");
    return options;
  } catch (error) {
    console.error("❌ Error generating action options:", error);
    throw error;
  }
}

export async function getOrGenerateExplanation({
  topic,
  subTopic,
  stepIndex,
  verse,
}: {
  topic: string;
  subTopic: string;
  stepIndex: number;
  verse: string;
}): Promise<string> {
  // Normalize IDs to match Firestore paths
  const normalizedTopic = topic.toLowerCase();
  const normalizedSubTopic = subTopic.toLowerCase();
  const conversationPath = getConversationDocPath(
    normalizedTopic,
    normalizedSubTopic,
    stepIndex
  );
  console.log("🔍 Looking up explanation at path:", conversationPath);
  const conversationRef = doc(db, conversationPath);
  const conversationDoc = await getDoc(conversationRef);
  if (conversationDoc.exists()) {
    const data = conversationDoc.data();
    const explanation = data?.learn?.explanation;
    console.log("📄 Fetched explanation:", explanation);
    if (explanation) {
      return explanation;
    }
  }
  console.warn("No explanation found — calling GPT");
  // Fallback to GPT
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
  const explanation =
    chat.choices[0].message.content?.trim() || "Explanation unavailable.";
  // Optionally cache in Firestore
  await updateDoc(conversationRef, { "learn.explanation": explanation });
  return explanation;
}
