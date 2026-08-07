/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IConsignment, consignmentStatusLabels } from './interface';
import { movementTypeLabel } from '../movement/constants';
import RoutesUtills from '../../core/routes/utills';
import LogoSrc from '../../statics/images/pride_logo_horizontal.png';
// Same palette and primitives as the movement release note and the GRN, so every document in the
// custody trail reads as one family. See utils/pdf/docKit.
import {
    BORDER, FAINT, GOLD, INK, MUTED, TEAL, TEAL_50, TEAL_DARK, WASH,
    drawDocHeader, drawFooter, drawPill, drawSignatureCards, ensureSpace,
    loadImage, partyPanel, rightAlignHeaders, sectionLabel,
} from '../../utils/pdf/docKit';

const STATUS_META: Record<string, [string, string]> = {
    DRAFT: ['#EEF1F5', '#475569'],
    DISPATCHED: ['#DBEAFE', '#1D4ED8'],
    IN_TRANSIT: ['#E0E7FF', '#4338CA'],
    ARRIVED: ['#DCFCE7', '#15803D'],
    CANCELLED: ['#FEE2E2', '#B91C1C'],
};

/** Overridable logistics, so the note can be printed from in-progress form values before dispatch. */
export interface ConsignmentNoteOverrides {
    courierName?: string | null;
    plateNumber?: string | null;
    trackingNumber?: string | null;
    dispatchDate?: string | null;
    expectedDeliveryDate?: string | null;
}

/**
 * Generates the (unsigned) Consignment Dispatch Note covering an entire courier run.
 *
 * <p>The consignment equivalent of the per-movement release note, and the same working method: the
 * admin prints it, the releasing officer and courier sign it, and the scan is uploaded before the
 * consignment can be dispatched.
 *
 * <p>What differs is scope. One note now covers every movement on the van, and the items table is
 * grouped by movement so the courier and the receiving branch can see which request each line
 * belongs to — the whole point of loading several requests onto one journey. A single flat list of
 * items would have made the load impossible to reconcile at the far end.
 */
export const generateConsignmentNote = async (
    consignment: IConsignment,
    overrides: ConsignmentNoteOverrides = {},
): Promise<void> => {
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
    const refNo = consignment.reference ?? `CNS-${String(consignment.id).padStart(6, '0')}`;
    const title = 'CONSIGNMENT DISPATCH NOTE';

    const currentUser = RoutesUtills().getCurrentUser();
    const releasedByName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim();

    const movements = consignment.movements ?? [];

    // ── Header ───────────────────────────────────────────────────────────────
    const hrY = drawDocHeader(doc, { logo, title, refNo, pageW, margin });

    let y = hrY + 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(INK);
    doc.text(refNo, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text(`${movements.length} movement(s) on this journey`, margin, y + 15);

    const [stBg, stFg] = STATUS_META[consignment.status] ?? ['#EEF1F5', MUTED];
    drawPill(doc, consignmentStatusLabels[consignment.status] ?? consignment.status, pageW - margin, y, stBg, stFg);
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

    partyPanel(doc, margin, panelY, panelW, panelH, 'FROM', TEAL,
        consignment.sourceLocation?.name ?? '—', 'Origin location');
    partyPanel(doc, margin + panelW + gap, panelY, panelW, panelH, 'TO', GOLD,
        consignment.destLocation?.name ?? '—', 'Destination location');

    const acx = margin + panelW + gap / 2;
    const acy = panelY + panelH / 2;
    doc.setDrawColor(FAINT);
    doc.setLineWidth(1.3);
    doc.line(acx - 7, acy, acx + 7, acy);
    doc.line(acx + 2, acy - 4, acx + 7, acy);
    doc.line(acx + 2, acy + 4, acx + 7, acy);
    doc.setLineWidth(0.5);

    y = panelY + panelH + 24;

    // ── Logistics ────────────────────────────────────────────────────────────
    // Form values win over what is stored: this note is normally printed *before* dispatch, when the
    // consignment itself still has none of these recorded.
    const logistics: Array<[string, string]> = [
        ['Courier', overrides.courierName || consignment.courierService || consignment.courier?.name || '—'],
        ['Plate Number', overrides.plateNumber || consignment.plateNumber || '—'],
        ['Tracking No', overrides.trackingNumber || consignment.trackingNumber || '—'],
        ['Dispatch Date', fmtDate(overrides.dispatchDate ?? consignment.dispatchDate)],
        ['Expected Delivery', fmtDate(overrides.expectedDeliveryDate ?? consignment.expectedDeliveryDate)],
    ];
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

    // ── Contents ─────────────────────────────────────────────────────────────
    // Grouped by movement: a separator row names the movement, its request and its recipient, then
    // its item lines follow. Flat lists cannot be reconciled at the far end when one van carries
    // several requests.
    const totalUnits = movements.reduce(
        (sum, m) => sum + (m.items ?? []).reduce((s, it) => s + (Number(it.quantity) || 0), 0), 0);
    const totalLines = movements.reduce((sum, m) => sum + (m.items ?? []).length, 0);

    y = sectionLabel(doc, `Contents  (${movements.length} movement(s), ${totalLines} line(s))`, margin, y);

    const groupRowIndexes: number[] = [];
    const body: string[][] = [];
    movements.forEach((m) => {
        const heading = [
            `Movement #${m.id}`,
            movementTypeLabel(m.movementType ?? undefined),
            m.requestId ? `Request #${m.requestId}` : null,
            m.recipientName ? `For ${m.recipientName}` : (m.destinationName ? `To ${m.destinationName}` : null),
        ].filter(Boolean).join('   ·   ');

        groupRowIndexes.push(body.length);
        body.push([heading, '', '', '', '']);

        const lines = m.items ?? [];
        if (lines.length === 0) {
            body.push(['', 'No items recorded', '—', '—', '—']);
            return;
        }
        lines.forEach((it, i) => {
            body.push([
                String(i + 1),
                it.name ?? '—',
                it.reference ?? '—',
                it.kind ?? '—',
                String(it.quantity ?? 0),
            ]);
        });
    });

    const redrawHeader = (): number =>
        drawDocHeader(doc, { logo, title, refNo, pageW, margin }) + 26;
    const tableFirstPage = doc.getNumberOfPages();

    autoTable(doc, {
        startY: y,
        head: [['#', 'Item', 'Reference', 'Kind', 'Qty']],
        body,
        theme: 'plain',
        showHead: 'everyPage',
        styles: { fontSize: 9, cellPadding: { top: 7, right: 8, bottom: 7, left: 8 }, textColor: INK },
        headStyles: {
            fillColor: TEAL_50, textColor: TEAL_DARK, fontStyle: 'bold', fontSize: 8,
            cellPadding: { top: 8, right: 8, bottom: 8, left: 8 },
        },
        columnStyles: {
            0: { cellWidth: 26, halign: 'right', textColor: FAINT },
            2: { textColor: MUTED, font: 'courier', fontSize: 8.5 },
            3: { cellWidth: 84, textColor: MUTED },
            4: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: (data) => {
            rightAlignHeaders([0, 4])(data);
            // Group heading: span the full width and set it apart from its lines.
            if (data.section === 'body' && groupRowIndexes.includes(data.row.index)) {
                if (data.column.index === 0) {
                    data.cell.colSpan = 5;
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fontSize = 8.5;
                    data.cell.styles.textColor = TEAL_DARK;
                    data.cell.styles.fillColor = TEAL_50;
                    data.cell.styles.halign = 'left';
                }
            }
        },
        margin: { top: 104, left: margin, right: margin, bottom: 58 },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 0
                && !groupRowIndexes.includes(data.row.index)) {
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
    doc.text(
        `Total:  ${movements.length} movement(s)   ·   ${totalLines} line item(s)   ·   ${totalUnits} unit(s)`,
        pageW - margin, y, { align: 'right' },
    );
    y += 36;

    // ── Authorisation ────────────────────────────────────────────────────────
    const sigH = 128;
    y = ensureSpace(doc, { y, needed: sigH + 24, pageH, margin, onNewPage: redrawHeader });
    y = sectionLabel(doc, 'Authorisation', margin, y);

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

    doc.save(`consignment-note-${refNo.replace(/[\\/]/g, '-')}.pdf`);
};
