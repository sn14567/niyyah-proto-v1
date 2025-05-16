import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

const options = ["All the time", "Sometimes", "Rarely", "Never"];

export default function ReflectScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.opening}>
        This verse summarises our human condition - and hands us the solution.
      </Text>

      <Text style={styles.question}>
        How much do your emotions swing based on what's happening around you?
      </Text>

      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => setSelected(option)}
          style={[styles.option, selected === option && styles.selected]}
        >
          <Text style={styles.optionText}>{option}</Text>
        </Pressable>
      ))}

      {selected && (
        <>
          <Text style={styles.response}>
            Noticing is step one. The ups and downs of life hit different when
            you're anchored in prayer. Consistency in salah builds an inner
            stillness that stands firm through life's storms.
          </Text>
          <Pressable
            style={styles.cta}
            onPress={() => router.push("/core/act")}
          >
            <Text style={styles.ctaText}>Put the Quran into action</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0b07", padding: 24 },
  opening: { color: "#fff", fontSize: 16, marginBottom: 16 },
  question: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 24,
  },
  option: {
    borderColor: "#5c4419",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  selected: {
    backgroundColor: "#5c4419",
  },
  optionText: { color: "#fff", fontSize: 16 },
  response: { color: "#fff", marginTop: 24, marginBottom: 16, lineHeight: 22 },
  cta: {
    backgroundColor: "#d1b06b",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  ctaText: { color: "#000", fontWeight: "600", fontSize: 16 },
});
