import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface TeamMetadata {
  colors: string;
  city: string;
  state: string;
  stadium: string;
  capacity: number;
  conference: string;
  division: string;
  head_coach: string;
  founded: number;
  mascot?: string;
  lat?: number;
  lng?: number;
}

export interface Team {
  id: string;
  name: string;
  league: string;
  metadata: TeamMetadata;
}
