import EventForm from "@/components/EventForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Report Generator - Core Admin",
  description: "Generate comprehensive reports for AWS Cloud Club REC events.",
};

export default function ReportPage() {
  return <EventForm />;
}
