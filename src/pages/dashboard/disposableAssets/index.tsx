/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import DisposalAssetsUtills from "./utills";
import RowContext from "../../../context/row/RowContext";
import { fetchRowsService } from "../../../core/apis/globalService";
import { GridRowsProp } from "@mui/x-data-grid";
import { itEquipmentMock } from "../../../mocks/itEquipment";
import TableComponent from "../../../components/tables/TableComponent";
import { ErrorMessage } from "../../../core/apis/axiosInstance";

const DisposalAssets = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { endPoint, columnHeaders, header } = DisposalAssetsUtills();
    const { setRows, rows } = useContext(RowContext);

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService(
                {
                    pageNumber: 1,
                    pageSize: 10,
                    endPoint
                }
            ) as unknown as GridRowsProp;

            console.log(response, "response!!");

            setRows([...itEquipmentMock]);
        } catch (error) {
            setRows([...itEquipmentMock]);
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
        setLoading(false)
    }

    useEffect(() => { fetchResources() }, []);

    return (
        <TableComponent
            endPoint={endPoint}
            loading={loading}
            count={100}
            header={header}
            rows={rows}
            columnHeaders={columnHeaders}
            paginationMode='client'
        />
    )
}

export default DisposalAssets