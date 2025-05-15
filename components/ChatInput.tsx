// components/ChatInput.tsx
import React from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ChatOption = {
  label: string;
  value: string;
};

type ChatInputProps =
  | {
      mode: "text";
      value: string;
      onChange: (text: string) => void;
      onSubmit: () => void;
    }
  | {
      mode: "options";
      options: ChatOption[];
      onSelect: (value: string) => void;
    };

export default function ChatInput(props: ChatInputProps) {
  if (props.mode === "text") {
    const { value, onChange, onSubmit } = props;

    return (
      <View style={styles.inputRow} pointerEvents="box-only">
        <TextInput
        /* ...unchanged props... */
        />
        <Pressable
        /* ...unchanged props... */
        >
          <Ionicons name="send" size={20} color="#2F1F0F" />
        </Pressable>
      </View>
    );
  } else {
    return (
      <View style={styles.optionsRow}>
        {props.options.map((opt) => (
          <Pressable
            key={opt.value}
            style={styles.optionButton}
            onPress={() => props.onSelect(opt.value)}
          >
            <Text style={styles.optionText}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopColor: "#333",
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 24,
    color: "#fff",
    marginRight: 10,
  },
  sendButton: {
    padding: 12,
    backgroundColor: "#FFE0AC",
    borderRadius: 20,
  },
  optionsRow: {
    padding: 16,
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#FFE0AC",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#1a1a1a",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
