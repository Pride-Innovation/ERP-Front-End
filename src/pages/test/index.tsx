/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid } from "@mui/material"
import TableComponent from "../../components/tables/TableComponent";
import TestUtils from "./testUtills";
import { useContext, useEffect, useState } from "react";
import { fetchRowsService } from "../../core/apis/globalService";
import { GridRowsProp } from "@mui/x-data-grid";
import RowContext from "../../context/row/RowContext";
import { ErrorMessage } from "../../core/apis/axiosInstance";

const TestComponent = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const { setRows, rows } = useContext(RowContext);
    const { columnHeaders, endPoint, header } = TestUtils();

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ pageNumber: 1, pageSize: 10, endPoint }) as unknown as GridRowsProp;
            setRows([...response]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchResources()
    }, []);

    return (
        <>
            {rows?.length > 0 && <Grid xs={12} container>
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={100}
                        exportData
                        header={header}
                        rows={rows}
                        columnHeaders={columnHeaders}
                    />
                }
            </Grid>}
        </>
    )
}

export default TestComponent