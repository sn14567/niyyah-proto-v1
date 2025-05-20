import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

// Types
export interface Conversation {
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
  conversation: Conversation;
}

export async function getJourneyConversations(
  topicId: string,
  subTopicId: string
): Promise<JourneyConversation[]> {
  try {
    // Construct the path to the conversations collection
    const conversationsRef = collection(
      db,
      "journeys",
      topicId,
      "subtopics",
      subTopicId,
      "conversations"
    );

    // Create a query to get all conversations ordered by stepIndex
    const q = query(conversationsRef, orderBy("stepIndex"));

    // Get the documents
    const querySnapshot = await getDocs(q);

    // Map the documents to our type
    const conversations = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        stepIndex: data.stepIndex,
        conversation: data.conversation,
      } as JourneyConversation;
    });

    return conversations;
  } catch (error) {
    console.error("Error fetching journey conversations:", error);
    throw error;
  }
}
