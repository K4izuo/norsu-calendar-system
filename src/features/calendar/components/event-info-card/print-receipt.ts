import { PDFBool, PDFDocument, PDFName, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import QRCode from "qrcode";
import type { EventDetails, ReservationApproval } from "@/interface/user-props";

// ─── Layout constants (points from top of page) ──────────────────────────────
// Adjust CONTENT_X if values appear inside the sidebar, or field Y values if
// they are shifted vertically after calibrating against a printed output.
const TEMPLATE_URL = "/templates/Long Letter Template (1).pdf";
const CONTENT_X = 170;   // left edge of main content (right of sidebar border)
const RIGHT_MARGIN = 35; // right page margin
const FONT_SIZE = 10;
const LINE_H = 13;       // points between wrapped lines
const TABLE_BORDER_WIDTH = 0.5;
const POINTS_PER_INCH = 72;
const LONG_BOND_WIDTH = 8.5 * POINTS_PER_INCH;
const LONG_BOND_HEIGHT = 13 * POINTS_PER_INCH;
const FOOTER_X = 135;
const FOOTER_RIGHT_MARGIN = 18;
const FOOTER_TABLE_Y = 22;
const FOOTER_ROW_H = 10;
const FOOTER_TABLE_H = FOOTER_ROW_H * 3;
const FOOTER_LABEL_W = 127;
const FOOTER_VALUE_W = 122;
const FOOTER_STATUS_LABEL_W = 55;
const FOOTER_PAGE_W = 55;
const FOOTER_FONT_SIZE = 5.2;
const FOOTER_DISCLAIMER_SIZE = 5.1;
const FOOTER_LINE_H = 5;

function setLongBondPageSize(page: PDFPage) {
  page.setSize(LONG_BOND_WIDTH, LONG_BOND_HEIGHT);
  page.setMediaBox(0, 0, LONG_BOND_WIDTH, LONG_BOND_HEIGHT);
  page.setCropBox(0, 0, LONG_BOND_WIDTH, LONG_BOND_HEIGHT);
  page.setBleedBox(0, 0, LONG_BOND_WIDTH, LONG_BOND_HEIGHT);
  page.setTrimBox(0, 0, LONG_BOND_WIDTH, LONG_BOND_HEIGHT);
  page.setArtBox(0, 0, LONG_BOND_WIDTH, LONG_BOND_HEIGHT);
}

function setPrintPreferences(pdfDoc: PDFDocument) {
  const viewerPreferences = pdfDoc.context.obj({
    PrintScaling: PDFName.of("None"),
    PickTrayByPDFSize: PDFBool.True,
  });

  pdfDoc.catalog.set(PDFName.of("ViewerPreferences"), viewerPreferences);
}

// y distance FROM THE TOP of the page for each label row
const Y: Record<string, number> = {
  dateRequested: 93,
  eventName: 113,
  eventTimeDate: 127,
  requestedVenue: 141,
  requestedEquipment: 155,
  eventDescription: 169,
  requiredAttendees: 183,
  additionalDetails: 202,
  requestedBy: 220,
  requestedThrough: 252,
  approvedBy: 284,
  dateTimeFullyApproved: 316,
  qrLabel: 620,
  qrImage: 635,  // top of QR image (90 × 90 pt)
  printedBy: 765,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt12h(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function fmtDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch { return dateStr; }
}

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return iso; }
}

function lastApproval(approvals?: ReservationApproval[]): ReservationApproval | null {
  if (!approvals?.length) return null;
  return approvals
    .filter(a => ["APPROVED", "APPROVE", "ENDORSE"].includes(a.action))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null;
}

function requestorThrough(event: EventDetails): string {
  const t = event.requestor?.type ?? event.requestor_type;
  if (t === "student") return "Student Organization / CSG";
  if (t === "faculty") return "Faculty";
  if (t === "office") return "Head of Office / Dean";
  return "N/A";
}

function formatRequiredAttendees(
  attendees: EventDetails["people_tag"] | string | null | undefined,
): string {
  const names = Array.isArray(attendees)
    ? attendees
    : typeof attendees === "string"
      ? attendees.split(",")
      : [];

  return names
    .map(name => name.trim())
    .filter(Boolean)
    .join(", ");
}

function wrapFooterText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function drawLongBondFooter(page: PDFPage, bold: PDFFont, italic: PDFFont) {
  const { width } = page.getSize();
  const tableWidth = width - FOOTER_X - FOOTER_RIGHT_MARGIN;
  const pageColX = FOOTER_X + tableWidth - FOOTER_PAGE_W;
  const leftTableW = tableWidth - FOOTER_PAGE_W;
  const value1X = FOOTER_X + FOOTER_LABEL_W;
  const statusLabelX = value1X + FOOTER_VALUE_W;
  const statusValueX = statusLabelX + FOOTER_STATUS_LABEL_W;

  page.drawRectangle({
    x: FOOTER_X - 1,
    y: 0,
    width: width - FOOTER_X - 4,
    height: 112,
    color: rgb(1, 1, 1),
  });

  page.drawRectangle({
    x: FOOTER_X,
    y: FOOTER_TABLE_Y,
    width: tableWidth,
    height: FOOTER_TABLE_H,
    borderColor: rgb(0, 0, 0),
    borderWidth: TABLE_BORDER_WIDTH,
  });

  page.drawLine({ start: { x: pageColX, y: FOOTER_TABLE_Y }, end: { x: pageColX, y: FOOTER_TABLE_Y + FOOTER_TABLE_H }, thickness: TABLE_BORDER_WIDTH, color: rgb(0, 0, 0) });
  page.drawLine({ start: { x: value1X, y: FOOTER_TABLE_Y }, end: { x: value1X, y: FOOTER_TABLE_Y + FOOTER_TABLE_H }, thickness: TABLE_BORDER_WIDTH, color: rgb(0, 0, 0) });
  page.drawLine({ start: { x: statusLabelX, y: FOOTER_TABLE_Y }, end: { x: statusLabelX, y: FOOTER_TABLE_Y + FOOTER_ROW_H * 2 }, thickness: TABLE_BORDER_WIDTH, color: rgb(0, 0, 0) });
  page.drawLine({ start: { x: statusValueX, y: FOOTER_TABLE_Y }, end: { x: statusValueX, y: FOOTER_TABLE_Y + FOOTER_ROW_H * 2 }, thickness: TABLE_BORDER_WIDTH, color: rgb(0, 0, 0) });

  for (let i = 1; i <= 2; i++) {
    const y = FOOTER_TABLE_Y + FOOTER_ROW_H * i;
    page.drawLine({ start: { x: FOOTER_X, y }, end: { x: FOOTER_X + leftTableW, y }, thickness: TABLE_BORDER_WIDTH, color: rgb(0, 0, 0) });
  }

  const drawCell = (text: string, x: number, y: number) => {
    page.drawText(text, { x: x + 4, y: y + 3, size: FOOTER_FONT_SIZE, font: bold, color: rgb(0, 0, 0) });
  };

  drawCell("Correspondence ID", FOOTER_X, FOOTER_TABLE_Y + FOOTER_ROW_H * 2);
  drawCell("Issue Date", FOOTER_X, FOOTER_TABLE_Y + FOOTER_ROW_H);
  drawCell("Issue Status", statusLabelX, FOOTER_TABLE_Y + FOOTER_ROW_H);
  drawCell("Reviewed & Authorized by", FOOTER_X, FOOTER_TABLE_Y);
  drawCell("Approved by", statusLabelX, FOOTER_TABLE_Y);

  const pageText = "Page 1 of 1";
  page.drawText(pageText, {
    x: pageColX + (FOOTER_PAGE_W - bold.widthOfTextAtSize(pageText, 8)) / 2,
    y: FOOTER_TABLE_Y + 11,
    size: 8,
    font: bold,
    color: rgb(0, 0, 0),
  });

  const disclaimer = "Disclaimer: The information transmitted by this document is intended only for the person or entity to which it is addressed. This document may contain proprietary, business-confidential and/or privileged material. If you are not the intended recipient of this message, be aware that any use, review, retransmission, distribution, reproduction or any action taken in reliance upon this message is strictly prohibited. If you received this in error, please contact the sender. Thank you.";
  const lines = wrapFooterText(disclaimer, italic, FOOTER_DISCLAIMER_SIZE, tableWidth);
  lines.forEach((line, index) => {
    page.drawText(line, {
      x: FOOTER_X,
      y: FOOTER_TABLE_Y - 8 - index * FOOTER_LINE_H,
      size: FOOTER_DISCLAIMER_SIZE,
      font: italic,
      color: rgb(0, 0, 0),
    });
  });
}

// Draw text value starting right after the label on the same baseline.
// Long values wrap onto subsequent lines at CONTENT_X.
function drawValue(
  page: PDFPage,
  font: PDFFont,
  pageWidth: number,
  pageHeight: number,
  labelText: string,
  value: string,
  yFromTop: number,
) {
  if (!value) return;
  const labelW = font.widthOfTextAtSize(labelText, FONT_SIZE);
  const maxLineW = pageWidth - RIGHT_MARGIN - CONTENT_X;

  const words = value.split(" ");
  let line = "";
  let isFirst = true;
  let y = pageHeight - yFromTop;

  const flush = (text: string) => {
    const x = isFirst ? CONTENT_X + labelW : CONTENT_X;
    page.drawText(text, { x, y, size: FONT_SIZE, font, color: rgb(0, 0, 0) });
    y -= LINE_H;
    isFirst = false;
  };

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    const available = isFirst ? maxLineW - labelW : maxLineW;
    if (font.widthOfTextAtSize(candidate, FONT_SIZE) > available && line) {
      flush(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) flush(line);
}

function clearMainContentBlock(
  page: PDFPage,
  pageWidth: number,
  pageHeight: number,
  yFromTop: number,
  blockHeight: number,
) {
  page.drawRectangle({
    x: CONTENT_X - 2,
    y: pageHeight - (yFromTop + blockHeight),
    width: pageWidth - RIGHT_MARGIN - CONTENT_X + 4,
    height: blockHeight + 4,
    color: rgb(1, 1, 1),
  });
}

function drawLabeledValue(
  page: PDFPage,
  labelFont: PDFFont,
  valueFont: PDFFont,
  pageWidth: number,
  pageHeight: number,
  labelText: string,
  value: string,
  yFromTop: number,
) {
  const labelW = labelFont.widthOfTextAtSize(labelText, FONT_SIZE);
  const maxLineW = pageWidth - RIGHT_MARGIN - CONTENT_X;

  page.drawText(labelText, {
    x: CONTENT_X,
    y: pageHeight - yFromTop,
    size: FONT_SIZE,
    font: labelFont,
    color: rgb(0, 0, 0),
  });

  const words = value.split(" ");
  let line = "";
  let isFirst = true;
  let y = pageHeight - yFromTop;

  const flush = (text: string) => {
    const x = isFirst ? CONTENT_X + labelW : CONTENT_X;
    page.drawText(text, { x, y, size: FONT_SIZE, font: valueFont, color: rgb(0, 0, 0) });
    y -= LINE_H;
    isFirst = false;
  };

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    const available = isFirst ? maxLineW - labelW : maxLineW;
    if (valueFont.widthOfTextAtSize(candidate, FONT_SIZE) > available && line) {
      flush(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) flush(line);
}

function drawPrintedBy(
  page: PDFPage,
  font: PDFFont,
  pageWidth: number,
  pageHeight: number,
  printedBy: string,
) {
  const labelText = "Printed by:  ";
  const valueX = CONTENT_X + font.widthOfTextAtSize(labelText, FONT_SIZE);
  const y = pageHeight - Y.printedBy;
  const signatureW = Math.min(
    Math.max(160, font.widthOfTextAtSize(printedBy, FONT_SIZE) + 12),
    pageWidth - RIGHT_MARGIN - valueX,
  );

  page.drawRectangle({
    x: valueX - 2,
    y: y - 2,
    width: signatureW + 4,
    height: FONT_SIZE + 4,
    color: rgb(1, 1, 1),
  });
  page.drawText(printedBy, { x: valueX, y, size: FONT_SIZE, font, color: rgb(0, 0, 0) });
  page.drawLine({
    start: { x: valueX, y: y - 5 },
    end: { x: valueX + signatureW, y: y - 5 },
    thickness: TABLE_BORDER_WIDTH,
    color: rgb(0, 0, 0),
  });
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function printEventReceipt(
  event: EventDetails,
  printedBy: string,
  baseUrl: string,
): Promise<void> {
  const eventUrl = `${baseUrl}/?eventId=${event.id}`;

  // 1. Load your PDF template
  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) throw new Error(`Could not load receipt template (${res.status})`);
  const templateBytes = await res.arrayBuffer();

  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  setLongBondPageSize(page);
  setPrintPreferences(pdfDoc);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const footerBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const footerItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // 2. Prepare field values
  const approval = lastApproval(event.approvals);

  const approvedByName = approval?.user
    ? `${approval.user.first_name} ${approval.user.last_name}`
    : event.approved_by_user_details
      ? `${event.approved_by_user_details.first_name} ${event.approved_by_user_details.last_name}`
      : (event.approved_by_user ?? "N/A");

  const approvedAt = approval ? fmtDateTime(approval.created_at) : "N/A";

  const equipment = event.equipment?.filter(e => e?.name).length
    ? event.equipment!.map(e => `${e.name} x${e.quantity}`).join(", ")
    : "None";

  const extras: string[] = [];
  const requiredAttendees = formatRequiredAttendees(event.people_tag);
  if (event.outsource) extras.push(`Outsource - ${event.outsource}`);
  if (event.guests?.length) extras.push(`Guests: ${event.guests.map(g => g.name).join(", ")}`);

  const requestedBy = event.reserve_by_user
    || (event.reserved_by_user
      ? `${event.reserved_by_user.first_name} ${event.reserved_by_user.last_name}`
      : "N/A");

  const draw = (label: string, value: string, key: keyof typeof Y) =>
    drawValue(page, font, width, height, label, value, Y[key]);

  // 3. Draw values onto the template
  draw("Date (Requested) ", fmtDate(event.date), "dateRequested");
  draw("Event name: ", event.title_name || "N/A", "eventName");
  draw("Event Time & Date: ",
    `${fmt12h(event.time_start)} - ${fmt12h(event.time_end)}, ${fmtDate(event.date)}` +
    (event.range > 1 ? ` (${event.range} days)` : ""), "eventTimeDate");
  draw("Requested Venue: ", event.asset?.asset_name || "N/A", "requestedVenue");
  draw("Requested equipment's: ", equipment, "requestedEquipment");
  draw("Event Description: ", event.description || "N/A", "eventDescription");
  clearMainContentBlock(page, width, height, Y.requiredAttendees - 3, 39);
  drawLabeledValue(page, footerBold, font, width, height, "Required Attendees: ", requiredAttendees || "N/A", Y.requiredAttendees);
  drawLabeledValue(page, footerBold, font, width, height, "Additional Details: ", extras.join("; ") || "N/A", Y.additionalDetails);
  draw("Requested By: ", requestedBy, "requestedBy");
  draw("Requested Through: ", requestorThrough(event), "requestedThrough");
  draw("Approved By: (Includes Date and time) ", `${approvedByName}  —  ${approvedAt}`, "approvedBy");
  draw("Date and Time (Fully Approved) ", approvedAt, "dateTimeFullyApproved");
  drawPrintedBy(page, font, width, height, printedBy);

  // 4. Generate QR code PNG and embed it
  try {
    const dataUrl = await QRCode.toDataURL(eventUrl, { width: 90, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
    const base64 = dataUrl.split(",")[1];
    const pngBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const qrImage = await pdfDoc.embedPng(pngBytes);
    page.drawImage(qrImage, {
      x: CONTENT_X,
      y: height - (Y.qrImage + 90),
      width: 90,
      height: 90,
    });
  } catch {
    // QR generation failed silently; receipt still prints without it
  }

  drawLongBondFooter(page, footerBold, footerItalic);

  // 5. Open filled PDF in a new tab and trigger browser print dialog
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, "_blank");
  if (win) {
    win.addEventListener("load", () => win.print());
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000);
}
