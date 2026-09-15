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
import { crudStates, PENDING_REQUEST_CODES } from "../../../../utils/constants";
import { statusIdsByCodes } from "../../../../utils/helpers";
import StatusUtills from "../../../settings/statuses/Utills";
import ModalComponent from "../../../../components/modal";
import AcknowledgeRequest from "../AcknowledgeRequest";
import ApproveRequest from "../ApprovedRequest";
import RejectRequest from "../RejectRequest";
import ApproveIssuance from "../ApproveIssuance";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AddTaskIcon from '@mui/icons-material/AddTask';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import usePermissions from "../../../../core/permissions/usePermissions";
import { PERMISSIONS } from "../../../../core/permissions/constants";
import RoutesUtills from "../../../../core/routes/utills";
import {
    REQUEST_SEARCH_KEY,
    REQUEST_SORT_FIELDS,
    buildRequestColumnFilters,
    toRequestParams,
} from "../requestTableConfig";
import useStaffOptions from "../useStaffOptions";
import useRequestExport from "../useRequestExport";

const PendingRequest = () => {
    /*
     * The staff directory behind the "Requested By" and "Approver" pickers.
     *
     * Branch-scoped on the server, so the list offered matches what this listing can actually return.
     */
    const fetchStaffOptions = useStaffOptions();

    const { exportRequests } = useRequestExport('Pending');
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const { fetchAllStatuses } = StatusUtills();
    const { requestTableData, setOptions, setRequestStatusIds } = useContext(RequestContext);
    const { has } = usePermissions();
    const { getCurrentUser } = RoutesUtills();
    const currentUser = getCurrentUser();
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [statusIds, setStatusIds] = useState<string>('');

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
        handleClose: closeModal,
        currentRequest,
        sendingRequest,
        setSendingRequest,
        // module
    } = RequestUtills()

    const params = {
        ...(statusIds ? { statusIds } : {}),
        ...(currentUser?.id ? { currentApproverId: currentUser.id } : {})
    };

    /**
     * The parameters currently in force.
     *
     * Held so that paging and exporting reissue exactly the query on screen. Without it both rebuilt
     * their own request and lost this tab's approver scoping and status ids.
     */
    const activeParams = useRef<Record<string, any>>(params);

    const runQuery = (next: Record<string, any>) => {
        activeParams.current = next;
        fetchAllRequests(next);
    };

    // Close the modal and re-fetch from the server so the list reflects the
    // request's new state (e.g. it leaves this approver's queue once actioned).
    const handleClose = () => {
        closeModal();
        runQuery(activeParams.current);
    };

    useEffect(() => { fetchAllStatuses(); }, []);

    useEffect(() => {
        runQuery(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => { handleRequest(requests) }, [requests]);

    /**
     * * Effect to set options based on permissions
     * @returns {void}
     * This effect checks the permissions of the current user and sets the options for the request actions accordingly.
     */
    useEffect(() => {
        const hasApproveRequestPermission = has(PERMISSIONS.APPROVE_REQUEST);
        const hasRejectRequestPermission = has(PERMISSIONS.REJECT_REQUEST);
        const hasIssueRequestPermission = has(PERMISSIONS.ISSUE_ITEMS);
        const hasAcknowledgeRequestPermission = has(PERMISSIONS.ACKNOWLEDGE_REQUEST);
        const hasApproveIssuancePermission = has(PERMISSIONS.APPROVE_ISSUANCE);

        const newOptions = [
            {
                value: crudStates.read,
                label: "View Details",
                icon: <RemoveRedEyeIcon fontSize='small' color='inherit' />
            }
        ];

        if (hasApproveRequestPermission) {
            newOptions.push({
                value: crudStates.approve,
                label: "Approve Request",
                icon: <AddTaskIcon fontSize='small' color='primary' />
            });
        }

        // Distinct from a normal ladder approval: a pending item whose request status is
        // "issued" is waiting on the issuer's-manager sign-off (approverSubject=ISSUER), which
        // must go through the dedicated /approve-issuance endpoint — that's the only path that
        // creates the cross-location fulfilment movement. handleOptionsFilter (tables/utills.tsx)
        // swaps this in for "Approve Request" on those rows specifically.
        if (hasApproveIssuancePermission) {
            newOptions.push({
                value: crudStates.approveIssuance,
                label: "Approve Issuance",
                icon: <AddTaskIcon fontSize='small' color='primary' />
            });
        }

        if (hasRejectRequestPermission) {
            newOptions.push({
                value: crudStates.reject,
                label: "Reject Request",
                icon: <RemoveCircleOutlineIcon fontSize='small' color='error' />
            });
        }

        if (hasIssueRequestPermission) {
            newOptions.push({
                value: crudStates.issue,
                label: "Issue Items",
                icon: <ExitToAppIcon fontSize='small' color='primary' />
            });
        }

        if (hasAcknowledgeRequestPermission) {
            newOptions.push({
                value: crudStates.acknowledgeRequest,
                label: "Acknowledge Request",
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
    const approverParam = currentUser?.id ? { currentApproverId: currentUser.id } : {};

    const handleStatusChange = (status: string) => {
        switch (status) {
            case 'requestApproved': {
                // "Approved at one stage, awaiting the next" — the in-progress approval chain.
                // Ids resolved from codes at call time (never hardcoded).
                const inProgressIds = statusIdsByCodes(statuses, PENDING_REQUEST_CODES);
                if (!inProgressIds) return; // status catalogue not loaded yet
                const param = { statusIds: inProgressIds, ...approverParam };
                runQuery(param);
                setSelectedStatus(status);
                setStatusIds(inProgressIds);
                break;
            }
            case 'requestAcknowledged': {
                const acknowledgedIds = statusIdsByCodes(statuses, ['unitAcknowledged']);
                if (!acknowledgedIds) return; // status catalogue not loaded yet
                const param = { statusIds: acknowledgedIds, ...approverParam };
                runQuery(param);
                setSelectedStatus(status);
                setStatusIds(acknowledgedIds);
                break;
            }
            default:
                setStatusIds('');
                runQuery({ ...approverParam });
                setSelectedStatus('all');
                break;
        }
    }

    const renderModals = () => (
        <>
            {crudStates.approve === modalState &&
                <ModalComponent width={"60%"} title='Approve Request' open={open} handleClose={handleClose}>
                    <ApproveRequest
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        buttonText="Approve" />
                </ModalComponent>
            }
            {crudStates.reject === modalState &&
                <ModalComponent width={"60%"} title='Reject Request' open={open} handleClose={handleClose}>
                    <RejectRequest
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        buttonText="Reject" />
                </ModalComponent>
            }
            {crudStates.acknowledgeRequest === modalState &&
                <ModalComponent width={"70%"} title='Acknowledge Request' open={open} handleClose={handleClose}>
                    <AcknowledgeRequest
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
        </>)

    return (
        <Box width={'100%'}>
            {renderModals()}
            {columnHeaders.length > 0 &&
                <TableComponent
                tableKey="assetRequests"
                    endPoint={endPoint}
                    loading={loading}
                    count={count}
                    exportData
                    module={"pending requests"}
                    header={{ plural: "Pending Requests", singular: "Pending Requests" }}
                    rows={requestTableData}
                    columnHeaders={columnHeaders}
                    handleOptionClicked={handleOptionClicked}
                    params={{ ...(statusIds ? { statusIds } : {}), ...approverParam }}
                    refresh
                    status
                    onStatusChange={handleStatusChange}
                    selectedStatus={selectedStatus}
                    columnFilters={buildRequestColumnFilters(statuses, fetchStaffOptions)}
                    /*
                     * Merged over this tab's own parameters, never replacing them.
                     *
                     * This previously spread only the filters and the approver param, dropping the
                     * tab's `statusIds` — so applying any filter on Pending widened it to every
                     * request in the system under a heading that said Pending.
                     */
                    onApplyFilters={(filters) =>
                        runQuery(toRequestParams({ ...params, ...approverParam }, filters))}
                    onPaginationChange={(model) => fetchAllRequests(activeParams.current, model)}
                    onExport={(format) => exportRequests(format, activeParams.current)}
                    searchKey={REQUEST_SEARCH_KEY}
                    serverSortFields={REQUEST_SORT_FIELDS}
                />
            }
        </Box>
    )
}

export default PendingRequest