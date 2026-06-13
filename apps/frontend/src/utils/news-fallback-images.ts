import type { NewsCategory } from "@/types/news";

const fallbackImagePools = {
  AWS: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=60",
  ],
  AZURE: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
  ],
  GCP: [
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60",
  ],
  CLOUD: [
    "https://images.unsplash.com/photo-1502224562085-639556652f33?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=60",
  ],
  AI: [
    "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1680814907495-75211000870c?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
  ],
  MACHINE_LEARNING: [
    "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60",
  ],
  DEVOPS: [
    "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=800&auto=format&fit=crop&q=60",
  ],
  CYBERSECURITY: [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
  ],
  PROGRAMMING: [
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
  ],
  STARTUPS: [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1556761175-b813f53a326d?w=800&auto=format&fit=crop&q=60",
  ],
  BUSINESS: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
  ],
  DATA_SCIENCE: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
  ],
  GENERAL_TECHNOLOGY: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=60",
  ],
  DEFAULT: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=60",
  ],
} as const;

type FallbackCategoryKey = keyof typeof fallbackImagePools;

const categoryFallbackMap: Record<NewsCategory, FallbackCategoryKey> = {
  AWS: "AWS",
  AZURE: "AZURE",
  GCP: "GCP",
  CLOUD: "CLOUD",
  AI: "AI",
  DEVOPS: "DEVOPS",
  CYBERSECURITY: "CYBERSECURITY",
  PROGRAMMING: "PROGRAMMING",
  GENERAL: "GENERAL_TECHNOLOGY",
};

export function getNewsFallbackImageSrc(
  articleId: string,
  category: NewsCategory | string | null,
) {
  const categoryKey = getFallbackCategoryKey(category);
  const pool = fallbackImagePools[categoryKey] ?? fallbackImagePools.DEFAULT;
  const index = hashString(`${articleId}:${categoryKey}`) % pool.length;

  return pool[index] ?? fallbackImagePools.DEFAULT[0];
}

function getFallbackCategoryKey(
  category: NewsCategory | string | null,
): FallbackCategoryKey {
  if (!category) {
    return "DEFAULT";
  }

  const normalizedCategory = category
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (isNewsCategory(normalizedCategory)) {
    return categoryFallbackMap[normalizedCategory];
  }

  if (normalizedCategory in fallbackImagePools) {
    return normalizedCategory as FallbackCategoryKey;
  }

  if (
    normalizedCategory.includes("MACHINE") ||
    normalizedCategory.includes("LLM") ||
    normalizedCategory.includes("AGENT")
  ) {
    return "MACHINE_LEARNING";
  }

  if (normalizedCategory.includes("STARTUP")) {
    return "STARTUPS";
  }

  if (normalizedCategory.includes("BUSINESS")) {
    return "BUSINESS";
  }

  if (normalizedCategory.includes("DATA")) {
    return "DATA_SCIENCE";
  }

  if (normalizedCategory.includes("TECH")) {
    return "GENERAL_TECHNOLOGY";
  }

  return "DEFAULT";
}

function isNewsCategory(category: string): category is NewsCategory {
  return category in categoryFallbackMap;
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}
