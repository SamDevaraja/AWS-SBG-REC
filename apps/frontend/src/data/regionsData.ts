export interface AWSRegionData {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  category: string;
  categoryId: string;
  flag: string;
  infrastructure: string;
  services: string[];
  benefits: string[];
}

export const awsRegionsData: AWSRegionData[] = [
  {
    id: "us-east-1",
    name: "US East (N. Virginia)",
    code: "US",
    lat: 8,
    lng: -97,
    category: "US North America",
    categoryId: "north-america",
    flag: "🇺🇸",
    infrastructure: "One of the oldest and largest AWS regions, containing multiple massive data centers and Availability Zones.",
    services: [
      "Compute workloads",
      "Advanced AI/ML services",
      "Enterprise database platforms",
      "Global content delivery (CloudFront)"
    ],
    benefits: [
      "Sub-millisecond local latency",
      "Massive resource capacity",
      "First-tier service rollouts"
    ]
  },
  {
    id: "us-west-2",
    name: "US West (Oregon)",
    code: "US",
    lat: 10,
    lng: -144,
    category: "US North America",
    categoryId: "north-america",
    flag: "🇺🇸",
    infrastructure: "A major US West Coast hub powered largely by renewable energy, supporting massive scalable compute grids.",
    services: [
      "GPU Compute Clusters",
      "High-performance storage",
      "E-commerce scale computing",
      "Serverless orchestration"
    ],
    benefits: [
      "Eco-friendly energy grid",
      "Lower regional operating costs",
      "High availability on the West Coast"
    ]
  },
  {
    id: "ca-central-1",
    name: "Canada (Central)",
    code: "CA",
    lat: 45.4,
    lng: -75.7,
    category: "US North America",
    categoryId: "north-america",
    flag: "🇨🇦",
    infrastructure: "AWS central Canada region designed to meet strict local data sovereignty and security regulations.",
    services: [
      "Cloud hosting",
      "Secure public sector storage",
      "Data warehouse indexing"
    ],
    benefits: [
      "Canadian compliance alignment",
      "Low latency for Canadian users",
      "Robust disaster recovery options"
    ]
  },
  {
    id: "eu-west-1",
    name: "Europe (Ireland)",
    code: "IE",
    lat: 24,
    lng: -20,
    category: "Europe",
    categoryId: "europe",
    flag: "🇮🇪",
    infrastructure: "AWS's primary European region, providing a huge footprint of compute, storage, and networking capacity.",
    services: [
      "Core cloud computing",
      "E-commerce backends",
      "Big data pipelines",
      "Financial transaction hosting"
    ],
    benefits: [
      "GDPR residency support",
      "Ultra-low latency across Ireland/UK",
      "High density of local direct connects"
    ]
  },
  {
    id: "eu-central-1",
    name: "Europe (Germany)",
    code: "DE",
    lat: 18,
    lng: -8,
    category: "Europe",
    categoryId: "europe",
    flag: "🇩🇪",
    infrastructure: "Highly secure region based in Frankfurt, complying with Germany's strict federal data security regulations.",
    services: [
      "Compliant secure storage",
      "Industrial IoT backends",
      "Automotive simulation grids"
    ],
    benefits: [
      "DGSVO / GDPR conformity",
      "Central European geographic hub",
      "Extremely secure environments"
    ]
  },
  {
    id: "eu-south-1",
    name: "Europe (Italy)",
    code: "IT",
    lat: 45.4,
    lng: 9.1,
    category: "Europe",
    categoryId: "europe",
    flag: "🇮🇹",
    infrastructure: "Local Italian region providing highly performant resources to Southern European markets.",
    services: [
      "Microservices API hosting",
      "Disaster recovery targets",
      "Local edge processing"
    ],
    benefits: [
      "Data sovereignty for Italian enterprises",
      "Sub-10ms response times locally",
      "High availability clustering"
    ]
  },
  {
    id: "eu-north-1",
    name: "Europe (Sweden)",
    code: "SE",
    lat: 59.3,
    lng: 18.0,
    category: "Europe",
    categoryId: "europe",
    flag: "🇸🇪",
    infrastructure: "Nordic region designed for high efficiency and sustainability, matching local green energy initiatives.",
    services: [
      "High-efficiency compute",
      "Real-time streaming backends",
      "Analytics platforms"
    ],
    benefits: [
      "Low carbon footprint operations",
      "Fast access for Baltic and Nordic users",
      "Strong compliance standards"
    ]
  },
  {
    id: "ap-south-1",
    name: "India (Mumbai)",
    code: "IN",
    lat: -6,
    lng: 68,
    category: "India",
    categoryId: "india",
    flag: "🇮🇳",
    infrastructure: "A key South Asian region supporting millions of digital developers, startups, and enterprise companies.",
    services: [
      "Mobile application backends",
      "E-commerce databases",
      "SaaS infrastructure scaling",
      "AdTech processing systems"
    ],
    benefits: [
      "Sovereign Indian data hosting",
      "Fast local load times",
      "Reduced routing latency"
    ]
  },
  {
    id: "ap-south-2",
    name: "India (Hyderabad)",
    code: "IN",
    lat: -9,
    lng: 73,
    category: "India",
    categoryId: "india",
    flag: "🇮🇳",
    infrastructure: "AWS's second region in India, offering redundancy, backup targets, and low latency for Central/Southern India.",
    services: [
      "Regional database replication",
      "Enterprise analytics pipelines",
      "Disaster recovery solutions"
    ],
    benefits: [
      "Intra-country disaster recovery",
      "High compliance alignment",
      "Enhanced local routing speeds"
    ]
  },
  {
    id: "ap-southeast-1",
    name: "Singapore",
    code: "SG",
    lat: -20.4,
    lng: 99,
    category: "Asia Pacific",
    categoryId: "singapore",
    flag: "🇸🇬",
    infrastructure: "The primary Southeast Asian hub, acting as the gateway for regional web, mobile, and SaaS delivery.",
    services: [
      "FinTech processing gateways",
      "SaaS multi-tenant clusters",
      "Dynamic content delivery"
    ],
    benefits: [
      "Gateway to ASEAN markets",
      "High density global connections",
      "Ultra-fast trans-pacific routes"
    ]
  },
  {
    id: "ap-southeast-2",
    name: "Sydney",
    code: "AU",
    lat: -46,
    lng: 148,
    category: "Australia",
    categoryId: "australia",
    flag: "🇦🇺",
    infrastructure: "AWS region in Australia ensuring high-speed local data residency and compliance for Oceania.",
    services: [
      "Enterprise web systems",
      "Mining and industrial analytics",
      "Media streaming backends"
    ],
    benefits: [
      "Oceania data sovereignty",
      "Sub-15ms local latency",
      "Subsea fiber connectivity"
    ]
  },
  {
    id: "ap-northeast-1",
    name: "Tokyo",
    code: "JP",
    lat: 7,
    lng: 138,
    category: "Japan",
    categoryId: "japan",
    flag: "🇯🇵",
    infrastructure: "One of the busiest Asian regions, running highly automated services for Japanese and East Asian consumer grids.",
    services: [
      "Gaming platform hosting",
      "Financial processing backends",
      "AI/ML model processing"
    ],
    benefits: [
      "Ultra-low latency for East Asia",
      "Massive network throughput",
      "Disaster resilient design"
    ]
  },
  {
    id: "ap-northeast-2",
    name: "Seoul",
    code: "KR",
    lat: 7,
    lng: 125,
    category: "Korea",
    categoryId: "korea",
    flag: "🇰🇷",
    infrastructure: "State-of-the-art data centers in South Korea supporting gaming, mobile AdTech, and e-commerce.",
    services: [
      "High-speed game backends",
      "IoT telemetry collectors",
      "E-commerce databases"
    ],
    benefits: [
      "Extremely low latency for South Korea",
      "Optimized regional fiber peering",
      "Korea ISMS certification support"
    ]
  },
  {
    id: "me-central-1",
    name: "UAE",
    code: "AE",
    lat: -4,
    lng: 44.3,
    category: "Middle East",
    categoryId: "middle-east",
    flag: "🇦🇪",
    infrastructure: "Expanding cloud footprint in the UAE, powering smart city initiatives and public sector digital transformation.",
    services: [
      "Smart city data platforms",
      "Government portal backends",
      "Secure localized enterprise databases"
    ],
    benefits: [
      "Middle East data residency conformity",
      "Enhanced GCC routing latency",
      "Localized compliance frameworks"
    ]
  },
  {
    id: "af-south-1",
    name: "South Africa",
    code: "ZA",
    lat: -45,
    lng: 18,
    category: "Africa",
    categoryId: "africa",
    flag: "🇿🇦",
    infrastructure: "The primary AWS gateway for the African continent, supporting regional cloud growth.",
    services: [
      "Cloud migrations",
      "Regional web hosting",
      "Data indexing pipelines"
    ],
    benefits: [
      "Sovereign African data hosting",
      "Lower latency across Sub-Saharan regions",
      "Development support"
    ]
  },
  {
    id: "sa-east-1",
    name: "Brazil",
    code: "BR",
    lat: -30,
    lng: -60,
    category: "South America",
    categoryId: "south-america",
    flag: "🇧🇷",
    infrastructure: "The key AWS region for South America, serving major enterprises, FinTechs, and government agencies.",
    services: [
      "Financial application backends",
      "Dynamic database hosting",
      "Global caching"
    ],
    benefits: [
      "Local latency reduction for South America",
      "Brazilian tax/regulatory compliance support",
      "High availability redundancy"
    ]
  }
];
