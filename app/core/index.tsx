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
import { getExplanation, getOrGenerateActionOptions } from "@/lib/gpt";
import { getJourneyConversations } from "@/lib/journeys";
import { Storage } from "../../services/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const { topic, subTopic, step } = useLocalSearchParams<{
    topic?: string;
    subTopic?: string;
    step?: string;
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

  // State for Firestore conversations
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load conversations from Firestore
  useEffect(() => {
    async function loadConversations() {
      console.log("🔄 Starting to load conversations...");
      if (!topic || !subTopic) {
        console.log("❌ Missing topic or subtopic:", { topic, subTopic });
        return;
      }

      try {
        console.log("📡 Fetching conversations for:", { topic, subTopic });
        const loadedConversations = await getJourneyConversations(
          topic,
          subTopic
        );
        console.log("✅ Loaded conversations:", loadedConversations);
        setConversations(loadedConversations);
      } catch (error) {
        console.error("❌ Error loading conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
  }, [topic, subTopic]);

  // Initialize messages with the correct conversation based on step
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    console.log("🔄 Checking conversations for message initialization...");
    console.log("Current conversations:", conversations);
    console.log("Step from URL:", step);

    if (conversations.length === 0) {
      console.log("❌ No conversations available yet");
      return;
    }

    // Find the conversation matching the step from URL
    const stepIndex = parseInt(step || "0", 10);
    const currentConversation = conversations.find(
      (conv) => conv.stepIndex === stepIndex
    );

    if (!currentConversation) {
      console.log("❌ No conversation found for step:", stepIndex);
      return;
    }

    console.log(
      "📝 Initializing messages with conversation:",
      currentConversation
    );

    const initialMessages: Message[] = [
      {
        id: generateId(),
        role: "system",
        type: "intro",
        text: `Welcome to step ${
          currentConversation.stepIndex + 1
        } of your journey`,
      },
      {
        id: generateId(),
        role: "ai",
        type: "verse",
        text: currentConversation.learn.verse,
      },
      {
        id: generateId(),
        role: "ai",
        type: "nextStep",
        text: "What would you like to do next?",
        options: ["Learn more about this verse", "Reflect on this verse"],
      },
    ];

    console.log("✅ Setting initial messages:", initialMessages);
    setMessages(initialMessages);
  }, [conversations, step]);

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

  // Helper to update completedSteps in Firestore
  const markStepCompleted = async (stepIndex: number) => {
    try {
      const proto_id = await Storage.get("proto_id");
      if (!proto_id || !topic || !subTopic) return;
      const profileRef = doc(db, "users", proto_id);
      const profileSnap = await getDoc(profileRef);
      let completedSteps: number[] = [];
      if (profileSnap.exists()) {
        completedSteps = profileSnap.data().completedSteps || [];
      }
      if (!completedSteps.includes(stepIndex)) {
        completedSteps.push(stepIndex);
        await setDoc(profileRef, { completedSteps }, { merge: true });
        console.log("✅ Updated completedSteps in Firestore:", completedSteps);
      }
    } catch (e) {
      console.error("❌ Failed to update completedSteps", e);
    }
  };

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

        // Find the current conversation for the current step
        const stepIndex = parseInt(step || "0", 10);
        const currentConversation = conversations.find(
          (conv) => conv.stepIndex === stepIndex
        );
        let explanation =
          currentConversation?.learn?.explanation ||
          currentConversation?.["learn.explanation"];
        if (!explanation) {
          explanation = "Explanation not available.";
          if (__DEV__) {
            console.warn(
              "[core] No learn.explanation found in conversation doc for step:",
              stepIndex,
              currentConversation
            );
          }
        } else {
          if (__DEV__) {
            console.log(
              "[core] Loaded explanation from conversation doc:",
              explanation
            );
          }
        }

        // Remove loading message and add explanation
        setMessages((prev) => {
          const withoutLoading = prev.filter((msg) => msg.id !== loadingMsg.id);
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
        // Find the current conversation for the current step
        const stepIndex = parseInt(step || "0", 10);
        const currentConversation = conversations.find(
          (conv) => conv.stepIndex === stepIndex
        );
        let reflectionQuestion =
          currentConversation?.reflect?.question ||
          currentConversation?.["reflect.question"];
        let reflectionOptions =
          currentConversation?.reflect?.options ||
          currentConversation?.["reflect.options"];
        if (!reflectionQuestion || !reflectionOptions) {
          reflectionQuestion = "Reflection not available.";
          reflectionOptions = [];
          if (__DEV__) {
            console.warn(
              "[core] No reflect.question/options found in conversation doc for step:",
              stepIndex,
              currentConversation
            );
          }
        } else {
          if (__DEV__) {
            console.log(
              "[core] Loaded reflection question/options from conversation doc:",
              reflectionQuestion,
              reflectionOptions
            );
          }
        }
        newMessages.push({
          id: generateId(),
          role: "ai",
          type: "reflectionQuestion",
          text: reflectionQuestion,
          options: reflectionOptions,
        });
      }

      // Handle reflection question
      if (currentMessage.type === "reflectionQuestion") {
        // Add reflection feedback
        newMessages.push({
          id: generateId(),
          role: "ai",
          type: "reflectionFeedback",
          text: "Thank you for sharing that. Let me suggest some practical ways to apply this verse's wisdom to your situation.",
        });

        // Find the current conversation for the current step
        const stepIndex = parseInt(step || "0", 10);
        const currentConversation = conversations.find(
          (conv) => conv.stepIndex === stepIndex
        );
        let actionOptions =
          currentConversation?.actionOptionsByReflection?.[selectedOption];
        if (actionOptions && actionOptions.length > 0) {
          if (__DEV__) {
            console.log(
              "[core] Loaded action options from Firestore for reflection:",
              selectedOption,
              actionOptions
            );
          }
          newMessages.push({
            id: generateId(),
            role: "ai",
            type: "actionOptions",
            text: "Here are 3 practical actions you can take:",
            options: actionOptions,
          });
        } else {
          if (__DEV__) {
            console.warn(
              "[core] No action options found in Firestore for reflection, falling back to GPT:",
              selectedOption,
              currentConversation
            );
          }
          try {
            // Get reflection-aware action options from GPT as fallback
            const gptActionOptions = await getOrGenerateActionOptions({
              topic,
              subTopic,
              stepIndex: currentConversation?.stepIndex ?? 0,
              reflectionAnswer: selectedOption,
            });
            newMessages.push({
              id: generateId(),
              role: "ai",
              type: "actionOptions",
              text: "Here are 3 practical actions you can take:",
              options: gptActionOptions,
            });
          } catch (error) {
            console.error("Error getting action options from GPT:", error);
            // Fallback to generic action options if GPT fails
            newMessages.push({
              id: generateId(),
              role: "ai",
              type: "actionOptions",
              text: "Here are some ways you can apply this verse:",
              options: [
                "Write a short dua asking Allah for guidance.",
                "Share this verse with someone who needs encouragement.",
                "Set a small goal that aligns with the verse's message.",
              ],
            });
          }
        }
      }

      // Handle action options
      if (currentMessage.type === "actionOptions") {
        newMessages.push({
          id: generateId(),
          role: "ai",
          type: "celebration",
          text: "Well done! You've just acted on divine guidance. Keep this up and return tomorrow for more insight.",
        });
        // Mark this step as completed
        const stepIndex = parseInt(step || "0", 10);
        const currentConversation = conversations.find(
          (conv) => conv.stepIndex === stepIndex
        );
        if (currentConversation) {
          markStepCompleted(currentConversation.stepIndex);
        }
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
    [
      messages,
      currentStepIndex,
      advanceSteps,
      scrollToMessage,
      topic,
      subTopic,
      conversations,
      step,
    ]
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading your journey...</Text>
      </View>
    );
  }

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
              // Mark this step as completed
              const stepIndex = parseInt(step || "0", 10);
              const currentConversation = conversations.find(
                (conv) => conv.stepIndex === stepIndex
              );
              if (currentConversation) {
                markStepCompleted(currentConversation.stepIndex);
              }
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
