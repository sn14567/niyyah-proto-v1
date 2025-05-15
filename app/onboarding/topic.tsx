// app/onboarding/topic.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Storage } from "../../services/storage";

export default function Topic() {
  const [name, setName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    Storage.get("user_name").then((val) => setName(val));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* User bubble */}
      {name && (
        <View style={styles.userBubbleContainer}>
          <Text style={styles.userBubble}>{name}</Text>
        </View>
      )}

      {/* Avatar + AI message */}
      <View style={styles.aiMessageContainer}>
        <Image
          source={require("../../assets/AI_icon.png")}
          style={styles.avatarTop}
        />
        <View style={styles.messageBlock}>
          <Text style={styles.messageText}>
            <Text style={styles.bold}>Jazak'Allah khair, {name}!</Text>
          </Text>
          <Text style={styles.messageText}>
            I'm really glad to be part of your journey towards understanding and
            applying the Quran!
          </Text>
          <Text style={styles.messageText}>
            <Text style={styles.bold}>Where would you like to start?</Text>
          </Text>
        </View>
      </View>

      {/* Options */}
      <Pressable
        style={styles.button}
        onPress={() => router.push("/onboarding/subtopic")}
      >
        <Text style={styles.buttonText}>Navigate my emotions</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/onboarding/subtopic")}
      >
        <Text style={styles.buttonText}>Improve my salah (prayers)</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: "#0D0A00",
    flexGrow: 1,
  },
  userBubbleContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  userBubble: {
    backgroundColor: "#A2703D",
    color: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    fontSize: 18,
    fontWeight: "500",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  avatar: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  messageBlock: {
    flex: 1,
    gap: 12,
  },
  messageText: {
    fontSize: 18,
    color: "#fff",
    lineHeight: 24,
  },
  bold: {
    fontWeight: "600",
  },
  button: {
    borderColor: "#FFE0AC",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  aiMessageContainer: {
    alignItems: "flex-start",
    marginBottom: 32,
  },
  avatarTop: {
    width: 36,
    height: 36,
    marginBottom: 12,
  },
});
