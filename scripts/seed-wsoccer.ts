/**
 * Seed script: Add Montpellier HSC Féminines and FC Rosengård Women
 * to the Supabase `teams` table.
 *
 * Usage:
 *   npx tsx scripts/seed-wsoccer.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Parse .env.local manually (no dotenv dependency)
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const teams = [
  {
    name: "Montpellier HSC",
    league: "wsoccer",
    metadata: {
      colors: "#F47920,#1B3C6B",
      city: "Montpellier",
      state: "Hérault",
      stadium: "Stade de la Mosson",
      capacity: 32900,
      conference: "D1 Arkema",
      division: "France",
      head_coach: "Laurent Necib",
      founded: 2001,
      lat: 43.6119,
      lng: 3.8122,
    },
  },
  {
    name: "FC Rosengård",
    league: "wsoccer",
    metadata: {
      colors: "#003DA5,#FFFFFF",
      city: "Malmö",
      state: "Skåne",
      stadium: "Malmö IP",
      capacity: 7500,
      conference: "Damallsvenskan",
      division: "Sweden",
      head_coach: "Rickard Nilsson",
      founded: 1970,
      lat: 55.5903,
      lng: 13.0059,
    },
  },
];

async function seed() {
  for (const team of teams) {
    // Check if already exists
    const { data: existing } = await supabase
      .from("teams")
      .select("id")
      .eq("name", team.name)
      .eq("league", team.league)
      .maybeSingle();

    if (existing) {
      console.log(`Already exists: ${team.name} — updating metadata`);
      const { error } = await supabase
        .from("teams")
        .update({ metadata: team.metadata })
        .eq("id", existing.id);
      if (error) console.error(`  Error updating ${team.name}:`, error.message);
      else console.log(`  Updated ${team.name}`);
    } else {
      console.log(`Inserting: ${team.name}`);
      const { error } = await supabase.from("teams").insert(team);
      if (error) console.error(`  Error inserting ${team.name}:`, error.message);
      else console.log(`  Inserted ${team.name}`);
    }
  }
  console.log("\nDone.");
}

seed();
