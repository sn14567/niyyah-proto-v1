// app/onboarding/chat.tsx
import { useRouter } from "expo-router";
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
type StepId = "topic" | "subtopic-emotion" | "subtopic-salah";

const topicRef = useRef<string | null>(null);
const subtopicRef = useRef<string | null>(null);

const [chat, setChat] = useState<Msg[]>([]);

const stepConfig: Record<
  StepId,
  {
    prompt: string;
    options: { label: string; value: string }[];
    next?: Record<string, StepId>; // option → next step
  }
> = {
  topic: {
    prompt: "Where would you like to start?",
    options: [
      { label: "Navigate my emotions", value: "navigate_emotions" },
      { label: "Improve my salah (prayers)", value: "improve_salah" },
    ],
    next: {
      navigate_emotions: "subtopic-emotion",
      improve_salah: "subtopic-salah",
    },
  },
  "subtopic-emotion": {
    prompt: "Which aspect of your emotions would you like to focus on?",
    options: [
      { label: "Nurturing positivity", value: "positivity" },
      { label: "Navigating negativity", value: "negativity" },
    ],
    next: {},
  },
  "subtopic-salah": {
    prompt: "Which aspect of your salah would you like to focus on?",
    options: [
      { label: "Increase my focus", value: "focus" },
      { label: "Boost my consistency", value: "consistency" },
    ],
    next: {},
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
  const router = useRouter();

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
          text: `May Allah bless you, ${name}! I'm really glad to be part of your journey towards understanding and applying the Quran!`,
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

    // 1. show user reply
    const selectedOption = stepConfig[currentStep].options.find(
      (option) => option.value === value
    );
    if (selectedOption) {
      push("user", selectedOption.label);
    }

    // 2. record state
    if (currentStep === "topic") {
      topicRef.current = value;
    }

    if (
      currentStep === "subtopic-emotion" ||
      currentStep === "subtopic-salah"
    ) {
      subtopicRef.current = value;
    }

    // 3. check if next step exists
    const nextId = stepConfig[currentStep].next?.[value];
    if (nextId) {
      const next = stepConfig[nextId];
      push("ai", next.prompt);
      setCurrentStep(nextId);
    } else {
      // 4. if no next step, navigate to journey summary
      setCurrentStep(null);
      router.push({
        pathname: "/onboarding/journey-summary",
        params: {
          topic: topicRef.current ?? "navigate_emotions",
          subtopic: subtopicRef.current ?? "nurturing_positivity",
        },
      });
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
            label: o.label,
            value: o.value,
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
