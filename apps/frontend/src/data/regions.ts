export interface AWSRegion {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  details: string;
  services: string[];
}

export const awsRegions: AWSRegion[] = [
  { 
    id: 'us-east-1', 
    name: 'N. Virginia', 
    lat: 38.8048, 
    lng: -77.0469, 
    color: '#FF9900', 
    details: 'US East (N. Virginia)',
    services: ['Amazon EC2', 'AWS Lambda', 'Amazon S3', 'Amazon Bedrock', 'AWS Outposts', 'Amazon RDS']
  },
  { 
    id: 'af-south-1', 
    name: 'Cape Town', 
    lat: -33.9249, 
    lng: 18.4241, 
    color: '#FF9900', 
    details: 'Africa (Cape Town)',
    services: ['Amazon EC2', 'Amazon S3', 'AWS Direct Connect', 'Amazon Route 53', 'AWS CloudFormation']
  },
  { 
    id: 'me-south-1', 
    name: 'Bahrain', 
    lat: 26.0667, 
    lng: 50.5577, 
    color: '#FF9900', 
    details: 'Middle East (Bahrain)',
    services: ['Amazon EC2', 'Amazon EBS', 'Amazon S3', 'AWS PrivateLink', 'Amazon VPC', 'AWS Shield']
  },
  { 
    id: 'eu-west-3', 
    name: 'Paris', 
    lat: 48.8566, 
    lng: 2.3522, 
    color: '#FF9900', 
    details: 'Europe (Paris)',
    services: ['Amazon EC2', 'Amazon Aurora', 'AWS Graviton', 'Amazon EFS', 'AWS Glue', 'Amazon SageMaker']
  },
  { 
    id: 'sa-east-1', 
    name: 'São Paulo', 
    lat: -23.5505, 
    lng: -46.6333, 
    color: '#0073BB', 
    details: 'South America (São Paulo)',
    services: ['Amazon EC2', 'Amazon EBS', 'Amazon S3', 'AWS WAF', 'Amazon CloudFront', 'AWS Lambda']
  },
  { 
    id: 'ap-northeast-1', 
    name: 'Tokyo', 
    lat: 35.6762, 
    lng: 139.6503, 
    color: '#0073BB', 
    details: 'Asia Pacific (Tokyo)',
    services: ['Amazon EC2', 'Amazon Bedrock', 'Amazon DynamoDB', 'Amazon Redshift', 'AWS Step Functions']
  },
  { 
    id: 'ap-southeast-2', 
    name: 'Sydney', 
    lat: -33.8688, 
    lng: 151.2093, 
    color: '#0073BB', 
    details: 'Asia Pacific (Sydney)',
    services: ['Amazon EC2', 'Amazon S3', 'AWS Direct Connect', 'Amazon ElastiCache', 'AWS IAM']
  }
];
