import { AWSRegion } from "@/data/regions";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  link: string;
  regionId?: string;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "AWS Bedrock: 2026 GenAI breakthroughs",
    summary: "New quantum-accelerated foundation models allow for real-time video generation and reasoning in milliseconds.",
    date: "June 8, 2026",
    category: "AI/ML",
    link: "https://aws.amazon.com/bedrock/",
    regionId: "us-east-1"
  },
  {
    id: "2",
    title: "Cape Town: Local Cloud Adoption Surges",
    summary: "The af-south-1 region sees 200% growth in green energy infrastructure utilization for 2026.",
    date: "June 7, 2026",
    category: "Compute",
    link: "https://aws.amazon.com/about-aws/global-infrastructure/regions_az/",
    regionId: "af-south-1"
  },
  {
    id: "3",
    title: "Bahrain Data Center Expansion Complete",
    summary: "The Middle East (Bahrain) region expands with 3 new availability zones to support financial tech growth.",
    date: "June 5, 2026",
    category: "Infrastructure",
    link: "https://aws.amazon.com/about-aws/global-infrastructure/regions_az/",
    regionId: "me-south-1"
  },
  {
    id: "4",
    title: "Paris: Zero-Carbon Computing Initiative",
    summary: "AWS Paris region becomes the first to achieve 100% real-time carbon tracking for all client workloads.",
    date: "June 3, 2026",
    category: "Sustainability",
    link: "https://aws.amazon.com/sustainability/",
    regionId: "eu-west-3"
  },
  {
    id: "5",
    title: "São Paulo: New Latency Records for Gaming",
    summary: "AWS High-Performance network fabric deployment in South America slashes latency by 40% globally.",
    date: "June 1, 2026",
    category: "Network",
    link: "https://aws.amazon.com/gaming/",
    regionId: "sa-east-1"
  },
  {
    id: "6",
    title: "Tokyo: Advanced Robotics Simulation Hub",
    summary: "New specialized EC2 instances in Tokyo are optimized for large-scale humanoid robot simulation.",
    date: "May 28, 2026",
    category: "Robotics",
    link: "https://aws.amazon.com/robomaker/",
    regionId: "ap-northeast-1"
  }
];

export async function fetchAWSNews(): Promise<NewsItem[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_NEWS;
}
