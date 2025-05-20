import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import { normalise, slugify } from "../utils/normalise";
dotenv.config();

const app = initializeApp({
  credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
});
const db = getFirestore(app);

async function migrateCleanReflections() {
  const batch = db.batch();
  let updated = 0;
  let changedKeys = 0;
  let total = 0;

  const snapshot = await db.collectionGroup("conversations").get();
  console.log(`Found ${snapshot.size} conversations`);

  for (const doc of snapshot.docs) {
    total++;
    const data = doc.data();
    const opts: string[] = data.reflect?.options ?? [];
    const cleanedOpts = opts.map(normalise);
    let updates: any = { "reflect.options": cleanedOpts };

    // Clean actionOptionsByReflection keys
    const aobr = data.act?.actionOptionsByReflection ?? {};
    const newAobr: Record<string, string[]> = {};
    let keyChanged = false;
    Object.entries(aobr).forEach(([oldKey, val]) => {
      const newKey = slugify(oldKey);
      if (newKey !== oldKey) keyChanged = true;
      newAobr[newKey] = val as string[];
    });
    updates["act.actionOptionsByReflection"] = newAobr;

    if (JSON.stringify(opts) !== JSON.stringify(cleanedOpts) || keyChanged) {
      batch.set(doc.ref, updates, { merge: true });
      updated++;
      if (keyChanged) changedKeys++;
      console.log(`Updated doc: ${doc.ref.path}`);
      if (keyChanged)
        console.log(
          `  Key changes:`,
          Object.keys(aobr),
          "→",
          Object.keys(newAobr)
        );
    }
  }

  if (updated > 0) {
    await batch.commit();
  }
  console.log(
    `\nSummary: ${updated} docs updated out of ${total}. ${changedKeys} had key changes.`
  );
}

migrateCleanReflections().catch((e) => {
  console.error(e);
  process.exit(1);
});
