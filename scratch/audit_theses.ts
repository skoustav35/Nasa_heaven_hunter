import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";
import path from "path";

async function main() {
  const configPath = path.resolve("./firebase-applet-config.json");
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const firebaseApp = initializeApp(firebaseConfig);
  const firestoreDb = getFirestore(firebaseApp, "default");

  console.log("Fetching discovery_theses...");
  const discSnap = await getDocs(collection(firestoreDb, "discovery_theses"));
  discSnap.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | TIC: ${data.tic_id} | Type: ${data.object_type}`);
  });

  process.exit(0);
}

main().catch(console.error);
