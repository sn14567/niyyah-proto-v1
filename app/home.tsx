// app/home.tsx
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import PlaceholderImage from "../assets/placeholder.png";
import { Ionicons } from "@expo/vector-icons";
import journeys from "@/data/journeys";

export default function HomeScreen() {
  const router = useRouter();

  // Hardcoded for now
  const topic = "improve_salah";
  const subTopic = "consistency";
  const userProgress = 1; // 0 = first done, 1 = second active, 2 = third locked

  // Get steps from journeys data
  const steps = journeys?.[topic]?.[subTopic]?.steps || [
    { label: "Session 1" },
    { label: "Session 2" },
    { label: "Session 3" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find daily calm through salah</Text>
      {steps.map((step, idx) => {
        let status: "done" | "active" | "locked";
        if (idx < userProgress) status = "done";
        else if (idx === userProgress) status = "active";
        else status = "locked";

        let cardStyle = [styles.card];
        if (status === "done")
          cardStyle = [{ ...styles.card, ...styles.completedCard }];
        else if (status === "locked")
          cardStyle = [{ ...styles.card, ...styles.lockedCard }];

        let description =
          status === "done"
            ? "You completed this session — congrats!"
            : status === "active"
            ? "You've unlocked this session! Are you ready?"
            : "Complete the previous session to unlock this.";

        return (
          <View style={cardStyle} key={idx}>
            {status === "done" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#4ADE80"
                style={{ marginBottom: 8 }}
              />
            )}
            {status === "locked" && (
              <Ionicons
                name="lock-closed"
                size={24}
                color="#999"
                style={{ marginBottom: 8 }}
              />
            )}
            {status === "active" && (
              <Image
                source={PlaceholderImage}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            <Text
              style={[
                styles.stepTitle,
                status === "locked" ? { color: "#999" } : {},
              ]}
            >
              {step.label}
            </Text>
            <Text
              style={[
                styles.stepDescription,
                status === "locked" ? { color: "#777" } : {},
              ]}
            >
              {description}
            </Text>
            {status === "active" && (
              <Pressable
                style={styles.cta}
                onPress={() => router.push(`/core?step=${idx}`)}
              >
                <Text style={styles.ctaText}>Start conversation</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0b07", padding: 24 },
  title: { fontSize: 20, fontWeight: "600", color: "#fff", marginBottom: 24 },
  card: {
    backgroundColor: "#1a140c",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  completedCard: {
    borderWidth: 1,
    borderColor: "#4ADE80",
  },
  lockedCard: {
    backgroundColor: "#12100e",
    borderWidth: 1,
    borderColor: "#333",
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 16,
    lineHeight: 20,
  },
  cta: {
    backgroundColor: "#f4d9a6",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },
  ctaText: { color: "#2e1f13", fontWeight: "600", fontSize: 16 },
});
