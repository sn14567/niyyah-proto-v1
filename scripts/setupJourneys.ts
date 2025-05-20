// SETUP: Journey conversations in Firestore for Niyyah app
// Run with: ts-node scripts/setupJourneys.ts

import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type Topic = "navigate_emotions" | "improve_salah";
type EmotionSubTopic = "positivity" | "negativity";
type SalahSubTopic = "focus" | "consistency";

interface JourneyData {
  navigate_emotions: Record<EmotionSubTopic, string[]>;
  improve_salah: Record<SalahSubTopic, string[]>;
}

const journeys: JourneyData = {
  navigate_emotions: {
    positivity: [
      "If you tried to count Allah's blessings, you would never be able to number them. [...] (Quran 16:18)",
      "remember Me; I will remember you. And thank Me, and never be ungrateful. (Quran 2:152)",
      "Allah does not burden a soul beyond that it can bear. [...] (Quran 2:286)",
    ],
    negativity: [
      "those who believe and whose hearts find comfort in the remembrance of Allah. Surely in the remembrance of Allah do hearts find comfort. (Quran 13:28)",
      "Indeed, messengers before you were rejected but patiently endured rejection and persecution until Our help came to them. And Allah's promise ˹to help˺ is never broken. (Quran 6:34)",
      "[...] Perhaps you dislike something which is good for you and like something which is bad for you. Allah knows and you do not know. (Quran 2:216)",
    ],
  },
  improve_salah: {
    focus: [
      "And seek help through patience and prayer. Indeed, it is a burden except for the humble— (Quran 2:45)",
      "Man was truly created anxious: distressed when touched with evil, and withholding when touched with good—except those who pray, (Quran 70:19-22)",
      "Successful indeed are the believers, those who humble themselves in their prayers. (Quran 23:1-2)",
    ],
    consistency: [
      "And seek help through patience and prayer. Indeed, it is a burden except for the humble— (Quran 2:45)",
      "Successful indeed are the believers, those who humble themselves in their prayers. (Quran 23:1-2)",
      "[...] Cooperate with one another in goodness and righteousness, and do not cooperate in sin and transgression. And be mindful of Allah. Surely Allah is severe in punishment. (Quran 5:2)",
    ],
  },
};

function isEmotionSubTopic(
  topic: Topic,
  subTopic: string
): subTopic is EmotionSubTopic {
  return (
    topic === "navigate_emotions" &&
    (subTopic === "positivity" || subTopic === "negativity")
  );
}

function isSalahSubTopic(
  topic: Topic,
  subTopic: string
): subTopic is SalahSubTopic {
  return (
    topic === "improve_salah" &&
    (subTopic === "focus" || subTopic === "consistency")
  );
}

async function setupJourneys() {
  try {
    // Validate Firebase config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error(
        "Firebase configuration is missing. Please check your .env file."
      );
    }

    for (const topic in journeys) {
      const typedTopic = topic as Topic;
      for (const subTopic in journeys[typedTopic]) {
        let verses: string[];

        if (isEmotionSubTopic(typedTopic, subTopic)) {
          verses = journeys.navigate_emotions[subTopic];
        } else if (isSalahSubTopic(typedTopic, subTopic)) {
          verses = journeys.improve_salah[subTopic];
        } else {
          continue; // Skip if subtopic doesn't match any type
        }

        for (let i = 0; i < verses.length; i++) {
          const verse = verses[i];

          const data = {
            stepIndex: i,
            learn: {
              verse,
              explanationPrompt: `Explain the meaning of the verse: "${verse}" in the context of ${subTopic}.`,
            },
            reflect: {
              questionPrompt: `Ask a reflection question that helps the user connect personally with this verse: "${verse}".`,
            },
            act: {
              actionPrompt: `Suggest 3 practical actions someone could take based on the message in this verse: "${verse}".`,
            },
          };

          const ref = doc(
            db,
            "journeys",
            topic,
            "subtopics",
            subTopic,
            "conversations",
            i.toString()
          );
          await setDoc(ref, { conversation: data });
          console.log(`✅ Created conversation ${i} for ${topic}/${subTopic}`);
        }
      }
    }

    console.log("🚀 Journey setup completed successfully!");
  } catch (error) {
    console.error("Error setting up journeys:", error);
    process.exit(1);
  }
}

setupJourneys();
