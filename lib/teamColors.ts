// Maps short team name (as stored in DB) to [primary, secondary] hex colors
const TEAM_COLORS: Record<string, [string, string]> = {
  // NFL
  Chiefs: ["#E31837", "#FFB81C"],
  Eagles: ["#004C54", "#A5ACAF"],
  Cowboys: ["#003594", "#869397"],
  "49ers": ["#AA0000", "#B3995D"],
  Packers: ["#203731", "#FFB612"],
  Bills: ["#00338D", "#C60C30"],
  Dolphins: ["#008E97", "#FC4C02"],
  Patriots: ["#002244", "#C60C30"],
  Ravens: ["#241773", "#9E7C0C"],
  Bengals: ["#FB4F14", "#C4C8CB"],
  Steelers: ["#FFB612", "#C4C8CB"],
  Browns: ["#311D00", "#FF3C00"],
  Broncos: ["#FB4F14", "#002244"],
  Raiders: ["#A5ACAF", "#C4C8CB"],
  Chargers: ["#0080C6", "#FFC20E"],
  Texans: ["#03202F", "#A71930"],
  Titans: ["#0C2340", "#4B92DB"],
  Jaguars: ["#006778", "#D7A22A"],
  Colts: ["#002C5F", "#A2AAAD"],
  Jets: ["#125740", "#80D48C"],
  Giants: ["#0B2265", "#A71930"],
  Commanders: ["#5A1414", "#FFB612"],
  Bears: ["#0B162A", "#C83803"],
  Vikings: ["#4F2683", "#FFC62F"],
  Lions: ["#0076B6", "#B0B7BC"],
  Buccaneers: ["#D50A0A", "#FF7900"],
  Saints: ["#D3BC8D", "#C4B581"],
  Falcons: ["#A71930", "#A5ACAF"],
  Panthers: ["#0085CA", "#BFC0BF"],
  Cardinals: ["#97233F", "#FFB612"],
  Rams: ["#003594", "#FFA300"],
  Seahawks: ["#002244", "#69BE28"],

  // NBA
  Lakers: ["#552583", "#FDB927"],
  Celtics: ["#007A33", "#BA9653"],
  Warriors: ["#1D428A", "#FFC72C"],
  Bulls: ["#CE1141", "#C4C8CB"],
  Heat: ["#98002E", "#F9A01B"],
  Nets: ["#C4C8CB", "#FFFFFF"],
  Knicks: ["#006BB6", "#F58426"],
  Bucks: ["#00471B", "#EEE1C6"],
  Suns: ["#1D1160", "#E56020"],
  Nuggets: ["#0E2240", "#FEC524"],
  Mavericks: ["#00538C", "#B8C4CA"],
  "76ers": ["#006BB6", "#ED174C"],
  Raptors: ["#CE1141", "#A5ACAF"],
  Kings: ["#5A2D81", "#63727A"],
  Cavaliers: ["#860038", "#FDBB30"],
  Thunder: ["#007AC1", "#EF6100"],
  Grizzlies: ["#5D76A9", "#12173F"],
  Timberwolves: ["#0C2340", "#236192"],
  Pelicans: ["#0C2340", "#C8102E"],
  Spurs: ["#C4CED4", "#8A8D8F"],
  Hawks: ["#E03A3E", "#C1D32F"],
  Hornets: ["#1D1160", "#00788C"],
  Pacers: ["#002D62", "#FDBB30"],
  Magic: ["#0077C0", "#C4CED4"],
  Wizards: ["#002B5C", "#E31837"],
  Pistons: ["#C8102E", "#1D42BA"],
  Rockets: ["#CE1141", "#C4C8CB"],
  Blazers: ["#E03A3E", "#C4C8CB"],
  Jazz: ["#002B5C", "#F9A01B"],
  Clippers: ["#C8102E", "#1D428A"],

  // WNBA
  Dream: ["#E31837", "#FFB81C"],
  Mercury: ["#CB6015", "#1D1160"],
  Sky: ["#418FDE", "#FFCD00"],
  Aces: ["#C8102E", "#A5ACAF"],
  Storm: ["#2C5234", "#FFC72C"],
  Mystics: ["#002B5C", "#E31837"],
  Fever: ["#002D62", "#E03A3E"],
  Sun: ["#F05023", "#FBB03B"],
  Sparks: ["#552583", "#FDB927"],
  Liberty: ["#6ECEB2", "#FFFFFF"],
  Lynx: ["#236192", "#78BE20"],
  Wings: ["#002B5C", "#C4D600"],
  Valkyries: ["#552583", "#FDB927"],
  "Portland Fire": ["#C8102E", "#FF6720"],
  "Toronto Tempo": ["#CE1141", "#A5ACAF"],

  // MLS
  "Inter Miami": ["#F7B5CD", "#231F20"],
  "LA Galaxy": ["#00245D", "#FFD200"],
  LAFC: ["#C39E6D", "#000000"],
  "Seattle Sounders": ["#005695", "#658D1B"],
  "Portland Timbers": ["#004812", "#D69F0E"],
  "Atlanta United": ["#80000B", "#A19060"],
  "Austin FC": ["#00B140", "#000000"],
  "CF Montreal": ["#003DA5", "#000000"],
  "Charlotte FC": ["#1A85C8", "#000000"],
  "Chicago Fire": ["#AF2626", "#0A174A"],
  "Columbus Crew": ["#FEDD00", "#000000"],
  "DC United": ["#EF3E42", "#000000"],
  "FC Cincinnati": ["#F05323", "#263B80"],
  "FC Dallas": ["#BF0D3E", "#002A5C"],
  "Houston Dynamo": ["#FF6B00", "#101820"],
  "Minnesota United": ["#E4E5E6", "#231F20"],
  "Nashville SC": ["#ECE83A", "#1F1646"],
  "NY Red Bulls": ["#ED1E36", "#002B5C"],
  NYCFC: ["#6CADDF", "#F15524"],
  "Orlando City": ["#633492", "#FDE192"],
  "Philadelphia Union": ["#002B5C", "#B99759"],
  "Real Salt Lake": ["#B30838", "#013A81"],
  "San Diego FC": ["#00B6F1", "#000000"],
  "San Jose Earthquakes": ["#0067B1", "#000000"],
  "Sporting KC": ["#93B1D7", "#002F65"],
  "St Louis City": ["#C8102E", "#0A0F23"],
  "Toronto FC": ["#E31937", "#A7A8AA"],
  "Vancouver Whitecaps": ["#00245E", "#9DC2EA"],
  "New England Revolution": ["#0A2141", "#CE0F3D"],
};

// Maps short team name to ESPN abbreviation for logo URLs
const ESPN_ABBR: Record<string, string> = {
  // NFL
  Chiefs: "kc",
  Eagles: "phi",
  Cowboys: "dal",
  "49ers": "sf",
  Packers: "gb",
  Bills: "buf",
  Dolphins: "mia",
  Patriots: "ne",
  Ravens: "bal",
  Bengals: "cin",
  Steelers: "pit",
  Browns: "cle",
  Broncos: "den",
  Raiders: "lv",
  Chargers: "lac",
  Texans: "hou",
  Titans: "ten",
  Jaguars: "jax",
  Colts: "ind",
  Jets: "nyj",
  Giants: "nyg",
  Commanders: "wsh",
  Bears: "chi",
  Vikings: "min",
  Lions: "det",
  Buccaneers: "tb",
  Saints: "no",
  Falcons: "atl",
  Panthers: "car",
  Cardinals: "ari",
  Rams: "lar",
  Seahawks: "sea",

  // NBA
  Lakers: "lal",
  Celtics: "bos",
  Warriors: "gs",
  Bulls: "chi",
  Heat: "mia",
  Nets: "bkn",
  Knicks: "ny",
  Bucks: "mil",
  Suns: "phx",
  Nuggets: "den",
  Mavericks: "dal",
  "76ers": "phi",
  Raptors: "tor",
  Kings: "sac",
  Cavaliers: "cle",
  Thunder: "okc",
  Grizzlies: "mem",
  Timberwolves: "min",
  Pelicans: "no",
  Spurs: "sa",
  Hawks: "atl",
  Hornets: "cha",
  Pacers: "ind",
  Magic: "orl",
  Wizards: "wsh",
  Pistons: "det",
  Rockets: "hou",
  Blazers: "por",
  Jazz: "utah",
  Clippers: "lac",

  // MLS (ESPN has limited MLS coverage — many will use text fallback)
  "Chicago Fire": "chi",
  "FC Dallas": "dal",
  "Houston Dynamo": "hou",
  "Portland Timbers": "por",
  "Seattle Sounders": "sea",
  "Toronto FC": "tor",
  "Vancouver Whitecaps": "van",

  // WNBA
  Dream: "atl",
  Mercury: "phx",
  Sky: "chi",
  Aces: "lv",
  Storm: "sea",
  Mystics: "wsh",
  Fever: "ind",
  Sun: "conn",
  Sparks: "la",
  Liberty: "ny",
  Lynx: "min",
  Wings: "dal",
  Valkyries: "gs",
};

// Full display name: "City + Name"
const FULL_NAMES: Record<string, string> = {
  Chiefs: "Kansas City Chiefs",
  Eagles: "Philadelphia Eagles",
  Cowboys: "Dallas Cowboys",
  "49ers": "San Francisco 49ers",
  Packers: "Green Bay Packers",
  Bills: "Buffalo Bills",
  Dolphins: "Miami Dolphins",
  Patriots: "New England Patriots",
  Ravens: "Baltimore Ravens",
  Bengals: "Cincinnati Bengals",
  Steelers: "Pittsburgh Steelers",
  Browns: "Cleveland Browns",
  Broncos: "Denver Broncos",
  Raiders: "Las Vegas Raiders",
  Chargers: "Los Angeles Chargers",
  Texans: "Houston Texans",
  Titans: "Tennessee Titans",
  Jaguars: "Jacksonville Jaguars",
  Colts: "Indianapolis Colts",
  Jets: "New York Jets",
  Giants: "New York Giants",
  Commanders: "Washington Commanders",
  Bears: "Chicago Bears",
  Vikings: "Minnesota Vikings",
  Lions: "Detroit Lions",
  Buccaneers: "Tampa Bay Buccaneers",
  Saints: "New Orleans Saints",
  Falcons: "Atlanta Falcons",
  Panthers: "Carolina Panthers",
  Cardinals: "Arizona Cardinals",
  Rams: "Los Angeles Rams",
  Seahawks: "Seattle Seahawks",
  Lakers: "Los Angeles Lakers",
  Celtics: "Boston Celtics",
  Warriors: "Golden State Warriors",
  Bulls: "Chicago Bulls",
  Heat: "Miami Heat",
  Nets: "Brooklyn Nets",
  Knicks: "New York Knicks",
  Bucks: "Milwaukee Bucks",
  Suns: "Phoenix Suns",
  Nuggets: "Denver Nuggets",
  Mavericks: "Dallas Mavericks",
  "76ers": "Philadelphia 76ers",
  Raptors: "Toronto Raptors",
  Kings: "Sacramento Kings",
  Cavaliers: "Cleveland Cavaliers",
  Thunder: "Oklahoma City Thunder",
  Grizzlies: "Memphis Grizzlies",
  Timberwolves: "Minnesota Timberwolves",
  Pelicans: "New Orleans Pelicans",
  Spurs: "San Antonio Spurs",
  Hawks: "Atlanta Hawks",
  Hornets: "Charlotte Hornets",
  Pacers: "Indiana Pacers",
  Magic: "Orlando Magic",
  Wizards: "Washington Wizards",
  Pistons: "Detroit Pistons",
  Rockets: "Houston Rockets",
  Blazers: "Portland Trail Blazers",
  Jazz: "Utah Jazz",
  Clippers: "Los Angeles Clippers",
  // MLS - these use full names in DB already
  // WNBA
  Dream: "Atlanta Dream",
  Mercury: "Phoenix Mercury",
  Sky: "Chicago Sky",
  Aces: "Las Vegas Aces",
  Storm: "Seattle Storm",
  Mystics: "Washington Mystics",
  Fever: "Indiana Fever",
  Sun: "Connecticut Sun",
  Sparks: "Los Angeles Sparks",
  Liberty: "New York Liberty",
  Lynx: "Minnesota Lynx",
  Wings: "Dallas Wings",
  Valkyries: "Golden State Valkyries",
  "Portland Fire": "Portland Fire",
  "Toronto Tempo": "Toronto Tempo",
};

// Wikipedia/Wikimedia logo overrides for teams where ESPN CDN fails
const WIKI_LOGOS: Record<string, string> = {
  // MLS
  "Inter Miami": "https://upload.wikimedia.org/wikipedia/en/5/5c/Inter_Miami_CF_logo.svg",
  "LA Galaxy": "https://upload.wikimedia.org/wikipedia/commons/7/70/Los_Angeles_Galaxy_logo.svg",
  LAFC: "https://upload.wikimedia.org/wikipedia/commons/8/86/Los_Angeles_Football_Club.svg",
  "Atlanta United": "https://upload.wikimedia.org/wikipedia/en/b/bb/Atlanta_MLS.svg",
  "Austin FC": "https://upload.wikimedia.org/wikipedia/commons/e/e5/Austin_FC.svg",
  "CF Montreal": "https://upload.wikimedia.org/wikipedia/commons/f/fe/Logo_of_CF_Montreal_2023.svg",
  "Charlotte FC": "https://upload.wikimedia.org/wikipedia/en/9/91/Charlotte_FC_logo.svg",
  "Chicago Fire": "https://upload.wikimedia.org/wikipedia/commons/0/03/Chicago_Fire_logo%2C_2021.svg",
  "Columbus Crew": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Columbus_Crew_logo_2021.svg",
  "DC United": "https://upload.wikimedia.org/wikipedia/en/3/32/D.C._United_logo_%282016%29.svg",
  "FC Cincinnati": "https://upload.wikimedia.org/wikipedia/en/7/78/FC_Cincinnati_primary_logo_2018.svg",
  "FC Dallas": "https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Dallas_logo.svg",
  "Houston Dynamo": "https://upload.wikimedia.org/wikipedia/commons/6/66/Houston_Dynamo_FC_logo.svg",
  "Minnesota United": "https://upload.wikimedia.org/wikipedia/en/e/e8/Minnesota_United_FC_%28MLS%29_Primary_logo.svg",
  "Nashville SC": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Nashville_SC_logo%2C_2020.svg",
  "New England Revolution": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Logo_of_New_England_Revolution_%282021%29.svg",
  "NY Red Bulls": "https://upload.wikimedia.org/wikipedia/en/5/51/New_York_Red_Bulls_logo.svg",
  NYCFC: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_New_York_City_FC_2025.svg",
  "Orlando City": "https://upload.wikimedia.org/wikipedia/en/6/6a/Orlando_City_2014.svg",
  "Philadelphia Union": "https://upload.wikimedia.org/wikipedia/en/4/46/Philadelphia_Union_2018_logo.svg",
  "Portland Timbers": "https://upload.wikimedia.org/wikipedia/commons/3/35/Portland_Timbers_logo.svg",
  "Real Salt Lake": "https://upload.wikimedia.org/wikipedia/en/5/54/Real_Salt_Lake_2010.svg",
  "San Diego FC": "https://upload.wikimedia.org/wikipedia/en/6/6f/San_Diego_FC_logo.svg",
  "San Jose Earthquakes": "https://upload.wikimedia.org/wikipedia/en/9/98/San_Jose_Earthquakes_2014.svg",
  "Seattle Sounders": "https://upload.wikimedia.org/wikipedia/en/8/84/Seattle_Sounders_logo.svg",
  "Sporting KC": "https://upload.wikimedia.org/wikipedia/commons/0/09/Sporting_Kansas_City_logo.svg",
  "St Louis City": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Logo_of_St._Louis_City_SC.svg",
  "Toronto FC": "https://upload.wikimedia.org/wikipedia/en/7/7c/Toronto_FC_Logo.svg",
  "Vancouver Whitecaps": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Vancouver_Whitecaps_logo.svg",
  // WNBA expansion
  "Portland Fire": "https://upload.wikimedia.org/wikipedia/en/c/cf/Portland_Fire_logo.svg",
  "Toronto Tempo": "https://upload.wikimedia.org/wikipedia/en/1/1b/Toronto_Tempo_logo.svg",
};

function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function lightenHex(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function hexSaturation(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

export function getTeamColors(teamName: string): {
  primary: string;
  secondary: string;
  /** A vibrant color guaranteed visible on dark (#0a0a0a) backgrounds — for headlines, labels, accents */
  accent: string;
  /** Text color to use ON the primary background (ticker, insight, CTA) */
  textOnPrimary: string;
  /** Text color to use ON the secondary background (nav CTA button) */
  textOnSecondary: string;
} {
  const colors = TEAM_COLORS[teamName];
  const primary = colors ? colors[0] : "#ffffff";
  const secondary = colors ? colors[1] : "#888888";

  const lumP = hexLuminance(primary);
  const lumS = hexLuminance(secondary);
  const satP = hexSaturation(primary);
  const satS = hexSaturation(secondary);

  // Accent selection: prefer vibrant (saturated + visible) colors that pop on dark.
  // Score = luminance * (1 + saturation * 3) — strongly rewards color over grey.
  // A vivid red at medium brightness beats a bright grey every time.
  // Minimum luminance threshold: 0.12 (below this is near-invisible on #0a0a0a).
  const scoreP = lumP >= 0.12 ? lumP * (1 + satP * 3) : 0;
  const scoreS = lumS >= 0.12 ? lumS * (1 + satS * 3) : 0;

  let accent: string;
  if (scoreP >= scoreS && scoreP > 0) {
    accent = primary;
  } else if (scoreS > 0) {
    accent = secondary;
  } else {
    // Both too dark — lighten the more saturated one
    accent = satP >= satS ? lightenHex(primary, 0.3) : lightenHex(secondary, 0.3);
  }

  // Ensure accent has minimum luminance of 0.25 for readability
  if (hexLuminance(accent) < 0.25) {
    accent = lightenHex(accent, 0.2);
  }

  const textOnPrimary = hexLuminance(primary) > 0.55 ? "#0a0a0a" : "#ffffff";
  const textOnSecondary = hexLuminance(secondary) > 0.55 ? "#0a0a0a" : "#ffffff";

  return { primary, secondary, accent, textOnPrimary, textOnSecondary };
}

export function getFullTeamName(shortName: string, city: string): string {
  return FULL_NAMES[shortName] || `${city} ${shortName}`;
}

export function getTeamLogoUrl(league: string, teamName: string): string {
  // Check Wikipedia override first
  if (WIKI_LOGOS[teamName]) return WIKI_LOGOS[teamName];

  // Fall back to ESPN CDN
  const abbr = ESPN_ABBR[teamName];
  if (!abbr) return "";

  const leagueMap: Record<string, string> = {
    nfl: "nfl",
    nba: "nba",
    mls: "mls",
    wnba: "wnba",
    mlb: "mlb",
    nhl: "nhl",
  };
  const espnLeague = leagueMap[league] || league;
  return `https://a.espncdn.com/i/teamlogos/${espnLeague}/500/${abbr}.png`;
}
