/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IMovement } from '../interface';
import { movementTypeLabel, categoryLabels } from '../constants';
import RoutesUtills from '../../../core/routes/utills';
import LogoSrc from '../../../statics/images/pride_logo_horizontal.png';

// ── Palette (light, professional) ────────────────────────────────────────────
const TEAL = '#08796C';
const TEAL_DARK = '#065E54';
const TEAL_50 = '#E9F3F1';   // very light brand tint for the table head
const GOLD = '#BC892C';
const GOLD_DARK = '#9B7024';
const INK = '#1E293B';
const MUTED = '#64748B';
const FAINT = '#94A3B8';
const BORDER = '#E5EAF0';
const WASH = '#F8FAFC';
const WHITE = '#FFFFFF';

const LOGO_RATIO = 909 / 275; // ≈ 3.305

const STATUS_META: Record<string, [string, string, string]> = {
    DRAFT: ['Draft', '#EEF1F5', '#475569'],
    INITIATED: ['Initiated', '#FEF3C7', '#A16207'],
    DISPATCHED: ['Dispatched', '#DBEAFE', '#1D4ED8'],
    IN_TRANSIT: ['In Transit', '#E0E7FF', '#4338CA'],
    RECEIVED: ['Received', '#D1FAE5', '#047857'],
    COMPLETED: ['Completed', '#DCFCE7', '#15803D'],
    CANCELLED: ['Cancelled', '#FEE2E2', '#B91C1C'],
};

/**
 * Loads a bundled image URL into a base64 data URL (via canvas) so jsPDF can embed it.
 * Resolves null on any failure so PDF generation never blocks on a missing/broken asset.
 */
const loadImage = (src: string): Promise<string | null> =>
    new Promise((resolve) => {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { resolve(null); return; }
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } catch { resolve(null); }
            };
            img.onerror = () => resolve(null);
            img.src = src;
        } catch { resolve(null); }
    });

/**
 * Generates the (unsigned) Store Release / Dispatch Note for a movement leaving a store — used both
 * for the post-dispatch reprint on the movement view page, and (with a draft movement built from the
 * in-progress form values) as the "Generate Dispatch Note" step inside the Dispatch action modal.
 * The admin prints it, has it signed by the releasing officer and the courier, then uploads the scan.
 */
export const generateReleaseNote = async (movement: IMovement): Promise<void> => {
    const logo = await loadImage(LogoSrc);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 44;
    const contentW = pageW - margin * 2;

    const fmtDate = (d?: string | null) =>
        d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const generatedLabel = new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const refNo = `MOV-${String(movement.id ?? 0).padStart(6, '0')}`;
    const recipient = movement.recipientUser
        ? `${movement.recipientUser.firstName} ${movement.recipientUser.lastName}`
        : null;

    // The logged-in user is the releasing officer — pre-fill their name on the note.
    const currentUser = RoutesUtills().getCurrentUser();
    const releasedByName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim();

    // ── Header (light) ───────────────────────────────────────────────────────
    // Slim brand strip at the very top for a touch of colour without a heavy band.
    doc.setFillColor(TEAL);
    doc.rect(0, 0, pageW, 4, 'F');

    const headerTop = 30;
    if (logo) {
        const h = 34;
        const w = h * LOGO_RATIO;
        doc.addImage(logo, 'PNG', margin, headerTop, w, h);
    } else {
        // Fallback wordmark if the logo asset can't be loaded.
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(TEAL);
        doc.text('PRIDE BANK LIMITED', margin, headerTop + 22);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(TEAL);
    doc.text('STORE RELEASE / DISPATCH NOTE', pageW - margin, headerTop + 14, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(MUTED);
    doc.text(`No. ${refNo}`, pageW - margin, headerTop + 30, { align: 'right' });

    // Header divider: hairline across, with a short teal accent segment on the left.
    const hrY = headerTop + 48;
    doc.setDrawColor(BORDER);
    doc.setLineWidth(0.8);
    doc.line(margin, hrY, pageW - margin, hrY);
    doc.setDrawColor(TEAL);
    doc.setLineWidth(2);
    doc.line(margin, hrY, margin + 54, hrY);
    doc.setLineWidth(0.5);

    // ── Reference row ────────────────────────────────────────────────────────
    let y = hrY + 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(INK);
    doc.text(`Movement #${movement.id ?? '—'}`, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    const typeLine = `${movementTypeLabel(movement.movementType)}${movement.movementCategory ? `  ·  ${categoryLabels[movement.movementCategory] ?? movement.movementCategory}` : ''}`;
    doc.text(typeLine, margin, y + 15);

    const [stLabel, stBg, stFg] = STATUS_META[movement.status ?? ''] ?? ['—', '#EEF1F5', MUTED];
    drawPill(doc, stLabel, pageW - margin, y, stBg, stFg);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(FAINT);
    doc.text(`Generated ${generatedLabel}`, pageW - margin, y + 15, { align: 'right' });

    y += 36;

    // ── Route ────────────────────────────────────────────────────────────────
    y = sectionLabel(doc, 'Route', margin, y);
    const gap = 34;
    const panelW = (contentW - gap) / 2;
    const panelH = 54;
    const panelY = y;

    routePanel(doc, margin, panelY, panelW, panelH, 'SOURCE', TEAL,
        movement.sourceStore?.name ?? '—', movement.sourceStore?.location?.name ?? '');
    routePanel(doc, margin + panelW + gap, panelY, panelW, panelH, 'DESTINATION', GOLD,
        movement.destStore?.name ?? recipient ?? '—',
        movement.destStore?.location?.name ?? movement.recipientUser?.branch?.name ?? '');

    // arrow between panels
    const acx = margin + panelW + gap / 2;
    const acy = panelY + panelH / 2;
    doc.setDrawColor(FAINT);
    doc.setLineWidth(1.3);
    doc.line(acx - 7, acy, acx + 7, acy);
    doc.line(acx + 2, acy - 4, acx + 7, acy);
    doc.line(acx + 2, acy + 4, acx + 7, acy);
    doc.setLineWidth(0.5);

    y = panelY + panelH + 24;

    // ── Logistics (only when there's something to show) ──────────────────────
    const logistics: Array<[string, string]> = [
        ['Courier', movement.courier?.name || movement.courierService || '—'],
        ['Plate Number', movement.plateNumber || '—'],
        ['Tracking No', movement.trackingNumber || '—'],
        ['Dispatch Date', fmtDate(movement.dispatchDate)],
        ['Expected Delivery', fmtDate(movement.expectedDeliveryDate)],
    ];
    if (logistics.some(([, v]) => v && v !== '—')) {
        y = sectionLabel(doc, 'Logistics', margin, y);
        const rows = Math.ceil(logistics.length / 2);
        const boxH = 14 + rows * 18 + 8;
        doc.setDrawColor(BORDER);
        doc.setFillColor(WASH);
        doc.roundedRect(margin, y, contentW, boxH, 5, 5, 'FD');
        const colW = contentW / 2;
        logistics.forEach((entry, i) => {
            const cx = margin + 16 + (i % 2 === 0 ? 0 : colW);
            const cy = y + 22 + Math.floor(i / 2) * 18;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(FAINT);
            doc.text(entry[0].toUpperCase(), cx, cy);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(INK);
            doc.text(String(entry[1]), cx + 96, cy, { maxWidth: colW - 112 });
        });
        y += boxH + 24;
    }

    // ── Items ────────────────────────────────────────────────────────────────
    const items = movement.items ?? [];
    const totalUnits = items.reduce((s, it) => s + (it.asset ? 1 : Number(it.quantity) || 0), 0);
    y = sectionLabel(doc, `Items  (${items.length})`, margin, y);

    const body = items.length > 0
        ? items.map((it, i) => [
            String(i + 1),
            it.asset ? (it.asset.assetName ?? '—') : (it.commodity?.name ?? '—'),
            it.asset ? (it.asset.engravedNumber || it.serialNumber || '—') : '—',
            it.asset ? 'Asset' : 'Consumable',
            it.asset ? '1' : String(it.quantity ?? 0),
        ])
        : [['—', 'No items listed', '—', '—', '—']];

    autoTable(doc, {
        startY: y,
        head: [['#', 'Item', 'Reference', 'Kind', 'Qty']],
        body,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: { top: 7, right: 8, bottom: 7, left: 8 }, textColor: INK },
        headStyles: { fillColor: TEAL_50, textColor: TEAL_DARK, fontStyle: 'bold', fontSize: 8, cellPadding: { top: 8, right: 8, bottom: 8, left: 8 } },
        alternateRowStyles: { fillColor: WASH },
        columnStyles: {
            0: { cellWidth: 26, halign: 'right', textColor: FAINT },
            2: { textColor: MUTED, font: 'courier', fontSize: 8.5 },
            3: { cellWidth: 84, textColor: MUTED },
            4: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
        },
        // Thin hairline under each row for a clean, light ledger look.
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 0) {
                doc.setDrawColor(BORDER);
                doc.setLineWidth(0.5);
                doc.line(margin, data.cell.y + data.row.height, pageW - margin, data.cell.y + data.row.height);
            }
        },
        margin: { left: margin, right: margin },
    });

    // @ts-expect-error autoTable augments the doc with lastAutoTable at runtime
    y = (doc.lastAutoTable?.finalY ?? y + 40) + 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED);
    doc.text(`Total:  ${items.length} line item(s)   ·   ${totalUnits} unit(s)`, pageW - margin, y, { align: 'right' });
    y += 26;

    // ── Authorisation ────────────────────────────────────────────────────────
    const sigH = 128;
    if (y + sigH + 30 > pageH - margin) {
        doc.addPage();
        y = margin + 6;
    }
    y = sectionLabel(doc, 'Authorisation', margin, y);

    const sigGap = 18;
    const sigW = (contentW - sigGap * 2) / 3;
    // Released-by is pre-filled with the logged-in (releasing) officer; the other two are blank
    // dotted lines for the courier and the receiving officer to complete by hand.
    const sigCards: Array<{ role: string; name: string }> = [
        { role: 'Released by', name: releasedByName },
        { role: 'Carried by', name: '' },
        { role: 'Received by', name: '' },
    ];

    /** One labelled field: a printed value on a solid line, or a dotted line to write on. */
    const fillField = (fx: number, fw: number, lineY: number, caption: string, value?: string) => {
        if (value) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(INK);
            doc.text(value, fx, lineY - 4, { maxWidth: fw });
            doc.setDrawColor(BORDER);
            doc.setLineWidth(0.6);
            doc.line(fx, lineY, fx + fw, lineY);
        } else {
            doc.setDrawColor(FAINT);
            doc.setLineWidth(0.6);
            doc.setLineDashPattern([1, 2.2], 0);
            doc.line(fx, lineY, fx + fw, lineY);
            doc.setLineDashPattern([], 0);
        }
        doc.setLineWidth(0.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(FAINT);
        doc.text(caption, fx, lineY + 9);
    };

    sigCards.forEach(({ role, name }, i) => {
        const x = margin + i * (sigW + sigGap);
        const padX = 14;
        const fw = sigW - padX * 2;

        doc.setDrawColor(BORDER);
        doc.roundedRect(x, y, sigW, sigH, 5, 5, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(TEAL);
        doc.text(role.toUpperCase(), x + padX, y + 19);

        fillField(x + padX, fw, y + 50, 'Name', name || undefined);
        fillField(x + padX, fw, y + 82, 'Signature');
        fillField(x + padX, fw, y + 114, 'Date');
    });

    // ── Footer on every page ─────────────────────────────────────────────────
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
        doc.setPage(p);
        const fy = pageH - 26;
        doc.setDrawColor(BORDER);
        doc.setLineWidth(0.5);
        doc.line(margin, fy, pageW - margin, fy);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(FAINT);
        // Left: confidentiality note (with the ref number appended so nothing overlaps the
        // right-aligned page count). Right: page count.
        doc.text(`Pride Bank Limited   ·   Confidential — for internal store & logistics use   ·   ${refNo}`, margin, fy + 12);
        doc.text(`Page ${p} of ${pages}`, pageW - margin, fy + 12, { align: 'right' });
    }

    doc.save(`release-note-movement-${movement.id ?? 'draft'}.pdf`);
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Gold-underlined uppercase section heading. Returns the y where content should start. */
function sectionLabel(doc: jsPDF, label: string, x: number, y: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(GOLD_DARK);
    const text = label.toUpperCase();
    doc.text(text, x, y);
    const w = Math.max(doc.getTextWidth(text), 22);
    doc.setDrawColor(GOLD);
    doc.setLineWidth(1.4);
    doc.line(x, y + 4, x + w, y + 4);
    doc.setLineWidth(0.5);
    return y + 17;
}

/** A tinted source/destination panel. */
function routePanel(
    doc: jsPDF, x: number, y: number, w: number, h: number,
    label: string, accent: string, name: string, sub: string,
): void {
    doc.setDrawColor(BORDER);
    doc.setFillColor(WASH);
    doc.roundedRect(x, y, w, h, 5, 5, 'FD');
    doc.setFillColor(accent);
    doc.roundedRect(x, y, 3.5, h, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(accent);
    doc.text(label, x + 15, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(INK);
    doc.text(name, x + 15, y + 34, { maxWidth: w - 26 });

    if (sub) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(MUTED);
        doc.text(sub, x + 15, y + 46, { maxWidth: w - 26 });
    }
}

/** A rounded status pill, right-anchored at x. */
function drawPill(doc: jsPDF, text: string, x: number, y: number, bg: string, fg: string): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const padX = 9;
    const w = doc.getTextWidth(text) + padX * 2;
    const h = 16;
    const bx = x - w;
    doc.setFillColor(bg);
    doc.roundedRect(bx, y - 11, w, h, 8, 8, 'F');
    doc.setTextColor(fg);
    doc.text(text, bx + padX, y);
}
