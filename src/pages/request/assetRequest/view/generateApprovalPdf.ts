/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LogoSrc from '../../../../statics/images/pride_logo_horizontal.png';
import {
    BORDER, FAINT, GOLD, INK, MUTED, TEAL, TEAL_50, TEAL_DARK, WASH,
    drawDocHeader, drawFooter, drawParagraph, drawPill, drawSignatureCards, ensureSpace,
    loadImage, partyPanel, rightAlignHeaders, sectionLabel,
} from '../../../../utils/pdf/docKit';
import { camelCaseToWords } from '../../../../utils/helpers';
import { ICommodity } from '../../../settings/commodity/interface';
import { IRequest } from '../../interface';
import { IStepLog, decidedSteps, isHeadOfficeRequest } from './approvalTrail';
import { requestApproverLabel } from '../../approverLabel';

/** Step decision → [label, background, foreground] for the trail table's decision column. */
const DECISION_META: Record<string, [string, string, string]> = {
    APPROVED: ['Approved', '#DCFCE7', '#15803D'],
    REJECTED: ['Rejected', '#FEE2E2', '#B91C1C'],
    ISSUED: ['Issued', '#E9F3F1', TEAL_DARK],
    ACKNOWLEDGED: ['Acknowledged', '#E9F3F1', TEAL_DARK],
};

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (d?: string | null) =>
    d ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }) : '—';

const personName = (person?: { firstName?: string; lastName?: string } | null): string =>
    [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim() || '—';

/**
 * The approval certificate for an asset request: what was asked for, and who signed it off.
 *
 * <p>Deliberately built on the same {@code docKit} as the Goods Received Note and the Store
 * Release note. All three leave the bank as evidence of a decision or a handover and are filed
 * together, so they share a brand strip, logo, gold-underlined sections, light ledger tables and
 * signature cards. A reader should not have to work out which system produced which page.
 *
 * <p>Two tables rather than one: the items are what was requested, the trail is what was decided
 * about them. Merging them would imply each approval applied to a particular line, which is not
 * how the workflow works — every approval covers the whole request.
 *
 * <p>Printing is gated on the Branch Manager's (or, at Head Office, the Head of Department's)
 * approval — see {@code printEligibility} in `approvalTrail`. This function assumes the caller has
 * already checked that, and prints whatever trail it is given.
 */
export const generateApprovalPdf = async (
    request: IRequest,
    logs: IStepLog[],
): Promise<void> => {
    const logo = await loadImage(LogoSrc);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 44;
    const contentW = pageW - margin * 2;

    const refNo = `REQ-${request.id ?? ''}`;
    const title = 'REQUEST APPROVAL CERTIFICATE';
    const headOffice = isHeadOfficeRequest(request);
    const steps = decidedSteps(logs);
    const generatedLabel = new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    // ── Header ───────────────────────────────────────────────────────────────
    const hrY = drawDocHeader(doc, { logo, title, refNo, pageW, margin });

    // ── Reference row ────────────────────────────────────────────────────────
    let y = hrY + 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(INK);
    doc.text(request.name || `Request #${request.id ?? '—'}`, margin, y, { maxWidth: contentW - 170 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text(
        headOffice
            ? 'Head Office request — approved through the Head Office route'
            : 'Branch request — approved through the branch route',
        margin, y + 15,
    );

    const statusLabel = request.status?.name
        || (request.status?.status ? camelCaseToWords(request.status.status) : 'Open');
    drawPill(doc, statusLabel, pageW - margin, y, TEAL_50, TEAL_DARK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(FAINT);
    doc.text(`Generated ${generatedLabel}`, pageW - margin, y + 15, { align: 'right' });

    y += 36;

    // ── Requester → current holder ───────────────────────────────────────────
    y = sectionLabel(doc, 'Requester & Routing', margin, y);
    const gap = 34;
    const panelW = (contentW - gap) / 2;
    const panelH = 54;
    const panelY = y;

    const requesterSub = [
        request.requester?.branch?.name,
        (request.requester?.department as { name?: string } | null | undefined)?.name,
    ].filter(Boolean).join('   ·   ');

    partyPanel(doc, margin, panelY, panelW, panelH, 'REQUESTED BY', TEAL,
        personName(request.requester ?? request.createdBy), requesterSub);
    /*
     * "CURRENTLY WITH" names the unit when the step is routed to one.
     *
     * This panel is the whole point of the certificate — it says who holds the request now — and it
     * printed "No outstanding approver" for one sitting with Admin awaiting acknowledgement. On a
     * signed document that is not just unhelpful, it is wrong: somebody does hold it.
     */
    const heldBy = requestApproverLabel(request);
    partyPanel(doc, margin + panelW + gap, panelY, panelW, panelH, 'CURRENTLY WITH', GOLD,
        heldBy ?? personName(request.currentApprover),
        heldBy ? 'Pending action' : 'No outstanding approver');

    // Forward arrow between the panels, pointing at whoever holds it now.
    const acx = margin + panelW + gap / 2;
    const acy = panelY + panelH / 2;
    doc.setDrawColor(FAINT);
    doc.setLineWidth(1.3);
    doc.line(acx - 7, acy, acx + 7, acy);
    doc.line(acx + 2, acy - 4, acx + 7, acy);
    doc.line(acx + 2, acy + 4, acx + 7, acy);
    doc.setLineWidth(0.5);

    y = panelY + panelH + 24;

    // ── Request details ──────────────────────────────────────────────────────
    const details: Array<[string, string]> = [
        ['Request No', refNo],
        ['Raised On', fmtDate(request.createDate)],
        ['Priority', request.priority ? `${request.priority[0].toUpperCase()}${request.priority.slice(1)}` : '—'],
        ['Category', request.assetType?.name || '—'],
        ['Branch', request.requester?.branch?.name || '—'],
        ['Current Status', statusLabel],
    ];
    y = sectionLabel(doc, 'Request Details', margin, y);
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

    // Every continuation page gets the document header back, so a loose page is still
    // identifiable as this certificate.
    const redrawHeader = (): number =>
        drawDocHeader(doc, { logo, title, refNo, pageW, margin }) + 26;

    // ── Items requested ──────────────────────────────────────────────────────
    const lines = (request.commodities ?? []) as Array<{ commodity: ICommodity; quantity: number }>;
    const totalQty = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);

    y = sectionLabel(doc, `Items Requested  (${lines.length})`, margin, y);

    const itemBody = lines.length > 0
        ? lines.map((line, i) => [
            String(i + 1),
            line.commodity?.name ?? '—',
            line.commodity?.groupName ?? '—',
            String(Number(line.quantity) || 0),
        ])
        : [['—', 'No items recorded', '—', '—']];

    const itemsFirstPage = doc.getNumberOfPages();
    const ITEM_NUMERIC = [0, 3];

    autoTable(doc, {
        startY: y,
        head: [['#', 'Item', 'Unit', 'Qty']],
        body: itemBody,
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
            2: { cellWidth: 90, textColor: MUTED },
            3: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: rightAlignHeaders(ITEM_NUMERIC),
        margin: { top: 104, left: margin, right: margin, bottom: 58 },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 0) {
                doc.setDrawColor(BORDER);
                doc.setLineWidth(0.5);
                doc.line(margin, data.cell.y + data.row.height, pageW - margin, data.cell.y + data.row.height);
            }
        },
        didDrawPage: () => {
            if (doc.getNumberOfPages() > itemsFirstPage) redrawHeader();
        },
    });

    // @ts-expect-error autoTable augments the doc with lastAutoTable at runtime
    y = (doc.lastAutoTable?.finalY ?? y + 40) + 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED);
    doc.text(
        `Total:  ${lines.length} line item(s)   ·   ${totalQty} unit(s) requested`,
        pageW - margin, y, { align: 'right' },
    );

    y += 30;

    // ── Approval trail ───────────────────────────────────────────────────────
    y = ensureSpace(doc, { y, needed: 90, pageH, margin, onNewPage: redrawHeader });
    y = sectionLabel(doc, `Approval Trail  (${steps.length})`, margin, y);

    const trailBody = steps.length > 0
        ? steps.map((step) => [
            String(step.stepOrder),
            step.stepName || (step.approverType ? camelCaseToWords(step.approverType.toLowerCase()) : '—'),
            (DECISION_META[step.action] ?? [step.action])[0],
            step.actorName || step.actorEmail || '—',
            fmtDateTime(step.lastModified),
            step.comment || '—',
        ])
        : [['—', 'No decisions recorded', '—', '—', '—', '—']];

    const trailFirstPage = doc.getNumberOfPages();

    autoTable(doc, {
        startY: y,
        head: [['#', 'Stage', 'Decision', 'Actioned By', 'Date & Time', 'Comment']],
        body: trailBody,
        theme: 'plain',
        showHead: 'everyPage',
        styles: {
            fontSize: 8.5, cellPadding: { top: 7, right: 6, bottom: 7, left: 6 },
            textColor: INK, valign: 'top',
        },
        headStyles: {
            fillColor: TEAL_50, textColor: TEAL_DARK, fontStyle: 'bold', fontSize: 8,
            cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
        },
        alternateRowStyles: { fillColor: WASH },
        columnStyles: {
            0: { cellWidth: 20, halign: 'right', textColor: FAINT },
            1: { cellWidth: 104, fontStyle: 'bold' },
            2: { cellWidth: 62 },
            3: { cellWidth: 92 },
            4: { cellWidth: 90, textColor: MUTED },
            5: { textColor: MUTED, fontStyle: 'italic' },
        },
        didParseCell: (data) => {
            rightAlignHeaders([0])(data);
            // Tint the decision cell to match the on-screen status chips, so the printed trail
            // can be skimmed for the rejection the same way the screen can.
            if (data.section === 'body' && data.column.index === 2) {
                const meta = DECISION_META[steps[data.row.index]?.action ?? ''];
                if (meta) {
                    data.cell.styles.fillColor = meta[1];
                    data.cell.styles.textColor = meta[2];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        margin: { top: 104, left: margin, right: margin, bottom: 58 },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 0) {
                doc.setDrawColor(BORDER);
                doc.setLineWidth(0.5);
                doc.line(margin, data.cell.y + data.row.height, pageW - margin, data.cell.y + data.row.height);
            }
        },
        didDrawPage: () => {
            if (doc.getNumberOfPages() > trailFirstPage) redrawHeader();
        },
    });

    // @ts-expect-error autoTable augments the doc with lastAutoTable at runtime
    y = (doc.lastAutoTable?.finalY ?? y + 40) + 24;

    // ── Declaration ──────────────────────────────────────────────────────────
    y = ensureSpace(doc, { y, needed: 46, pageH, margin, onNewPage: redrawHeader });
    y = drawParagraph(
        doc,
        `This certificate records the approvals held against request ${refNo} at the time of printing. `
        + `It is issued after ${headOffice ? 'Head of Department' : 'Branch Manager'} approval and reflects `
        + 'the workflow trail retained by the system. Any approval recorded after this date will not appear above.',
        { x: margin, y, maxWidth: contentW, italic: true },
    );

    y += 34;

    // ── Authorisation ────────────────────────────────────────────────────────
    // Kept whole: the label and both cards move to the next page together rather than stranding
    // a heading at the foot of one page and its cards at the top of the next.
    const sigH = 128;
    y = ensureSpace(doc, { y, needed: sigH + 24, pageH, margin, onNewPage: redrawHeader });
    y = sectionLabel(doc, 'Certified By', margin, y);
    drawSignatureCards(
        doc,
        [
            { role: headOffice ? 'Head of Department' : 'Branch Manager', name: '' },
            { role: 'Administration', name: '' },
        ],
        { x: margin, y, contentW, height: sigH },
    );

    drawFooter(doc, {
        pageW, pageH, margin, refNo,
        note: 'Confidential — for internal approval & audit use',
    });

    doc.save(`Request-Approval-${refNo}.pdf`);
};
