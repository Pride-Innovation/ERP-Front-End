/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IInventory } from '../interface';

/**
 * Generates the *unsigned* Goods Received Note for a stock delivery. The
 * resulting PDF is downloaded by the browser; the admin then prints it,
 * hands it to the supplier for signature, and re-uploads the scanned copy
 * via the existing "Upload Signed GRN" modal.
 *
 * Layout mirrors the typical Pride Bank GRN form:
 *  - Brand header strip
 *  - Stock metadata (LPO/GRN/Date/Supplier)
 *  - Line-item table: commodity, ordered, delivered, outstanding, unit cost, total
 *  - Signature blocks for supplier and storekeeper
 */
export const generateGrnPdf = (inventory: IInventory): void => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
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
    doc.text('Goods Received Note', margin, 46);

    const generatedAt = new Date();
    const generatedLabel = generatedAt.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
    doc.setFontSize(9);
    doc.text(`Generated: ${generatedLabel}`, pageWidth - margin, 46, { align: 'right' });

    // ── Stock metadata ─────────────────────────────────────────────
    let cursorY = 90;
    doc.setTextColor('#1E293B');
    doc.setFontSize(10);

    const meta: Array<[string, string]> = [
        ['LPO Number', inventory.lpoNumber || '—'],
        ['GRN Number', inventory.grnNumber || (inventory.grnReports?.[0]?.name ?? '—')],
        ['Reference', inventory.referenceNumber || '—'],
        ['Supplier', inventory.supplier?.name || '—'],
        ['Supplier Email', inventory.supplier?.email || '—'],
        ['Supplier Phone', inventory.supplier?.telephone || '—'],
        ['Branch', inventory.branch?.name || '—'],
        ['Delivery Date', inventory.createDate
            ? new Date(inventory.createDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—'],
    ];

    // Two-column meta layout
    const colWidth = (pageWidth - margin * 2) / 2;
    meta.forEach((entry, i) => {
        const x = margin + (i % 2 === 0 ? 0 : colWidth);
        const y = cursorY + Math.floor(i / 2) * 18;
        doc.setFont('helvetica', 'bold');
        doc.text(`${entry[0]}:`, x, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(entry[1]), x + 90, y, { maxWidth: colWidth - 100 });
    });
    cursorY += Math.ceil(meta.length / 2) * 18 + 12;

    // ── Line-item table ────────────────────────────────────────────
    const rows = (inventory.commodities ?? []).map((c) => {
        const ordered = c.orderedQuantity || 0;
        const delivered = c.deliveredQuantity || 0;
        const outstanding = Math.max(ordered - delivered, 0);
        const unitCost = c.purchasePrice ?? c.costPrice ?? 0;
        const lineTotal = unitCost * delivered;
        return [
            c.commodity?.name ?? '—',
            String(ordered),
            String(delivered),
            String(outstanding),
            unitCost.toLocaleString(),
            lineTotal.toLocaleString(),
        ];
    });

    const totalDelivered = (inventory.commodities ?? [])
        .reduce((sum, c) => sum + (c.deliveredQuantity || 0), 0);
    const totalValue = (inventory.commodities ?? [])
        .reduce((sum, c) => sum + ((c.purchasePrice ?? c.costPrice ?? 0) * (c.deliveredQuantity || 0)), 0);

    autoTable(doc, {
        startY: cursorY,
        head: [['Commodity', 'Ordered', 'Delivered', 'Outstanding', 'Unit Cost', 'Total']],
        body: rows,
        foot: [[
            { content: 'Total', styles: { halign: 'right', fontStyle: 'bold' } },
            '',
            { content: String(totalDelivered), styles: { fontStyle: 'bold' } },
            '',
            '',
            { content: totalValue.toLocaleString(), styles: { fontStyle: 'bold' } },
        ]],
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 6,
            lineColor: '#D1D5DB',
            textColor: '#1E293B',
        },
        headStyles: {
            fillColor: PRIMARY,
            textColor: '#FFFFFF',
            fontStyle: 'bold',
            halign: 'left',
        },
        footStyles: {
            fillColor: '#F1F5F9',
            textColor: '#1E293B',
        },
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' },
        },
        margin: { left: margin, right: margin },
    });

    // ── Signature blocks ────────────────────────────────────────────
    const tableEndY = (doc as any).lastAutoTable?.finalY ?? cursorY;
    let signY = Math.max(tableEndY + 50, pageHeight - 180);
    // If we'd run off the page, start a new page for signatures
    if (signY > pageHeight - 120) {
        doc.addPage();
        signY = 80;
    }

    doc.setDrawColor('#94A3B8');
    doc.setLineWidth(0.6);
    const colHalf = (pageWidth - margin * 2 - 30) / 2;

    drawSignatureBox(doc, margin, signY, colHalf, 'Supplier Representative');
    drawSignatureBox(doc, margin + colHalf + 30, signY, colHalf, 'Storekeeper / Receiver');

    // ── Footer note ─────────────────────────────────────────────────
    doc.setFontSize(8);
    doc.setTextColor('#64748B');
    doc.text(
        'This document confirms that the items above were physically received in good condition unless otherwise noted. '
        + 'Once signed by both parties, please scan and re-upload via the system.',
        margin,
        pageHeight - 30,
        { maxWidth: pageWidth - margin * 2 }
    );

    const filename = `GRN-${inventory.lpoNumber || inventory.id || 'unsigned'}.pdf`;
    doc.save(filename);
};

function drawSignatureBox(doc: jsPDF, x: number, y: number, width: number, label: string) {
    doc.setTextColor('#1E293B');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(label, x, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // Name line
    doc.text('Name:', x, y + 24);
    doc.line(x + 36, y + 24, x + width, y + 24);

    // Signature line
    doc.text('Signature:', x, y + 56);
    doc.line(x + 56, y + 56, x + width, y + 56);

    // Date line
    doc.text('Date:', x, y + 88);
    doc.line(x + 32, y + 88, x + width, y + 88);
}
