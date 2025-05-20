import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import journeys from "@/data/journeys";
import AIAvatar from "../../assets/AI_icon.png";
import { Storage } from "../../services/storage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function JourneySummaryScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  // Get user name from storage
  useEffect(() => {
    const getName = async () => {
      const name = await Storage.get("user_name");
      setUserName(name || "friend");
    };
    getName();
  }, []);

  // ✅ Get the topic + subtopic from URL
  const { topic, subtopic } = useLocalSearchParams<{
    topic?: string;
    subtopic?: string;
  }>();

  console.log("topic:", topic);
  console.log("subtopic:", subtopic);

  // ✅ Safely access journey data
  const t = (topic ?? "").toLowerCase().replace(/\\s+/g, "_");
  const s = (subtopic ?? "").toLowerCase().replace(/\\s+/g, "_");

  console.log("🔍 topic param:", topic);
  console.log("🔍 subtopic param:", subtopic);
  console.log("🧩 resolved keys →", t, s);

  const data = journeys?.[t]?.[s];

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0e0b07", padding: 24 }}>
        <Text style={{ color: "#fff" }}>
          Sorry, we couldn't find your journey. Please go back and try again.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.cta, { marginTop: 24 }]}
        >
          <Text style={styles.ctaText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      {/* Back */}
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </Pressable>

      {/* Top image */}
      <Image source={data.image} style={styles.banner} resizeMode="cover" />

      {/* AI icon */}
      <Image source={AIAvatar} style={styles.ai} />

      {/* Intro copy */}
      {/* Intro text (personalised + static) */}
      <Text style={styles.intro}>{data.intro}</Text>
      <Text style={styles.intro}>{data.staticLine}</Text>

      {/* Steps */}
      {data.steps.map((s: any, idx: number) => (
        <View key={idx} style={styles.stepRow}>
          <Ionicons name="ellipse" size={20} color="#ffcc66" />
          <Text style={styles.stepText}>{s.label}</Text>
        </View>
      ))}

      {/* Outro */}
      <Text style={styles.outro}>{data.outro(userName)}</Text>

      {/* CTA */}
      <Pressable
        style={styles.cta}
        onPress={async () => {
          // Save journey selection to Firestore
          try {
            const proto_id = await Storage.get("proto_id");
            if (proto_id && topic && subtopic) {
              await setDoc(
                doc(db, "users", proto_id),
                { topic, subTopic: subtopic },
                { merge: true }
              );
              console.log("✅ Saved journey selection to Firestore", {
                proto_id,
                topic,
                subtopic,
              });
            }
          } catch (e) {
            console.error("❌ Failed to save journey selection", e);
          }
          router.push({
            pathname: "/core",
            params: {
              topic,
              subTopic: subtopic,
            },
          });
        }}
      >
        <Text style={styles.ctaText}>Bismillah – let's begin!</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0b07", padding: 24 },
  back: { marginBottom: 8, width: 32 },
  banner: { width: "100%", height: 160, borderRadius: 12, marginBottom: 16 },
  ai: { width: 32, height: 32, borderRadius: 16, marginBottom: 16 },
  intro: { color: "#fff", fontSize: 16, marginBottom: 24, lineHeight: 24 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#5c4419",
    borderRadius: 12,
    marginBottom: 12,
  },
  stepText: { color: "#fff", fontSize: 15, marginLeft: 12 },
  outro: {
    color: "#fff",
    fontSize: 15,
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  cta: {
    backgroundColor: "#d1b06b",
    borderRadius: 30,
    alignItems: "center",
    paddingVertical: 14,
  },
  ctaText: { color: "#000", fontWeight: "600", fontSize: 16 },
});
