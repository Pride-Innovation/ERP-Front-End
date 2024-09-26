import { useEffect, useState } from "react";
import { testListMock } from "../../mocks/trails";
import { ITableHeader } from "../../components/tables/interface";
import { getTableHeaders } from "../../components/tables/getTableHeaders";

const TestUtils = () => {
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { id, ...data } = testListMock[0];

    const rowData = { ...data };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    return (
        { columnHeaders }
    )
}

export default TestUtils