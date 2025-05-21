// app/home.tsx
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import PlaceholderImage from "../assets/placeholder.png";
import { Ionicons } from "@expo/vector-icons";
import journeys from "@/data/journeys";
import { useEffect, useState } from "react";
import { Storage } from "../services/storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomeScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState<string | null>(null);
  const [subTopic, setSubTopic] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const proto_id = await Storage.get("proto_id");
        if (!proto_id) throw new Error("No user ID found");
        const profileRef = doc(db, "users", proto_id);
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) throw new Error("No profile found");
        const data = profileSnap.data();
        setTopic(data.topic);
        setSubTopic(data.subTopic);
        setCompletedSteps(
          Array.isArray(data.completedSteps) ? data.completedSteps : []
        );
      } catch (e: any) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={{ color: "#fff", marginTop: 16 }}>
          Loading your journey...
        </Text>
      </View>
    );
  }

  if (error || !topic || !subTopic) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff" }}>
          Could not load your journey. {error}
        </Text>
      </View>
    );
  }

  // Get steps from journeys data
  const steps = journeys?.[topic]?.[subTopic]?.steps || [
    { label: "Session 1" },
    { label: "Session 2" },
    { label: "Session 3" },
  ];

  // Determine status for each step
  function getStepStatus(idx: number): "done" | "active" | "locked" {
    if (completedSteps.includes(idx)) return "done";
    // Active if all previous steps are done and this step is not
    const allPrevDone = Array.from({ length: idx }, (_, i) => i).every((i) =>
      completedSteps.includes(i)
    );
    if (allPrevDone) return "active";
    return "locked";
  }

  // Capitalize subTopic for the title
  const journeyTitle = subTopic
    ? subTopic.charAt(0).toUpperCase() + subTopic.slice(1)
    : "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{journeyTitle}</Text>
      {steps.map((step, idx) => {
        const status = getStepStatus(idx);
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
                onPress={() =>
                  router.push(
                    `/core?topic=${topic}&subTopic=${subTopic}&step=${idx}`
                  )
                }
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
  container: { flex: 1, backgroundColor: "#18140f", padding: 24 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffe6b3",
    marginBottom: 32,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#23201a",
    borderRadius: 20,
    padding: 22,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#FFD580",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    alignItems: "center",
  },
  completedCard: {
    borderColor: "#4ADE80",
    backgroundColor: "#1e2a1e",
  },
  lockedCard: {
    backgroundColor: "#18140f",
    borderColor: "#333",
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 14,
    color: "#d1c7b0",
    marginBottom: 12,
    textAlign: "center",
  },
  cta: {
    backgroundColor: "#FFD580",
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
    shadowColor: "#FFD580",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 1,
  },
  ctaText: { color: "#18140f", fontWeight: "700", fontSize: 15 },
});
