import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  findNodeHandle,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChatBubble } from "../../components/ChatBubble";
import journeyConfigs from "@/data/journeys";
import { SafeAreaView } from "react-native-safe-area-context";
import { getExplanation } from "@/lib/gpt";

// Simple unique ID generator
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

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
      id: generateId(),
      role: "system",
      type: "intro",
      text: journey.intro,
    },
    {
      id: generateId(),
      role: "ai",
      type: "verse",
      text: "Indeed, this Qur'an guides to that which is most suitable... (17:9)",
    },
    {
      id: generateId(),
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

  const router = useRouter();

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
    async (selectedOption: string, currentMessage: Message) => {
      // Handle nextStep branching
      if (
        currentMessage.type === "nextStep" &&
        selectedOption === "Learn more about this verse"
      ) {
        // Add user selection
        const userMsg: Message = {
          id: generateId(),
          role: "user",
          type: "userSelection",
          text: selectedOption,
        };

        // Add loading message
        const loadingMsg: Message = {
          id: generateId(),
          role: "ai",
          type: "explanation",
          text: "Let me explain that for you...",
        };

        // Update messages and advance
        setMessages((prev) => [...prev, userMsg, loadingMsg]);
        advanceSteps(2);

        try {
          const explanation = await getExplanation({ topic, subTopic });

          // Remove loading message and add explanation
          setMessages((prev) => {
            const withoutLoading = prev.filter(
              (msg) => msg.id !== loadingMsg.id
            );
            return [
              ...withoutLoading,
              {
                id: generateId(),
                role: "ai",
                type: "explanation",
                text: explanation,
              },
              {
                id: generateId(),
                role: "ai",
                type: "nextStep",
                text: "Ready to reflect on this verse?",
                options: ["Reflect on this verse"],
              },
            ];
          });
          advanceSteps(2);
        } catch (err) {
          console.error("GPT error:", err);
          // Remove loading message on error
          setMessages((prev) => prev.filter((msg) => msg.id !== loadingMsg.id));
        }
        return;
      }

      // Handle other options
      const newMessages: Message[] = [];

      // Add user selection
      newMessages.push({
        id: generateId(),
        role: "user",
        type: "userSelection",
        text: selectedOption,
      });

      if (selectedOption === "Reflect on this verse") {
        newMessages.push({
          id: generateId(),
          role: "ai",
          type: "reflectionQuestion",
          text: "How does this verse make you reflect on your current emotional state?",
          options: ["I feel hopeful", "I feel unsure", "I feel disconnected"],
        });
      }

      // Handle reflection question
      if (currentMessage.type === "reflectionQuestion") {
        newMessages.push(
          {
            id: generateId(),
            role: "ai",
            type: "reflectionFeedback",
            text: "That's beautiful to hear. When hope is rooted in divine guidance, it becomes a powerful anchor through life's storms.",
          },
          {
            id: generateId(),
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
          id: generateId(),
          role: "ai",
          type: "celebration",
          text: "Well done! You've just acted on divine guidance. Keep this up and return tomorrow for more insight",
        });
      }

      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      advanceSteps(newMessages.length);

      // Special scroll for actionOptions (final action step)
      if (currentMessage.type === "actionOptions") {
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 150);
        return;
      }

      // Existing scroll logic for all other steps
      const lastMessage = [...messages, ...newMessages].slice(-1)[0];
      if (lastMessage) {
        setTimeout(() => scrollToMessage(lastMessage.id), 100);
      }
    },
    [messages, currentStepIndex, advanceSteps, scrollToMessage, topic, subTopic]
  );

  // Get the last visible message
  const visibleMessages = messages.slice(0, currentStepIndex);
  const lastVisibleMessage = visibleMessages[visibleMessages.length - 1];
  const showReturnHome = lastVisibleMessage?.type === "celebration";

  useEffect(() => {
    if (!visibleMessages.length) return;
    const lastMsg = visibleMessages[visibleMessages.length - 1];
    const isTrulyLast = lastMsg.id === messages[messages.length - 1].id;
    const view = messageRefs.current[lastMsg.id];
    if (!view) return;
    setTimeout(() => {
      if (isTrulyLast) {
        scrollRef.current?.scrollToEnd({ animated: true });
      } else {
        view.measure((x, y, width, height, pageX, pageY) => {
          const scrollPosition = Math.max(0, pageY - 100);
          scrollRef.current?.scrollTo({ y: scrollPosition, animated: true });
        });
      }
    }, 100);
  }, [currentStepIndex, visibleMessages.length, messages]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0e0b07" }}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: showReturnHome ? 120 : 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {visibleMessages.map((msg) => (
          <View
            key={msg.id}
            ref={(el) => {
              if (el) {
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
      {showReturnHome && (
        <SafeAreaView edges={["bottom"]} style={styles.safeAreaBottom}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => {
              console.log("Navigating to /home from Return to home button");
              router.replace("/home");
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomButtonText}>Return to home</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
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
  safeAreaBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 10,
  },
  bottomButton: {
    backgroundColor: "#FDE7C2",
    borderRadius: 32,
    paddingHorizontal: 32,
    paddingVertical: 18,
    minWidth: 240,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  bottomButtonText: {
    color: "#3A2C13",
    fontSize: 18,
    fontWeight: "500",
  },
});
