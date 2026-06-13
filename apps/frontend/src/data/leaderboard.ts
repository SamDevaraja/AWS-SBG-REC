export interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  streak: number;
  events: number;
  badge: string;
  avatar?: string;
  isCurrentUser?: boolean;
}

export const leaderboardUsers: LeaderboardUser[] = [
  { rank: 1, name: "Arnav Sharma", points: 2840, streak: 12, events: 15, badge: "Community Legend", avatar: "A" },
  { rank: 2, name: "Jessica Chen", points: 2450, streak: 8, events: 11, badge: "Cloud Master", avatar: "J" },
  { rank: 3, name: "David Miller", points: 2190, streak: 14, events: 9, badge: "Serverless Guru", avatar: "D" },
  { rank: 4, name: "Priya Patel", points: 2010, streak: 0, events: 10, badge: "Tech Evangelist", avatar: "P" },
  { rank: 5, name: "Neil Daniel A", points: 1920, streak: 4, events: 8, badge: "Cloud Builder", avatar: "N", isCurrentUser: true },
  { rank: 6, name: "Hiroshi Sato", points: 1810, streak: 5, events: 7, badge: "DevOps Specialist", avatar: "H" },
  { rank: 7, name: "Elena Rostova", points: 1680, streak: 3, events: 6, badge: "Kubernetes Sage", avatar: "E" },
  { rank: 8, name: "Marcus Johnson", points: 1490, streak: 6, events: 5, badge: "Security Guardian", avatar: "M" },
  { rank: 9, name: "Aisha Diallo", points: 1320, streak: 2, events: 5, badge: "AI Explorer", avatar: "A" },
  { rank: 10, name: "Carlos Santana", points: 1210, streak: 1, events: 4, badge: "Node Ninja", avatar: "C" },
  { rank: 11, name: "Siddharth Sen", points: 1100, streak: 0, events: 4, badge: "Cloud Enthusiast", avatar: "S" },
  { rank: 12, name: "Emily Watson", points: 950, streak: 3, events: 3, badge: "Cloud Explorer", avatar: "E" }
];
