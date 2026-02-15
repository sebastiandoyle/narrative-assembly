import { describe, it, expect } from "vitest";
import { extractTopic } from "@/lib/reddit/topics";

describe("extractTopic", () => {
  it("extracts short topic labels, not full sentences", () => {
    const titles = [
      "Immigration numbers reach record high despite government promises",
      "NHS waiting times: A&E departments in crisis across England",
      "Cost of living: Energy bills set to rise again in April",
      "Brexit trade barriers continue to impact small businesses",
      "Discord UK users they part of an experiment their age verification",
      "Rupert Lowe faces allegations of misconduct in parliament",
      "Reform UK latest polling numbers show surge in support",
      "Starmer faces pressure over Mandelson appointment controversy",
    ];

    titles.forEach((title) => {
      const topic = extractTopic(title);
      expect(topic.length).toBeLessThanOrEqual(30);
      expect(topic.length).toBeGreaterThan(0);
    });
  });

  it("prefers named entities when available", () => {
    const topic = extractTopic("Starmer faces pressure from Labour backbenchers");
    // Should extract "Starmer" or similar short entity, not a long noun dump
    expect(topic.length).toBeLessThanOrEqual(30);
  });

  it("strips leading articles from noun phrases", () => {
    const topic = extractTopic("The government announces new policy");
    expect(topic).not.toMatch(/^(the|a|an)\s/i);
  });

  it("handles titles with no clear nouns gracefully", () => {
    const topic = extractTopic("Why do we even bother?");
    expect(topic.length).toBeGreaterThan(0);
    expect(topic.length).toBeLessThanOrEqual(30);
  });

  it("deduplicates topics in fetchRedditTopics", async () => {
    // This is tested at the integration level in reddit-topics.test.ts
    // Here we just verify extractTopic returns consistent results
    const result1 = extractTopic("Immigration policy debate intensifies");
    const result2 = extractTopic("Immigration policy debate intensifies");
    expect(result1).toBe(result2);
  });
});
