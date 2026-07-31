/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IGRNCommodity, IGRNReport, IInventory, IStockCommodities } from '../interface';
import LogoSrc from '../../../statics/images/pride_logo_horizontal.png';
import {
    BORDER, FAINT, GOLD, INK, MUTED, TEAL, TEAL_50, TEAL_DARK, WASH,
    drawDocHeader, drawFooter, drawParagraph, drawPill, drawSignatureCards, ensureSpace,
    loadImage, partyPanel, rightAlignHeaders, sectionLabel,
} from '../../../utils/pdf/docKit';

/** Stock status → [label, background, foreground] for the header pill. */
const STATUS_META: Record<string, [string, string, string]> = {
    stockPending: ['Partially Stocked', '#FEF3C7', '#A16207'],
    stockCompleted: ['Fully Stocked', '#DCFCE7', '#15803D'],
    stockClosedShort: ['Closed Short', '#FEE2E2', '#B91C1C'],
};

/** One printable line, normalised from either a GRN line or a stock commodity line. */
interface GrnLine {
    name: string;
    unit: string;
    ordered: number;
    received: number;
    unitCost: number;
    unitPrice: number;
}

const money = (n: number) => (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/** GRN lines describe a single delivery; stock lines describe the order's cumulative position. */
const fromGrnLines = (lines: IGRNCommodity[]): GrnLine[] =>
    lines.map((l) => ({
        name: l.commodity?.name ?? '—',
        unit: l.commodity?.groupName ?? '—',
        ordered: Number(l.orderedQuantity ?? l.totalOrderedQuantity ?? 0),
        received: Number(l.deliveredQuantity ?? 0),
        unitCost: Number(l.costPrice ?? 0),
        unitPrice: Number(l.purchasePrice ?? 0),
    }));

const fromStockLines = (lines: IStockCommodities[]): GrnLine[] =>
    lines.map((l) => ({
        name: l.commodity?.name ?? '—',
        unit: l.commodity?.groupName ?? '—',
        ordered: Number(l.orderedQuantity ?? 0),
        received: Number(l.deliveredQuantity ?? 0),
        unitCost: Number(l.costPrice ?? 0),
        unitPrice: Number(l.purchasePrice ?? 0),
    }));

/**
 * Generates the (unsigned) Goods Received Note for a stock delivery. The storekeeper prints it, has
 * the supplier's representative sign it on delivery, then uploads the scan against the GRN record.
 *
 * <p>Deliberately shares {@code docKit} with the Store Release / Dispatch Note: the two are the
 * inbound and outbound halves of the same custody trail and are handled by the same people, so they
 * are laid out identically — brand strip, logo, gold-underlined sections, light ledger table and
 * signature cards.
 *
 * @param inventory the stock this note belongs to
 * @param options   pass {@code lines} + {@code grnReport} to print one specific delivery; omit them
 *                  to print the order's cumulative position across all deliveries
 */
export const generateGrnPdf = async (
    inventory: IInventory,
    options?: { grnReport?: IGRNReport | null; lines?: IGRNCommodity[]; receivedBy?: string },
): Promise<void> => {
    const logo = await loadImage(LogoSrc);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 44;
    const contentW = pageW - margin * 2;

    const perDelivery = Boolean(options?.lines?.length);
    const rows: GrnLine[] = perDelivery
        ? fromGrnLines(options!.lines as IGRNCommodity[])
        : fromStockLines((inventory.commodities ?? []) as IStockCommodities[]);

    const refNo = options?.grnReport?.name || inventory.grnNumber || `GRN-${inventory.id ?? ''}`;
    const generatedLabel = new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    // ── Header ───────────────────────────────────────────────────────────────
    const hrY = drawDocHeader(doc, { logo, title: 'GOODS RECEIVED NOTE', refNo, pageW, margin });

    // ── Reference row ────────────────────────────────────────────────────────
    let y = hrY + 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(INK);
    doc.text(inventory.name || `Stock #${inventory.id ?? '—'}`, margin, y, { maxWidth: contentW - 170 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text(
        perDelivery ? 'Receipt for a single delivery against this order' : 'Cumulative receipt across all deliveries',
        margin, y + 15,
    );

    const [stLabel, stBg, stFg] = STATUS_META[inventory.status?.status ?? ''] ?? ['—', '#EEF1F5', MUTED];
    drawPill(doc, stLabel, pageW - margin, y, stBg, stFg);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(FAINT);
    doc.text(`Generated ${generatedLabel}`, pageW - margin, y + 15, { align: 'right' });

    y += 36;

    // ── Supplier → Receiving store ───────────────────────────────────────────
    y = sectionLabel(doc, 'Supplier & Delivery', margin, y);
    const gap = 34;
    const panelW = (contentW - gap) / 2;
    const panelH = 54;
    const panelY = y;

    const supplierContact = [inventory.supplier?.telephone, inventory.supplier?.email]
        .filter(Boolean).join('   ·   ');

    partyPanel(doc, margin, panelY, panelW, panelH, 'SUPPLIER', TEAL,
        inventory.supplier?.name ?? '—', supplierContact);
    partyPanel(doc, margin + panelW + gap, panelY, panelW, panelH, 'RECEIVED AT', GOLD,
        inventory.branch?.name ?? '—', 'Admin Store');

    // Inbound arrow between the panels (points at the receiving store).
    const acx = margin + panelW + gap / 2;
    const acy = panelY + panelH / 2;
    doc.setDrawColor(FAINT);
    doc.setLineWidth(1.3);
    doc.line(acx - 7, acy, acx + 7, acy);
    doc.line(acx + 2, acy - 4, acx + 7, acy);
    doc.line(acx + 2, acy + 4, acx + 7, acy);
    doc.setLineWidth(0.5);

    y = panelY + panelH + 24;

    // ── Order details ────────────────────────────────────────────────────────
    const details: Array<[string, string]> = [
        ['LPO Number', inventory.lpoNumber || '—'],
        ['PO Number', inventory.poNumber || '—'],
        ['GRN Number', refNo],
        ['Order Date', fmtDate(inventory.orderDate)],
        ['Delivery Date', fmtDate(inventory.deliveryDate ?? inventory.createDate)],
        ['Invoice Date', fmtDate(inventory.invoiceDate)],
    ];
    y = sectionLabel(doc, 'Order Details', margin, y);
    const detailRows = Math.ceil(details.length / 2);
    const boxH = 14 + detailRows * 18 + 8;
    doc.setDrawColor(BORDER);
    doc.setFillColor(WASH);
    doc.roundedRect(margin, y, contentW, boxH, 5, 5, 'FD');
    const colW = contentW / 2;
    details.forEach((entry, i) => {
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

    // ── Items ────────────────────────────────────────────────────────────────
    const totalReceived = rows.reduce((s, r) => s + r.received, 0);
    const totalValue = rows.reduce((s, r) => s + r.unitPrice * r.received, 0);

    y = sectionLabel(doc, `Items Received  (${rows.length})`, margin, y);

    const body = rows.length > 0
        ? rows.map((r, i) => {
            const outstanding = Math.max(r.ordered - r.received, 0);
            return [
                String(i + 1),
                r.name,
                r.unit,
                String(r.ordered),
                String(r.received),
                outstanding > 0 ? String(outstanding) : '—',
                money(r.unitPrice),
                money(r.unitPrice * r.received),
            ];
        })
        : [['—', 'No items recorded', '—', '—', '—', '—', '—', '—']];

    // A long delivery spills over: the column head repeats, and every continuation page gets the
    // document header back so a loose page is still identifiable as this GRN.
    const redrawHeader = (): number =>
        drawDocHeader(doc, { logo, title: 'GOODS RECEIVED NOTE', refNo, pageW, margin }) + 26;
    const tableFirstPage = doc.getNumberOfPages();

    // Numeric columns: # / Ord. / Recd. / Outst. / Unit Price / Line Total. Shared by the body's
    // columnStyles and the header hook so figures and headings always align together.
    const NUMERIC_COLUMNS = [0, 3, 4, 5, 6, 7];

    autoTable(doc, {
        startY: y,
        head: [['#', 'Commodity', 'Unit', 'Ord.', 'Recd.', 'Outst.', 'Unit Price', 'Line Total']],
        body,
        theme: 'plain',
        showHead: 'everyPage',
        styles: { fontSize: 9, cellPadding: { top: 7, right: 6, bottom: 7, left: 6 }, textColor: INK },
        headStyles: {
            fillColor: TEAL_50, textColor: TEAL_DARK, fontStyle: 'bold', fontSize: 8,
            cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
        },
        alternateRowStyles: { fillColor: WASH },
        columnStyles: {
            0: { cellWidth: 22, halign: 'right', textColor: FAINT },
            2: { cellWidth: 54, textColor: MUTED },
            3: { cellWidth: 34, halign: 'right' },
            4: { cellWidth: 38, halign: 'right', fontStyle: 'bold' },
            5: { cellWidth: 40, halign: 'right', textColor: MUTED },
            6: { cellWidth: 62, halign: 'right' },
            7: { cellWidth: 70, halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: rightAlignHeaders(NUMERIC_COLUMNS),
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

    // ── Totals ───────────────────────────────────────────────────────────────
    y = ensureSpace(doc, { y, needed: 48, pageH, margin, onNewPage: redrawHeader });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED);
    doc.text(`Total:  ${rows.length} line item(s)   ·   ${totalReceived} unit(s) received`, pageW - margin, y, { align: 'right' });

    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(INK);
    doc.text(`Value received:  UGX ${money(totalValue)}`, pageW - margin, y, { align: 'right' });

    y += 34;

    // ── Declaration ──────────────────────────────────────────────────────────
    y = ensureSpace(doc, { y, needed: 46, pageH, margin, onNewPage: redrawHeader });
    y = drawParagraph(
        doc,
        'The items listed above were received in good condition unless noted otherwise. Once signed by both '
        + 'parties, scan and upload this note against the GRN record.',
        { x: margin, y, maxWidth: contentW, italic: true },
    );

    y += 34;

    // ── Authorisation ────────────────────────────────────────────────────────
    // Kept whole: the label and all three cards move to the next page together rather than
    // stranding a heading at the foot of one page and its cards at the top of the next.
    const sigH = 128;
    y = ensureSpace(doc, { y, needed: sigH + 24, pageH, margin, onNewPage: redrawHeader });
    y = sectionLabel(doc, 'Authorisation', margin, y);
    drawSignatureCards(
        doc,
        [
            { role: 'Delivered by', name: '' },
            { role: 'Received by', name: options?.receivedBy ?? '' },
            { role: 'Checked by', name: '' },
        ],
        { x: margin, y, contentW, height: sigH },
    );

    drawFooter(doc, {
        pageW, pageH, margin, refNo,
        note: 'Confidential — for internal store & procurement use',
    });

    doc.save(`GRN-${refNo.replace(/[/\\\s]+/g, '-')}.pdf`);
};
