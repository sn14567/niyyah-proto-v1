// components/ChatBubble.tsx
import { View, Text, Image, StyleSheet } from "react-native";

/* ─────────  Props  ───────── */
type ChatBubbleProps = {
  sender: "ai" | "user";
  text: string;
  /** true only for the first AI bubble in a consecutive block */
  showAvatar?: boolean;
};

export function ChatBubble({
  sender,
  text,
  showAvatar = false,
}: ChatBubbleProps) {
  const isAI = sender === "ai";

  return isAI ? (
    /* 👇 AI bubble: avatar ON TOP  */
    <View style={styles.aiContainer}>
      {showAvatar && (
        <Image
          source={require("../assets/AI_icon.png")}
          style={styles.avatar}
        />
      )}
      <Text style={styles.aiText}>{text}</Text>
    </View>
  ) : (
    /* 👇 USER bubble: right-aligned */
    <View style={styles.userContainer}>
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{text}</Text>
      </View>
    </View>
  );
}

/* ─────────  Styles  ───────── */
const styles = StyleSheet.create({
  /* AI ------------------------------------------------------------- */
  aiContainer: {
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 8, // spacing between avatar & text
  },
  avatar: {
    width: 36,
    height: 36,
  },
  aiText: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 26,
    flexShrink: 1,
  },

  /* USER ----------------------------------------------------------- */
  userContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  userBubble: {
    backgroundColor: "#6A4A27",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: "80%",
  },
  userText: { color: "#fff", fontSize: 18 },
});
