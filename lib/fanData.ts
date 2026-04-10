import { supabase } from "./supabase";

export interface FanMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  kind: "fan_club" | "sports_bar" | "mascot";
  memberCount?: number;
  description?: string;
}

export async function getFanDataForTeam(teamId: string): Promise<FanMarker[]> {
  const markers: FanMarker[] = [];

  // Fan clubs for this team
  const { data: fanClubs } = await supabase
    .from("fan_clubs")
    .select("id, name, lat, lng, city, country, member_count, description")
    .eq("team_id", teamId)
    .not("lat", "is", null);

  for (const fc of fanClubs ?? []) {
    markers.push({
      id: fc.id,
      name: fc.name,
      lat: fc.lat,
      lng: fc.lng,
      city: fc.city || "",
      country: fc.country || "",
      kind: "fan_club",
      memberCount: fc.member_count,
      description: fc.description,
    });
  }

  // Global sports bars (limited sample for performance)
  const { data: bars } = await supabase
    .from("sports_bars")
    .select("id, name, lat, lng, city, country, description")
    .not("lat", "is", null)
    .limit(150);

  for (const b of bars ?? []) {
    markers.push({
      id: b.id,
      name: b.name,
      lat: b.lat,
      lng: b.lng,
      city: b.city || "",
      country: b.country || "",
      kind: "sports_bar",
      description: b.description,
    });
  }

  // Mascot appearances
  const { data: mascots } = await supabase
    .from("mascot_appearances")
    .select("id, mascot_name, lat, lng, city, country, event_name, description")
    .not("lat", "is", null)
    .limit(100);

  for (const m of mascots ?? []) {
    markers.push({
      id: m.id,
      name: m.event_name || m.mascot_name,
      lat: m.lat,
      lng: m.lng,
      city: m.city || "",
      country: m.country || "",
      kind: "mascot",
      description: m.description,
    });
  }

  return markers;
}
