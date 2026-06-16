import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
  PageBreak,
} from "docx";

const FONT = "Times New Roman";

interface ReportBodySection {
  id: string;
  title: string;
  content: string;
}

interface ReportData {
  eventName: string;
  eventNumber: number;
  academicYear: string;
  place: string;
  time: string;
  abstract: string;
  agendaItems: string[];
  coreMembers: string[];
  crewMembers: string[];
  participationCount: number;
  bodySections: ReportBodySection[];
}


function centeredBold(text: string, sizePt: number): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 0 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: sizePt * 2,
        bold: true,
      }),
    ],
  });
}

function justifiedBody(text: string, spaceBefore = 12, spaceAfter = 12): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: spaceBefore * 20, after: spaceAfter * 20 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 28,
      }),
    ],
  });
}

function emptyPara(count = 1): Paragraph[] {
  return Array.from({ length: count }, () =>
    new Paragraph({ spacing: { after: 0 }, children: [] })
  );
}

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
};

function labelCell(text: string): TableCell {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, font: FONT, size: 34, bold: true }),
        ],
      }),
    ],
  });
}

function valueCell(text: string, centered = true): TableCell {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    children: [
      new Paragraph({
        alignment: centered ? AlignmentType.CENTER : undefined,
        children: [
          new TextRun({ text, font: FONT, size: 34, bold: false }),
        ],
      }),
    ],
  });
}

function multiLineValueCell(lines: string[]): TableCell {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    children: lines.map(
      (line) =>
        new Paragraph({
          children: [
            new TextRun({ text: line, font: FONT, size: 34, bold: false }),
          ],
        })
    ),
  });
}

export async function generateReport(data: ReportData): Promise<Buffer> {
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
  } = data;

  const abstractParagraphs = abstract
    .split("\n")
    .filter((p) => p.trim())
    .map((p) => justifiedBody(p.trim()));

  const doc = new Document({
    styles: {
      default: {
        heading2: {
          run: { font: FONT, size: 38, bold: true },
        },
        heading3: {
          run: { font: FONT, size: 32, bold: true },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertInchesToTwip(8.27),
              height: convertInchesToTwip(11.69),
            },
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: [
          // ============================================================
          // PAGE 1: COVER PAGE
          // ============================================================
          centeredBold("AWS CLOUD CLUB REC", 28),
          centeredBold("RAJALAKSHMI ENGINEERING COLLEGE", 28),
          ...emptyPara(35),
          centeredBold(`EVENT-${eventNumber} REPORT`, 32),
          centeredBold(eventName, 32),
          centeredBold(`(${academicYear})`, 28),
          ...emptyPara(2),

          // Page break before abstract
          new Paragraph({
            children: [new PageBreak()],
          }),

          centeredBold("ABSTRACT", 28),
          ...abstractParagraphs,
          ...emptyPara(9),

          // EVENT AGENDA heading
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: "EVENT AGENDA",
                font: FONT,
                size: 56,
                bold: true,
              }),
            ],
          }),
          ...emptyPara(),

          // Agenda items (17pt, justified — matching sample)
          ...agendaItems.map(
            (item) =>
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 0 },
                children: [
                  new TextRun({
                    text: item,
                    font: FONT,
                    size: 34,
                  }),
                ],
              })
          ),
          ...emptyPara(3),

          // Page break before table
          new Paragraph({
            children: [new PageBreak()],
          }),

          // Event Details Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  labelCell("Event Name"),
                  valueCell(eventName),
                ],
              }),
              new TableRow({
                children: [
                  labelCell("Place"),
                  valueCell(place),
                ],
              }),
              new TableRow({
                children: [
                  labelCell("Time"),
                  valueCell(time),
                ],
              }),
              new TableRow({
                children: [
                  labelCell("Core Participation"),
                  multiLineValueCell(coreMembers),
                ],
              }),
              new TableRow({
                children: [
                  labelCell("Crew Participation"),
                  multiLineValueCell(crewMembers),
                ],
              }),
              new TableRow({
                children: [
                  labelCell("Participation Count"),
                  valueCell(String(participationCount)),
                ],
              }),
            ],
          }),

          // ============================================================
          // PAGE 2: REPORT
          // ============================================================
          new Paragraph({
            children: [new PageBreak()],
          }),
          centeredBold(`${eventName} REPORT`, 28),

          // Render sections in reordered / custom sequence
          ...bodySections.flatMap((sec, idx) => {
            const sectionBlocks: Paragraph[] = [];

            // Heading 2 for the section
            sectionBlocks.push(
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
                children: [
                  new TextRun({
                    text: `${idx + 1}. ${sec.title}`,
                    font: FONT,
                    size: 38,
                    bold: true,
                  }),
                ],
              })
            );

            // If it's the proceedings section, apply Heading 3 time-stamp parsing
            if (sec.id === "proceedings") {
              const lines = sec.content.split("\n");
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                if (trimmed.match(/^\d{1,2}:\d{2}\s*(AM|PM)\s*[-–]/i)) {
                  sectionBlocks.push(
                    new Paragraph({
                      heading: HeadingLevel.HEADING_3,
                      spacing: { before: 240, after: 120 },
                      children: [
                        new TextRun({
                          text: trimmed,
                          font: FONT,
                          size: 32,
                          bold: true,
                        }),
                      ],
                    })
                  );
                } else {
                  sectionBlocks.push(justifiedBody(trimmed));
                }
              }
            } else {
              // Standard justified text block for other sections
              const paragraphs = sec.content
                .split("\n")
                .filter((p) => p.trim())
                .map((p) => justifiedBody(p.trim()));
              sectionBlocks.push(...paragraphs);
            }

            return sectionBlocks;
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
