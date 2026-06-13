export interface Announcement {
  id: string;
  title: string;
  date: string;
  description: string;
  tag: string;
  tagColor: string;
}

export const announcements: Announcement[] = [
  {
    id: "ann-1",
    title: "AWS GenAI Workshop Registration Open",
    date: "June 08, 2026",
    description: "Get hands-on experience building serverless generative AI applications with Amazon Bedrock. Limited seats available!",
    tag: "Workshop",
    tagColor: "orange"
  },
  {
    id: "ann-2",
    title: "Community Day Volunteers Needed",
    date: "June 05, 2026",
    description: "Join the planning committee and help organize the biggest AWS event of the year! Applications close this weekend.",
    tag: "Volunteering",
    tagColor: "blue"
  },
  {
    id: "ann-3",
    title: "New Learning Path Available",
    date: "June 01, 2026",
    description: "Start the AWS Cloud Practitioner learning pathway. Complete it before the end of the month to earn a bonus badge and 200 points.",
    tag: "Learning",
    tagColor: "green"
  },
  {
    id: "ann-4",
    title: "Community Roadmap Updated",
    date: "May 28, 2026",
    description: "Check out the projects, upcoming feature plans, and certification pathways mapped out for Q3 and Q4 2026.",
    tag: "Roadmap",
    tagColor: "purple"
  }
];
