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
  // ── FEATURED REVIEW ──
  {
    name: "Neil Daniel",
    role: "2nd Year · CSE Department",
    initials: "ND",
    stars: 5,
    color: "#7C3AED",
    badge: "Robo Walk",
    tag: "Workshops",
    verified: true,
    featured: false,
    text: "Attended Robo Walk — it was an informative session getting to know how robots think and act.",
    event: "Robo Walk · 2025",
  },
  // ── GRID REVIEWS (2 more cards) ──
  {
    name: "Sam Devaraja J",
    role: "2nd Year · CSE Department",
    initials: "SD",
    stars: 5,
    color: "#0073BB",
    badge: "Cloud Matrix",
    tag: "Cloud Basics",
    verified: true,
    featured: false,
    text: "Attended Cloud Matrix — got a clear view on what is cloud, its basics and about certifications and how to build a career in cloud-based jobs.",
  },
  {
    name: "Prathakshanaa T",
    role: "3rd Year · ECE Department",
    initials: "PR",
    stars: 5,
    color: "#FF9900",
    badge: "Robo Walk",
    tag: "Hands-On",
    verified: true,
    featured: false,
    text: "Attended Robo Walk — got hands-on experience and witnessed how robots think and act.",
  },
  {
    name: "Thirunavukarasu",
    role: "3rd Year · R&A Department",
    initials: "TN",
    stars: 5,
    color: "#16A34A",
    badge: "Cloud Matrix",
    tag: "Cloud Basics",
    verified: true,
    featured: false,
    text: "Attended Cloud Matrix — got informative insights about cloud basics and certifications.",
  },
];

export const BUBBLES = [
  { name: "Neil Daniel", role: "CSE · 2nd Year", initials: "ND", color: "#7C3AED", quote: "Robo Walk — how robots think and act!", stars: 5 },
  { name: "Sam Devaraja J", role: "CSE · 2nd Year", initials: "SD", color: "#0073BB", quote: "Cloud Matrix — clear view on cloud careers.", stars: 5 },
  { name: "Prathakshanaa", role: "ECE · 3rd Year", initials: "PR", color: "#FF9900", quote: "Robo Walk — hands-on robot experience.", stars: 5 },
  { name: "Thirunavukarasu", role: "R&A · 3rd Year", initials: "TN", color: "#16A34A", quote: "Cloud Matrix — cloud basics and certs.", stars: 5 },
];
