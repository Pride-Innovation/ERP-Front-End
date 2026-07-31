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
// Palette and primitives are shared with the Goods Received Note so the inbound and outbound
// halves of the custody trail stay visually identical. See utils/pdf/docKit.
import {
    BORDER, FAINT, GOLD, INK, MUTED, TEAL, TEAL_50, TEAL_DARK, WASH,
    drawDocHeader, drawFooter, drawPill, drawSignatureCards, ensureSpace,
    loadImage, partyPanel, rightAlignHeaders, sectionLabel,
} from '../../../utils/pdf/docKit';

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
    const hrY = drawDocHeader(doc, { logo, title: 'STORE RELEASE / DISPATCH NOTE', refNo, pageW, margin });

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

    partyPanel(doc, margin, panelY, panelW, panelH, 'SOURCE', TEAL,
        movement.sourceStore?.name ?? '—', movement.sourceStore?.location?.name ?? '');
    partyPanel(doc, margin + panelW + gap, panelY, panelW, panelH, 'DESTINATION', GOLD,
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

    // A long movement spills over: the column head repeats, and every continuation page gets the
    // document header back so a loose page is still identifiable as this note.
    const redrawHeader = (): number =>
        drawDocHeader(doc, { logo, title: 'STORE RELEASE / DISPATCH NOTE', refNo, pageW, margin }) + 26;
    const tableFirstPage = doc.getNumberOfPages();

    autoTable(doc, {
        startY: y,
        head: [['#', 'Item', 'Reference', 'Kind', 'Qty']],
        body,
        theme: 'plain',
        showHead: 'everyPage',
        styles: { fontSize: 9, cellPadding: { top: 7, right: 8, bottom: 7, left: 8 }, textColor: INK },
        headStyles: { fillColor: TEAL_50, textColor: TEAL_DARK, fontStyle: 'bold', fontSize: 8, cellPadding: { top: 8, right: 8, bottom: 8, left: 8 } },
        alternateRowStyles: { fillColor: WASH },
        columnStyles: {
            0: { cellWidth: 26, halign: 'right', textColor: FAINT },
            2: { textColor: MUTED, font: 'courier', fontSize: 8.5 },
            3: { cellWidth: 84, textColor: MUTED },
            4: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
        },
        // Headings for the right-aligned columns (# / Qty) must follow their figures.
        didParseCell: rightAlignHeaders([0, 4]),
        // top clears the repeated header; bottom keeps rows clear of the footer rule.
        margin: { top: 104, left: margin, right: margin, bottom: 58 },
        // Thin hairline under each row for a clean, light ledger look.
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 0) {
                doc.setDrawColor(BORDER);
                doc.setLineWidth(0.5);
                doc.line(margin, data.cell.y + data.row.height, pageW - margin, data.cell.y + data.row.height);
            }
        },
        didDrawPage: () => {
            if (doc.getNumberOfPages() > tableFirstPage) redrawHeader();
        },
    });

    // @ts-expect-error autoTable augments the doc with lastAutoTable at runtime
    y = (doc.lastAutoTable?.finalY ?? y + 40) + 22;
    y = ensureSpace(doc, { y, needed: 28, pageH, margin, onNewPage: redrawHeader });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED);
    doc.text(`Total:  ${items.length} line item(s)   ·   ${totalUnits} unit(s)`, pageW - margin, y, { align: 'right' });
    y += 36;

    // ── Authorisation ────────────────────────────────────────────────────────
    // Kept whole: the label and all three cards move together rather than stranding a heading at
    // the foot of one page and its cards at the top of the next.
    const sigH = 128;
    y = ensureSpace(doc, { y, needed: sigH + 24, pageH, margin, onNewPage: redrawHeader });
    y = sectionLabel(doc, 'Authorisation', margin, y);

    // Released-by is pre-filled with the logged-in (releasing) officer; the other two are blank
    // dotted lines for the courier and the receiving officer to complete by hand.
    drawSignatureCards(
        doc,
        [
            { role: 'Released by', name: releasedByName },
            { role: 'Carried by', name: '' },
            { role: 'Received by', name: '' },
        ],
        { x: margin, y, contentW, height: sigH },
    );

    drawFooter(doc, {
        pageW, pageH, margin, refNo,
        note: 'Confidential — for internal store & logistics use',
    });

    doc.save(`release-note-movement-${movement.id ?? 'draft'}.pdf`);
};
