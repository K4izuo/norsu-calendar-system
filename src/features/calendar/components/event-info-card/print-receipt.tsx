"use client";

import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import QRCode from "qrcode";
import { EventDetails } from "../../../../interface/user-props";

const TEMPLATE_URL = "/templates/Long Letter Template (1).pdf"; // sample layout template
const CONTENT_X = 114; // main content starts just after the sidebar border
const CONTENT_RIGHT = 585;
const CONTENT_W = CONTENT_RIGHT - CONTENT_X;
const FS = 12;
const LINE_H = 15.5;
const DESCRIPTION_FIRST_LINE_INDENT = 39;
const TABLE_BORDER_WIDTH = 0.5;
const TEMPLATE_TOP_SHIFT = 8;
const BLACK = rgb(0, 0, 0);

const STAGE_TITLE: Record<string, string> = {
  vpaa: "Vice President of Academic Affairs",
  vpsas: "Vice President of Student Affairs and Services",
  vpaf: "Vice President of Administration and Finance",
  vprde: "Vice President of Research, Extension, and Development",
  campus_director: "Campus Director",
};

// ─── Format helpers ───────────────────────────────────────────────────────────

function fmt12h(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "P.M." : "A.M."}`;
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
    const d = new Date(iso);
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const suffix = hours >= 12 ? "P.M." : "A.M.";
    const date = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `${date} (${hours % 12 || 12}:${minutes} ${suffix})`;
  } catch { return iso; }
}

function requestorThrough(event: EventDetails): string {
  const t = event.requestor?.type ?? event.requestor_type;
  if (t === "student") return "Student Organization / CSG";
  if (t === "faculty") return "Faculty";
  if (t === "office") return "Head of Office / Dean";
  return "N/A";
}

// ─── Canvas helper ────────────────────────────────────────────────────────────

class Canvas {
  page: PDFPage;
  bold: PDFFont;
  regular: PDFFont;
  h: number; // page height
  y: number; // current Y from page top

  constructor(page: PDFPage, bold: PDFFont, regular: PDFFont, startY = 123) {
    this.page = page;
    this.bold = bold;
    this.regular = regular;
    this.h = page.getSize().height;
    this.y = startY;
  }

  // Convert "Y from page top" → PDF coordinate (origin is bottom-left)
  py(fromTop: number): number { return Math.round(this.h - fromTop); }

  draw(text: string, x: number, font: PDFFont, size = FS) {
    this.page.drawText(text, { x, y: this.py(this.y), size, font, color: BLACK });
  }

  nl(n = 1) { this.y += n * LINE_H; }
  gap(pt: number) { this.y += pt; }

  // Bold label + regular value inline; value wraps if needed
  row(label: string, value: string) {
    const lw = this.bold.widthOfTextAtSize(label, FS);
    this.draw(label, CONTENT_X, this.bold);

    const words = (value || "").split(" ");
    let line = "";
    let first = true;

    const flush = () => {
      const x = first ? CONTENT_X + lw : CONTENT_X;
      this.draw(line, x, this.regular);
      this.nl();
      first = false;
    };

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      const avail = first ? CONTENT_W - lw : CONTENT_W;
      if (this.regular.widthOfTextAtSize(candidate, FS) > avail && line) {
        flush();
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) flush();
    else if (first) this.nl(); // empty value
  }

  // Bold label on its own line
  heading(label: string) {
    this.draw(label, CONTENT_X, this.bold);
    this.nl();
  }

  // Regular text, wrapped, with optional first-line paragraph indent
  text(content: string, firstLineIndent = 0) {
    const words = content.split(" ");
    let line = "";
    let first = true;

    const flush = () => {
      const indent = first ? firstLineIndent : 0;
      this.draw(line, CONTENT_X + indent, this.regular);
      this.nl();
      first = false;
    };

    for (const word of words) {
      const c = line ? `${line} ${word}` : word;
      const indent = first ? firstLineIndent : 0;
      const avail = CONTENT_W - indent;
      if (this.regular.widthOfTextAtSize(c, FS) > avail && line) {
        flush();
        line = word;
      } else {
        line = c;
      }
    }
    if (line) flush();
  }

  // Table with "Equipment type | Quantity" columns
  equipTable(items: { name: string; quantity: number }[]) {
    if (items.length === 0) { this.text("None"); return; }

    const ROW_H = 19;
    const col1W = Math.round(CONTENT_W * 0.5);
    const totalH = ROW_H * (items.length + 1); // +1 for header
    const top = this.y;

    // Outer border
    this.page.drawRectangle({
      x: CONTENT_X, y: this.py(top + totalH),
      width: CONTENT_W, height: totalH,
      borderColor: BLACK, borderWidth: TABLE_BORDER_WIDTH,
    });

    // Horizontal lines separating rows
    for (let r = 1; r <= items.length; r++) {
      const ly = this.py(top + r * ROW_H);
      this.page.drawLine({ start: { x: CONTENT_X, y: ly }, end: { x: CONTENT_X + CONTENT_W, y: ly }, thickness: TABLE_BORDER_WIDTH, color: BLACK });
    }

    // Vertical column separator
    const vx = CONTENT_X + col1W;
    this.page.drawLine({ start: { x: vx, y: this.py(top) }, end: { x: vx, y: this.py(top + totalH) }, thickness: TABLE_BORDER_WIDTH, color: BLACK });

    // Header labels
    const headerY = this.py(top + ROW_H - 5);
    const equipmentHeader = "Equipment type";
    const quantityHeader = "Quantity";
    this.page.drawText(equipmentHeader, {
      x: CONTENT_X + (col1W - this.bold.widthOfTextAtSize(equipmentHeader, FS)) / 2,
      y: headerY,
      size: FS,
      font: this.bold,
      color: BLACK,
    });
    this.page.drawText(quantityHeader, {
      x: vx + (CONTENT_W - col1W - this.bold.widthOfTextAtSize(quantityHeader, FS)) / 2,
      y: headerY,
      size: FS,
      font: this.bold,
      color: BLACK,
    });

    // Data rows
    items.forEach((item, i) => {
      const ty = this.py(top + (i + 2) * ROW_H - 5);
      this.page.drawText(item.name, { x: CONTENT_X + 4, y: ty, size: FS, font: this.regular, color: BLACK });
      const quantity = String(item.quantity);
      this.page.drawText(quantity, {
        x: vx + (CONTENT_W - col1W - this.regular.widthOfTextAtSize(quantity, FS)) / 2,
        y: ty,
        size: FS,
        font: this.regular,
        color: BLACK,
      });
    });

    this.y += totalH;
  }

  // "Printed by: _____________" line
  printedBy(name: string) {
    const label = "Printed by:  ";
    const lw = this.bold.widthOfTextAtSize(label, FS);
    this.draw(label, CONTENT_X, this.bold);
    const lx = CONTENT_X + lw;
    const baselineY = this.py(this.y) + 1;
    this.page.drawLine({ start: { x: lx, y: baselineY }, end: { x: lx + 160, y: baselineY }, thickness: TABLE_BORDER_WIDTH, color: BLACK });
    if (name) this.draw(name, lx, this.regular);
    this.nl();
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function printEventReceipt(
  event: EventDetails,
  printedBy: string,
  baseUrl: string,
): Promise<void> {
  const eventUrl = `${baseUrl}/?eventId=${event.id}`;

  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) throw new Error(`Could not load receipt template (${res.status})`);
  const pdfDoc = await PDFDocument.load(await res.arrayBuffer());
  const page = pdfDoc.getPages()[0];
  const { width: pgW, height: pgH } = page.getSize();

  // Keep the full long-bond page size, then move the template up to hide the top gap.
  page.setMediaBox(0, 0, pgW, pgH);
  page.translateContent(0, TEMPLATE_TOP_SHIFT);
  page.resetPosition();

  // White out the shifted editable content area while leaving the official header intact.
  page.drawRectangle({
    x: 113,
    y: 90,
    width: pgW - 113 - 5,
    height: pgH - (112 - TEMPLATE_TOP_SHIFT) - 90,
    color: rgb(1, 1, 1),
  });

  const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const regular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const cv = new Canvas(page, bold, regular, 115);

  // ── Date ──────────────────────────────────────────────────────────────────
  cv.row("Date: ", fmtDate(event.date));
  cv.gap(17 + LINE_H); // one blank line gap (matches template: Date at 122.5, Event name at 151.6)

  // ── Core event fields ─────────────────────────────────────────────────────
  cv.row("Event name: ", event.title_name || "N/A");
  cv.row("Event Time & Date: ",
    `${fmt12h(event.time_start)} - ${fmt12h(event.time_end)}, ${fmtDate(event.date)}` +
    (event.range > 1 ? ` (${event.range} days)` : ""),
  );
  cv.row("Requested Venue: ", event.asset?.asset_name || "N/A");

  // ── Equipment table ───────────────────────────────────────────────────────
  cv.heading("Requested equipment's:");
  cv.equipTable(event.equipment?.filter(e => e?.name) ?? []);
  cv.gap(15 + LINE_H);

  // ── Description ───────────────────────────────────────────────────────────
  cv.heading("Event Description:");
  cv.text(event.description || "N/A", DESCRIPTION_FIRST_LINE_INDENT);
  cv.gap(LINE_H);

  // ── Additional details ────────────────────────────────────────────────────
  const extras: string[] = [];
  if (event.outsource) extras.push(`Catering - ${event.outsource}`);
  if (event.guests?.length) {
    for (const g of event.guests)
      extras.push(`Guest - ${g.name}${g.details ? `, ${g.details}` : ""}`);
  }
  cv.heading("Additional Details:");
  if (extras.length > 0) { for (const line of extras) cv.text(line); }
  else cv.text("N/A");
  cv.gap(LINE_H); // blank line before Requested By

  // ── Requestor ─────────────────────────────────────────────────────────────
  const requestedBy = event.reserve_by_user
    || (event.reserved_by_user
      ? `${event.reserved_by_user.first_name} ${event.reserved_by_user.last_name}`
      : "N/A");
  cv.row("Requested By: ", requestedBy);
  cv.gap(LINE_H);
  cv.row("Requested Through: ", requestorThrough(event));
  cv.gap(LINE_H);

  // ── Approvals (all, sorted oldest first) ─────────────────────────────────
  const approvals = (event.approvals ?? [])
    .filter(a => ["APPROVED", "APPROVE", "ENDORSE"].includes(a.action))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  cv.heading("Approved By: (Includes Date and time)");
  if (approvals.length > 0) {
    for (const a of approvals) {
      const title = STAGE_TITLE[a.stage]
        ?? (a.user ? `${a.user.first_name} ${a.user.last_name}` : a.stage);
      cv.text(`${title} -- ${fmtDateTime(a.created_at)}`);
    }
  } else {
    const name = event.approved_by_user_details
      ? `${event.approved_by_user_details.first_name} ${event.approved_by_user_details.last_name}`
      : (event.approved_by_user ?? "N/A");
    cv.text(name);
  }
  cv.gap(LINE_H);

  // ── Fully-approved date ───────────────────────────────────────────────────
  const lastApproval = approvals[approvals.length - 1];
  cv.row("Date and Time (Fully Approved): ", lastApproval ? fmtDateTime(lastApproval.created_at) : "N/A");
  cv.gap(LINE_H);

  // ── QR code ───────────────────────────────────────────────────────────────
  cv.heading("QR code");
  try {
    const dataUrl = await QRCode.toDataURL(eventUrl, { width: 90, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
    const pngBytes = Uint8Array.from(atob(dataUrl.split(",")[1]), c => c.charCodeAt(0));
    const qrImage = await pdfDoc.embedPng(pngBytes);
    page.drawImage(qrImage, { x: CONTENT_X + (CONTENT_W - 90) / 2, y: cv.py(cv.y + 90), width: 90, height: 90 });
    cv.gap(90 + LINE_H);
  } catch {
    cv.text("(QR code unavailable)");
    cv.gap(22);
  }

  // ── Printed by ────────────────────────────────────────────────────────────
  cv.printedBy(printedBy);

  // ── Output via hidden iframe (bypasses IDM / download managers) ───────────
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0;";
  document.body.appendChild(iframe);
  iframe.src = blobUrl;
  iframe.onload = () => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(blobUrl);
    }, 120_000);
  };
}
