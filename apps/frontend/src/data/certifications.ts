export type Cert = {
  key: string;
  name: string;
  level: string;
  category: string;
  summary: string;
  highlights: string;
  accent: string;
  detailHtml: string;
};

export const certifications: Cert[] = [
  {
    key: "cloud-practitioner",
    name: "AWS Certified Cloud Practitioner",
    level: "Foundational",
    category: "Foundational",
    summary: "Broad introduction to AWS cloud concepts, pricing, architecture, and security basics.",
    highlights: "Best for first-time AWS learners who want a polished starting point before moving into role-specific tracks.",
    accent: "from-[#ff9900] to-[#f6b74d]",
    detailHtml: `
      <h2>AWS Certified Cloud Practitioner</h2>
      <p><strong>Exam Duration:</strong> 90 minutes</p>
      <p><strong>Total questions:</strong> 65</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 100 USD</p>
      <p><strong>Mode of Examination:</strong> Online or Pearson VUE testing centre</p>
      <h3>Domains</h3>
      <h4>Domain 1 - Cloud Concepts (24%)</h4>
      <ul>
        <li>Benefits of cloud computing</li>
        <li>AWS cloud value proposition</li>
        <li>AWS global Infrastructure</li>
        <li>Cloud Migration</li>
        <li>Cloud Economics</li>
      </ul>
      <h4>Domain 2 - Security and Compliance (30%)</h4>
      <ul>
        <li>Shared responsibility model</li>
        <li>Identity and Access Management</li>
        <li>Security services</li>
        <li>Compliance</li>
        <li>Monitoring and Auditing</li>
      </ul>
      <h4>Domain 3 - Cloud Technology and Services (34%)</h4>
      <ul>
        <li>Compute, Storage, Database, Networking</li>
        <li>Application Integration, Container services</li>
        <li>Migration services, Well-Architected Framework</li>
      </ul>
      <h4>Domain 4 - Billing, pricing and Support (12%)</h4>
      <ul>
        <li>Pricing models and cost management tools</li>
        <li>AWS support plans and billing concepts</li>
      </ul>
    `
  },
  {
    key: "ai-practitioner",
    name: "AWS Certified AI Practitioner",
    level: "Foundational",
    category: "AI",
    summary: "Intended for individuals familiar with AI/ML concepts on AWS (non-builders).",
    highlights: "A strong entry point for teams exploring generative AI, prompt design, and responsible AI on AWS.",
    accent: "from-[#7c3aed] to-[#c084fc]",
    detailHtml: `
      <h2>AWS Certified AI Practitioner</h2>
      <p><strong>Exam Duration:</strong> 90 minutes</p>
      <p><strong>Total questions:</strong> 65</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 100 USD</p>
      <h3>Domains</h3>
      <h4>Domain 1: Fundamentals of AI and ML (20%)</h4>
      <ul>
        <li>AI Concepts, Machine Learning Concepts, Data Concepts</li>
        <li>ML Use Cases, ML Lifecycle, AWS AI/ML Services</li>
      </ul>
      <h4>Domain 2: Fundamentals of Generative AI (24%)</h4>
      <ul>
        <li>Generative AI Concepts, Foundation Models, Capabilities and Use Cases</li>
      </ul>
      <h4>Domain 3: Applications of Foundation Models (28%)</h4>
      <ul>
        <li>Prompt engineering, RAG, Fine-tuning, AWS Generative AI Services</li>
      </ul>
      <h4>Domain 4: Guidelines for Responsible AI (14%)</h4>
      <ul>
        <li>Responsible AI principles, bias, transparency</li>
      </ul>
      <h4>Domain 5: Security, Compliance, and Governance for AI Solutions (14%)</h4>
      <ul>
        <li>AI security concepts, privacy, governance</li>
      </ul>
    `
  },
  {
    key: "machine-learning-associate",
    name: "AWS Certified Machine Learning Associate",
    level: "Associate",
    category: "AI / ML",
    summary: "Build, operationalize, and monitor ML solutions on AWS.",
    highlights: "Connects model development to deployment, monitoring, and security so ML feels like a real production skill.",
    accent: "from-[#6d28d9] to-[#22c55e]",
    detailHtml: `
      <h2>AWS Certified Machine Learning Associate</h2>
      <p><strong>Exam Duration:</strong> 130 minutes</p>
      <p><strong>Total questions:</strong> 65</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 150 USD</p>
      <h3>Domains</h3>
      <h4>Domain 1: Data Preparation for Machine Learning (28%)</h4>
      <ul>
        <li>Data ingestion, transformation, validation, storage, feature engineering</li>
      </ul>
      <h4>Domain 2: ML Model Development (26%)</h4>
      <ul>
        <li>Model selection, training, hyperparameter tuning, evaluation</li>
      </ul>
      <h4>Domain 3: Deployment and Orchestration (22%)</h4>
      <ul>
        <li>Model deployment, inference endpoints, CI/CD, orchestration</li>
      </ul>
      <h4>Domain 4: Monitoring, Maintenance, and Security (24%)</h4>
      <ul>
        <li>Model monitoring, data/model drift, logging, security</li>
      </ul>
    `
  },
  {
    key: "solutions-architect-associate",
    name: "AWS Certified Solutions Architect - Associate",
    level: "Associate",
    category: "Architecture",
    summary: "Design secure, resilient, high-performing AWS solutions.",
    highlights: "A flagship architect path that rewards clear thinking about reliability, cost, security, and scale.",
    accent: "from-[#00a3e0] to-[#60a5fa]",
    detailHtml: `
      <h2>AWS Certified Solutions Architect - Associate</h2>
      <p><strong>Exam Duration:</strong> 130 minutes</p>
      <p><strong>Total questions:</strong> 65</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 150 USD</p>
      <h3>Domains</h3>
      <h4>Design Secure Architectures — 30%</h4>
      <ul><li>IAM, security controls, multi-account, encryption, network security</li></ul>
      <h4>Design Resilient Architectures — 26%</h4>
      <ul><li>High availability, fault tolerance, backup and recovery</li></ul>
      <h4>Design High-Performing Architectures — 24%</h4>
      <ul><li>Compute, storage, database, networking, caching strategies</li></ul>
      <h4>Design Cost-Optimized Architectures — 20%</h4>
      <ul><li>Cost management, right-sizing, lifecycle management</li></ul>
    `
  },
  {
    key: "developer-associate",
    name: "AWS Certified Developer - Associate",
    level: "Associate",
    category: "Developer",
    summary: "Build, deploy, and debug cloud-native applications on AWS.",
    highlights: "Best for builders who want to pair application development with serverless, CI/CD, and observability.",
    accent: "from-[#f97316] to-[#facc15]",
    detailHtml: `
      <h2>AWS Certified Developer - Associate</h2>
      <p><strong>Exam Duration:</strong> 130 minutes</p>
      <p><strong>Total questions:</strong> 65</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 150 USD</p>
      <h3>Domains</h3>
      <h4>Development with AWS Services (32%)</h4>
      <ul><li>Application development, Lambda, data stores</li></ul>
      <h4>Security (26%)</h4>
      <ul><li>Authentication, authorization, encryption</li></ul>
      <h4>Deployment (24%)</h4>
      <ul><li>Preparing artifacts, testing, CI/CD</li></ul>
      <h4>Troubleshooting and Optimization (18%)</h4>
      <ul><li>Monitoring, logging, performance, cost optimization</li></ul>
    `
  },
  {
    key: "data-engineer-associate",
    name: "AWS Certified Data Engineer - Associate",
    level: "Associate",
    category: "Data",
    summary: "Build data pipelines, storage layers, and analytics solutions on AWS.",
    highlights: "A practical path for analytics pipelines, governance, and data platform design across AWS services.",
    accent: "from-[#0f766e] to-[#34d399]",
    detailHtml: `
      <h2>AWS Certified Data Engineer - Associate</h2>
      <p><strong>Exam Duration:</strong> 130 minutes</p>
      <p><strong>Total questions:</strong> 65</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 150 USD</p>
      <h3>Domains</h3>
      <h4>Data Ingestion and Transformation (34%)</h4>
      <ul><li>Ingestion, processing, pipeline orchestration</li></ul>
      <h4>Data Store Management (26%)</h4>
      <ul><li>Data modeling, schema design, lifecycle management</li></ul>
      <h4>Data Operations (22%)</h4>
      <ul><li>Monitoring, troubleshooting, performance optimization</li></ul>
      <h4>Data Security and Governance (18%)</h4>
      <ul><li>Authentication, encryption, privacy, governance</li></ul>
    `
  },
  {
    key: "cloud-ops-associate",
    name: "AWS Certified Cloud Ops Engineer - Associate",
    level: "Associate",
    category: "Operations",
    summary: "Deploy, manage, and operate workloads on AWS.",
    highlights: "Operations-focused and ideal for monitoring, automation, remediation, and day-two cloud work.",
    accent: "from-[#334155] to-[#60a5fa]",
    detailHtml: `
      <h2>AWS Certified Cloud Ops Engineer - Associate</h2>
      <p><strong>Exam Duration:</strong> 130 minutes</p>
      <p><strong>Total questions:</strong> 65</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 150 USD</p>
      <h3>Domains</h3>
      <ul>
        <li>Monitoring, Logging, and Remediation (CloudWatch, CloudTrail)</li>
        <li>Reliability and Business Continuity</li>
        <li>Deployment, Provisioning, and Automation (IaC, CDK, CloudFormation)</li>
        <li>Security and Compliance (IAM, encryption)</li>
        <li>Networking and Content Delivery (VPC, Route53)</li>
        <li>Cost and Performance Optimization</li>
      </ul>
    `
  },
  {
    key: "genai-developer",
    name: "AWS Certified Generative AI Developer",
    level: "Professional",
    category: "AI / GenAI",
    summary: "Design and build generative AI applications using foundation models on AWS.",
    highlights: "For builders who want to combine Bedrock, prompting, guardrails, and production-grade AI delivery.",
    accent: "from-[#8b5cf6] to-[#ec4899]",
    detailHtml: `
      <h2>AWS Certified Generative AI Developer</h2>
      <p><strong>Exam Duration:</strong> 180 minutes</p>
      <p><strong>Total questions:</strong> 75</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 300 USD</p>
      <h3>Domains</h3>
      <h4>Foundation Model Integration, Data Management and Compliance (31%)</h4>
      <ul>
        <li>Foundation models, prompt engineering, embeddings, vector DBs, governance</li>
      </ul>
      <h4>Implementation and Integration (26%)</h4>
      <ul>
        <li>Bedrock, multi-model architectures, API patterns, AI agents</li>
      </ul>
      <h4>AI Safety, Security and Governance (20%)</h4>
      <ul>
        <li>Responsible AI, identity, content moderation, guardrails</li>
      </ul>
      <h4>Operational Efficiency (12%)</h4>
      <ul>
        <li>Cost, performance, scalability, monitoring</li>
      </ul>
      <h4>Testing & Troubleshooting (11%)</h4>
      <ul>
        <li>Evaluation techniques, hallucination detection, debugging inference issues</li>
      </ul>
    `
  },
  {
    key: "solutions-architect-professional",
    name: "AWS Certified Solutions Architect - Professional",
    level: "Professional",
    category: "Architecture",
    summary: "Enterprise-scale architecture design, migration, and governance.",
    highlights: "The deep architecture credential for large programs, migration decisions, and complex design tradeoffs.",
    accent: "from-[#0f172a] to-[#f59e0b]",
    detailHtml: `
      <h2>AWS Certified Solutions Architect - Professional</h2>
      <p><strong>Exam Duration:</strong> 180 minutes</p>
      <p><strong>Total questions:</strong> 75</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 300 USD</p>
      <h3>Domains</h3>
      <ul>
        <li>Design for organizational complexity, multi-account, hybrid</li>
        <li>Design for new solutions, HA, performance, cost optimization</li>
        <li>Migration planning and post-migration validation</li>
        <li>Continuous improvement and operational excellence</li>
      </ul>
    `
  },
  {
    key: "devops-professional",
    name: "AWS Certified DevOps Engineer",
    level: "Professional",
    category: "DevOps",
    summary: "Automate SDLC, IaC, CI/CD, resilience and monitoring at scale.",
    highlights: "Ideal for teams that want production automation, governance, and operational excellence to feel connected.",
    accent: "from-[#fb7185] to-[#f97316]",
    detailHtml: `
      <h2>AWS Certified DevOps Engineer</h2>
      <p><strong>Exam Duration:</strong> 180 minutes</p>
      <p><strong>Total questions:</strong> 75</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 300 USD</p>
      <h3>Domains</h3>
      <ul>
        <li>SDLC automation, CI/CD, build and deployment automation</li>
        <li>IaC, configuration management, drift detection</li>
        <li>Resilient cloud solutions, monitoring, incident response, security</li>
      </ul>
    `
  },
  {
    key: "advanced-networking-specialty",
    name: "AWS Certified Advanced Networking - Specialty",
    level: "Specialty",
    category: "Networking",
    summary: "Deep expertise in hybrid and global networking on AWS.",
    highlights: "Designed for hybrid network design, routing, traffic engineering, and secure connectivity at scale.",
    accent: "from-[#1d4ed8] to-[#22d3ee]",
    detailHtml: `
      <h2>AWS Certified Advanced Networking - Specialty</h2>
      <p><strong>Exam Duration:</strong> 170 minutes</p>
      <p><strong>Total questions:</strong> 65</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 300 USD</p>
      <h3>Domains</h3>
      <ul>
        <li>Network design, hybrid connectivity, Direct Connect, Transit Gateway</li>
        <li>Implementation: VPC, Route53, CloudFront, load balancing</li>
        <li>Management: monitoring, observability, capacity planning</li>
        <li>Security, compliance, traffic inspection</li>
      </ul>
    `
  },
  {
    key: "security-specialty",
    name: "AWS Certified Security - Specialty",
    level: "Specialty",
    category: "Security",
    summary: "Expertise in threat detection, incident response, and security governance.",
    highlights: "A strong fit for practitioners who want to turn security, monitoring, and governance into a visible specialty.",
    accent: "from-[#0f766e] to-[#14b8a6]",
    detailHtml: `
      <h2>AWS Certified Security - Specialty</h2>
      <p><strong>Exam Duration:</strong> 170 minutes</p>
      <p><strong>Total questions:</strong> 65</p>
      <p><strong>Format:</strong> Multiple choice or Multiple response</p>
      <p><strong>Cost:</strong> 300 USD</p>
      <h3>Domains</h3>
      <ul>
        <li>Threat detection and incident response, security monitoring</li>
        <li>Logging and monitoring, infrastructure security, IAM</li>
        <li>Data protection, encryption, governance and compliance</li>
      </ul>
    `
  }
];

export function findCert(key: string) {
  return certifications.find((c) => c.key === key) ?? certifications[0];
}
