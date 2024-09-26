import { Grid } from "@mui/material"
import TableComponent from "../../components/tables/TableComponent";
import TestUtils from "./testUtills";
import { ITest } from "../../mocks/trails";
import { useContext, useEffect, useState } from "react";
import { TestContext } from "../../components/test/TestContext";
import { fetchRowsService } from "../../core/apis/globalService";

const TestComponent = () => {
    const { columnHeaders } = TestUtils();
    const [loading, setLoading] = useState<boolean>(false);
    const header = { plural: 'Test Trails', singular: 'Test Trail' };
    const endPoint = 'posts'
    const { tests, setTests } = useContext(TestContext);

    const fetchResources = async () => {
        setLoading(true)
        const response = await fetchRowsService({ page: 1, size: 10, endPoint }) as unknown as ITest[];
        setTests([...response]);
        setLoading(false)
    }

    useEffect(() => {
        fetchResources()
    }, []);

    return (
        <>
            {tests?.length > 0 && <Grid xs={12} container>
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={100}
                        exportData
                        header={header}
                        rows={tests}
                        columnHeaders={columnHeaders}
                    />
                }
            </Grid>}
        </>
    )
}

export default TestComponent