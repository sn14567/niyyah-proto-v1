import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";

export default function Splash() {
  return (
    <ImageBackground
      source={require("../../assets/bg-pattern.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/niyyah-logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Solve any problem{"\n"}using the Quran</Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push("/onboarding/name")}
        >
          <Text style={styles.buttonText}>Get started</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logo: { width: 120, height: 120, marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 48,
  },
  button: {
    backgroundColor: "#FFE0AC",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 20,
  },
  buttonText: { color: "#2F1F0F", fontSize: 18, fontWeight: "600" },
});
