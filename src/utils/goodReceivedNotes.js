/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

/**
 * Generates a professional GRN PDF with improved layout.
 * @param {Object} data - The GRN JSON object.
 * @param {string} [logoBase64] - Optional Base64 image string.
 * @param {string} [username] - The username of the person receiving the goods.
 */
export function generateGoodsReceivedNote(data, logoBase64 = null, username = 'Pride Bank Limited') {
    // Initialize document with better formatting
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const PRIMARY_COLOR = '#835F1E';     // Gold/brown for primary branding
    const SECONDARY_COLOR = '#08796C';   // Teal for secondary elements
    const LIGHT_GOLD = '#F6EFE0';        // Light gold for backgrounds
    const LIGHT_TEAL = '#E6F2F1';        // Light teal for backgrounds
    const BLACK = '#000000';
    const GREY = '#707070';

    // REDUCED margin for more content space
    const margin = 17;
    const pageWidth = 210; // A4 width in mm
    const contentWidth = pageWidth - (margin * 2);

    const drawPageBorder = () => {
        doc.setDrawColor(PRIMARY_COLOR);
        doc.setLineWidth(0.5);

        // MUCH FURTHER EXTENDED border - now with 10mm padding all around
        // Extended from margin-5 to margin-10 and height from 270 to 280
        doc.rect(margin - 10, margin - 10, contentWidth + 20, 280); // Outer border

        doc.setDrawColor(SECONDARY_COLOR);
        doc.setLineWidth(1.5);
        doc.line(margin - 10, margin + 30, margin + contentWidth + 10, margin + 30);
    };

    drawPageBorder();

    // Document header
    let y = margin;

    // Logo placement
    if (logoBase64) {
        // Moved logo up from y+2 to y-4 to prevent overlap with header background
        doc.addImage(logoBase64, 'PNG', pageWidth - margin - 25, y - 4, 18, 18);
    }

    // Header title section
    doc.setTextColor(PRIMARY_COLOR);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('PRIDE BANK LIMITED', margin, y + 10);

    // Add subtle background for header
    doc.setFillColor(LIGHT_GOLD);
    doc.rect(margin - 3, y + 15, contentWidth + 6, 12, 'F');

    doc.setTextColor(SECONDARY_COLOR);
    doc.setFontSize(14);
    doc.text('GOODS RECEIVED NOTE (GRN)', margin, y + 24);

    y += 35; // Move down after header

    // Document reference section with structured layout
    doc.setFillColor(LIGHT_TEAL);
    doc.roundedRect(margin - 3, y, contentWidth + 6, 28, 2, 2, 'F');

    doc.setTextColor(BLACK);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');

    // Left column
    doc.text(`GRN Ref No: ${data.reports[0].grnReport.name}`, margin, y + 8);
    doc.text(`LPO No: ${data.lpoNumber}`, margin, y + 18);

    // Right column
    doc.text(`Date: ${moment(data.createDate).format('Do MMMM YYYY')}`, margin + contentWidth / 2, y + 8);
    doc.text(`Branch: ${data.branch.name}`, margin + contentWidth / 2, y + 18);

    y += 35;

    // Supplier section with box
    doc.setFillColor(LIGHT_GOLD);
    doc.roundedRect(margin - 3, y, contentWidth + 6, 37, 2, 2, 'F');

    doc.setFont(undefined, 'bold');
    doc.setTextColor(PRIMARY_COLOR);
    doc.setFontSize(11);
    doc.text('SUPPLIER INFORMATION', margin, y + 8);

    // Supplier details
    doc.setTextColor(BLACK);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    const supplierCol1 = [
        `Name: ${data.supplier.name}`,
        `Email: ${data.supplier.email}`
    ];

    const supplierCol2 = [
        `Phone: ${data.supplier.telephone}`,
        `Address: ${data.supplier.address}`
    ];

    supplierCol1.forEach((text, i) => {
        doc.text(text, margin, y + 18 + (i * 8));
    });

    supplierCol2.forEach((text, i) => {
        doc.text(text, margin + contentWidth / 2, y + 18 + (i * 8));
    });

    y += 45;

    // Acknowledgment with accent styling
    doc.setFont(undefined, 'italic');
    doc.setTextColor(GREY);
    doc.setFontSize(9);
    doc.text(`We acknowledge receipt of the items listed below as detailed in LPO No: ${data.lpoNumber}`, margin, y);

    y += 10;

    // Prepare table data
    const tableData = data.reports.map((item, index) => {
        const variance = item.orderedQuantity - item.totalDeliveredQuantity;
        return [
            index + 1,
            item.commodity.name,
            item.orderedQuantity,
            item.totalDeliveredQuantity,
            variance,
            item.costPrice.toLocaleString(),
            item.purchasePrice.toLocaleString()
        ];
    });

    autoTable(doc, {
        head: [['#', 'Item Description', 'Qty Ordered', 'Qty Received', 'Variance', 'Cost Price', 'Purchase Price']],
        body: tableData,
        startY: y,
        margin: { left: margin - 3, right: margin - 3 },
        headStyles: {
            fillColor: SECONDARY_COLOR,
            textColor: '#FFFFFF',
            lineWidth: 0.1,
            lineColor: '#FFFFFF',
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 3,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: BLACK,
            lineColor: '#CCCCCC'
        },
        alternateRowStyles: {
            fillColor: LIGHT_TEAL
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 44 },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 25 },
            4: { halign: 'center', cellWidth: 25 },
            5: { halign: 'right', cellWidth: 26 },
            6: { halign: 'right', cellWidth: 26 }
        },
        didDrawPage: (data) => {
            drawPageBorder();
        }
    });

    const afterTableY = doc.lastAutoTable.finalY + 10;

    doc.setFillColor(LIGHT_TEAL);
    doc.roundedRect(pageWidth - margin - 80, afterTableY - 4, 80, 38, 2, 2, 'F');

    doc.setTextColor(SECONDARY_COLOR);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('SUMMARY', pageWidth - margin - 75, afterTableY + 5);

    doc.setTextColor(BLACK);
    doc.text(`Total Cost:`, pageWidth - margin - 75, afterTableY + 15);
    doc.text(`Balance Cost:`, pageWidth - margin - 75, afterTableY + 25);

    doc.text(`UGX ${data.totalCost.toLocaleString()}`, pageWidth - margin - 10, afterTableY + 15, { align: 'right' });
    doc.text(`UGX ${data.balanceCost.toLocaleString()}`, pageWidth - margin - 10, afterTableY + 25, { align: 'right' });

    const status = data.status.status?.toLowerCase();
    let statusColor = BLACK;
    let statusBgColor = '#F4F4F4';

    if (status === 'stockpending') {
        statusColor = '#e67e22';
        statusBgColor = '#FFF3E0';
    } else if (status === 'stockcompleted') {
        statusColor = '#2ecc71';
        statusBgColor = '#E8F5E9';
    }

    // Status badge - adjusted positioning to balance with summary box
    doc.setFillColor(statusBgColor);
    doc.roundedRect(margin, afterTableY + 5, 75, 18, 5, 5, 'F');
    doc.setTextColor(statusColor);
    doc.setFont(undefined, 'bold');
    doc.text(`Status: ${data.status.name}`, margin + 37.5, afterTableY + 15, { align: 'center' });

    // SIGNATURE SECTION - now with more room inside extended border
    // More conservative position to ensure it fits within the extended border
    const signatureY = Math.min(Math.max(afterTableY + 50, 230), 260);

    // Divider line
    doc.setDrawColor(GREY);
    doc.setLineWidth(0.5);
    doc.line(margin, signatureY - 10, margin + contentWidth, signatureY - 10);

    // Signature title
    doc.setFont(undefined, 'bold');
    doc.setTextColor(SECONDARY_COLOR);
    doc.setFontSize(11);
    doc.text('AUTHORIZATION', margin, signatureY);

    // Signature blocks
    doc.setFont(undefined, 'normal');
    doc.setTextColor(BLACK);
    doc.setFontSize(9);

    // Delivered by
    doc.text('Delivered by:', margin, signatureY + 15);
    doc.line(margin + 25, signatureY + 15, margin + 90, signatureY + 15);

    doc.text('Signature:', margin + 95, signatureY + 15);
    doc.line(margin + 120, signatureY + 15, margin + 160, signatureY + 15);

    // Received by
    doc.text('Received by:', margin, signatureY + 30);
    doc.text(username, margin + 25, signatureY + 30);
    doc.line(margin + 25 + doc.getTextWidth(username), signatureY + 30, margin + 90, signatureY + 30);

    doc.text('Signature:', margin + 95, signatureY + 30);
    doc.line(margin + 120, signatureY + 30, margin + 160, signatureY + 30);

    // Date line
    doc.text('Date:', margin, signatureY + 45);
    doc.text(moment(new Date()).format('Do MMMM YYYY'), margin + 25, signatureY + 45);

    // Footer with page numbers - adjusted position to be below extended border
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(GREY);

        // Page number - positioned well below the extended border
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - margin,
            292, // Moved down from 285 to account for larger extended border
            { align: 'right' }
        );

        // Footer text - positioned well below the extended border
        doc.text(
            'Generated by Pride Bank Asset Management System',
            margin,
            292 // Moved down from 285 to account for larger extended border
        );
    }

    // Save the PDF with appropriate filename
    doc.save(`GRN_${data.reports[0].grnReport.name}.pdf`);
}