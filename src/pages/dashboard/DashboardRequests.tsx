/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useSelector } from "react-redux";
import TableComponent from "../../components/tables/TableComponent";
import DashBoardUtills from "./utills";
import { useContext, useEffect } from "react";
import { RootState } from "../../store";
import { RequestContext } from "../../context/request/RequestContext";


const DashboardRequests = () => {
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
    const { requestTableData, count } = useContext(RequestContext);

    const {
        endPoint,
        columnHeaders,
        header,
        handleRequest,
        fetchLatestRequest,
        loading
    } = DashBoardUtills();


    useEffect(() => { fetchLatestRequest() }, []);
    useEffect(() => { handleRequest(requests) }, [requests])

    return (
        <TableComponent
            endPoint={endPoint}
            loading={loading}
            count={count}
            header={header}
            rows={requestTableData || []}
            columnHeaders={columnHeaders}
            paginationMode='server'
        />
    )
}

export default DashboardRequests;