/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useRef } from "react";
import TableComponent from "../../../../components/tables/TableComponent";
import { Box } from "@mui/material";
import RequestUtills from "../utills";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { RequestContext } from "../../../../context/request/RequestContext";
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import InfoIcon from '@mui/icons-material/Info';
import { crudStates } from "../../../../utils/constants";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ModalComponent from "../../../../components/modal";
import DeleteRequest from "../../DeleteRequest";
import StatusUtills from "../../../settings/statuses/Utills";
import { statusIdsByCodes } from "../../../../utils/helpers";
import {
    REQUEST_SEARCH_KEY,
    REQUEST_SORT_FIELDS,
    buildRequestColumnFilters,
    toRequestParams,
} from "../requestTableConfig";
import useRequestExport from "../useRequestExport";

const RejectedRequest = () => {
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const { fetchAllStatuses } = StatusUtills();
    const { requestTableData, setOptions, setRequestStatusIds } = useContext(RequestContext);
    const { exportRequests } = useRequestExport('Rejected');

    /*
     * Resolved from the status code, not hardcoded.
     *
     * This was the literal string "2", which relied on the status table having been seeded into an
     * empty database in a particular order. Any environment seeded differently — or any future
     * insert ahead of it — pointed this tab at the wrong status with nothing to indicate it.
     */
    const statusIds = statusIdsByCodes(statuses, ['requestRejected']);

    useEffect(() => { fetchAllStatuses(); }, []);

    useEffect(() => {
        if (statusIds) setRequestStatusIds(statusIds.split(',').map((id) => parseInt(id, 10)));
    }, [statusIds]);

    const {
        handleOptionClicked,
        columnHeaders,
        endPoint,
        loading,
        fetchAllRequests,
        handleRequest,
        count,
        modalState,
        handleClose,
        open,
        currentRequest,
        sendingRequest,
        setSendingRequest
    } = RequestUtills()

    /** The parameters in force, so paging and exporting reissue the query on screen. */
    const activeParams = useRef<Record<string, any>>({});

    const runQuery = (next: Record<string, any>) => {
        activeParams.current = next;
        fetchAllRequests(next);
    };

    useEffect(() => {
        /**
         * The status id for rejected requests, resolved by code.
         */
        // Depends on statusIds, which resolves only once the status catalogue has loaded — an
        // empty dependency list here would fire once with nothing and never fetch again.
        if (!statusIds) return;
        runQuery({ statusIds, status: "REJECTED" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusIds]);

    useEffect(() => { handleRequest(requests) }, [requests]);

    useEffect(() => {
        setOptions([
            { value: crudStates.delete, label: "Delete", icon: <InfoIcon fontSize='small' color='error' /> },
            { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
            { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> },
        ])
    }, []);


    const renderModals = () => (
        <>
            {
                crudStates.delete === modalState &&
                <ModalComponent width={"40%"} title='Delete Request' open={open} handleClose={handleClose}>
                    <DeleteRequest
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        buttonText="Delete" />
                </ModalComponent>
            }
        </>)
    return (
        <Box width={'100%'}>
            {renderModals()}
            {columnHeaders.length > 0 &&
                <TableComponent
                    endPoint={endPoint}
                    loading={loading}
                    count={count}
                    exportData
                    module={"rejected requests"}
                    header={{ plural: "Rejected Requests", singular: "Rejected Requests" }}
                    rows={requestTableData}
                    columnHeaders={columnHeaders}
                    handleOptionClicked={handleOptionClicked}
                    params={{ statusIds, status: "REJECTED" }}
                    refresh
                    columnFilters={buildRequestColumnFilters(statuses)}
                    /*
                     * Merged over this tab's own parameters. It previously passed the filters alone,
                     * which dropped `statusIds` — so filtering the Rejected tab listed every request
                     * in the system under a heading that said Rejected.
                     */
                    onApplyFilters={(filters) =>
                        runQuery(toRequestParams({ statusIds, status: "REJECTED" }, filters))}
                    onPaginationChange={(model) => fetchAllRequests(activeParams.current, model)}
                    onExport={(format) => exportRequests(format, activeParams.current)}
                    searchKey={REQUEST_SEARCH_KEY}
                    serverSortFields={REQUEST_SORT_FIELDS}
                />
            }
        </Box>
    )
}
export default RejectedRequest