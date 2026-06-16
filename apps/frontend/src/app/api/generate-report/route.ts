import { generateReport } from "@/lib/generate-docx";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      eventName,
      eventNumber,
      academicYear,
      place,
      time,
      abstract,
      agendaItems,
      coreMembers,
      crewMembers,
      participationCount,
      bodySections,
    } = body;

    const buffer = await generateReport({
      eventName,
      eventNumber,
      academicYear,
      place,
      time,
      abstract,
      agendaItems,
      coreMembers,
      crewMembers,
      participationCount,
      bodySections,
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${eventName.replace(/\s+/g, "_")}_Report.docx"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
