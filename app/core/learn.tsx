import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function LearnScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anxiety to Peace</Text>
      <Text style={styles.description}>
        We're wired for worry. When troubles hit, we fret. When blessings come,
        we overlook them. It's human nature. The Quran reveals a powerful
        antidote: consistent prayer.
      </Text>

      <View style={styles.verseBox}>
        <Text style={styles.verse}>
          "Man was truly created anxious: he is fretful when misfortune touches
          him, but tight-fisted when good fortune comes his way. Not so those
          who pray and are constant in their prayers."
        </Text>
        <Text style={styles.surah}>(Quran 70:19-22)</Text>
      </View>

      <Pressable
        style={styles.cta}
        onPress={() => router.push("/core/reflect")}
      >
        <Text style={styles.ctaText}>Let me reflect</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0b07", padding: 24 },
  title: { fontSize: 24, fontWeight: "600", color: "#fff", marginBottom: 12 },
  description: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 24,
    lineHeight: 22,
  },
  verseBox: {
    backgroundColor: "#1f1b14",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  verse: { fontSize: 16, fontStyle: "italic", color: "#fff", marginBottom: 8 },
  surah: { fontSize: 14, color: "#ccc" },
  cta: {
    backgroundColor: "#d1b06b",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  ctaText: { color: "#000", fontWeight: "600", fontSize: 16 },
});
