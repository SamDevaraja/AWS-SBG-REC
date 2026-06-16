import { PrismaClient } from '@prisma/client';
import { seedCategories } from './seed-categories';
import { seedServicesPart1 } from './seed-services-part1';
import { seedServicesPart2 } from './seed-services-part2';
import { seedServicesPart3 } from './seed-services-part3';
import { seedServicesPart4 } from './seed-services-part4';
import { seedServicesPart5 } from './seed-services-part5';

const prisma = new PrismaClient();

const categoriesData = [
  { slug: "north-america", name: "US North America", flag: "https://flagcdn.com/us.svg", displayOrder: 1 },
  { slug: "europe", name: "Europe", flag: "https://flagcdn.com/eu.svg", displayOrder: 2 },
  { slug: "india", name: "India", flag: "https://flagcdn.com/in.svg", displayOrder: 3 },
  { slug: "singapore", name: "Asia Pacific", flag: "https://flagcdn.com/sg.svg", displayOrder: 4 },
  { slug: "japan", name: "Japan", flag: "https://flagcdn.com/jp.svg", displayOrder: 5 },
  { slug: "korea", name: "Korea", flag: "https://flagcdn.com/kr.svg", displayOrder: 6 },
  { slug: "middle-east", name: "Middle East", flag: "https://flagcdn.com/ae.svg", displayOrder: 7 },
  { slug: "africa", name: "Africa", flag: "https://flagcdn.com/za.svg", displayOrder: 8 },
  { slug: "south-america", name: "South America", flag: "https://flagcdn.com/br.svg", displayOrder: 9 },
  { slug: "australia", name: "Australia", flag: "https://flagcdn.com/au.svg", displayOrder: 10 },
];

const regionsData = [
  {
    awsRegionCode: "us-east-1",
    name: "US East (N. Virginia)",
    regionCode: "US",
    latitude: 38.8048,
    longitude: -77.0469,
    categorySlug: "north-america",
    flag: "🇺🇸",
    infrastructureDescription: "One of the oldest and largest AWS regions, containing multiple massive data centers and Availability Zones.",
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
    ],
    aiCapabilities: ["SageMaker Model Hosting", "Bedrock Foundation Models", "GPU Accelerators (P4/P5)", "Trainium/Inferentia Clusters"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon EKS", "Amazon Aurora", "AWS Lambda"],
    workloads: ["Enterprise-scale generative AI applications", "Core financial transaction backends", "High-throughput data ingestion grids"]
  },
  {
    awsRegionCode: "us-west-2",
    name: "US West (Oregon)",
    regionCode: "US",
    latitude: 45.8405,
    longitude: -119.7014,
    categorySlug: "north-america",
    flag: "🇺🇸",
    infrastructureDescription: "A major US West Coast hub powered largely by renewable energy, supporting massive scalable compute grids.",
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
    ],
    aiCapabilities: ["SageMaker Studio", "Bedrock APIs", "GPU Compute Instances (G5/P4)", "Inferentia Nodes"],
    topServices: ["Amazon EKS", "Amazon Aurora", "Amazon ECS", "AWS Batch"],
    workloads: ["High-performance media rendering", "Large-scale scientific simulations", "SaaS product hosting"]
  },
  {
    awsRegionCode: "ca-central-1",
    name: "Canada (Central)",
    regionCode: "CA",
    latitude: 45.4215,
    longitude: -75.6972,
    categorySlug: "north-america",
    flag: "🇨🇦",
    infrastructureDescription: "AWS central Canada region designed to meet strict local data sovereignty and security regulations.",
    services: [
      "Cloud hosting",
      "Secure public sector storage",
      "Data warehouse indexing"
    ],
    benefits: [
      "Canadian compliance alignment",
      "Low latency for Canadian users",
      "Robust disaster recovery options"
    ],
    aiCapabilities: ["SageMaker Pipelines", "Amazon Rekognition", "Amazon Lex"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon RDS", "Amazon EMR"],
    workloads: ["Canadian public sector applications", "Local retail analytics engines", "Sovereign storage compliance"]
  },
  {
    awsRegionCode: "eu-west-1",
    name: "Europe (Ireland)",
    regionCode: "IE",
    latitude: 53.3498,
    longitude: -6.2603,
    categorySlug: "europe",
    flag: "🇮🇪",
    infrastructureDescription: "AWS's primary European region, providing a huge footprint of compute, storage, and networking capacity.",
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
    ],
    aiCapabilities: ["SageMaker Canvas", "Bedrock Inference", "GPU Graphics Instances", "Amazon Translate"],
    topServices: ["Amazon S3", "Amazon EC2", "Amazon EKS", "Amazon Redshift"],
    workloads: ["Pan-European SaaS platforms", "GDPR-compliant data storage", "Financial transaction ledgers"]
  },
  {
    awsRegionCode: "eu-central-1",
    name: "Europe (Germany)",
    regionCode: "DE",
    latitude: 50.1109,
    longitude: 8.6821,
    categorySlug: "europe",
    flag: "🇩🇪",
    infrastructureDescription: "Highly secure region based in Frankfurt, complying with Germany's strict federal data security regulations.",
    services: [
      "Compliant secure storage",
      "Industrial IoT backends",
      "Automotive simulation grids"
    ],
    benefits: [
      "DGSVO / GDPR conformity",
      "Central European geographic hub",
      "Extremely secure environments"
    ],
    aiCapabilities: ["SageMaker Model registry", "Amazon Textract", "Amazon Comprehend"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon Aurora", "AWS IoT Core"],
    workloads: ["Industrial IoT telemetry grids", "Automotive supply-chain tracking", "Strict German data privacy nodes"]
  },
  {
    awsRegionCode: "eu-south-1",
    name: "Europe (Italy)",
    regionCode: "IT",
    latitude: 45.4408,
    longitude: 9.1840,
    categorySlug: "europe",
    flag: "🇮🇹",
    infrastructureDescription: "Local Italian region providing highly performant resources to Southern European markets.",
    services: [
      "Microservices API hosting",
      "Disaster recovery targets",
      "Local edge processing"
    ],
    benefits: [
      "Data sovereignty for Italian enterprises",
      "Sub-10ms response times locally",
      "High availability clustering"
    ],
    aiCapabilities: ["SageMaker Studio Notebooks", "Amazon Polly"],
    topServices: ["Amazon EC2", "Amazon RDS", "AWS Lambda", "Amazon SQS"],
    workloads: ["Italian public administration portals", "Local media distribution hubs", "Disaster recovery targets"]
  },
  {
    awsRegionCode: "eu-north-1",
    name: "Europe (Sweden)",
    regionCode: "SE",
    latitude: 59.3293,
    longitude: 18.0686,
    categorySlug: "europe",
    flag: "🇸🇪",
    infrastructureDescription: "Nordic region designed for high efficiency and sustainability, matching local green energy initiatives.",
    services: [
      "High-efficiency compute",
      "Real-time streaming backends",
      "Analytics platforms"
    ],
    benefits: [
      "Low carbon footprint operations",
      "Fast access for Baltic and Nordic users",
      "Strong compliance standards"
    ],
    aiCapabilities: ["SageMaker Data Wrangler", "Amazon Kendra"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon ECS", "Amazon DynamoDB"],
    workloads: ["Nordic green-energy monitoring platforms", "Baltic streaming services backends", "Localized secure application hosting"]
  },
  {
    awsRegionCode: "ap-south-1",
    name: "India (Mumbai)",
    regionCode: "IN",
    latitude: 19.0760,
    longitude: 72.8777,
    categorySlug: "india",
    flag: "🇮🇳",
    infrastructureDescription: "A key South Asian region supporting millions of digital developers, startups, and enterprise companies.",
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
    ],
    aiCapabilities: ["SageMaker Model Hosting", "Bedrock APIs", "Amazon Rekognition", "Amazon Lex"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon EKS", "Amazon DynamoDB", "Amazon RDS"],
    workloads: ["High-volume mobile banking gateways", "E-commerce transactional backends", "Start-up app microservice grids"]
  },
  {
    awsRegionCode: "ap-south-2",
    name: "India (Hyderabad)",
    regionCode: "IN",
    latitude: 17.3850,
    longitude: 78.4860,
    categorySlug: "india",
    flag: "🇮🇳",
    infrastructureDescription: "AWS's second region in India, offering redundancy, backup targets, and low latency for Central/Southern India.",
    services: [
      "Regional database replication",
      "Enterprise analytics pipelines",
      "Disaster recovery solutions"
    ],
    benefits: [
      "Intra-country disaster recovery",
      "High compliance alignment",
      "Enhanced local routing speeds"
    ],
    aiCapabilities: ["SageMaker Pipelines", "Amazon Translate"],
    topServices: ["Amazon EC2", "Amazon Aurora", "Amazon S3", "AWS Backup"],
    workloads: ["Disaster recovery replicas for Mumbai", "Telco network analytics pipelines", "Sovereign local cloud storage"]
  },
  {
    awsRegionCode: "ap-southeast-1",
    name: "Singapore",
    regionCode: "SG",
    latitude: 1.3521,
    longitude: 103.8198,
    categorySlug: "singapore",
    flag: "🇸🇬",
    infrastructureDescription: "The primary Southeast Asian hub, acting as the gateway for regional web, mobile, and SaaS delivery.",
    services: [
      "FinTech processing gateways",
      "SaaS multi-tenant clusters",
      "Dynamic content delivery"
    ],
    benefits: [
      "Gateway to ASEAN markets",
      "High density global connections",
      "Ultra-fast trans-pacific routes"
    ],
    aiCapabilities: ["SageMaker Studio", "Bedrock Inference", "Amazon Translate", "Amazon Lex"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon EKS", "Amazon Aurora"],
    workloads: ["ASEAN FinTech microservices hubs", "Multi-tenant SaaS distribution nodes", "Regional CDN edge ingestions"]
  },
  {
    awsRegionCode: "ap-southeast-2",
    name: "Sydney",
    regionCode: "AU",
    latitude: -33.8688,
    longitude: 151.2093,
    categorySlug: "australia",
    flag: "🇦🇺",
    infrastructureDescription: "AWS region in Australia ensuring high-speed local data residency and compliance for Oceania.",
    services: [
      "Enterprise web systems",
      "Mining and industrial analytics",
      "Media streaming backends"
    ],
    benefits: [
      "Oceania data sovereignty",
      "Sub-15ms local latency",
      "Subsea fiber connectivity"
    ],
    aiCapabilities: ["SageMaker Pipelines", "Amazon Kendra", "Amazon Textract"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon RDS", "Amazon EMR"],
    workloads: ["Natural resource exploration analytics", "Oceania banking portals", "Regional government cloud backends"]
  },
  {
    awsRegionCode: "ap-northeast-1",
    name: "Tokyo",
    regionCode: "JP",
    latitude: 35.6762,
    longitude: 139.6503,
    categorySlug: "japan",
    flag: "🇯🇵",
    infrastructureDescription: "One of the busiest Asian regions, running highly automated services for Japanese and East Asian consumer grids.",
    services: [
      "Gaming platform hosting",
      "Financial processing backends",
      "AI/ML model processing"
    ],
    benefits: [
      "Ultra-low latency for East Asia",
      "Massive network throughput",
      "Disaster resilient design"
    ],
    aiCapabilities: ["SageMaker Model Hosting", "Bedrock Foundation Models", "GPU Clusters (P4)", "Trainium Nodes"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon EKS", "Amazon Aurora", "Amazon DynamoDB"],
    workloads: ["High-throughput gaming backends", "East Asian financial transaction hubs", "Real-time robotics telemetry processing"]
  },
  {
    awsRegionCode: "ap-northeast-2",
    name: "Seoul",
    regionCode: "KR",
    latitude: 37.5665,
    longitude: 126.9780,
    categorySlug: "korea",
    flag: "🇰🇷",
    infrastructureDescription: "State-of-the-art data centers in South Korea supporting gaming, mobile AdTech, and e-commerce.",
    services: [
      "High-speed game backends",
      "IoT telemetry collectors",
      "E-commerce databases"
    ],
    benefits: [
      "Extremely low latency for South Korea",
      "Optimized regional fiber peering",
      "Korea ISMS certification support"
    ],
    aiCapabilities: ["SageMaker Canvas", "Amazon Rekognition"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon ECS", "Amazon DynamoDB"],
    workloads: ["High-speed mobile game platform hosting", "IoT factory sensor networks", "Korean ISMS-compliant enterprise backends"]
  },
  {
    awsRegionCode: "me-central-1",
    name: "UAE",
    regionCode: "AE",
    latitude: 24.4539,
    longitude: 54.3773,
    categorySlug: "middle-east",
    flag: "🇦🇪",
    infrastructureDescription: "Expanding cloud footprint in the UAE, powering smart city initiatives and public sector digital transformation.",
    services: [
      "Smart city data platforms",
      "Government portal backends",
      "Secure localized enterprise databases"
    ],
    benefits: [
      "Middle East data residency conformity",
      "Enhanced GCC routing latency",
      "Localized compliance frameworks"
    ],
    aiCapabilities: ["SageMaker Pipelines", "Amazon Lex", "Amazon Translate"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon RDS", "AWS IoT Core"],
    workloads: ["Smart-city database hubs", "GCC government digital portal backends", "Localized oil & gas IoT analytics"]
  },
  {
    awsRegionCode: "af-south-1",
    name: "South Africa",
    regionCode: "ZA",
    latitude: -33.9249,
    longitude: 18.4241,
    categorySlug: "africa",
    flag: "🇿🇦",
    infrastructureDescription: "The primary AWS gateway for the African continent, supporting regional cloud growth.",
    services: [
      "Cloud migrations",
      "Regional web hosting",
      "Data indexing pipelines"
    ],
    benefits: [
      "Sovereign African data hosting",
      "Lower latency across Sub-Saharan regions",
      "Development support"
    ],
    aiCapabilities: ["SageMaker Studio", "Amazon Comprehend"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon ECS", "Amazon Aurora"],
    workloads: ["Sub-Saharan mobile financial platforms", "African e-commerce backend hosting", "Local data residency compliance nodes"]
  },
  {
    awsRegionCode: "sa-east-1",
    name: "Brazil",
    regionCode: "BR",
    latitude: -23.5505,
    longitude: -46.6333,
    categorySlug: "south-america",
    flag: "🇧🇷",
    infrastructureDescription: "The key AWS region for South America, serving major enterprises, FinTechs, and government agencies.",
    services: [
      "Financial application backends",
      "Dynamic database hosting",
      "Global caching"
    ],
    benefits: [
      "Local latency reduction for South America",
      "Brazilian tax/regulatory compliance support",
      "High availability redundancy"
    ],
    aiCapabilities: ["SageMaker Pipelines", "Amazon Rekognition", "Amazon Lex"],
    topServices: ["Amazon EC2", "Amazon S3", "Amazon EKS", "Amazon DynamoDB"],
    workloads: ["Latin American digital bank backends", "Brazilian tax-compliance processing systems", "High-density retail databases"]
  }
];

const regionalSpecs: Record<string, any> = {
  "us-east-1": {
    zones: 6,
    launchYear: 2006,
    primaryLocation: "Virginia, USA",
    compliance: "FedRAMP, HIPAA, SOC, ISO",
    totalServices: "250+",
    aimlServices: "40+",
    analyticsServices: "30+",
    networkingServices: "25+",
    edgeLocations: "100+",
    directConnect: "Available",
    reach: "Global",
    latency: "Ultra-low across North America"
  },
  "us-west-2": {
    zones: 4,
    launchYear: 2011,
    primaryLocation: "Oregon, USA",
    compliance: "SOC, ISO, HIPAA",
    totalServices: "240+",
    aimlServices: "40+",
    analyticsServices: "28+",
    networkingServices: "24+",
    edgeLocations: "90+",
    directConnect: "Available",
    reach: "Americas & Asia Pacific",
    latency: "Optimized West Coast access"
  },
  "ca-central-1": {
    zones: 3,
    launchYear: 2016,
    primaryLocation: "Montreal",
    compliance: "Canadian Data Residency",
    totalServices: "200+",
    aimlServices: "25+",
    analyticsServices: "22+",
    networkingServices: "20+",
    edgeLocations: "15+",
    directConnect: "Available",
    reach: "Canada & North America",
    latency: "Optimized for Canadian users"
  },
  "eu-west-1": {
    zones: 3,
    launchYear: 2007,
    primaryLocation: "Dublin",
    compliance: "GDPR, ISO, SOC",
    totalServices: "220+",
    aimlServices: "35+",
    analyticsServices: "25+",
    networkingServices: "22+",
    edgeLocations: "30+",
    directConnect: "Available",
    reach: "Europe & Global",
    latency: "Ultra-low across Ireland and UK"
  },
  "eu-central-1": {
    zones: 3,
    launchYear: 2014,
    primaryLocation: "Frankfurt",
    compliance: "GDPR, BSI Standards",
    totalServices: "220+",
    aimlServices: "35+",
    analyticsServices: "25+",
    networkingServices: "22+",
    edgeLocations: "35+",
    directConnect: "Available",
    reach: "Central Europe",
    latency: "Sub-15ms across major EU markets"
  },
  "eu-south-1": {
    zones: 3,
    launchYear: 2020,
    primaryLocation: "Milan",
    compliance: "GDPR",
    totalServices: "190+",
    aimlServices: "25+",
    analyticsServices: "20+",
    networkingServices: "18+",
    edgeLocations: "15+",
    directConnect: "Available",
    reach: "Southern Europe",
    latency: "Optimized Mediterranean connectivity"
  },
  "eu-north-1": {
    zones: 3,
    launchYear: 2018,
    primaryLocation: "Stockholm",
    compliance: "GDPR, Nordic Standards",
    totalServices: "210+",
    aimlServices: "30+",
    analyticsServices: "22+",
    networkingServices: "20+",
    edgeLocations: "12+",
    directConnect: "Available",
    reach: "Nordic & Baltic Regions",
    latency: "Low-latency Northern Europe access"
  },
  "ap-south-1": {
    zones: 3,
    launchYear: 2016,
    primaryLocation: "Mumbai",
    compliance: "India Data Residency",
    totalServices: "220+",
    aimlServices: "35+",
    analyticsServices: "25+",
    networkingServices: "22+",
    edgeLocations: "20+",
    directConnect: "Available",
    reach: "South Asia",
    latency: "Optimized for India-wide access"
  },
  "ap-south-2": {
    zones: 3,
    launchYear: 2022,
    primaryLocation: "Hyderabad",
    compliance: "India Data Residency",
    totalServices: "200+",
    aimlServices: "30+",
    analyticsServices: "22+",
    networkingServices: "20+",
    edgeLocations: "20+",
    directConnect: "Available",
    reach: "Central & Southern India",
    latency: "Enhanced intra-country routing"
  },
  "ap-southeast-1": {
    zones: 3,
    launchYear: 2010,
    primaryLocation: "Singapore",
    compliance: "ASEAN Regulations",
    totalServices: "230+",
    aimlServices: "35+",
    analyticsServices: "25+",
    networkingServices: "22+",
    edgeLocations: "25+",
    directConnect: "Available",
    reach: "Southeast Asia",
    latency: "Regional ASEAN gateway"
  },
  "ap-southeast-2": {
    zones: 3,
    launchYear: 2012,
    primaryLocation: "Sydney",
    compliance: "Australian Government Standards",
    totalServices: "210+",
    aimlServices: "30+",
    analyticsServices: "22+",
    networkingServices: "20+",
    edgeLocations: "15+",
    directConnect: "Available",
    reach: "Australia & New Zealand",
    latency: "Low-latency Oceania access"
  },
  "ap-northeast-1": {
    zones: 4,
    launchYear: 2011,
    primaryLocation: "Tokyo",
    compliance: "Financial & Government Standards",
    totalServices: "230+",
    aimlServices: "35+",
    analyticsServices: "25+",
    networkingServices: "22+",
    edgeLocations: "20+",
    directConnect: "Available",
    reach: "East Asia",
    latency: "Ultra-low for Japan"
  },
  "ap-northeast-2": {
    zones: 4,
    launchYear: 2016,
    primaryLocation: "Seoul",
    compliance: "ISMS, Korean Standards",
    totalServices: "210+",
    aimlServices: "30+",
    analyticsServices: "22+",
    networkingServices: "20+",
    edgeLocations: "10+",
    directConnect: "Available",
    reach: "South Korea",
    latency: "Extremely low for local users"
  },
  "me-central-1": {
    zones: 3,
    launchYear: 2022,
    primaryLocation: "Abu Dhabi",
    compliance: "UAE Data Regulations",
    totalServices: "180+",
    aimlServices: "20+",
    analyticsServices: "18+",
    networkingServices: "16+",
    edgeLocations: "10+",
    directConnect: "Available",
    reach: "GCC & Middle East",
    latency: "Optimized Gulf connectivity"
  },
  "af-south-1": {
    zones: 3,
    launchYear: 2020,
    primaryLocation: "Cape Town",
    compliance: "POPIA",
    totalServices: "180+",
    aimlServices: "20+",
    analyticsServices: "18+",
    networkingServices: "16+",
    edgeLocations: "8+",
    directConnect: "Available",
    reach: "African Continent",
    latency: "Reduced Sub-Saharan latency"
  },
  "sa-east-1": {
    zones: 3,
    launchYear: 2011,
    primaryLocation: "São Paulo",
    compliance: "LGPD",
    totalServices: "200+",
    aimlServices: "25+",
    analyticsServices: "20+",
    networkingServices: "18+",
    edgeLocations: "15+",
    directConnect: "Available",
    reach: "Latin America",
    latency: "Optimized South American performance"
  }
};

async function main() {
  console.log("Purging existing database tables...");
  await prisma.aWSService.deleteMany({});
  await prisma.aWSServiceCategory.deleteMany({});
  await prisma.regionWorkload.deleteMany({});
  await prisma.regionTopService.deleteMany({});
  await prisma.regionAiCapability.deleteMany({});
  await prisma.regionBenefit.deleteMany({});
  await prisma.regionService.deleteMany({});
  await prisma.region.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("Seeding geographic categories...");
  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        flag: cat.flag,
        displayOrder: cat.displayOrder,
      },
    });
    categories[cat.slug] = createdCat;
  }

  console.log("Seeding regions and nested specifications...");
  let index = 0;
  for (const r of regionsData) {
    const spec = regionalSpecs[r.awsRegionCode] || {
      zones: 3,
      launchYear: 2026,
      primaryLocation: "Unknown",
      compliance: "ISO",
      totalServices: "150+",
      aimlServices: "10+",
      analyticsServices: "10+",
      networkingServices: "10+",
      edgeLocations: "5+",
      directConnect: "Available",
      reach: "Local",
      latency: "Under evaluation"
    };

    const category = categories[r.categorySlug];
    if (!category) {
      console.warn(`Category slug '${r.categorySlug}' not found for region '${r.awsRegionCode}'. Skipping.`);
      continue;
    }

    const createdRegion = await prisma.region.create({
      data: {
        awsRegionCode: r.awsRegionCode,
        name: r.name,
        regionCode: r.regionCode,
        flag: r.flag,
        flagUrl: `https://flagcdn.com/${r.regionCode.toLowerCase()}.svg`,
        displayOrder: (index++) * 10,
        latitude: r.latitude,
        longitude: r.longitude,
        categoryId: category.id,
        infrastructureDescription: r.infrastructureDescription,
        availabilityZones: spec.zones,
        launchYear: spec.launchYear,
        primaryLocation: spec.primaryLocation,
        compliance: spec.compliance,
        totalServices: spec.totalServices,
        aimlServices: spec.aimlServices,
        analyticsServices: spec.analyticsServices,
        networkingServices: spec.networkingServices,
        edgeLocations: spec.edgeLocations,
        directConnect: spec.directConnect,
        reach: spec.reach,
        latency: spec.latency,
        createdBy: "system-seed",
        updatedBy: "system-seed",
      },
    });

    // Seed services
    for (const serviceName of r.services) {
      await prisma.regionService.create({
        data: {
          name: serviceName,
          regionId: createdRegion.id,
        },
      });
    }

    // Seed benefits
    for (const benefitDesc of r.benefits) {
      await prisma.regionBenefit.create({
        data: {
          description: benefitDesc,
          regionId: createdRegion.id,
        },
      });
    }

    // Seed AI Capabilities
    for (const cap of r.aiCapabilities) {
      await prisma.regionAiCapability.create({
        data: {
          capability: cap,
          regionId: createdRegion.id,
        },
      });
    }

    // Seed Top Services
    for (const name of r.topServices) {
      await prisma.regionTopService.create({
        data: {
          name: name,
          regionId: createdRegion.id,
        },
      });
    }

    // Seed Workloads
    for (const desc of r.workloads) {
      await prisma.regionWorkload.create({
        data: {
          description: desc,
          regionId: createdRegion.id,
        },
      });
    }
  }

  console.log("Seeding AWS Service Categories...");
  const awsCategoriesMap: Record<string, any> = {};
  for (const cat of seedCategories) {
    const created = await prisma.aWSServiceCategory.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
      }
    });
    awsCategoriesMap[cat.slug] = created;
  }

  const allSeedServices = [
    ...seedServicesPart1,
    ...seedServicesPart2,
    ...seedServicesPart3,
    ...seedServicesPart4,
    ...seedServicesPart5
  ];

  console.log(`Seeding ${allSeedServices.length} AWS Services...`);
  for (const s of allSeedServices) {
    const category = awsCategoriesMap[s.categorySlug];
    if (!category) {
      console.warn(`Category slug '${s.categorySlug}' not found for service '${s.serviceCode}'. Skipping.`);
      continue;
    }
    await prisma.aWSService.create({
      data: {
        serviceCode: s.serviceCode,
        name: s.name,
        slug: s.slug,
        categoryId: category.id,
        shortDescription: s.shortDescription,
        fullDescription: s.fullDescription,
        characteristics: s.characteristics,
        features: s.features,
        useCases: s.useCases,
        pricingModels: s.pricingModels,
        relatedServices: s.relatedServices as any, // Json
        iconUrl: `/uploads/services/${s.slug}.svg`,
        keywords: s.keywords,
        awsDocumentationUrl: s.awsDocumentationUrl,
        isFeatured: s.isFeatured,
        status: s.status,
        comparisonTags: s.comparisonTags,
        displayOrder: s.displayOrder,
        isActive: s.isActive,
      }
    });
  }

  console.log("AWS Globe & Services seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
