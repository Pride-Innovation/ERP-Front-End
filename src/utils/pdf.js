import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportPDF = (columns, rows, fileName) => {
    const doc = new jsPDF('l', 'pt');

    doc.autoTable({
        columns: columns,
        body: rows,
    });

    doc.save(`${fileName}.pdf`);
}
