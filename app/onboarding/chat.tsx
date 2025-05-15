// app/onboarding/chat.tsx
import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Storage } from "../../services/storage";
import { ChatBubble } from "../../components/ChatBubble";
import ChatInput from "../../components/ChatInput";

/**
 * ─────────────────────────────
 * 1.  STEP CONFIG (hard-coded)
 * ─────────────────────────────
 */
type StepId =
  | "topic"
  | "subtopic-emotion"
  | "subtopic-salah"
  | "journey-positivity";

const stepConfig: Record<
  StepId,
  {
    prompt: string;
    options: string[];
    next?: Record<string, StepId>; // option → next step
  }
> = {
  topic: {
    prompt: "Where would you like to start?",
    options: ["Navigate my emotions", "Improve my salah (prayers)"],
    next: {
      "Navigate my emotions": "subtopic-emotion",
      "Improve my salah (prayers)": "subtopic-salah",
    },
  },
  "subtopic-emotion": {
    prompt: "Which aspect of your emotions would you like to focus on?",
    options: ["Positivity", "Negativity"],
    next: {
      Positivity: "journey-positivity",
      Negativity: "journey-positivity", // placeholder
    },
  },
  "subtopic-salah": {
    prompt: "Which aspect of your salah would you like to focus on?",
    options: ["Focus in prayer", "Consistency"],
    next: {
      "Focus in prayer": "journey-positivity", // placeholder
      Consistency: "journey-positivity",
    },
  },
  "journey-positivity": {
    prompt:
      "Let's begin a journey towards nurturing positivity, insha'Allah! Where would you like to begin?",
    options: ["Example A", "Example B"],
  },
};

/**
 * ─────────────────────────────
 * 2.  TYPES
 * ─────────────────────────────
 */
type Msg = { id: string; sender: "ai" | "user"; text: string };

/**
 * ─────────────────────────────
 * 3.  CHAT COMPONENT
 * ─────────────────────────────
 */
export default function OnboardingChat() {
  const [chat, setChat] = useState<Msg[]>([]);
  const [currentStep, setCurrentStep] = useState<StepId | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const listRef = useRef<FlatList<Msg>>(null);

  /* ── load name + kick off first step ──────────────────────────────── */
  useEffect(() => {
    const init = async () => {
      const name = await Storage.get("user_name");
      setUserName(name);

      // greeting + first prompt
      setChat([
        {
          id: "ai-0",
          sender: "ai",
          text: `JazakAllah Khair, ${name}! I'm really glad to be part of your journey towards understanding and applying the Quran!`,
        },
        {
          id: "ai-1",
          sender: "ai",
          text: stepConfig.topic.prompt,
        },
      ]);
      setCurrentStep("topic");
    };
    init();
  }, []);

  /* ── Auto-scroll whenever chat grows ────────────────────────────── */
  useEffect(() => {
    // small delay lets RN finish measuring the new row
    requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true })
    );
  }, [chat]);

  /* ── helper to push a message ─────────────────────────────────────── */
  const push = (sender: "ai" | "user", text: string) =>
    setChat((prev) => [
      ...prev,
      { id: `${sender}-${Date.now()}`, sender, text },
    ]);

  /* ── when user selects an option ───────────────────────────────────── */
  const handleSelect = (value: string) => {
    if (!currentStep) return;

    // 1. show user bubble
    push("user", value);

    // 2. determine next step (if any)
    const nextId = stepConfig[currentStep].next?.[value];
    if (nextId) {
      const next = stepConfig[nextId];
      // show AI prompt for next step
      push("ai", next.prompt);
      setCurrentStep(nextId);
    } else {
      // no next step: onboarding done
      setCurrentStep(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={listRef}
        data={chat}
        keyExtractor={(m) => m.id}
        renderItem={({ item, index }) => {
          // showAvatar only if previous message isn't AI
          const prev = chat[index - 1];
          const showAvatar =
            item.sender === "ai" && (!prev || prev.sender !== "ai");
          return (
            <ChatBubble
              sender={item.sender}
              text={item.text}
              showAvatar={showAvatar}
            />
          );
        }}
        contentContainerStyle={{ padding: 24, gap: 24 }}
        onContentSizeChange={() =>
          requestAnimationFrame(() =>
            listRef.current?.scrollToEnd({
              animated: true,
            })
          )
        }
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        /* keeps history scrollable upward */
      />

      {currentStep && (
        <ChatInput
          mode="options"
          options={stepConfig[currentStep].options.map((o) => ({
            label: o,
            value: o,
          }))}
          onSelect={handleSelect}
        />
      )}
    </KeyboardAvoidingView>
  );
}

/* ─────────────────────────────
 * 4.  STYLES
 * ──────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0A00" },
});
