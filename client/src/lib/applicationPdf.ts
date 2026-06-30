import { jsPDF } from 'jspdf';

export interface ApplicationRecord {
  fullName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  experience?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  videoIntroUrl?: string;
  date?: any;
  [k: string]: unknown;
}

const NAVY: [number, number, number] = [27, 58, 75];   // #1B3A4B
const GOLD: [number, number, number] = [198, 167, 94];  // #C6A75E
const INK: [number, number, number] = [31, 42, 68];     // #1F2A44
const MUTED: [number, number, number] = [110, 122, 140];

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

function whenLabel(date: any): string {
  try {
    const d = date?.toDate ? date.toDate() : date ? new Date(date) : new Date();
    return d.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
  } catch {
    return new Date().toLocaleString();
  }
}

/**
 * Build a branded, one-or-more-page PDF of a careers application and return it
 * as a Blob (and a suggested filename). Used both for the email attachment
 * (the moment an application arrives) and the admin "Download PDF" action.
 */
export function buildApplicationPdf(record: ApplicationRecord): { blob: Blob; filename: string } {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;

  // ── header band ───────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 92, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 92, pageW, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('OutsourcEdge', margin, 44);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...GOLD);
  doc.text('Job Application', margin, 66);
  doc.setTextColor(220, 228, 238);
  doc.setFontSize(9);
  doc.text(`Received ${whenLabel(record.date)}`, pageW - margin, 66, { align: 'right' });

  let y = 132;

  // ── applicant name + position ─────────────────────────────────
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(str(record.fullName) || 'Applicant', margin, y);
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(`Applying for: ${str(record.jobTitle) || 'Open position'}`, margin, y);
  y += 24;

  // ── detail rows ───────────────────────────────────────────────
  const rows: Array<[string, string]> = [
    ['Email', str(record.email)],
    ['Phone', str(record.phone)],
    ['Experience', str(record.experience)],
    ['Portfolio', str(record.portfolioUrl)],
    ['Resume', str(record.resumeUrl)],
    ['Video intro', str(record.videoIntroUrl)],
  ].filter(([, v]) => v) as Array<[string, string]>;

  doc.setFontSize(10);
  for (const [label, value] of rows) {
    if (y > pageH - margin) { doc.addPage(); y = margin; }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(value, contentW - 110);
    doc.text(lines, margin + 110, y);
    y += Math.max(16, lines.length * 13) + 4;
  }

  // ── cover letter ──────────────────────────────────────────────
  const letter = str(record.coverLetter);
  if (letter) {
    y += 8;
    if (y > pageH - margin - 40) { doc.addPage(); y = margin; }
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + 40, y);
    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...NAVY);
    doc.text('Cover Letter', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    const para = doc.splitTextToSize(letter, contentW);
    for (const line of para) {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 15;
    }
  }

  // ── footer on every page ──────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Generated automatically from the OutsourcEdge careers form.', margin, pageH - 24);
    doc.text(`Page ${p} of ${pages}`, pageW - margin, pageH - 24, { align: 'right' });
  }

  const safeName = (str(record.fullName) || 'applicant').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  return { blob: doc.output('blob'), filename: `application_${safeName}.pdf` };
}

/**
 * Read a Blob as a base64 string (no `data:` prefix) so the PDF can be sent
 * inline to the notify API and attached to the team email without first having
 * to host it on Cloudinary.
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read PDF blob'));
    reader.readAsDataURL(blob);
  });
}
