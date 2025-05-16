import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎉 Welcome to your journey home screen!</Text>
      <Text style={styles.subtext}>
        You can show progress here, next steps, etc.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0b07",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  text: { fontSize: 20, fontWeight: "600", color: "#fff", marginBottom: 12 },
  subtext: { fontSize: 16, color: "#ccc" },
});
