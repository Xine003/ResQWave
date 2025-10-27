import { saveAs } from "file-saver";
import * as docx from "docx";
import { jsPDF } from "jspdf";

export interface ExportData {
  title: string;
  totalItems: number;
  status?: string;
  items: Array<{
    term: string;
    definition: string;
  }>;
  summary?: string;
}

// Export to TXT
export const exportToTxt = (data: ExportData) => {
  let content = `${data.title}\n`;
  content += `Total Terms: ${data.totalItems}\n\n`;

  if (data.summary) {
    content += `Summary:\n${data.summary}\n\n`;
  }

  content += `Terms and Definitions:\n\n`;
  data.items.forEach((item, index) => {
    content += `${index + 1}. Term: ${item.term}\n   Definition: ${item.definition
      }\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${data.title}.txt`);
};

// Export to DOCX
export const exportToDocx = async (data: ExportData) => {
  const doc = new docx.Document({
    styles: {
      paragraphStyles: [
        {
          id: "Title",
          name: "Title",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 32,
            bold: true,
            color: "120F1B",
          },
          paragraph: {
            spacing: { before: 240, after: 240 },
            alignment: docx.AlignmentType.CENTER,
          },
        },
        {
          id: "Heading",
          name: "Heading",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 28,
            bold: true,
            color: "3B354D",
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: [
          new docx.Paragraph({
            text: data.title,
            style: "Title",
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `Total Terms: ${data.totalItems}`,
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 400, after: 400 },
          }),
          ...(data.summary
            ? [
              new docx.Paragraph({
                text: "Summary:",
                style: "Heading",
                spacing: { before: 400 },
              }),
              new docx.Paragraph({
                text: data.summary,
                spacing: { before: 200 },
              }),
            ]
            : []),
          new docx.Paragraph({
            text: "Terms and Definitions:",
            style: "Heading",
            spacing: { before: 400 },
          }),
          ...data.items.flatMap((item, index) => [
            new docx.Paragraph({
              text: `${index + 1}. Term: ${item.term}`,
              style: "Heading",
              spacing: { before: 200 },
            }),
            new docx.Paragraph({
              text: `Definition: ${item.definition}`,
              spacing: { before: 100 },
            }),
          ]),
        ],
        footers: {
          default: new docx.Footer({
            children: [
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: "© 2024 Duel-Learn Inc.",
                    size: 18,
                  }),
                  new docx.TextRun({
                    text: "\t\t",
                    size: 18,
                  }),
                  new docx.TextRun({
                    children: [
                      docx.PageNumber.CURRENT,
                      " of ",
                      docx.PageNumber.TOTAL_PAGES,
                    ],
                    size: 18,
                  }),
                ],
                alignment: docx.AlignmentType.JUSTIFIED,
              }),
            ],
          }),
        },
      },
    ],
  });

  const blob = await docx.Packer.toBlob(doc);
  saveAs(blob, `${data.title}.docx`);
};

// Export to PDF
export const exportToPdf = async (data: ExportData, headerImage: string) => {
  const doc = new jsPDF();
  // Set margins: 1.25 inch left/right, 1 inch top/bottom
  const inch = 25.4; // 1 inch in mm
  const marginLeft = 1.25 * inch; // 31.75 mm
  const marginRight = 1.25 * inch; // 31.75 mm
  const marginTop = 1 * inch; // 25.4 mm
  const marginBottom = 1 * inch; // 25.4 mm
  let y = marginTop;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const tableWidth = pageWidth - marginLeft - marginRight;
  // Set both columns to equal width
  const col1w = Math.floor(tableWidth / 2);
  const col2w = tableWidth - col1w;


  // Title (centered, blue, 18)
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(34, 77, 153); // blue
  doc.text('Rescue Operation Report', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Intro/description (black, justified, 11)
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const intro =
    'This document serves as the official report of the rescue operation conducted for the affected community. It records the key information, emergency context, and actions taken to ensure accountability, transparency, and reference for future disaster response efforts.';
  const introLines = doc.splitTextToSize(intro, tableWidth);
  // Render intro lines with normal spacing to preserve spaces
  introLines.forEach((line: string) => {
    doc.text(line, marginLeft, y);
    y += 6;
  });
  y += 12;

  // Section: Community & Terminal Information (same size as main title)
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(34, 77, 153);
  doc.text('Community & Terminal Information', marginLeft, y);
  y += 6;

  // Table: Community Info
  const commTable = [
    ['Neighborhood ID', 'N-01'],
    ["Focal Person’s Name", 'Rosalyn Dela Cruz'],
    ["Focal Person’s Address", 'Paraiso Rd, 1400'],
    ["Focal Person’s Contact Number", '09687342038'],
  ];
  // Table header
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setFillColor(34, 77, 153);
  doc.setTextColor(255, 255, 255);
  doc.rect(marginLeft, y, col1w + col2w, 10, 'F');
  doc.text(commTable[0][0], marginLeft + 1, y + 7);
  doc.text(commTable[0][1], marginLeft + col1w + 1, y + 7);
  y += 10;
  // Table rows
  for (let i = 1; i < commTable.length; i++) {
    // Support multiline for both label and value
    // Remove padding: use full cell width
    // Use slightly reduced width for text wrapping to avoid overflow
    // Add horizontal padding for text inside cells
    const cellPadX = 2;
    const labelLines = doc.splitTextToSize(commTable[i][0], col1w - cellPadX * 2);
    const valueLines = doc.splitTextToSize(commTable[i][1], col2w - cellPadX * 2);
    // Add extra bottom padding for value cell
    const valuePadding = valueLines.length > 1 ? 4 : 0;
    const rowHeight = Math.max(10, labelLines.length * 6, valueLines.length * 6 + valuePadding);
    // If not enough space for row, add new page
    if (y + rowHeight > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
    doc.rect(marginLeft, y, col1w + col2w, rowHeight);
    // Draw label lines (bold)
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let labelY = y + 6;
    labelLines.forEach((line: string, idx: number) => {
      doc.text(line, marginLeft + cellPadX, labelY);
      if (idx < labelLines.length - 1) labelY += 6;
    });
    // Draw value lines (normal)
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    let valY = y + 6;
    valueLines.forEach((line: string, idx: number) => {
      doc.text(line, marginLeft + col1w + cellPadX, valY);
      if (idx < valueLines.length - 1) {
        valY += 6;
      } else {
        // Add extra space after last line for padding
        valY += valuePadding;
      }
    });
    y += rowHeight;
  }
  y += 12;

  // Section: Emergency Context (same size as main title)
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(34, 77, 153);
  doc.text('Emergency Context', marginLeft, y);
  y += 6;

  // Table: Emergency Context
  const emTable = [
    ['Emergency ID', 'EMERGENCY-01'],
    ['Current Situation / Water Level', 'Waist-level inside most houses\nChest-deep near riverbank\nSome families moved to 2nd floors\nFew climbing rooftops (water still rising)'],
    ['Urgency of Evacuation', 'Families on 2nd floors still safe for now\nOne-story houses = urgent evacuation needed\nRising water (fast) — risk of entrapment'],
    ['Hazards Present', 'Live wires hanging near barangay hall\nLeaning electric posts\nStrong current along main road near creek (impassable)\nSmall landslide blocking Zone 5 alley (river path only access)'],
    ['Accessibility', 'Rescue trucks can reach up to Zone 2\nBeyond Zone 2 = boats only\nAbandoned motorcycles/pedicabs on roads'],
    ['Resource Needs', 'Rescue: trapped households\nRelief: evacuees at covered court haven’t eaten since morning\nMedical: 2 evacuees (1 with asthma, 1 with high fever)'],
    ['Other Information', 'N/A'],
    ['Time of Rescue', '3:45 AM, Thursday'],
    ['Alert Type', 'Critical'],
  ];
  // Table header
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setFillColor(34, 77, 153);
  doc.setTextColor(255, 255, 255);
  doc.rect(marginLeft, y, col1w + col2w, 10, 'F');
  doc.text(emTable[0][0], marginLeft + 1, y + 7);
  doc.text(emTable[0][1], marginLeft + col1w + 1, y + 7);
  y += 10;
  // Table rows
  for (let i = 1; i < emTable.length; i++) {
    // Support multiline for both label and value (split on \n, then wrap)
    // Remove padding: use full cell width
    // Add horizontal padding for text inside cells
    const cellPadX = 2;
    const labelLines = doc.splitTextToSize(emTable[i][0], col1w - cellPadX * 2);
    const valueRawLines = emTable[i][1].split('\n');
    let valueLines: string[] = [];
    valueRawLines.forEach(valLine => {
      valueLines = valueLines.concat(doc.splitTextToSize(valLine, col2w - cellPadX * 2));
    });
    // Add extra bottom padding for value cell
    const valuePadding = valueLines.length > 1 ? 4 : 0;
    const rowHeight = Math.max(10, labelLines.length * 6, valueLines.length * 6 + valuePadding);
    // If not enough space for row, add new page
    if (y + rowHeight > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
    // Draw only the outer border, not the vertical separator
    doc.rect(marginLeft, y, col1w + col2w, rowHeight);
    // Draw label lines (bold)
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let labelY = y + 6;
    labelLines.forEach((line: string, idx: number) => {
      doc.text(line, marginLeft + cellPadX, labelY);
      if (idx < labelLines.length - 1) labelY += 6;
    });
    // Draw value lines (normal)
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    let valY = y + 6;
    valueLines.forEach((line: string, idx: number) => {
      doc.text(line, marginLeft + col1w + cellPadX, valY);
      if (idx < valueLines.length - 1) {
        valY += 6;
      } else {
        // Add extra space after last line for padding
        valY += valuePadding;
      }
    });
    y += rowHeight;
  }

  // Add Rescue Completion Details table
  y += 12;
  // If not enough space for table, add new page
  if (y + 50 > pageHeight - marginBottom) {
    doc.addPage();
    y = marginTop;
  }
  // Section title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(34, 77, 153);
  doc.text('Rescue Completion Details', marginLeft, y);
  y += 6;
  // Table data
  const rescueTable = [
    ['Rescue Completion Time', '1:09:46'],
    ['No. of Personnel Deployed', '12'],
    ['Resources Used', '12 Rescue Boats\n48 Rescue Personnel\n200 Life Vests\n15 First Aid Kits\n25 Radios\n6 Emergency Vehicles'],
    ['Actions Taken', 'Removed fallen tree blocking road access\nRescued stranded residents from flooded homes\nEvacuated children, elderly, and PWDs to safe shelter\nCleared debris to reopen evacuation routes'],
  ];
  // Table header
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setFillColor(34, 77, 153);
  doc.setTextColor(255, 255, 255);
  doc.rect(marginLeft, y, col1w + col2w, 10, 'F');
  doc.text(rescueTable[0][0], marginLeft + 1, y + 7);
  doc.text(rescueTable[0][1], marginLeft + col1w + 1, y + 7);
  y += 10;
  // Table rows
  for (let i = 1; i < rescueTable.length; i++) {
    // Support multiline for both label and value (split on \n, then wrap)
    // Remove padding: use full cell width
    // Add horizontal padding for text inside cells
    const cellPadX = 2;
    const labelLines = doc.splitTextToSize(rescueTable[i][0], col1w - cellPadX * 2);
    const valueRawLines = rescueTable[i][1].split('\n');
    let valueLines: string[] = [];
    valueRawLines.forEach(valLine => {
      valueLines = valueLines.concat(doc.splitTextToSize(valLine, col2w - cellPadX * 2));
    });
    // Add extra bottom padding for value cell
    const valuePadding = valueLines.length > 1 ? 4 : 0;
    const rowHeight = Math.max(10, labelLines.length * 6, valueLines.length * 6 + valuePadding);
    // If not enough space for row, add new page
    if (y + rowHeight > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
    // Draw only the outer border, not the vertical separator
    doc.rect(marginLeft, y, col1w + col2w, rowHeight);
    // Draw label lines (bold)
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let labelY = y + 6;
    labelLines.forEach((line: string, idx: number) => {
      doc.text(line, marginLeft + cellPadX, labelY);
      if (idx < labelLines.length - 1) labelY += 6;
    });
    // Draw value lines (normal)
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    let valY = y + 6;
    valueLines.forEach((line: string, idx: number) => {
      doc.text(line, marginLeft + col1w + cellPadX, valY);
      if (idx < valueLines.length - 1) {
        valY += 6;
      } else {
        // Add extra space after last line for padding
        valY += valuePadding;
      }
    });
    y += rowHeight;
  }

  // Footer: page number
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    // Clear background behind page number to prevent overlap
    const pageNumText = `Page | ${i}`;
    const textWidth = doc.getTextWidth(pageNumText);
    const xRight = pageWidth - marginRight;
    const yBottom = pageHeight - 10;
    doc.setFillColor(255, 255, 255);
    doc.rect(xRight - textWidth - 2, yBottom - 4, textWidth + 4, 10, 'F');
    doc.setTextColor(100, 100, 100);
    doc.text(pageNumText, xRight, yBottom, { align: 'right' });
  }

  // Instead of download, open in new tab (for integration)
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
};
