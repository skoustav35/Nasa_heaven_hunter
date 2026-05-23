import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

async function main() {
  const configPath = path.resolve("./firebase-applet-config.json");
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const firebaseApp = initializeApp(firebaseConfig);
  const firestoreDb = getFirestore(firebaseApp, "default");

  console.log("Fetching rejection_theses...");
  const rejSnap = await getDocs(collection(firestoreDb, "rejection_theses"));
  rejSnap.forEach(doc => console.log(`REJECTION: ${doc.id} - TIC: ${doc.data().tic_id}`));

  console.log("Fetching discovery_theses...");
  const discSnap = await getDocs(collection(firestoreDb, "discovery_theses"));
  discSnap.forEach(doc => console.log(`DISCOVERY: ${doc.id} - TIC: ${doc.data().tic_id}`));

  process.exit(0);
}

main().catch(console.error);
