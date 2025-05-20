import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

// Types
export interface Conversation {
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

export interface JourneyConversation {
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

export async function getJourneyConversations(
  topicId: string,
  subTopicId: string
): Promise<JourneyConversation[]> {
  try {
    // Normalize the IDs to match the setup script
    const normalizedTopicId = topicId.toLowerCase().replace(/\s+/g, "_");
    const normalizedSubTopicId = subTopicId.toLowerCase().replace(/\s+/g, "_");

    console.log("🔍 Original IDs:", { topicId, subTopicId });
    console.log("🔍 Normalized IDs:", {
      normalizedTopicId,
      normalizedSubTopicId,
    });

    // Construct the path to the conversations collection
    const conversationsRef = collection(
      db,
      "journeys",
      normalizedTopicId,
      "subtopics",
      normalizedSubTopicId,
      "conversations"
    );

    console.log("📂 Collection path:", conversationsRef.path);

    // Create a query to get all conversations ordered by stepIndex
    const q = query(conversationsRef, orderBy("stepIndex"));

    // Get the documents
    console.log("📥 Fetching documents...");
    const querySnapshot = await getDocs(q);

    console.log("📊 Found documents:", querySnapshot.size);
    if (querySnapshot.size === 0) {
      console.log("⚠️ No documents found at path:", conversationsRef.path);
      return [];
    }

    // Map the documents to our type
    const conversations = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log("📄 Document data:", { id: doc.id, data });
      return data as JourneyConversation;
    });

    console.log("✅ Mapped conversations:", conversations);
    return conversations;
  } catch (error) {
    console.error("❌ Error fetching journey conversations:", error);
    throw error;
  }
}

// Helper function to list collections (for debugging)
async function listCollections(db: any) {
  try {
    const collections = await db.listCollections();
    return collections.map((col: any) => col.id);
  } catch (error) {
    console.error("Error listing collections:", error);
    return [];
  }
}
