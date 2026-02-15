import type { RedditTopic } from "@/lib/types";

/** Raw Reddit API listing response shape (r/ukpolitics/hot.json) */
export const mockRedditApiResponse = {
  kind: "Listing",
  data: {
    after: "t3_abc123",
    children: [
      {
        kind: "t3",
        data: {
          title: "Immigration numbers reach record high despite government promises",
          score: 2847,
          permalink: "/r/ukpolitics/comments/abc123/immigration_numbers/",
          num_comments: 512,
          selftext: "New ONS figures show net migration has reached...",
          link_flair_text: "News",
        },
      },
      {
        kind: "t3",
        data: {
          title: "NHS waiting times: A&E departments in crisis across England",
          score: 1923,
          permalink: "/r/ukpolitics/comments/def456/nhs_waiting/",
          num_comments: 389,
          selftext: "Latest figures show waiting times at emergency...",
          link_flair_text: "News",
        },
      },
      {
        kind: "t3",
        data: {
          title: "Cost of living: Energy bills set to rise again in April",
          score: 1654,
          permalink: "/r/ukpolitics/comments/ghi789/energy_bills/",
          num_comments: 278,
          selftext: "Ofgem has announced the new price cap...",
          link_flair_text: "News",
        },
      },
      {
        kind: "t3",
        data: {
          title: "Brexit trade barriers continue to impact small businesses",
          score: 987,
          permalink: "/r/ukpolitics/comments/jkl012/brexit_trade/",
          num_comments: 156,
          selftext: "Survey of 1000 SMEs reveals ongoing challenges...",
          link_flair_text: "Discussion",
        },
      },
      {
        kind: "t3",
        data: {
          title: "Weekly megathread - general discussion",
          score: 45,
          permalink: "/r/ukpolitics/comments/mno345/weekly_mega/",
          num_comments: 890,
          selftext: "",
          link_flair_text: "Megathread",
        },
      },
    ],
  },
};

/** Expected parsed topics from the mock API response */
export const mockParsedTopics: RedditTopic[] = [
  {
    title: "Immigration numbers reach record high despite government promises",
    extractedTopic: "immigration",
    score: 2847,
    url: "https://reddit.com/r/ukpolitics/comments/abc123/immigration_numbers/",
    numComments: 512,
  },
  {
    title: "NHS waiting times: A&E departments in crisis across England",
    extractedTopic: "NHS waiting times",
    score: 1923,
    url: "https://reddit.com/r/ukpolitics/comments/def456/nhs_waiting/",
    numComments: 389,
  },
  {
    title: "Cost of living: Energy bills set to rise again in April",
    extractedTopic: "cost of living",
    score: 1654,
    url: "https://reddit.com/r/ukpolitics/comments/ghi789/energy_bills/",
    numComments: 278,
  },
  {
    title: "Brexit trade barriers continue to impact small businesses",
    extractedTopic: "Brexit trade",
    score: 987,
    url: "https://reddit.com/r/ukpolitics/comments/jkl012/brexit_trade/",
    numComments: 156,
  },
];

/** Fallback topics when Reddit API is unavailable */
export const mockFallbackTopics: RedditTopic[] = [
  {
    title: "Immigration policy",
    extractedTopic: "immigration",
    score: 0,
    url: "",
    numComments: 0,
  },
  {
    title: "NHS and healthcare",
    extractedTopic: "NHS",
    score: 0,
    url: "",
    numComments: 0,
  },
  {
    title: "Cost of living",
    extractedTopic: "cost of living",
    score: 0,
    url: "",
    numComments: 0,
  },
];
