// Seeds runs/gold/p2p.json from the cached gold-case artifacts so the demo's
// escalation beat is instant. Run: npx tsx scripts/seed-p2p.ts
import fs from "node:fs";
import { runP2p } from "../src/pipeline/p2p";

const denial = JSON.parse(fs.readFileSync("runs/gold/denial.json", "utf8"));
const letter = JSON.parse(fs.readFileSync("runs/gold/letter.json", "utf8"));
const qa = JSON.parse(fs.readFileSync("runs/gold/qa.json", "utf8"));

const brief = await runP2p(denial, letter, qa);
fs.writeFileSync("runs/gold/p2p.json", JSON.stringify(brief, null, 2));
console.log("headline:", brief.headline);
console.log("key points:", brief.key_points.length, "| objections:", brief.anticipated_objections.length);
