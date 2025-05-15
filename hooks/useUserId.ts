import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Storage } from "../services/storage";

export function useUserId() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const existing = await Storage.get("proto_id");
        if (existing) {
          setId(existing);
        } else {
          const newId = uuid();
          await Storage.set("proto_id", newId);
          setId(newId);
        }
      } catch (err) {
        console.warn("User-ID init error", err);
      }
    })();
  }, []);

  return id; // null until loaded
}
