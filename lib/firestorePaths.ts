// Returns the Firestore path for a conversation doc in the nested structure
export function getConversationDocPath(
  topic: string,
  subTopic: string,
  stepIndex: number | string
): string {
  return `journeys/${topic}/subtopics/${subTopic}/conversations/${stepIndex}`;
}
