import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 *  Minimal wrapper so web uses localStorage, native uses SecureStore.
 */
const webStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
};

export const Storage = {
  get: (key: string) =>
    Platform.select({
      web: webStorage.getItem,
      default: SecureStore.getItemAsync,
    })(key),
  set: (key: string, value: string) =>
    Platform.select({
      web: webStorage.setItem,
      default: SecureStore.setItemAsync,
    })(key, value),
};
