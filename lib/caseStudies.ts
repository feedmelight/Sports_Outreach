export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  year: number;
  description: string;
  categories: string[];
  /** Tags for matching: "sport", "entertainment", "gaming", "advertising", "us-market", "global-event", "brand", "tech" */
  tags: string[];
  stats?: { label: string; value: string }[];
  credits?: { role: string; name: string }[];
  url?: string;
  thumbnail?: string;
  videoUrl?: string;
  videoType?: "vimeo" | "youtube";
}

export const caseStudies: CaseStudy[] = [
  {
    id: "fifa-wc-2022",
    title: "FIFA World Cup Qatar 2022",
    client: "FIFA",
    year: 2022,
    description:
      "Full creative content portfolio across the entire tournament. Social content integrating 3D mascot with archival World Cup footage, opening ceremony cinematic film for the live stadium performance, and projection mapping countdown installations globally.",
    categories: ["Event", "3D"],
    tags: ["sport", "global-event", "us-market"],
    stats: [
      { label: "Audience", value: "1.5B+" },
      { label: "Scope", value: "Full Tournament" },
      { label: "Deliverables", value: "Ceremony, Social, OOH" },
    ],
    credits: [
      { role: "Executive Producer", name: "Ben Leyland" },
      { role: "Executive Creative Director", name: "Denis Bodart" },
      { role: "Managing Director", name: "Kiri Haggart" },
    ],
    url: "/projects/fifa-world-cup-2022-global-event-creative",
    thumbnail: "/images/proof-wc2022.avif",
    videoUrl: "https://vimeo.com/1110918500",
    videoType: "vimeo",
  },
  {
    id: "afc-asian-cup-ceremony",
    title: "AFC Asian Cup 2023: Ceremony & Activations",
    client: "Asian Football Confederation",
    year: 2023,
    description:
      "Two major creative umbrellas for one of the world's largest football tournaments: anime-inspired mascot films with anamorphic OOH, and an original IP featuring 28 national animals for the opening ceremony, designed as an enduring story world.",
    categories: ["Event", "3D"],
    tags: ["sport", "global-event"],
    stats: [
      { label: "Characters", value: "28" },
      { label: "Markets", value: "Pan-Asia" },
      { label: "Scope", value: "Ceremony + Social + OOH" },
    ],
    credits: [
      { role: "Executive Producer", name: "Ben Leyland" },
      { role: "Executive Creative Director", name: "Denis Bodart" },
      { role: "Managing Director", name: "Kiri Haggart" },
    ],
    url: "/projects/asian-cup-2023-design-storytelling",
    thumbnail: "/images/proof-asian-cup.avif",
    videoUrl: "https://www.youtube.com/watch?v=U-uZU0vujiM",
    videoType: "youtube",
  },
  {
    id: "afc-mascots",
    title: "AFC Asian Cup: Official Mascots",
    client: "AFC / Katara Studios",
    year: 2023,
    description:
      "Revival of the legendary mascot family from Qatar's 2011 AFC Asian Cup. Colourful 2D football-themed content featuring character animations set across beaches, deserts, and urban landscapes for social media and broadcast.",
    categories: ["2D Animation", "Social Media"],
    tags: ["sport", "global-event"],
    stats: [
      { label: "Format", value: "2D Animation" },
      { label: "Platform", value: "Social + Broadcast" },
    ],
    credits: [
      { role: "Executive Producer", name: "Ben Leyland" },
      { role: "Executive Creative Director", name: "Denis Bouyer" },
      { role: "2D Animation Lead", name: "Jorge Duran" },
    ],
    url: "/projects/asian-cup-mascots",
    thumbnail: "https://img.youtube.com/vi/NtqrV0nz-UM/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=NtqrV0nz-UM",
    videoType: "youtube",
  },
  {
    id: "fifa-u17",
    title: "FIFA U-17 World Cup: Mascot Activations",
    client: "FIFA / Katara Studios",
    year: 2025,
    description:
      "Animated mascot activations for the FIFA U-17 World Cup Qatar 2025, centred on 'BOMA': a Desert Owl character inspired by legendary coach Velibor Milutinovic. Dynamic character animation with flashback vignettes from the real coach's career.",
    categories: ["Advertising", "3D"],
    tags: ["sport", "global-event"],
    stats: [
      { label: "Character", value: "BOMA" },
      { label: "Event", value: "FIFA U-17 WC" },
    ],
    credits: [
      { role: "Executive Producer", name: "Ben Leyland" },
      { role: "Executive Creative Director", name: "Denis Bouyer" },
      { role: "Character Design", name: "Rayner Alencar" },
    ],
    url: "/projects/fifa-u17wc-2025",
    thumbnail: "https://i.vimeocdn.com/video/2078009672-ddfd193c7ed38eb1e49aef74b971e29bb0a61a3ae4e6b2db6e2a45dbeec21f4c-d_1280",
    videoUrl: "https://vimeo.com/1133413770",
    videoType: "vimeo",
  },
  {
    id: "kelileh-demneh",
    title: "Kelileh & Demneh: Opening Ceremony Film",
    client: "Katara Studios / AFC",
    year: 2023,
    description:
      "12 anthropomorphic animal characters for the Asian Cup opening ceremony: 7 CG head replacements on live-action performers, 5 full CG characters. Adapted from an ancient fable celebrating Asia's diversity. Pushed FML's creature/CG pipeline significantly.",
    categories: ["3D", "Live Action"],
    tags: ["sport", "global-event", "tech"],
    stats: [
      { label: "Characters", value: "12" },
      { label: "Pipeline", value: "ZBrush → Maya → Houdini → Arnold" },
    ],
    credits: [
      { role: "Executive Producer", name: "Ben Leyland" },
      { role: "VFX Supervisor", name: "Finlay Crowther" },
      { role: "Lead Animator", name: "Alex Alvarez" },
    ],
    url: "/projects/the-lost-chapter-of-kelileh-demneh",
    thumbnail: "https://img.youtube.com/vi/U-uZU0vujiM/2.jpg",
    videoUrl: "https://www.youtube.com/watch?v=U-uZU0vujiM",
    videoType: "youtube",
  },
  {
    id: "taco-bell-espn",
    title: "Taco Bell × ESPN: Live Mas Student Section",
    client: "ESPN / Taco Bell",
    year: 2023,
    description:
      "Energetic animation for the Live Mas Student Section campaign. Dynamic 3D camera movements with seamless 2D animation introducing college football celebrations. American football, fireworks, and tacos in a vibrant aesthetic.",
    categories: ["Advertising", "3D"],
    tags: ["sport", "us-market", "advertising", "entertainment"],
    stats: [
      { label: "Partner", value: "Elastic × FML" },
      { label: "Sport", value: "College Football" },
      { label: "Platform", value: "Broadcast + Social" },
    ],
    credits: [
      { role: "Creative Director", name: "Pedro Allevato" },
      { role: "Executive Creative Director", name: "Denis Bouyer" },
      { role: "Producer", name: "Dawn Cottrell" },
    ],
    url: "/projects/live-mas-student-section",
    thumbnail: "https://img.youtube.com/vi/RKSgPRF9SIs/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=RKSgPRF9SIs",
    videoType: "youtube",
  },
  {
    id: "gorillaz-gshock",
    title: "Gorillaz × G-SHOCK: Mission M101",
    client: "G-SHOCK (Casio)",
    year: 2023,
    description:
      "Three-episode intergalactic campaign featuring the virtual band Gorillaz for G-Shock's newest watch line. Blending 2D, 3D, illustration, and photography in a gritty, graphic visual style with in-store activation at Carnaby Street, London.",
    categories: ["Advertising", "Studio Work"],
    tags: ["entertainment", "brand", "advertising"],
    stats: [
      { label: "Episodes", value: "3" },
      { label: "Activation", value: "Carnaby Street" },
      { label: "Partner", value: "Blinkink × FML" },
    ],
    credits: [
      { role: "Creative Directors", name: "BRVTVS Collective" },
      { role: "Gorillaz Creative Director", name: "Jamie Hewlett" },
      { role: "Lead CG", name: "Olivier Pirard" },
    ],
    url: "/projects/mission-m101",
    thumbnail: "https://img.youtube.com/vi/Z84dJpep3PA/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=Z84dJpep3PA",
    videoType: "youtube",
  },
  {
    id: "valorant",
    title: "Riot Games: Valorant",
    client: "Riot Games",
    year: 2020,
    description:
      "Teaser for Valorant, one of Riot Games' first releases outside League of Legends. First official collaboration between Elastic and Feed Me Light, combining cinematic direction with high-end CG production.",
    categories: ["Gaming", "Studio Work"],
    tags: ["gaming", "entertainment", "us-market"],
    credits: [
      { role: "Director / Art Director", name: "Denis Bodart" },
      { role: "Executive Producer", name: "Ryan Goodwin-Smith" },
      { role: "CG Leads", name: "Frederic Colin, Olivier Pirard" },
    ],
    url: "/projects/valorant",
    thumbnail: "https://img.youtube.com/vi/L15aBEPryy8/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=L15aBEPryy8",
    videoType: "youtube",
  },
  {
    id: "dead-island-2",
    title: "Dead Island 2: Cinematic Trailer",
    client: "Deep Silver / Dambuster Studios",
    year: 2023,
    description:
      "Cinematic trailer for the long-awaited Dead Island sequel. A joint Elastic × FML production featuring high-end CG character work, stylised environments, and dynamic action sequences.",
    categories: ["Gaming", "Studio Work"],
    tags: ["gaming", "entertainment", "us-market"],
    credits: [
      { role: "Director / ECD", name: "Denis Bodart" },
      { role: "CG Supervisor", name: "Olivier Pirard" },
    ],
    url: "/projects/deadisland2",
    thumbnail: "https://img.youtube.com/vi/QpZecVmKzow/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=QpZecVmKzow",
    videoType: "youtube",
  },
  {
    id: "hp-omen",
    title: "HP: Omen Gaming Brand Film",
    client: "HP",
    year: 2022,
    description:
      "Gaming brand film structured across four creative pillars: The Story, The Character, Look Development, and The World. Joint Elastic × FML production for HP's flagship gaming brand.",
    categories: ["Advertising", "3D"],
    tags: ["gaming", "brand", "advertising", "us-market"],
    credits: [
      { role: "Executive Producer", name: "Ben Leyland" },
      { role: "Creative Director", name: "Joseph May" },
      { role: "Technical Director", name: "Olivier Pirard" },
    ],
    url: "/projects/omen",
    thumbnail: "https://img.youtube.com/vi/MeDnLYVDU50/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=MeDnLYVDU50",
    videoType: "youtube",
  },
  {
    id: "netflix-storybots",
    title: "Netflix: StoryBots Season 2",
    client: "Netflix",
    year: 2019,
    description:
      "Animated segments for Netflix's educational children's series StoryBots, covering character design, 3D modelling, rigging, and animation for the second season covering grammar and science topics.",
    categories: ["TV Series", "3D"],
    tags: ["entertainment", "us-market"],
    credits: [
      { role: "Executive Producer", name: "Ben Leyland" },
      { role: "Director", name: "Marc Bouyer" },
      { role: "Executive Creative Director", name: "Denis Bodart" },
    ],
    url: "/projects/storybots",
    thumbnail: "https://img.youtube.com/vi/kGk05KO4cbk/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=kGk05KO4cbk",
    videoType: "youtube",
  },
  {
    id: "ahs-title",
    title: "American Horror Stories: Title Sequence",
    client: "Disney / FX",
    year: 2022,
    description:
      "Opening title sequence for the 'X' episode. Dark, stylish and gory, designed to establish an unsettling tone. Joint Elastic × FML production.",
    categories: ["Title Sequence", "3D"],
    tags: ["entertainment", "us-market"],
    credits: [
      { role: "Direction", name: "Mike & Richard Payne" },
      { role: "FML ECD", name: "Denis Bouyer" },
    ],
    url: "/projects/howl",
    thumbnail: "https://img.youtube.com/vi/y9CnnXqibbI/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=y9CnnXqibbI",
    videoType: "youtube",
  },
  {
    id: "apple-truth-be-told",
    title: "Apple TV+: Truth Be Told S2",
    client: "Apple TV+",
    year: 2021,
    description:
      "Co-produced title sequence for the podcast-centred drama series, featuring dynamic visual storytelling through movement and design. Joint Elastic × FML production.",
    categories: ["Title Sequence", "Studio Work"],
    tags: ["entertainment", "us-market"],
    credits: [
      { role: "FML Executive Producer", name: "Ryan Goodwin-Smith" },
      { role: "FML ECD", name: "Denis Bodart" },
      { role: "Lead Creative", name: "Frederic Colin" },
    ],
    url: "/projects/truth-be-told-s2",
    thumbnail: "https://img.youtube.com/vi/0gG8XcBjhBU/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=0gG8XcBjhBU",
    videoType: "youtube",
  },
  {
    id: "sainsburys-150",
    title: "Sainsbury's: 150th Anniversary Zoetrope",
    client: "Sainsbury's",
    year: 2019,
    description:
      "An animated zoetrope cake over 1 metre wide, spinning at 80rpm with 14 uniquely designed characters representing 150 years of company history. VR previsualisation used in production. Agency: Wieden+Kennedy London.",
    categories: ["Creative Technology", "Studio Work"],
    tags: ["brand", "tech", "advertising"],
    stats: [
      { label: "Cake Width", value: "1m+" },
      { label: "Characters", value: "14" },
      { label: "RPM", value: "80" },
    ],
    credits: [
      { role: "ECD", name: "Denis Bodart" },
      { role: "Director", name: "Noah Harris" },
      { role: "Character Design", name: "James Castillo" },
    ],
    url: "/projects/150th-anniversary",
    thumbnail: "https://img.youtube.com/vi/umnAj1x3lAM/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=umnAj1x3lAM",
    videoType: "youtube",
  },
  {
    id: "royal-enfield",
    title: "Royal Enfield: Shotgun 650 Launch",
    client: "Royal Enfield",
    year: 2023,
    description:
      "Animated launch film for the limited-edition Shotgun 650, debuted live at the 'Motoverse' event in Goa, India. 3D bike model rendered in 2D animation style within a futuristic environment.",
    categories: ["Advertising", "3D"],
    tags: ["brand", "advertising", "global-event"],
    credits: [
      { role: "Executive Producer", name: "Ben Leyland" },
      { role: "Creative Director", name: "Thibaud Clergue" },
    ],
    url: "/projects/royal-enfield-shotgun-650",
    thumbnail: "https://img.youtube.com/vi/H928jc9Bgfg/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=H928jc9Bgfg",
    videoType: "youtube",
  },
  {
    id: "piccadilly-dooh",
    title: "Piccadilly Lights & Global DOOH",
    client: "Multiple",
    year: 2024,
    description:
      "3D anamorphic and large-format screen content at landmark locations globally. We understand how to make a moment feel enormous. On the biggest screens in the world.",
    categories: ["DOOH", "3D"],
    tags: ["brand", "global-event", "advertising", "tech"],
    stats: [
      { label: "Format", value: "3D Anamorphic" },
      { label: "Locations", value: "Global Landmarks" },
    ],
  },
];

/** Sport/league to tag relevance mapping */
const LEAGUE_TAG_PRIORITY: Record<string, string[]> = {
  nfl: ["sport", "us-market", "global-event", "advertising", "entertainment"],
  nba: ["sport", "us-market", "global-event", "entertainment", "gaming"],
  mls: ["sport", "global-event", "us-market", "brand"],
  wnba: ["sport", "us-market", "entertainment", "brand"],
  college: ["sport", "us-market", "advertising", "entertainment"],
};

/**
 * Returns the top N most relevant case studies for a given team's league.
 * Scores each study by tag overlap with the league's priority tags.
 */
export function getRelevantCaseStudies(
  league: string,
  count: number = 4
): CaseStudy[] {
  const priorityTags = LEAGUE_TAG_PRIORITY[league] || LEAGUE_TAG_PRIORITY["nfl"];

  const scored = caseStudies.map((cs) => {
    let score = 0;
    for (let i = 0; i < priorityTags.length; i++) {
      if (cs.tags.includes(priorityTags[i])) {
        // Earlier tags in priority list score higher
        score += (priorityTags.length - i) * 2;
      }
    }
    // Recency bonus
    score += (cs.year - 2018) * 0.5;
    return { cs, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.cs);
}
