import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
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

// y distance FROM THE TOP of the page for each label row
const Y: Record<string, number> = {
  dateRequested: 93,
  eventName: 113,
  eventTimeDate: 127,
  requestedVenue: 141,
  requestedEquipment: 155,
  eventDescription: 169,
  additionalDetails: 183,
  requestedBy: 220,
  requestedThrough: 252,
  approvedBy: 284,
  dateTimeFullyApproved: 316,
  qrLabel: 348,
  qrImage: 360,  // top of QR image (90 × 90 pt)
  printedBy: 465,
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
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

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
  if (event.outsource) extras.push(`Outsource: ${event.outsource}`);
  if (event.guests?.length) extras.push(`Guests: ${event.guests.map(g => g.name).join(", ")}`);

  const requestedBy = event.reserve_by_user
    || (event.reserved_by_user
      ? `${event.reserved_by_user.first_name} ${event.reserved_by_user.last_name}`
      : "N/A");

  const draw = (label: string, value: string, key: keyof typeof Y) =>
    drawValue(page, font, width, height, label, value, Y[key]);

  // 3. Draw values onto the template
  draw("Date (Requested) ",         fmtDate(event.date),                                               "dateRequested");
  draw("Event name: ",              event.title_name || "N/A",                                         "eventName");
  draw("Event Time & Date: ",
    `${fmt12h(event.time_start)} - ${fmt12h(event.time_end)}, ${fmtDate(event.date)}` +
    (event.range > 1 ? ` (${event.range} days)` : ""),                                                 "eventTimeDate");
  draw("Requested Venue: ",         event.asset?.asset_name || "N/A",                                  "requestedVenue");
  draw("Requested equipment's: ",   equipment,                                                          "requestedEquipment");
  draw("Event Description: ",       event.description || "N/A",                                        "eventDescription");
  draw("Additional Details: ",      extras.join("; ") || "N/A",                                        "additionalDetails");
  draw("Requested By: ",            requestedBy,                                                        "requestedBy");
  draw("Requested Through: ",       requestorThrough(event),                                            "requestedThrough");
  draw("Approved By: (Includes Date and time) ", `${approvedByName}  —  ${approvedAt}`,                "approvedBy");
  draw("Date and Time (Fully Approved) ",         approvedAt,                                           "dateTimeFullyApproved");
  draw("Printed by:  ",             printedBy,                                                          "printedBy");

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
