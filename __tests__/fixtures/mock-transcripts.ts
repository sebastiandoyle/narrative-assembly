import type { TranscriptFile, TranscriptManifest } from "@/lib/types";

export const mockTranscriptImmigration: TranscriptFile = {
  videoId: "test_vid_001",
  title: "UK immigration policy debate - BBC News",
  publishedAt: "2025-11-15",
  channel: "BBC News",
  durationSeconds: 120,
  segments: [
    { start: 0, dur: 4.0, text: "The government has announced sweeping changes to immigration policy" },
    { start: 4.0, dur: 3.5, text: "aimed at reducing net migration figures which have reached record levels" },
    { start: 7.5, dur: 4.0, text: "The Home Secretary outlined plans to tighten visa requirements" },
    { start: 11.5, dur: 3.8, text: "particularly for workers coming from outside the European Union" },
    { start: 15.3, dur: 4.2, text: "Critics say the measures could damage the economy" },
    { start: 19.5, dur: 3.5, text: "with sectors like healthcare and agriculture relying on migrant workers" },
    { start: 23.0, dur: 4.0, text: "The NHS has warned that restricting immigration could worsen staff shortages" },
    { start: 27.0, dur: 3.6, text: "Hospitals across England are already struggling with record waiting times" },
  ],
};

export const mockTranscriptNHS: TranscriptFile = {
  videoId: "test_vid_002",
  title: "NHS waiting lists hit record high - BBC News",
  publishedAt: "2025-12-03",
  channel: "BBC News",
  durationSeconds: 95,
  segments: [
    { start: 0, dur: 4.0, text: "NHS waiting lists have reached an all time high" },
    { start: 4.0, dur: 3.8, text: "with over seven million people waiting for treatment in England" },
    { start: 7.8, dur: 4.1, text: "Doctors and nurses say the system is under unprecedented pressure" },
    { start: 11.9, dur: 3.5, text: "Emergency departments report patients waiting hours to be seen" },
    { start: 15.4, dur: 4.0, text: "The government has pledged additional funding for the health service" },
    { start: 19.4, dur: 3.7, text: "but critics argue it is not enough to address the crisis" },
  ],
};

export const mockTranscriptClimate: TranscriptFile = {
  videoId: "test_vid_003",
  title: "Climate change and net zero targets - BBC News",
  publishedAt: "2025-11-28",
  channel: "BBC News",
  durationSeconds: 80,
  segments: [
    { start: 0, dur: 4.2, text: "The UK government faces growing pressure on climate targets" },
    { start: 4.2, dur: 3.9, text: "Carbon emissions have fallen but not fast enough to meet net zero goals" },
    { start: 8.1, dur: 4.0, text: "Renewable energy now provides a significant share of electricity" },
    { start: 12.1, dur: 3.6, text: "Wind and solar power have seen massive investment" },
    { start: 15.7, dur: 4.1, text: "But the transition away from fossil fuels faces economic challenges" },
  ],
};

export const mockManifest: TranscriptManifest = {
  generatedAt: "2026-02-15T00:00:00Z",
  totalVideos: 3,
  videos: [
    {
      videoId: "test_vid_001",
      title: "UK immigration policy debate - BBC News",
      publishedAt: "2025-11-15",
      segmentCount: 8,
    },
    {
      videoId: "test_vid_002",
      title: "NHS waiting lists hit record high - BBC News",
      publishedAt: "2025-12-03",
      segmentCount: 6,
    },
    {
      videoId: "test_vid_003",
      title: "Climate change and net zero targets - BBC News",
      publishedAt: "2025-11-28",
      segmentCount: 5,
    },
  ],
};

export const allMockTranscripts: TranscriptFile[] = [
  mockTranscriptImmigration,
  mockTranscriptNHS,
  mockTranscriptClimate,
];
