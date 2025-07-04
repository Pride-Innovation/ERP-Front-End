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
 * Generates a professional GRN PDF.
 * @param {Object} data - The GRN JSON object.
 * @param {string} [logoBase64] - Optional Base64 image string (e.g. data:image/png;base64,...).
 */
export function generateGoodsReceivedNote(data, logoBase64 = null, username = 'Pride Bank Limited') {
    const doc = new jsPDF();
    const primaryColor = '#835F1E';
    const secondaryColor = '#08796C';
    const black = '#000000';

    let cursorY = 15;

    // 🖼️ Add Logo (if provided)
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 160, 10, 30, 40); // x, y, width, height
    }

    // 🧾 Header
    doc.setTextColor(primaryColor);
    doc.setFontSize(16);
    doc.text('PRIDE BANK LIMITED', 14, cursorY);
    doc.setTextColor(secondaryColor);
    doc.setFontSize(14);
    doc.text('GOODS RECEIVED NOTE (GRN)', 14, (cursorY += 10));

    // 📑 Details
    doc.setTextColor(black);
    doc.setFontSize(10);
    doc.text(`GRN Ref No: ${data.reports[0].grnReport.name}`, 14, (cursorY += 10));
    doc.text(`LPO No: ${data.lpoNumber}`, 14, (cursorY += 6));
    doc.text(`Date: ${new Date(data.createDate).toLocaleDateString()}`, 14, (cursorY += 6));
    doc.text(`Branch: ${data.branch.name}`, 14, (cursorY += 6));

    doc.setTextColor(primaryColor);
    doc.text('Supplier Information', 14, (cursorY += 10));
    doc.setTextColor(black);
    doc.text(`Name: ${data.supplier.name}`, 14, (cursorY += 6));
    doc.text(`Phone: ${data.supplier.telephone}`, 14, (cursorY += 6));
    doc.text(`Email: ${data.supplier.email}`, 14, (cursorY += 6));
    doc.text(`Address: ${data.supplier.address}`, 14, (cursorY += 6));

    // 📋 Acknowledgment
    doc.setFontSize(10);
    doc.text(`We acknowledge receipt of the items listed below as detailed in LPO No: ${data.lpoNumber}`, 14, (cursorY += 10));

    // 📦 Commodities Table
    const tableData = data.reports.map((item, index) => {
        const variance = item.orderedQuantity - item.totalDeliveredQuantity;
;
        return [
            index + 1,
            item.commodity.name,
            item.orderedQuantity,
            item.totalDeliveredQuantity,
            variance,
            `UGX ${item.costPrice.toLocaleString()}`,
            `UGX ${item.purchasePrice.toLocaleString()}`
        ];
    });

    autoTable(doc, {
        head: [
            [
                '#',
                'Item Description',
                'Qty Ordered',
                'Qty Received',
                'Variance',
                'Cost Price',
                'Purchase Price'
            ]
        ],
        body: tableData,
        startY: cursorY + 6,
        headStyles: {
            fillColor: secondaryColor,
            textColor: '#ffffff',
        },
        styles: {
            fontSize: 9,
            textColor: black,
        },
    });

    // 💰 Totals
    const afterTableY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(black);
    doc.text(`Total Cost: UGX ${data.totalCost.toLocaleString()}`, 14, afterTableY);
    doc.text(`Balance Cost: UGX ${data.balanceCost.toLocaleString()}`, 14, afterTableY + 6);
    // doc.text(`Status: ${data.status.name}`, 14, afterTableY + 12);

    // 🎯 Status Color Logic
    const status = data.status.name?.toLowerCase();
    let statusColor = '#000000'; // default black

    if (status === 'pending') {
        statusColor = '#e67e22'; // orange
    } else if (status === 'completed') {
        statusColor = '#2ecc71'; // green
    }

    doc.setTextColor(statusColor);
    doc.text(`Status: ${data.status.name}`, 14, afterTableY + 12);
    doc.setTextColor(black); // reset to black after status
    // End of Status Color Logic.


    // 🖊️ Signature Area
    const signatureY = afterTableY + 25;
    doc.setFontSize(10);
    doc.setTextColor(black);
    doc.text(`Delivered by: _____________________  Signature: ____________  Date: ${moment(new Date()).format('Do MMMM YYYY')}`, 14, signatureY);
    doc.text(`Received by: ${username}  Signature: ____________  Date: ${moment(new Date()).format('Do MMMM YYYY')}`, 14, signatureY + 10);

    // 📤 Save
    doc.save(`GRN_${data.reports[0].grnReport.name}.pdf`);
}
