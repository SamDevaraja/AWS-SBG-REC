export interface PointsGrowth {
  week: string;
  points: number;
}

export interface Participation {
  month: string;
  attended: number;
}

export interface AchievementCategory {
  name: string;
  value: number;
  color: string;
}

// User points growth (Neil Daniel A)
export const pointsProgress: PointsGrowth[] = [
  { week: "Week 1", points: 800 },
  { week: "Week 2", points: 1100 },
  { week: "Week 3", points: 1350 },
  { week: "Week 4", points: 1550 },
  { week: "Week 5", points: 1720 },
  { week: "Week 6", points: 1920 }
];

// Events participation trend
export const participationTrend: Participation[] = [
  { month: "Jan", attended: 1 },
  { month: "Feb", attended: 2 },
  { month: "Mar", attended: 1 },
  { month: "Apr", attended: 3 },
  { month: "May", attended: 1 },
  { month: "Jun", attended: 4 }
];

// Achievement Distribution categories
export const achievementDistribution: AchievementCategory[] = [
  { name: "Events", value: 35, color: "#FF9900" },
  { name: "Certifications", value: 25, color: "#0073BB" },
  { name: "Quizzes", value: 20, color: "#005C63" },
  { name: "Community Activities", value: 20, color: "#0A6A70" }
];
