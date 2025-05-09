/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


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
