import nlp from "compromise";
import type { RedditTopic } from "../types";

const REDDIT_URL = "https://www.reddit.com/r/ukpolitics/hot.json?limit=15";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cachedTopics: RedditTopic[] | null = null;
let cachedAt = 0;

/**
 * Fallback topics when Reddit is unavailable.
 * These represent common UK politics themes.
 */
export const FALLBACK_TOPICS: RedditTopic[] = [
  {
    title: "Immigration policy debate intensifies",
    extractedTopic: "immigration",
    score: 0,
    url: "",
    numComments: 0,
  },
  {
    title: "NHS waiting lists reach new record",
    extractedTopic: "NHS waiting lists",
    score: 0,
    url: "",
    numComments: 0,
  },
  {
    title: "Cost of living crisis continues",
    extractedTopic: "cost of living",
    score: 0,
    url: "",
    numComments: 0,
  },
  {
    title: "Starmer faces pressure over Mandelson",
    extractedTopic: "Starmer Mandelson",
    score: 0,
    url: "",
    numComments: 0,
  },
  {
    title: "Climate change targets under review",
    extractedTopic: "climate change",
    score: 0,
    url: "",
    numComments: 0,
  },
  {
    title: "Reform UK rises in polls",
    extractedTopic: "Reform UK",
    score: 0,
    url: "",
    numComments: 0,
  },
  {
    title: "Russia-Ukraine war latest",
    extractedTopic: "Russia Ukraine",
    score: 0,
    url: "",
    numComments: 0,
  },
  {
    title: "Housing crisis worsens across UK",
    extractedTopic: "housing crisis",
    score: 0,
    url: "",
    numComments: 0,
  },
];

/**
 * Extract the key political topic from a Reddit post title
 * using compromise NLP. Pulls out noun phrases and named entities.
 */
export function extractTopic(title: string): string {
  const doc = nlp(title);

  // Try to get named entities first (people, places, organizations)
  const people = doc.people().text();
  const places = doc.places().text();
  const orgs = doc.organizations().text();

  // Get key noun phrases
  const nouns = doc.nouns().text();

  // Build topic from most specific to least
  const parts: string[] = [];
  if (people) parts.push(people);
  if (orgs) parts.push(orgs);
  if (places) parts.push(places);

  if (parts.length > 0) {
    return parts.join(" ").slice(0, 60);
  }

  // Fall back to noun phrases
  if (nouns) {
    return nouns.slice(0, 60);
  }

  // Last resort: first few meaningful words
  const words = title
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 4);
  return words.join(" ");
}

/**
 * Fetch hot topics from r/ukpolitics.
 * Uses Reddit's public JSON API (no auth required).
 * Caches for 5 minutes. Falls back to curated topics on error.
 * Returns array of RedditTopic directly.
 */
export async function fetchRedditTopics(): Promise<RedditTopic[]> {
  // Return cache if fresh
  if (cachedTopics && Date.now() - cachedAt < CACHE_TTL) {
    return cachedTopics;
  }

  try {
    const response = await fetch(REDDIT_URL, {
      headers: {
        "User-Agent": "narrative-assembly:v1.0 (educational demo)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}`);
    }

    const data = await response.json();
    const posts = data?.data?.children ?? [];

    const topics: RedditTopic[] = posts
      .filter(
        (post: { data: { stickied: boolean; title: string } }) =>
          !post.data.stickied &&
          !post.data.title.toLowerCase().includes("megathread")
      )
      .slice(0, 10)
      .map(
        (post: {
          data: {
            title: string;
            score: number;
            permalink: string;
            num_comments: number;
          };
        }) => ({
          title: post.data.title,
          extractedTopic: extractTopic(post.data.title),
          score: post.data.score,
          url: `https://reddit.com${post.data.permalink}`,
          numComments: post.data.num_comments,
        })
      );

    cachedTopics = topics;
    cachedAt = Date.now();

    return topics;
  } catch {
    // Return fallback topics on any error
    return FALLBACK_TOPICS;
  }
}

/**
 * Reset the cache (useful for testing).
 */
export function resetCache(): void {
  cachedTopics = null;
  cachedAt = 0;
}
