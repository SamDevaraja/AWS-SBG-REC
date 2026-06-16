export interface SeedCategory {
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
}

export const seedCategories: SeedCategory[] = [
  { slug: "compute", name: "Compute", description: "Virtual servers, serverless computing, and edge compute services.", displayOrder: 1 },
  { slug: "storage", name: "Storage", description: "Object, block, file, and archival cloud storage solutions.", displayOrder: 2 },
  { slug: "database", name: "Database", description: "Relational, non-relational, cache, ledger, and graph databases.", displayOrder: 3 },
  { slug: "networking", name: "Networking & Content Delivery", description: "Virtual networks, routing, DNS, CDN, and load balancing.", displayOrder: 4 },
  { slug: "security", name: "Security, Identity, & Compliance", description: "Identity governance, encryption keys, firewalls, and compliance tools.", displayOrder: 5 },
  { slug: "analytics", name: "Analytics", description: "Data warehousing, serverless querying, search, and dashboard visualization.", displayOrder: 6 },
  { slug: "machine-learning", name: "Machine Learning", description: "AI models, natural language processing, vision APIs, and custom training.", displayOrder: 7 },
  { slug: "containers", name: "Containers", description: "Kubernetes, ECS orchestration, and container registry services.", displayOrder: 8 },
  { slug: "developer-tools", name: "Developer Tools", description: "Source repositories, build servers, deploy pipelines, and Cloud IDEs.", displayOrder: 9 },
  { slug: "migration", name: "Migration & Transfer", description: "Application migrations, database transfer, and offline data shipping.", displayOrder: 10 },
  { slug: "media", name: "Media Services", description: "Live streaming, transcoding, media storage, and video delivery.", displayOrder: 11 },
  { slug: "iot", name: "Internet of Things (IoT)", description: "IoT gateways, defender policies, sensor telemetry, and green-grass edge.", displayOrder: 12 },
  { slug: "end-user-computing", name: "End User Computing", description: "Virtual desktops, workspaces, browser streaming, and client portals.", displayOrder: 13 },
  { slug: "business-applications", name: "Business Applications", description: "Contact centers, secure mail, collaborative workspaces, and corporate chat.", displayOrder: 14 },
  { slug: "management", name: "Management & Governance", description: "Infrastructure blueprints, metric monitoring, cost explorer, and audits.", displayOrder: 15 },
  { slug: "integration", name: "Application Integration", description: "Pub/Sub notifications, message queues, workflow steps, and API gateways.", displayOrder: 16 },
  { slug: "customer-engagement", name: "Customer Engagement", description: "E-mail delivery, text alerts, customer messaging, and dynamic campaigns.", displayOrder: 17 },
  { slug: "blockchain", name: "Blockchain", description: "Managed ledgers, blockchain nodes, and ledger query APIs.", displayOrder: 18 },
  { slug: "quantum", name: "Quantum Technologies", description: "Quantum computer access and simulator backends.", displayOrder: 19 },
  { slug: "satellite", name: "Satellite", description: "Ground station communication and satellite downlink scheduling.", displayOrder: 20 },
  { slug: "frontend-mobile", name: "Front-End Web & Mobile", description: "Amplify backends, dynamic location APIs, and web hosting.", displayOrder: 21 }
];
