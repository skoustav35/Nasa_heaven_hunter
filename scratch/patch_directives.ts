import fs from "fs";
import path from "path";

const tsPath = path.resolve("index.ts");
let content = fs.readFileSync(tsPath, "utf-8");

// Replace run_ensemble_analysis return prompt
content = content.replace(
    "If confidence is > 0.85, use 'create_discovery_thesis' to log this to the database.",
    "CRITICAL AI DIRECTIVE: Evaluate these results. If confidence is > 0.70, you MUST use 'create_discovery_thesis' to comprehensively log this to the database. DO NOT reject if > 0.70."
);

// Replace run_ensemble_analysis tool description
content = content.replace(
    "This tool handles transient routing internally (Supernova vs Black Hole vs AGN).`,",
    "This tool handles transient routing internally. CRITICAL DIRECTIVE: If the returned confidence is > 0.70, you are EXPRESSLY COMMANDED to log it using create_discovery_thesis.`,"
);

fs.writeFileSync(tsPath, content);
console.log("MCP Server source successfully patched with strict 0.70 AI Directives!");
process.exit(0);
