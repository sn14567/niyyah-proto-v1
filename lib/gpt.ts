// lib/gpt.ts

import { OpenAI } from "openai";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";
import Constants from "expo-constants";

const openai = new OpenAI({
  apiKey: Constants.expoConfig?.extra?.OPENAI_API_KEY,
});
const db = getFirestore(firebaseApp);

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
    model: "gpt-4o",
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
