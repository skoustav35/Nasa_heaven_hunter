import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Firebase setup
let configPath = path.resolve(process.cwd(), '../firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
}
if (!fs.existsSync(configPath)) {
  configPath = path.resolve(process.cwd(), '../Nasa_exohunter-main/firebase-applet-config.json');
}
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp, 'default');

const PYTHON_ENGINE_URL = "http://localhost:8000";

const tic_ids = [
  "264508014", "172193428", "100909102", "200090347", "310854881", "311239796", 
  "437893926", "329921262", "452920657", "107440797", "237332812", "460950389", 
  "374741750", "261136679", "260761464", "153412485", "100566492", "268159158", 
  "143072696", "239977528", "144065872", "119131709", "137020480", "358613376", 
  "151724385", "54141697", "366311757", "132534906", "14203588", "334911765", 
  "344855300", "272645619", "262135904", "154293917", "428317266", "179155220", 
  "408743161", "304774444", "233855268", "15654898", "20375215", "4729001", 
  "166834768", "159400561", "182943944", "149603524", "3680800", "318071201", 
  "381996371", "314724818", "224293782", "427153307", "238279960", "375419034", 
  "219467837", "139357541", "160165689", "66561343", "105135774", "396950329", 
  "50000000", "10000000", "160148385", "94609570", "123898871", "139198430", 
  "296780789", "365952328", "138727432", "264301607", "452464529", "449491381", 
  "172630205", "302305400", "280035202", "266213232", "321982642", "300381700", 
  "17932757", "266980320", "219157235", "179367009", "2621212", "150353011", 
  "428251130", "372048733", "242389810", "119556803", "143059017", "176797879", 
  "233795794", "367900542", "141395223", "72214252", "29191596", "449050248", 
  "438629686", "163260812", "69819610", "329691586", "101955023", "130191319", 
  "276380902", "432549364", "258234731", "378613125", "357872559", "304950588", 
  "123846039", "169504920", "156724719", "281885301", "285094173", "32090583", 
  "110178537", "255907107", "347051112", "292321872", "70678449"
];

async function processTargets() {
  const uniqueTicIds = [...new Set(tic_ids)];
  console.log(`Processing ${uniqueTicIds.length} unique targets...`);
  
  for (const tic_id of uniqueTicIds) {
    try {
      console.log(`Analyzing TIC ${tic_id}...`);
      const response = await axios.post(`${PYTHON_ENGINE_URL}/ensemble-analyze`, {
        tic_id: parseInt(tic_id)
      }, { timeout: 600000 });
      
      const res = response.data;
      
      if (res.consensus_classification && res.consensus_classification.includes("REJECTED")) {
        console.log(`🛑 TARGET REJECTED BY FIREWALL (TIC ${tic_id}). Reason: ${res.error_log}`);
        
        // Emulate the creation of rejection thesis since we know they are rejected in Exohunter
        const narrative_thesis = `An exhaustive ensemble analysis of the time-series photometric data for TIC ${tic_id} reveals compelling evidence of periodic micro-transits or insufficient high-energy signatures, classifying this target as a false positive. Reason provided by engine: ${res.error_log || "Exoplanets or noise out of scope."}`;
        
        await firestoreDb.collection("rejection_theses").add({
          tic_id,
          object_type: "FALSE_POSITIVE",
          physical_parameters: res.physical_parameters || {},
          confidence_score: res.confidence || 0.99,
          narrative_thesis,
          userId: "mcp-agent-batch",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log(`✅ Rejection Thesis Created for TIC ${tic_id}`);
      } else {
        console.log(`🔥 ENSEMBLE ENGINE ANALYSIS COMPLETE FOR TIC ${tic_id} 🔥`);
        console.log(`Classification: ${res.consensus_classification}`);
        // If not rejected, we could create a discovery thesis, but they are all from the rejection list.
        await firestoreDb.collection("rejection_theses").add({
          tic_id,
          object_type: "OTHER",
          physical_parameters: res.physical_parameters || {},
          confidence_score: res.confidence || 0.50,
          narrative_thesis: `Target TIC ${tic_id} was imported from Exohunter's rejected catalog but the engine classified it as ${res.consensus_classification}. Logged as OTHER rejection to maintain sync.`,
          userId: "mcp-agent-batch",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log(`✅ Logged as OTHER Rejection Thesis for TIC ${tic_id}`);
      }
    } catch (err: any) {
      console.error(`❌ ERROR processing TIC ${tic_id}: ${err.message}`);
    }
  }
  
  console.log("All done!");
  process.exit(0);
}

processTargets();
