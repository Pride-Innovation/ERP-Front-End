import { useEffect, useState } from "react";
import { auditTrailsMock } from "../../mocks/trails";
import { ITableHeader } from "../../components/tables/interface";
import { getTableHeaders } from "../../components/tables/getTableHeaders";

const AuditUtils = () => {
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { id, ...data } = auditTrailsMock[0];

    const rowData = { ...data };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    return (
        { columnHeaders }
    )
}

export default AuditUtils