// app/home.tsx
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import PlaceholderImage from "../assets/placeholder.png";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find daily calm through salah</Text>

      {/* Step 1 - Completed */}
      <View style={[styles.card, styles.completedCard]}>
        <Ionicons
          name="checkmark-circle"
          size={24}
          color="#4ADE80"
          style={{ marginBottom: 8 }}
        />
        <Text style={styles.stepTitle}>Overcome anxiety through salah</Text>
        <Text style={styles.stepDescription}>
          You reflected on how to get daily practical benefits through salah!
        </Text>
      </View>

      {/* Step 2 - Available */}
      <View style={styles.card}>
        <Image
          source={PlaceholderImage}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.stepTitle}>
          Build an unshakeable daily foundation
        </Text>
        <Text style={styles.stepDescription}>
          I've got a special 5-minute lesson on how to make salah your daily
          foundation!
        </Text>
        <Pressable
          style={styles.cta}
          onPress={() => router.push("/core/learn-foundation")}
        >
          <Text style={styles.ctaText}>Start conversation</Text>
        </Pressable>
      </View>

      {/* Step 3 - Locked */}
      <View style={[styles.card, styles.lockedCard]}>
        <Ionicons
          name="lock-closed"
          size={24}
          color="#999"
          style={{ marginBottom: 8 }}
        />
        <Text style={[styles.stepTitle, { color: "#999" }]}>
          Fall in love with your salah
        </Text>
        <Text style={[styles.stepDescription, { color: "#777" }]}>
          Perhaps the most important question of them all – are you spiritually
          ready?
        </Text>
      </View>
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
