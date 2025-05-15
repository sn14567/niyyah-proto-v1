import { Stack } from "expo-router";
import { useEffect } from "react";
import { useUserId } from "../hooks/useUserId";
// import mixpanel from "../lib/mixpanel";   // if you’re using Mixpanel

export default function Layout() {
  const uid = useUserId();

  useEffect(() => {
    if (uid) {
      console.log("🆔 proto_id:", uid);
      // mixpanel.identify(uid);   // uncomment when you add analytics
    }
  }, [uid]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
