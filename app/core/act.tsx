// app/core/act.tsx
import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

const actions = [
  {
    title: "30-Second Reset",
    subtitle:
      'Before each prayer today, pause and say: "Ya Allah, I drop my worries at the door and come to You with my full heart."',
    recommended: true,
  },
  {
    title: "Worry Drop-Off",
    subtitle:
      'Name your biggest anxiety and literally imagine setting it down as you say "Allahu Akbar" to begin prayer.',
  },
  {
    title: "Prayer Shield",
    subtitle:
      "Set exact prayer times today and guard them fiercely - consistency is your superpower against anxiety.",
  },
];

export default function ActScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  if (selected) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.tab}>Learn ✅</Text>
          <Text style={styles.tab}>Reflect ✅</Text>
          <Text style={styles.tab}>Act ✅</Text>
        </View>

        <Pressable style={styles.selectionBubble}>
          <Text style={styles.selectionText}>{selected}</Text>
        </Pressable>

        <View style={styles.aiContainer}>
          <Text style={styles.aiText}>
            May Allah bless your intention today!
          </Text>
          <Text style={styles.aiText}>
            You’ve just completed a Quranic step towards finding daily calm
            through salah!
          </Text>
        </View>

        <Pressable style={styles.cta} onPress={() => router.push("/home")}>
          <Text style={styles.ctaText}>Return to home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Time to transform anxiety into peace. Pick one practice:
      </Text>

      {actions.map((a, idx) => (
        <Pressable
          key={idx}
          style={styles.actionBox}
          onPress={() => setSelected(a.title)}
        >
          <View style={styles.actionHeader}>
            <Text style={styles.actionTitle}>{a.title}</Text>
            {a.recommended && (
              <Text style={styles.recommended}>Recommended</Text>
            )}
          </View>
          <Text style={styles.subtitle}>{a.subtitle}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0b07", padding: 24 },
  description: { color: "#fff", fontSize: 16, marginBottom: 24 },
  actionBox: {
    borderWidth: 1,
    borderColor: "#5c4419",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  actionTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  recommended: {
    backgroundColor: "#d1b06b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    color: "#000",
  },
  subtitle: { color: "#ccc", fontSize: 14, lineHeight: 20 },
  cta: {
    backgroundColor: "#f4d9a6",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 48,
  },
  ctaText: { color: "#2e1f13", fontWeight: "600", fontSize: 16 },
  selectionBubble: {
    backgroundColor: "#443622",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectionText: { color: "#fff", fontSize: 16 },
  aiContainer: {
    marginBottom: 48,
  },
  aiText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#5a3b10",
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 32,
  },
  tab: { color: "#fff", fontWeight: "600" },
});
