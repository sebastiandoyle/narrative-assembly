/**
 * Curated synonym map for UK politics topics.
 * Maps common search terms to related terms that might appear in BBC News transcripts.
 * This is intentionally hand-built to demonstrate that narrative assembly
 * doesn't require AI — just careful keyword mapping.
 */
export const ukPoliticsSynonyms: Record<string, string[]> = {
  // Immigration & borders
  immigration: ["migration", "migrants", "asylum", "refugees", "deportation", "visa", "borders"],
  migrants: ["immigrants", "refugees", "asylum seekers", "migrant workers"],
  asylum: ["refugees", "asylum seekers", "protection", "sanctuary"],
  deportation: ["removal", "deported", "expelled", "sent back"],
  "small boats": ["channel crossings", "dinghies", "english channel", "boat crossings"],
  borders: ["border control", "border force", "border security"],

  // Health
  nhs: ["national health service", "health service", "hospitals", "healthcare"],
  hospital: ["hospitals", "a&e", "emergency department", "ward"],
  "waiting list": ["waiting lists", "waiting times", "backlog", "queue"],
  doctors: ["gps", "physicians", "consultants", "surgeons"],
  nurses: ["nursing", "midwives", "healthcare workers"],
  "mental health": ["psychological", "psychiatry", "wellbeing", "anxiety", "depression"],

  // Economy & cost of living
  economy: ["economic", "gdp", "growth", "recession", "downturn"],
  inflation: ["prices", "cost of living", "cpi", "price rises"],
  "cost of living": ["living costs", "household bills", "expenses", "affordability"],
  recession: ["downturn", "contraction", "economic decline"],
  wages: ["pay", "salaries", "earnings", "income"],
  "interest rates": ["bank rate", "base rate", "mortgage rates"],

  // Housing
  housing: ["homes", "property", "accommodation", "dwellings"],
  rent: ["rental", "renting", "tenants", "landlords"],
  mortgage: ["mortgages", "home loans", "house prices"],
  homelessness: ["homeless", "rough sleeping", "street homeless"],

  // Climate & environment
  climate: ["climate change", "global warming", "environmental"],
  "net zero": ["carbon neutral", "decarbonisation", "emissions targets"],
  renewable: ["renewables", "wind power", "solar", "green energy"],
  emissions: ["carbon emissions", "greenhouse gases", "co2", "pollution"],

  // Brexit & trade
  brexit: ["leaving the eu", "european union", "post-brexit"],
  eu: ["european union", "brussels", "europe"],
  trade: ["exports", "imports", "trading", "commerce"],
  tariffs: ["duties", "trade barriers", "customs"],

  // Politics & government
  government: ["ministers", "cabinet", "downing street", "whitehall"],
  "prime minister": ["pm", "starmer", "leader", "no 10"],
  starmer: ["keir starmer", "prime minister", "labour leader"],
  labour: ["labour party", "labour government"],
  conservative: ["tory", "tories", "conservative party"],
  reform: ["reform uk", "reform party", "farage"],
  parliament: ["commons", "lords", "westminster", "mps"],
  resign: ["resignation", "step down", "quit", "stand down"],

  // Crime & justice
  crime: ["criminal", "offences", "offending"],
  police: ["policing", "officers", "met police", "constabulary"],
  prison: ["prisons", "jail", "custody", "inmates"],
  knife: ["knife crime", "stabbing", "blades"],

  // Education
  education: ["schools", "teaching", "learning", "curriculum"],
  university: ["universities", "higher education", "degree", "tuition"],
  teachers: ["teaching staff", "educators", "school staff"],

  // Foreign affairs
  russia: ["russian", "putin", "moscow", "kremlin"],
  ukraine: ["ukrainian", "kyiv", "zelensky"],
  war: ["conflict", "military", "fighting", "invasion"],
  trump: ["donald trump", "us president", "white house", "america"],

  // Scandals
  epstein: ["jeffrey epstein", "epstein files", "epstein scandal"],
  mandelson: ["peter mandelson", "lord mandelson"],
  scandal: ["controversy", "affair", "crisis", "allegations"],
};

/**
 * Look up synonyms for a term. Case-insensitive.
 */
export function getSynonyms(term: string): string[] {
  const lower = term.toLowerCase();
  return ukPoliticsSynonyms[lower] ?? [];
}
