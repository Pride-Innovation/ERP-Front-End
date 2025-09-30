/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Logo from '../statics/images/NavLogo-removebg-preview.png';

export const exportPDF = (columns, rows, fileName) => {
    // Create landscape PDF with slightly better quality
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
        compress: true
    });

    // Define document dimensions and margins
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 40;

    // Brand colors
    const primaryColor = [8, 121, 108]; // RGB
    const secondaryColor = [50, 50, 50]; // Dark gray
    const accentColor = [0, 95, 85]; // Darker shade for accents

    // Header section with logo
    const headerHeight = 100;

    // Add colored header bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // Add the actual logo image (left side)
    try {
        // Logo dimensions and positioning
        const logoWidth = 60;
        const logoHeight = 60;
        const logoX = margin;
        const logoY = margin / 2;

        // Add the logo image
        doc.addImage(Logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
        console.error('Error adding logo to PDF:', error);
        // Fallback in case logo fails to load
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, margin / 2, 80, 60, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("LOGO", margin + 40, margin / 2 + 30, { align: 'center' });
    }

    // Report title (right side)
    const titleText = fileName.charAt(0).toUpperCase() + fileName.slice(1) + ' Report';
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(titleText, pageWidth - margin, margin + 15, { align: 'right' });

    // Add report details section
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = today.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${formattedDate} at ${formattedTime}`, pageWidth - margin, margin + 35, { align: 'right' });
    doc.text(`Total Records: ${rows.length}`, pageWidth - margin, margin + 50, { align: 'right' });

    // Add a divider below header
    const startY = headerHeight + 20;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, startY - 10, pageWidth - margin, startY - 10);

    // Format columns for auto-table
    const formattedColumns = columns.map(col => ({
        header: col.title,
        dataKey: col.dataKey
    }));

    // Add the table with enhanced styling
    doc.autoTable({
        columns: formattedColumns,
        body: rows,
        startY: startY,
        margin: { top: startY, left: margin, right: margin, bottom: 60 },
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 11,
            cellPadding: 8,
        },
        bodyStyles: {
            fontSize: 10,
            cellPadding: 6,
            textColor: [40, 40, 40],
        },
        alternateRowStyles: {
            fillColor: [245, 248, 250]
        },
        styles: {
            font: 'helvetica',
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
        },
        // Format cells based on content type
        didParseCell: function (data) {
            // Right align numeric values
            if (typeof data.cell.raw === 'number') {
                data.cell.styles.halign = 'right';

                // Format currency values (if they seem like money values)
                if (data.column.dataKey.toLowerCase().includes('cost') ||
                    data.column.dataKey.toLowerCase().includes('price') ||
                    data.column.dataKey.toLowerCase().includes('amount')) {
                    // Format with commas but without currency symbol
                    data.cell.text = [new Intl.NumberFormat('en-UG', {
                        style: 'decimal', // Changed from 'currency' to 'decimal'
                        useGrouping: true, // Ensures commas for thousands
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(data.cell.raw)];

                    data.cell.styles.halign = 'right';
                }
            }

            // Format date cells
            if (data.column.dataKey.toLowerCase().includes('date') &&
                data.cell.raw &&
                typeof data.cell.raw === 'string') {
                try {
                    // Check if it's likely a date string
                    const dateValue = new Date(data.cell.raw);
                    if (!isNaN(dateValue.getTime())) {
                        data.cell.text = [dateValue.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })];
                    }
                } catch (e) {
                    // Not a valid date, leave as is
                }
            }

            // Center status columns
            if (data.column.dataKey.toLowerCase() === 'status') {
                data.cell.styles.halign = 'center';

                // Color status cells based on value
                if (data.cell.raw) {
                    const statusText = data.cell.raw.toString().toLowerCase();

                    if (statusText.includes('active') ||
                        statusText.includes('approved') ||
                        statusText.includes('completed')) {
                        data.cell.styles.textColor = [0, 128, 0]; // Green
                    } else if (statusText.includes('pending')) {
                        data.cell.styles.textColor = [255, 152, 0]; // Orange
                    } else if (statusText.includes('reject') ||
                        statusText.includes('cancel') ||
                        statusText.includes('error')) {
                        data.cell.styles.textColor = [211, 47, 47]; // Red
                    }
                }
            }
        },
        // Add page numbers and footer
        didDrawPage: function (data) {
            // Add watermark to EVERY page in the background
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.1 })); // Set transparency for the watermark
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(60);
            doc.setFont('helvetica', 'bold');
            doc.text('CONFIDENTIAL', pageWidth / 1.5, pageHeight / 1.5, {
                align: 'center',
                angle: 45
            });
            doc.restoreGraphicsState(); // Restore normal opacity for other content
            // Footer with page numbers and company information
            const footerY = pageHeight - 25;

            // Add subtle footer bar
            doc.setFillColor(245, 245, 245);
            doc.rect(0, footerY - 15, pageWidth, 40, 'F');

            // Add company name/copyright on left
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.setFont('helvetica', 'italic');
            doc.text('Pride Bank Limited © ' + new Date().getFullYear(), margin, footerY);

            // Add report name in center
            doc.setFont('helvetica', 'normal');
            doc.text(fileName.charAt(0).toUpperCase() + fileName.slice(1), pageWidth / 2, footerY, { align: 'center' });

            // Add page numbers on right
            const pageCount = doc.internal.getNumberOfPages();
            doc.text(
                `Page ${data.pageNumber} of ${pageCount}`,
                pageWidth - margin,
                footerY,
                { align: 'right' }
            );

            // Add subtle divider above footer
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.line(margin, footerY - 20, pageWidth - margin, footerY - 20);
        },
        // Handle table overflow across pages
        willDrawCell: function (data) {
            // Add light border to cells
            if (data.row.index === 0 && data.section === 'body') {
                // Add subtle separator between header and first row
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.3);
            }
        }
    });

    doc.save(`${fileName}.pdf`);
}