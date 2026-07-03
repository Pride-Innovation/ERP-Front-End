/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IMovement } from '../interface';
import { movementTypeLabel } from '../constants';

/**
 * Generates the (unsigned) Store Release Note / Gate Pass for a movement leaving a store —
 * used especially for dispatches out of Head Office. The admin prints it, has it signed by the
 * releasing officer and the courier, then uploads the signed scan via the Documents panel.
 *
 * Mirrors the GRN layout: brand header, movement metadata, item table, and signature blocks.
 */
export const generateReleaseNote = (movement: IMovement): void => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const PRIMARY = '#08796C';

    // ── Brand header strip ─────────────────────────────────────────
    doc.setFillColor(PRIMARY);
    doc.rect(0, 0, pageWidth, 60, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Pride Bank Limited', margin, 28);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Store Release Note / Gate Pass', margin, 46);

    const generatedLabel = new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    doc.setFontSize(9);
    doc.text(`Generated: ${generatedLabel}`, pageWidth - margin, 46, { align: 'right' });

    // ── Movement metadata ──────────────────────────────────────────
    let cursorY = 90;
    doc.setTextColor('#1E293B');
    doc.setFontSize(10);

    const recipient = movement.recipientUser
        ? `${movement.recipientUser.firstName} ${movement.recipientUser.lastName}`
        : null;
    const fmtDate = (d?: string | null) =>
        d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const meta: Array<[string, string]> = [
        ['Movement No', `#${movement.id ?? '—'}`],
        ['Type', movementTypeLabel(movement.movementType)],
        ['Source', movement.sourceStore?.name ?? '—'],
        ['Destination', movement.destStore?.name ?? recipient ?? '—'],
        ['From Location', movement.sourceStore?.location?.name ?? '—'],
        ['To Location', movement.destStore?.location?.name ?? movement.recipientUser?.branch?.name ?? '—'],
        ['Courier', movement.courierService || '—'],
        ['Tracking No', movement.trackingNumber || '—'],
        ['Dispatch Date', fmtDate(movement.dispatchDate)],
        ['Expected Delivery', fmtDate(movement.expectedDeliveryDate)],
    ];

    const colWidth = (pageWidth - margin * 2) / 2;
    meta.forEach((entry, i) => {
        const x = margin + (i % 2 === 0 ? 0 : colWidth);
        const y = cursorY + Math.floor(i / 2) * 18;
        doc.setFont('helvetica', 'bold');
        doc.text(`${entry[0]}:`, x, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(entry[1]), x + 95, y, { maxWidth: colWidth - 105 });
    });
    cursorY += Math.ceil(meta.length / 2) * 18 + 16;

    // ── Item table ─────────────────────────────────────────────────
    const rows = (movement.items ?? []).map((it, i) => [
        String(i + 1),
        it.asset ? `${it.asset.engravedNumber ?? ''} — ${it.asset.assetName ?? ''}`.trim() : (it.commodity?.name ?? '—'),
        it.asset ? 'Asset' : 'Consumable',
        it.asset ? '1' : String(it.quantity ?? 0),
    ]);

    autoTable(doc, {
        startY: cursorY,
        head: [['#', 'Item', 'Kind', 'Qty']],
        body: rows.length > 0 ? rows : [['—', 'No items listed', '—', '—']],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 6, lineColor: '#D1D5DB', textColor: '#1E293B' },
        headStyles: { fillColor: PRIMARY, textColor: '#FFFFFF', fontStyle: 'bold', halign: 'left' },
        columnStyles: { 0: { cellWidth: 30, halign: 'right' }, 3: { halign: 'right' } },
        margin: { left: margin, right: margin },
    });

    // ── Signature blocks ───────────────────────────────────────────
    // @ts-expect-error autoTable augments the doc with lastAutoTable at runtime
    let y = (doc.lastAutoTable?.finalY ?? cursorY + 60) + 40;
    const blockWidth = (pageWidth - margin * 2 - 40) / 3;
    const blocks = ['Released by (Store)', 'Courier', 'Received by'];
    blocks.forEach((label, i) => {
        const x = margin + i * (blockWidth + 20);
        doc.setDrawColor('#94A3B8');
        doc.line(x, y, x + blockWidth, y);
        doc.setFontSize(8);
        doc.setTextColor('#475569');
        doc.text(label, x, y + 14);
        doc.text('Name / Signature / Date', x, y + 26);
    });

    doc.save(`release-note-movement-${movement.id ?? 'draft'}.pdf`);
};
