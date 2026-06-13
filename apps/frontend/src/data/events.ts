export interface CommunityEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  bannerUrl: string;
  tag: string;
  points: number;
}

export const events: CommunityEvent[] = [
  {
    id: "1",
    name: "AWS Community Day",
    description: "Experience a day of Cloud, Code, Community, and Innovation. Learn from cloud experts, discover modern practices, and connect with fellow developers.",
    date: "Sep 11, 2025",
    time: "9:30 AM",
    venue: "Rajalakshmi Engineering College",
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80",
    tag: "Conference",
    points: 150
  },
  {
    id: "2",
    name: "AWS GenAI Hands-on Workshop",
    description: "Get hands-on experience building serverless generative AI applications with Amazon Bedrock. Build, deploy, and scale intelligent agents.",
    date: "Jun 20, 2026",
    time: "2:00 PM",
    venue: "Virtual (Zoom/Twitch)",
    bannerUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80",
    tag: "Workshop",
    points: 100
  },
  {
    id: "3",
    name: "AWS Cloud Practitioner Bootcamp",
    description: "Prepare for your AWS Certified Cloud Practitioner exam in this intensive guided study session with official practice exam reviews.",
    date: "Jul 15, 2026",
    time: "10:00 AM",
    venue: "Tech Hub, Block C",
    bannerUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1000&auto=format&fit=crop&q=80",
    tag: "Bootcamp",
    points: 200
  }
];
