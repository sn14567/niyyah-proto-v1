// app/index.tsx
import { Redirect } from "expo-router";

export default function Root() {
  // Redirect waits until the router is mounted, so no premature-navigation error
  return <Redirect href="/onboarding" />;
}
