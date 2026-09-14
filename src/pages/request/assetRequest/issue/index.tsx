/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import TableComponent from "../../../../components/tables/TableComponent";
import { Box } from "@mui/material";
import RequestUtills from "../utills";
import { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { RequestContext } from "../../../../context/request/RequestContext";
import ToggleOffOutlined from '@mui/icons-material/ToggleOffOutlined';
import { crudStates } from "../../../../utils/constants";
import ModalComponent from "../../../../components/modal";
import AcknowledgeReceipt from "../AcknowledgeReceipt";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ApproveIssuance from "../ApproveIssuance";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import usePermissions from "../../../../core/permissions/usePermissions";
import { PERMISSIONS } from "../../../../core/permissions/constants";
import StatusUtills from "../../../settings/statuses/Utills";
import { statusIdByCode } from "../../../../utils/helpers";
import {
    REQUEST_SEARCH_KEY,
    REQUEST_SORT_FIELDS,
    buildRequestColumnFilters,
    toRequestParams,
} from "../requestTableConfig";
import useStaffOptions from "../useStaffOptions";
import useRequestExport from "../useRequestExport";

const IssuedRequest = () => {
    /*
     * The staff directory behind the "Requested By" and "Approver" pickers.
     *
     * Branch-scoped on the server, so the list offered matches what this listing can actually return.
     */
    const fetchStaffOptions = useStaffOptions();

    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const { fetchAllStatuses } = StatusUtills();
    const { requestTableData, setOptions, setRequestStatusIds } = useContext(RequestContext);
    const { has } = usePermissions();
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // The "Issued" tab groups the three post-issuance request states. Ids are resolved from
    // status codes (never hardcoded — seeded ids vary by environment, see utils/helpers).
    const ISSUED_GROUP_CODES = ['issued', 'issuanceApproved', 'receiptAcknowledged'];
    const issuedGroupCsv = ISSUED_GROUP_CODES
        .map((code) => statusIdByCode(statuses, code))
        .filter((id): id is number => id != null)
        .join(',');

    const [statusIds, setStatusIds] = useState<string>('');
    const { exportRequests } = useRequestExport('Issued');

    /** The parameters in force, so paging and exporting reissue the query on screen. */
    const activeParams = useRef<Record<string, any>>({});

    const runQuery = (next: Record<string, any>) => {
        activeParams.current = next;
        fetchAllRequests(next);
    };

    useEffect(() => { fetchAllStatuses(); }, []);

    useEffect(() => {
        if (statusIds) {
            setRequestStatusIds(statusIds.split(',').map(id => parseInt(id, 10)));
        }
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
        open,
        handleClose,
        sendingRequest,
        currentRequest,
        setSendingRequest
    } = RequestUtills();

    // Load the issued-group requests once the status catalogue resolves the group ids
    // (Request Issued + Issuance Approved + Receipt Acknowledged). Only drives the default
    // "all" view; per-status filters are handled by handleStatusChange.
    useEffect(() => {
        if (issuedGroupCsv && selectedStatus === 'all') {
            setStatusIds(issuedGroupCsv);
            runQuery({ statusIds: issuedGroupCsv, status: "ISSUED" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [issuedGroupCsv]);


    useEffect(() => { handleRequest(requests) }, [requests]);


    /**
     * * Effect to set options based on permissions
     * @returns {void}
     * This effect checks the permissions of the current user and sets the options for the request actions accordingly.
     */
    useEffect(() => {
        const hasApproveIssuancePermission = has(PERMISSIONS.APPROVE_ISSUANCE);

        const newOptions = [
            {
                value: crudStates.read,
                label: "View Details",
                icon: <RemoveRedEyeIcon fontSize='small'
                    color='inherit' />
            },
            {
                value: crudStates.acknowledgeReceipt,
                label: "Acknowledge Receipt",
                icon: <ToggleOffOutlined fontSize='small' color='info' />
            }
        ];

        if (hasApproveIssuancePermission) {
            newOptions.push({
                value: crudStates.approveIssuance,
                label: "Approve Issuance",
                icon: <ThumbUpOffAltIcon fontSize='small' color='secondary' />
            });
        }


        setOptions(newOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    /**
     * Handle changes to the request status filter
     * Updates the request list based on the selected status filter
     * @param status - The status filter to apply
     */
    const handleStatusChange = (status: string) => {
        // Map the filter option to its status code, then resolve the id (never hardcode).
        const codeByOption: Record<string, string> = {
            requestIssued: 'issued',
            issuanceApproved: 'issuanceApproved',
            receiptAcknowledged: 'receiptAcknowledged',
        };

        const code = codeByOption[status];
        if (!code) {
            // Default (all) case — the whole issued group.
            runQuery({ statusIds: issuedGroupCsv, status: "ISSUED" });
            setStatusIds(issuedGroupCsv);
            setSelectedStatus('all');
            return;
        }

        const resolved = statusIdByCode(statuses, code);
        if (resolved == null) return; // status catalogue not loaded yet
        const statusId = String(resolved);

        runQuery({ status: "ISSUED", statusIds: statusId });
        setSelectedStatus(status);
        setStatusIds(statusId);
    }

    const renderModals = () => (
        <>
            {crudStates.acknowledgeReceipt === modalState &&
                <ModalComponent width={"60%"} title='Acknowledge Receipt' open={open} handleClose={handleClose}>
                    <AcknowledgeReceipt
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        buttonText="Acknowledge" />
                </ModalComponent>
            }

            {crudStates.approveIssuance === modalState &&
                <ModalComponent width={"60%"} title='Approve Issuance' open={open} handleClose={handleClose}>
                    <ApproveIssuance
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        buttonText="Approve" />
                </ModalComponent>
            }
        </>
    )

    return (
        // Full-width like the other request tabs (All/Pending/Rejected) — the previous
        // px-padding + 1500px-capped Card made this tab's table visibly narrower.
        <Box width={'100%'}>
            {renderModals()}
            {columnHeaders.length > 0 &&
                    <TableComponent
                tableKey="assetRequests"
                        endPoint={endPoint}
                        loading={loading}
                        count={count}
                        exportData
                        module="issued requests"
                        header={{ plural: "Issue Requests", singular: "Issued Requests" }}
                        rows={requestTableData}
                        columnHeaders={columnHeaders}
                        handleOptionClicked={handleOptionClicked}
                        params={{ statusIds: statusIds }}
                        refresh
                        status
                        onStatusChange={handleStatusChange}
                        selectedStatus={selectedStatus}
                        columnFilters={buildRequestColumnFilters(statuses, fetchStaffOptions)}
                        /*
                         * Merged over this tab's own parameters. It previously passed the filters
                         * alone, dropping `statusIds` — so filtering the Issued tab listed every
                         * request in the system under a heading that said Issued.
                         */
                        onApplyFilters={(filters) =>
                            runQuery(toRequestParams({ statusIds, status: "ISSUED" }, filters))}
                        onPaginationChange={(model) => fetchAllRequests(activeParams.current, model)}
                        onExport={(format) => exportRequests(format, activeParams.current)}
                        searchKey={REQUEST_SEARCH_KEY}
                        serverSortFields={REQUEST_SORT_FIELDS}
                    />
                }
        </Box>
    )
}

export default IssuedRequest;