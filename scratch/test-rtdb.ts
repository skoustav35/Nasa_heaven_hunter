import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, get } from "firebase/database";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting RTDB connection test...");
  const configPath = path.resolve("./firebase-applet-config.json");
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  console.log("Config loaded:", firebaseConfig);

  const firebaseApp = initializeApp(firebaseConfig);
  const realtimeDb = getDatabase(firebaseApp);
  console.log("Firebase App initialized, database instance fetched.");

  console.log("Attempting to write to RTDB (analyzed_targets/test)...");
  try {
    const p = update(ref(realtimeDb, "analyzed_targets/test"), {
      status: "TEST_WRITE",
      timestamp: new Date().toISOString()
    });
    
    // Set a timeout of 5 seconds
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB write timed out")), 5000));
    await Promise.race([p, timeout]);
    console.log("Write completed successfully!");
  } catch (error: any) {
    console.error("Write failed or timed out:", error.message);
  }

  console.log("Attempting to get data from RTDB...");
  try {
    const p = get(ref(realtimeDb, "analyzed_targets/test"));
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB get timed out")), 5000));
    const snapshot = await Promise.race([p, timeout]) as any;
    console.log("Get completed. Exists:", snapshot.exists(), "Value:", snapshot.val());
  } catch (error: any) {
    console.error("Get failed or timed out:", error.message);
  }
  
  process.exit(0);
}

main().catch(console.error);
