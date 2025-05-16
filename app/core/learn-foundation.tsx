import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LearnFoundation() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </Pressable>

      <Text style={styles.text}>🧱 Lesson 2 - coming soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0b07",
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    marginTop: 100,
    textAlign: "center",
  },
  back: {
    marginBottom: 16,
    width: 32,
  },
});
