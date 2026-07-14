/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import TableComponent from "../../../../components/tables/TableComponent";
import { Box } from "@mui/material";
import RequestUtills from "../utills";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { RequestContext } from "../../../../context/request/RequestContext";
import { crudStates, workflowApprovalStatusIdsCsv } from "../../../../utils/constants";
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

const PendingRequest = () => {
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
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
        status: "PENDING",
        ...(currentUser?.id ? { currentApproverId: currentUser.id } : {})
    };

    // Close the modal and re-fetch from the server so the list reflects the
    // request's new state (e.g. it leaves this approver's queue once actioned).
    const handleClose = () => {
        closeModal();
        fetchAllRequests(params);
    };

    useEffect(() => {
        fetchAllRequests(params);

        // setFileData({ file: "", module: "", jsonData: [] });
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
                // Includes the per-stage workflow approvals (13-17) — approved at one
                // stage, awaiting the next — so in-progress requests stay listed.
                const inProgressIds = `3,${workflowApprovalStatusIdsCsv}`;
                const param = { status: "PENDING", statusIds: inProgressIds, ...approverParam };
                fetchAllRequests(param);
                setSelectedStatus(status);
                setStatusIds(inProgressIds);
                break;
            }
            case 'requestAcknowledged': {
                const param = { status: "PENDING", statusIds: '4', ...approverParam };
                fetchAllRequests(param);
                setSelectedStatus(status);
                setStatusIds('4');
                break;
            }
            default:
                setStatusIds('');
                fetchAllRequests({ status: "PENDING", ...approverParam });
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
                    filterOptions
                    refresh
                    optionsfilterParams={{ status: "PENDING" }}
                    status
                    onStatusChange={handleStatusChange}
                    selectedStatus={selectedStatus}
                    columnFilters={[
                        { key: 'assetName', label: 'Asset Name', type: 'text' },
                        { key: 'requestedBy', label: 'Requested By', type: 'text' },
                        { key: 'requestedFrom', label: 'Requested From', type: 'text' },
                        {
                            key: 'status', label: 'Status', type: 'select', options: [
                                { value: 'active', label: 'Active' },
                                { value: 'disabled', label: 'Disabled' },
                                { value: 'locked', label: 'Locked' },
                            ]
                        },
                        { key: 'createdAt', label: 'Request Created', type: 'dateRange' },
                    ]}
                    onApplyFilters={(filters) => fetchAllRequests({ ...filters, ...approverParam })}
                />
            }
        </Box>
    )
}

export default PendingRequest