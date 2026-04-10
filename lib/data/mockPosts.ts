import { subHours, subYears } from "date-fns";
import { NormalizedPost } from "@/lib/types";

const now = new Date();

export const truthSocialMock: NormalizedPost[] = [
  {
    id: "ts-2026-0408-001",
    text: "AMERICA IS BACK ON TRACK. GREAT CROWD TONIGHT. THANK YOU!",
    createdAt: subHours(now, 2).toISOString(),
    source: "truth_social",
    sourceLabel: "Truth Social",
    sourceUrl: "https://truthsocial.com/@realDonaldTrump/posts/example-1",
    authorName: "Donald J. Trump",
    authorHandle: "@realDonaldTrump",
    media: [],
    tags: ["rally", "statement"],
    isArchive: false,
    metadata: { allCapsScore: 0.88, characterCount: 64, sharesCount: 0, favouritesCount: 0 }
  },
  {
    id: "ts-2026-0408-002",
    text: "Gas prices are down and optimism is up. The American people deserve WINNING leadership.",
    createdAt: subHours(now, 5).toISOString(),
    source: "truth_social",
    sourceLabel: "Truth Social",
    sourceUrl: "https://truthsocial.com/@realDonaldTrump/posts/example-2",
    authorName: "Donald J. Trump",
    authorHandle: "@realDonaldTrump",
    media: [],
    tags: ["economy"],
    isArchive: false,
    metadata: { allCapsScore: 0.24, characterCount: 92, sharesCount: 0, favouritesCount: 0 }
  },
  {
    id: "ts-2026-0407-003",
    text: "MAKE AMERICA WEALTHY AGAIN!",
    createdAt: subHours(now, 20).toISOString(),
    source: "truth_social",
    sourceLabel: "Truth Social",
    sourceUrl: "https://truthsocial.com/@realDonaldTrump/posts/example-3",
    authorName: "Donald J. Trump",
    authorHandle: "@realDonaldTrump",
    media: [],
    tags: ["slogan"],
    isArchive: false,
    metadata: { allCapsScore: 0, sharesCount: 0, favouritesCount: 0, characterCount: 27 }
  }
];

export const twitterArchiveMock: NormalizedPost[] = [
  {
    id: "tw-2019-0408-001",
    text: "Big meeting today. We are making tremendous progress for the country.",
    createdAt: subYears(now, 7).toISOString(),
    source: "twitter_archive",
    sourceLabel: "Twitter Archive",
    sourceUrl: "https://www.thetrumparchive.com/",
    authorName: "Donald J. Trump",
    authorHandle: "@realDonaldTrump",
    media: [],
    tags: ["archive"],
    isArchive: true,
    metadata: { allCapsScore: 0.08, characterCount: 72, sharesCount: 0, favouritesCount: 0 }
  },
  {
    id: "tw-2018-0408-002",
    text: "THE FAKE NEWS MEDIA NEVER STOPS!",
    createdAt: subYears(now, 8).toISOString(),
    source: "twitter_archive",
    sourceLabel: "Twitter Archive",
    sourceUrl: "https://www.thetrumparchive.com/",
    authorName: "Donald J. Trump",
    authorHandle: "@realDonaldTrump",
    media: [],
    tags: ["archive", "media"],
    isArchive: true,
    metadata: { allCapsScore: 0.91, characterCount: 33, sharesCount: 0, favouritesCount: 0 }
  },
  {
    id: "tw-2016-0408-003",
    text: "Great turnout in Wisconsin. Thank you!",
    createdAt: subYears(now, 10).toISOString(),
    source: "twitter_archive",
    sourceLabel: "Twitter Archive",
    sourceUrl: "https://www.thetrumparchive.com/",
    authorName: "Donald J. Trump",
    authorHandle: "@realDonaldTrump",
    media: [],
    tags: ["campaign", "archive"],
    isArchive: true,
    metadata: { allCapsScore: 0.13, characterCount: 39, sharesCount: 0, favouritesCount: 0 }
  }
];
