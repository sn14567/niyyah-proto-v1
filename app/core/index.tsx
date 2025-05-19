import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ChatBubble } from "../../components/ChatBubble";
import journeyConfigs from "@/data/journeys";

type Message = {
  id: string;
  role: "system" | "ai" | "user";
  type:
    | "intro"
    | "verse"
    | "explanation"
    | "reflectionQuestion"
    | "reflectionFeedback"
    | "actionOptions"
    | "celebration"
    | "userSelection";
  text: string;
  options?: string[]; // For MCQs
};

export default function CoreScreen() {
  // Get journey params
  const { topic, subTopic } = useLocalSearchParams<{
    topic?: string;
    subTopic?: string;
  }>();

  // Load journey config
  const journey =
    journeyConfigs?.[topic?.toLowerCase() ?? ""]?.[
      subTopic?.toLowerCase() ?? ""
    ] ?? null;

  // Show fallback if no valid journey
  if (!journey) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Something went wrong. Please restart your journey.
        </Text>
      </View>
    );
  }

  // Initial messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      type: "intro",
      text: journey.intro,
    },
    {
      id: "2",
      role: "ai",
      type: "verse",
      text: "Indeed, this Qur'an guides to that which is most suitable... (17:9)", // Replace with Firestore verse later
    },
    {
      id: "3",
      role: "ai",
      type: "explanation",
      text: "This verse reminds us that the Quran provides the most upright guidance for all aspects of life. (To be GPT-generated.)",
    },
    {
      id: "4",
      role: "ai",
      type: "reflectionQuestion",
      text: "How does this verse make you reflect on your current emotional state?",
      options: ["I feel hopeful", "I feel unsure", "I feel disconnected"],
    },
    {
      id: "5",
      role: "user",
      type: "userSelection",
      text: "I feel hopeful", // Simulated user choice
    },
    {
      id: "6",
      role: "ai",
      type: "reflectionFeedback",
      text: "That's beautiful to hear. When hope is rooted in divine guidance, it becomes a powerful anchor through life's storms.",
    },
    {
      id: "7",
      role: "ai",
      type: "actionOptions",
      text: "Here are three ways you can act on this verse today:",
      options: [
        "Write a short dua asking Allah to strengthen your hope.",
        "Share this verse with someone who needs encouragement.",
        "Set a small goal that aligns with the verse's message.",
      ],
    },
    {
      id: "8",
      role: "user",
      type: "userSelection",
      text: "Write a short dua asking Allah to strengthen your hope.",
    },
    {
      id: "9",
      role: "ai",
      type: "celebration",
      text: "Well done! You've just acted on divine guidance. Keep this up and return tomorrow for more insight 🌱",
    },
  ]);

  // Track current step
  const [currentStepIndex, setCurrentStepIndex] = useState(1);

  // Helper to reveal next message
  const advanceSteps = (count: number = 1) => {
    setCurrentStepIndex((prev) => Math.min(prev + count, messages.length));
  };

  // Reveal initial AI message after intro
  useEffect(() => {
    const timeout = setTimeout(() => {
      advanceSteps();
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  // Auto-advance AI messages that don't require input
  useEffect(() => {
    const nextMessage = messages[currentStepIndex];
    if (!nextMessage) return;

    const shouldAutoAdvance =
      nextMessage.role === "ai" &&
      (!nextMessage.options || nextMessage.options.length === 0);

    if (shouldAutoAdvance) {
      const timeout = setTimeout(() => {
        advanceSteps();
      }, 1000); // Delay for realism
      return () => clearTimeout(timeout);
    }
  }, [currentStepIndex]);

  const handleOptionSelect = (
    selectedOption: string,
    currentMessage: Message
  ) => {
    const newMessages: Message[] = [];

    // Push user selection
    newMessages.push({
      id: `${messages.length + 1}`,
      role: "user",
      type: "userSelection",
      text: selectedOption,
    });

    // Simulate AI response after user selection
    if (currentMessage.type === "reflectionQuestion") {
      newMessages.push({
        id: `${messages.length + 2}`,
        role: "ai",
        type: "reflectionFeedback",
        text: "That's beautiful to hear. When hope is rooted in divine guidance, it becomes a powerful anchor through life's storms.",
      });
    }

    if (currentMessage.type === "actionOptions") {
      newMessages.push({
        id: `${messages.length + 2}`,
        role: "ai",
        type: "celebration",
        text: "Well done! You've just acted on divine guidance. Keep this up and return tomorrow for more insight 🌱",
      });
    }

    setMessages([...messages, ...newMessages]);

    // Reveal those new messages now
    advanceSteps(newMessages.length);
  };

  return (
    <ScrollView style={styles.container}>
      {messages.slice(0, currentStepIndex).map((msg) => (
        <ChatBubble
          key={msg.id}
          sender={msg.role === "ai" ? "ai" : "user"}
          text={msg.text}
          options={msg.options}
          onOptionSelect={(option) => handleOptionSelect(option, msg)}
          showAvatar={msg.role === "ai" && msg.id === "2"}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0b07",
    padding: 16,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
  },
});
