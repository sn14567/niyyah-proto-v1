import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { Storage } from "../../services/storage";

export default function Name({ onDone }) {
  const [name, setName] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => console.log("Back")}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Avatar and Message */}
        <View style={styles.messageContainer}>
          <Image
            source={require("../../assets/AI_icon.png")}
            style={styles.avatarLeft}
          />
          <View style={styles.messageBlock}>
            <Text style={styles.messageText}>Assalamu alaikum!</Text>
            <Text style={styles.messageText}>
              I'm Niyyah, here to help you solve any problem using the Quran.
              Let&apos;s get started with a few quick questions so I can
              personalise your experience.
            </Text>
            <Text style={styles.messageText}>
              To start, what can I call you?
            </Text>
          </View>
        </View>

        {/* Input box with send button */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#ccc"
            value={name}
            onChangeText={setName}
          />
          <Pressable
            style={[
              styles.sendButton,
              !name.trim() && styles.sendButtonDisabled,
            ]}
            onPress={async () => {
              const trimmedName = name.trim();
              if (!trimmedName) return;

              await Storage.set("user_name", trimmedName);
              router.push("/onboarding/chat");
            }}
          >
            <Ionicons name="send" size={20} color="#2F1F0F" />
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0D0A",
    padding: 24,
    paddingTop: 60,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  messageText: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 8,
  },
  boldMessage: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    backgroundColor: "#1C1A17",
    borderRadius: 24,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: "auto",
    marginBottom: 32,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#FFE0AC",
    padding: 8,
    borderRadius: 50,
    marginLeft: 12,
  },
  messageContainer: {
    marginBottom: 24,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  avatarLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
  },
  messageBlock: {
    backgroundColor: "transparent", // no bubble
    paddingRight: 8,
    paddingLeft: 0,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
});
