import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

async function main() {
  const configPath = path.resolve("./firebase-applet-config.json");
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const firebaseApp = initializeApp(firebaseConfig);
  const firestoreDb = getFirestore(firebaseApp, "default");

  const updates = [
    { id: "7A1aFbVNNaI39htqp8op", type: "SUPERNOVA" },
    { id: "agqViulzyyNH88wQfz74", type: "SUPERNOVA" },
    { id: "BrzPOcMhdqy7B81W6fKH", type: "BLACK_HOLE" },
    { id: "HXr2Pchw965pK3BsRtKa", type: "BLACK_HOLE" },
    { id: "HXpbf9T19ZJa15LiKmo3", type: "BLACK_HOLE" },
    { id: "0tVUzfUmC5Zvu6v5ckto", type: "BLACK_HOLE" },
    { id: "0AWqvt5dm7pJUD2UpYcA", type: "HIGH_ENERGY" },
    { id: "TEST_WRITE_DOC", type: "HIGH_ENERGY" }
  ];

  for (const { id, type } of updates) {
    console.log(`Updating ${id} to ${type}...`);
    await updateDoc(doc(firestoreDb, "discovery_theses", id), { object_type: type });
  }

  console.log("All 8 theses successfully moved to their mathematically correct archives!");
  process.exit(0);
}

main().catch(console.error);
