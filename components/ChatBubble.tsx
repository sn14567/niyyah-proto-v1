// components/ChatBubble.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

/* ─────────  Props  ───────── */
type ChatBubbleProps = {
  sender: "ai" | "user";
  text: string;
  options?: string[];
  /** true only for the first AI bubble in a consecutive block */
  showAvatar?: boolean;
  onOptionSelect?: (option: string) => void;
};

export function ChatBubble({
  sender,
  text,
  options,
  showAvatar = false,
  onOptionSelect,
}: ChatBubbleProps) {
  const isAI = sender === "ai";

  return (
    <View
      style={[
        styles.container,
        isAI ? styles.aiContainer : styles.userContainer,
      ]}
    >
      {isAI && showAvatar && (
        <Image
          source={require("../assets/AI_icon.png")}
          style={styles.avatar}
        />
      )}
      <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
        <Text style={styles.text}>{text}</Text>

        {options && options.length > 0 && (
          <View style={styles.optionsContainer}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.optionButton}
                onPress={() => onOptionSelect?.(opt)}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

/* ─────────  Styles  ───────── */
const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    gap: 8,
  },
  aiContainer: {
    alignItems: "flex-start",
  },
  userContainer: {
    alignItems: "flex-end",
  },
  avatar: {
    width: 36,
    height: 36,
  },
  bubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "90%",
  },
  aiBubble: {
    backgroundColor: "#2c2c2c",
  },
  userBubble: {
    backgroundColor: "#6A4A27",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 0,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 26,
  },
  optionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  optionButton: {
    backgroundColor: "#666",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
});
