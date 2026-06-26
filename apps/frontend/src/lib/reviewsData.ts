export interface Review {
  name: string;
  role: string;
  initials: string;
  stars: number;
  color: string;
  badge?: string;
  tag: string;
  verified: boolean;
  featured: boolean;
  text: string;
  event?: string;
}

export const REVIEWS: Review[] = [
  {
    name: "Shruti K",
    role: "2nd Year · CSE Department",
    initials: "SK",
    stars: 5,
    color: "#0073BB",
    badge: "Cloud Matrix",
    tag: "Cloud Computing",
    verified: true,
    featured: false,
    text: "The Cloud Matrix session was informative and interesting. The quiz part was really challenging and engaging. I gained a lot of valuable information about cloud computing and its applications. Overall, it was a great learning experience.",
    event: "Cloud Matrix · 2025",
  },
  {
    name: "Shanthosh Sivan E",
    role: "2nd Year · CSE Department",
    initials: "SS",
    stars: 5,
    color: "#FF9900",
    badge: "Cloud Matrix",
    tag: "Career Insights",
    verified: true,
    featured: false,
    text: "The session was highly interactive and provided me with new insights regarding my career paths in the cloud domain. The quiz was fun, competitive, and kept everyone engaged throughout. Overall, the experience was truly useful and informative.",
    event: "Cloud Matrix · 2025",
  },
  {
    name: "Sachin Saravanan",
    role: "2nd Year · CSE Department",
    initials: "SS",
    stars: 5,
    color: "#16A34A",
    badge: "Cloud Matrix",
    tag: "Real-World Cloud",
    verified: true,
    featured: false,
    text: "The session went in-depth into cloud computing and helped me understand how platforms like Netflix and other websites leverage cloud technologies to operate efficiently. It was an insightful session that gave me a better understanding of real-world cloud applications.",
    event: "Cloud Matrix · 2025",
  },
  {
    name: "Pooja",
    role: "1st Year · CSE Department",
    initials: "PO",
    stars: 5,
    color: "#7C3AED",
    badge: "Robowolke",
    tag: "Robotics",
    verified: true,
    featured: false,
    text: "Robowolke was a truly engaging and insightful experience. I got hands-on experience working with robotics concepts and learned how robots learn, think, act, and make decisions based on the data they receive.",
    event: "Robowolke · 2025",
  },
  {
    name: "Devadarshini",
    role: "2nd Year · CSE Department",
    initials: "DD",
    stars: 5,
    color: "#DC2626",
    badge: "Robowolke",
    tag: "Intelligent Systems",
    verified: true,
    featured: false,
    text: "Robowolke provided a great blend of learning and hands-on practice. It sparked my interest in robotics and intelligent systems.",
    event: "Robowolke · 2025",
  },
];

export const BUBBLES = [
  { name: "Shruti K", role: "CSE · 2nd Year", initials: "SK", color: "#0073BB", quote: "Cloud Matrix — informative, engaging quiz!", stars: 5 },
  { name: "Shanthosh Sivan E", role: "CSE · 2nd Year", initials: "SS", color: "#FF9900", quote: "Cloud Matrix — new career insights in cloud.", stars: 5 },
  { name: "Sachin Saravanan", role: "CSE · 2nd Year", initials: "SS", color: "#16A34A", quote: "Cloud Matrix — real-world cloud applications.", stars: 5 },
  { name: "Pooja", role: "CSE · 1st Year", initials: "PO", color: "#7C3AED", quote: "Robowolke — hands-on robotics experience!", stars: 5 },
  { name: "Devadarshini", role: "CSE · 2nd Year", initials: "DD", color: "#DC2626", quote: "Robowolke — sparked my interest in robotics.", stars: 5 },
];
