import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  findNodeHandle,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChatBubble } from "../../components/ChatBubble";
import journeyConfigs from "@/data/journeys";

type Message = {
  id: string;
  role: "system" | "ai" | "user";
  type:
    | "intro"
    | "verse"
    | "nextStep"
    | "explanation"
    | "reflectionQuestion"
    | "reflectionFeedback"
    | "actionOptions"
    | "celebration"
    | "userSelection";
  text: string;
  options?: string[];
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
      text: "Indeed, this Qur'an guides to that which is most suitable... (17:9)",
    },
    {
      id: "3",
      role: "ai",
      type: "nextStep",
      text: "What would you like to do next?",
      options: ["Learn more about this verse", "Reflect on this verse"],
    },
  ]);

  // Start with just the intro message
  const [currentStepIndex, setCurrentStepIndex] = useState(1);

  // Create refs for scrolling
  const scrollRef = useRef<ScrollView>(null);
  const messageRefs = useRef<{ [id: string]: View | null }>({});

  // Helper to reveal next message
  const advanceSteps = useCallback(
    (count: number = 1) => {
      console.log("Advancing steps by:", count);
      console.log("Current index:", currentStepIndex);
      console.log("Total messages:", messages.length);

      setCurrentStepIndex((prev) => {
        const next = Math.min(prev + count, messages.length);
        console.log("Next index will be:", next);
        return next;
      });
    },
    [messages.length, currentStepIndex]
  );

  // Reveal initial AI message after intro
  useEffect(() => {
    console.log("Initial auto-advance effect running");
    const timeout = setTimeout(() => {
      console.log("Initial auto-advance timeout triggered");
      advanceSteps();
    }, 800);
    return () => clearTimeout(timeout);
  }, [advanceSteps]);

  // Auto-advance AI messages that don't require input
  useEffect(() => {
    const nextMessage = messages[currentStepIndex];
    console.log("Auto-advance effect running");
    console.log("Current step index:", currentStepIndex);
    console.log("Next message:", nextMessage);

    if (!nextMessage) {
      console.log("No next message, returning");
      return;
    }

    // Check if this is the verse message (id: "2")
    const isVerseMessage = nextMessage.id === "2";

    const shouldAutoAdvance =
      nextMessage.role === "ai" &&
      (!nextMessage.options || nextMessage.options.length === 0) &&
      (isVerseMessage || currentStepIndex < messages.length - 1);

    console.log("Should auto-advance:", shouldAutoAdvance);
    console.log("Is verse message:", isVerseMessage);
    console.log("Message has options:", nextMessage.options?.length);

    if (shouldAutoAdvance) {
      console.log("Setting up auto-advance timeout");
      const timeout = setTimeout(() => {
        console.log("Auto-advance timeout triggered");
        advanceSteps();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentStepIndex, messages, advanceSteps]);

  // Helper to scroll to a message
  const scrollToMessage = useCallback((messageId: string) => {
    console.log("Attempting to scroll to message:", messageId);

    // Wait for next render cycle
    requestAnimationFrame(() => {
      const view = messageRefs.current[messageId];
      console.log("Got view ref in scrollToMessage:", !!view);

      if (!view) {
        console.log("No view ref found, retrying in 500ms");
        setTimeout(() => scrollToMessage(messageId), 500);
        return;
      }

      view.measure((x, y, width, height, pageX, pageY) => {
        console.log("Measured position:", { x, y, pageX, pageY });
        // Scroll to position the message near the top of the screen
        const scrollPosition = Math.max(0, pageY - 100);
        console.log("Scrolling to position:", scrollPosition);
        scrollRef.current?.scrollTo({ y: scrollPosition, animated: true });
      });
    });
  }, []);

  const handleOptionSelect = useCallback(
    (selectedOption: string, currentMessage: Message) => {
      const newMessages: Message[] = [];

      // Push user selection
      newMessages.push({
        id: `${messages.length + 1}`,
        role: "user",
        type: "userSelection",
        text: selectedOption,
      });

      // Handle nextStep branching
      if (currentMessage.type === "nextStep") {
        if (selectedOption === "Learn more about this verse") {
          newMessages.push(
            {
              id: `${messages.length + 2}`,
              role: "ai",
              type: "explanation",
              text: "This verse reminds us that the Quran provides the most upright guidance...",
            },
            {
              id: `${messages.length + 3}`,
              role: "ai",
              type: "nextStep",
              text: "Ready to reflect on this verse?",
              options: ["Reflect on this verse"],
            }
          );
        }

        if (selectedOption === "Reflect on this verse") {
          newMessages.push({
            id: `${messages.length + 2}`,
            role: "ai",
            type: "reflectionQuestion",
            text: "How does this verse make you reflect on your current emotional state?",
            options: ["I feel hopeful", "I feel unsure", "I feel disconnected"],
          });
        }
      }

      // Handle reflection question
      if (currentMessage.type === "reflectionQuestion") {
        newMessages.push(
          {
            id: `${messages.length + 2}`,
            role: "ai",
            type: "reflectionFeedback",
            text: "That's beautiful to hear. When hope is rooted in divine guidance, it becomes a powerful anchor through life's storms.",
          },
          {
            id: `${messages.length + 3}`,
            role: "ai",
            type: "actionOptions",
            text: "Here are three ways you can act on this verse today:",
            options: [
              "Write a short dua asking Allah to strengthen your hope.",
              "Share this verse with someone who needs encouragement.",
              "Set a small goal that aligns with the verse's message.",
            ],
          }
        );
      }

      // Handle action options
      if (currentMessage.type === "actionOptions") {
        newMessages.push({
          id: `${messages.length + 2}`,
          role: "ai",
          type: "celebration",
          text: "Well done! You've just acted on divine guidance. Keep this up and return tomorrow for more insight",
        });
      }

      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      advanceSteps(newMessages.length);

      // Scroll to the most recent message
      const lastMessage = [...messages, ...newMessages].slice(-1)[0];
      if (lastMessage) {
        console.log("Found last message:", lastMessage.id);
        // Wait for all messages to be rendered
        setTimeout(() => {
          // Double check that the ref exists
          if (messageRefs.current[lastMessage.id]) {
            scrollToMessage(lastMessage.id);
          } else {
            // If ref doesn't exist yet, wait a bit longer
            setTimeout(() => scrollToMessage(lastMessage.id), 500);
          }
        }, 500);
      }
    },
    [messages, currentStepIndex, advanceSteps, scrollToMessage]
  );

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {messages.slice(0, currentStepIndex).map((msg) => (
        <View
          key={msg.id}
          ref={(el) => {
            if (el) {
              console.log("Setting ref for message:", msg.id);
              messageRefs.current[msg.id] = el;
            }
          }}
        >
          <ChatBubble
            sender={msg.role === "ai" ? "ai" : "user"}
            text={msg.text}
            options={msg.options}
            onOptionSelect={(option) => handleOptionSelect(option, msg)}
            showAvatar={msg.role === "ai" && msg.id === "2"}
          />
        </View>
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
