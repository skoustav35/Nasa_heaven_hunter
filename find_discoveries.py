import requests
import json
import sys

remaining_tics = [
    "237332812", "460950389", "374741750", "261136679", "260761464", "153412485", "100566492", 
    "268159158", "143072696", "239977528", "144065872", "119131709", "137020480", "358613376", 
    "151724385", "54141697", "366311757", "132534906", "14203588", "334911765", "344855300", 
    "272645619", "262135904", "154293917", "428317266", "179155220", "408743161", "304774444", 
    "233855268", "15654898", "20375215", "4729001", "166834768", "159400561", "182943944", 
    "149603524", "3680800", "318071201", "381996371", "314724818", "224293782", "427153307", 
    "238279960", "375419034", "219467837", "139357541", "160165689", "66561343", "105135774", 
    "396950329", "50000000", "10000000", "160148385", "94609570", "123898871", "139198430", 
    "296780789", "365952328", "138727432", "264301607", "452464529", "449491381", "172630205", 
    "302305400", "280035202", "266213232", "321982642", "300381700", "17932757", "266980320", 
    "219157235", "179367009", "2621212", "150353011", "428251130", "372048733", "242389810", 
    "119556803", "143059017", "176797879", "233795794", "367900542", "141395223", "72214252", 
    "29191596", "449050248", "438629686", "163260812", "69819610", "329691586", "101955023", 
    "130191319", "276380902", "432549364", "258234731", "378613125", "357872559", "304950588", 
    "123846039", "169504920", "156724719", "281885301", "285094173", "32090583", "110178537", 
    "255907107", "347051112", "292321872", "70678449"
]

discoveries = []
rejections = []

for tic in remaining_tics:
    print(f"Analyzing {tic}...", flush=True)
    try:
        res = requests.post("http://localhost:8000/ensemble-analyze", json={"tic_id": int(tic)}, timeout=600)
        data = res.json()
        if data.get("consensus_classification") and "REJECTED" not in data.get("consensus_classification"):
            # It's a discovery!
            if data.get("confidence", 0) > 0.85:
                print(f"!!! DISCOVERY !!! {tic}")
                discoveries.append({"tic_id": tic, "data": data})
                if len(discoveries) >= 20:
                    print("Found 20 discoveries! Stopping.")
                    break
            else:
                print(f"Low confidence discovery for {tic}. Skipping.")
        else:
            print(f"Rejected: {tic}")
            rejections.append({"tic_id": tic, "data": data})
    except Exception as e:
        print(f"Failed to analyze {tic}: {e}")

with open("discoveries.json", "w") as f:
    json.dump(discoveries, f)

with open("rejections.json", "w") as f:
    json.dump(rejections, f)

print(f"Finished finding {len(discoveries)} discoveries.")
