import { Grid } from "@mui/material"
import TableComponent from "../../components/tables/TableComponent";
import TestUtils from "./testUtills";
import { ITest } from "../../mocks/trails";
import { useContext, useEffect, useState } from "react";
import { fetchTestData } from "./service";
import { TestContext } from "../../components/test/TestContext";

const TestComponent = () => {
    const { columnHeaders } = TestUtils();
    const [loading, setLoading] = useState<boolean>(false);
    const header = { plural: 'Test Trails', singular: 'Test Trail' };
    const { tests, setTests } = useContext(TestContext);

    const fetchResources = async () => {
        setLoading(true)
        const response = await fetchTestData({ id: 1, size: 10 }) as unknown as ITest[];
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