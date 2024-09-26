import { useEffect, useState } from "react";
import { testListMock } from "../../mocks/trails";
import { ITableHeader } from "../../components/tables/interface";
import { getTableHeaders } from "../../components/tables/getTableHeaders";

const TestUtils = () => {
    const endPoint = 'posts';
    const header = { plural: 'Test Trails', singular: 'Test Trail' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { id, ...data } = testListMock[0];

    const rowData = { ...data };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    return (
        { columnHeaders, endPoint, header }
    )
}

export default TestUtils