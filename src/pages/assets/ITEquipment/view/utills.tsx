import { useEffect, useState } from "react";
import { ITableHeader } from "../../../../components/tables/interface";
import assignmentHistoryMock from "../../../../mocks/assignmentHistory";
import { getTableHeaders } from "../../../../components/tables/getTableHeaders";

const ITEquipmentViewUtills = () => {
    const endPoint = 'posts';
    const header = { plural: 'Assignment History', singular: 'Assignment' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);

    const {
        id,
        user,
        serialNumber,
        statusBefore,
        statusAfter,
        ...data
    } = assignmentHistoryMock[0];

    const rowData = {
        user: assignmentHistoryMock[0].user,
        serialNumber: assignmentHistoryMock[0].serialNumber,
        statusBefore: assignmentHistoryMock[0].statusBefore,
        statusAfter: assignmentHistoryMock[0].statusAfter,
        ...data,
    };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    return ({
        endPoint,
        header,
        columnHeaders
    }
    )
}

export default ITEquipmentViewUtills