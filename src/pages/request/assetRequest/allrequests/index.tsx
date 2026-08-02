/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    useContext,
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router";
import { Box } from "@mui/material";
import { RequestContext } from "../../../../context/request/RequestContext";
import { crudStates, ALL_REQUEST_CODES, PENDING_REQUEST_CODES } from "../../../../utils/constants";
import { statusIdsByCodes } from "../../../../utils/helpers";
import StatusUtills from "../../../settings/statuses/Utills";
import { ROUTES } from "../../../../core/routes/routes";
import ModalComponent from "../../../../components/modal";
import TableComponent from "../../../../components/tables/TableComponent";
import RequestUtills from "../utills";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import RejectRequest from "../RejectRequest";
import ApproveRequest from "../ApprovedRequest";
import AddTaskIcon from '@mui/icons-material/AddTask';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import usePermissions from "../../../../core/permissions/usePermissions";
import { PERMISSIONS } from "../../../../core/permissions/constants";
import DeleteRequest from "../../DeleteRequest";
import { FormContext } from "../../../../context/form";
import dayjs from "dayjs";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ToggleOffOutlined from '@mui/icons-material/ToggleOffOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AcknowledgeRequest from "../AcknowledgeRequest";
import AcknowledgeReceipt from "../AcknowledgeReceipt";
import ApproveIssuance from "../ApproveIssuance";


const Request = () => {
    const { requestTableData, setOptions } = useContext(RequestContext);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore);
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const { fetchAllStatuses } = StatusUtills();
    const { has } = usePermissions();
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [statusIds, setStatusIds] = useState<string>('');
    const { setRequestStatusIds } = useContext(RequestContext);
    const { tableStartDate, tableEndDate } = useContext(FormContext);

    // Every request lifecycle state, resolved from codes (never hardcode ids — see utils/helpers).
    const allRequestCsv = statusIdsByCodes(statuses, ALL_REQUEST_CODES);

    const navigate = useNavigate();

    useEffect(() => { fetchAllStatuses(); }, []);

    useEffect(() => {
        if (statusIds) {
            setRequestStatusIds(statusIds.split(',').map(id => parseInt(id, 10)));
        }
    }, [statusIds]);

    const {
        columnHeaders,
        endPoint,
        header,
        module,
        handleClose: closeModal,
        open,
        fetchAllRequests,
        modalState,
        handleOptionClicked,
        count,
        handleRequest,
        loading,
        currentRequest,
    } = RequestUtills();

    // Close the modal and re-fetch so the list shows the request's updated
    // state after an action (status/approver change) instead of going stale.
    const handleClose = () => {
        closeModal();
        fetchAllRequests({
            statusIds,
            status: "CREATED",
            startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
            endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
        });
    };


    // Load the full (all-statuses) list once the status catalogue resolves the group ids.
    // Only drives the default "all" view; per-status filters go through handleStatusChange.
    useEffect(() => {
        if (allRequestCsv && selectedStatus === 'all') {
            setStatusIds(allRequestCsv);
            fetchAllRequests({
                statusIds: allRequestCsv,
                status: "CREATED",
                startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
                endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allRequestCsv]);


    useEffect(() => {
        if (statusIds && tableStartDate && tableEndDate) {
            const params = {
                statusIds,
                status: "CREATED",
                startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
                endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
            }; // Fetching requests with status Asset Request Created ID

            fetchAllRequests(params);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableStartDate, tableEndDate]);

    useEffect(() => {
        handleRequest(requests);
    }, [requests]);

    /**
     * Effect to set options based on permissions
     */
    useEffect(() => {
        const hasApproveRequestPermission = has(PERMISSIONS.APPROVE_REQUEST);
        const hasRejectRequestPermission = has(PERMISSIONS.REJECT_REQUEST);
        const hasApproveIssuancePermission = has(PERMISSIONS.APPROVE_ISSUANCE);
        const hasAcknowledgeRequestPermission = has(PERMISSIONS.ACKNOWLEDGE_REQUEST);
        const hasIssueItemsPermission = has(PERMISSIONS.ISSUE_ITEMS);

        // Update and Delete were unconditional, so the menu offered them to users holding neither
        // permission and the failure only surfaced on the destination page. Per-row status and
        // ownership are still narrowed by handleOptionsFilter in components/tables/utills.
        const newOptions = [
            {
                value: crudStates.read,
                label: "View Details",
                icon: <RemoveRedEyeIcon fontSize="small" color="inherit" />
            },
            ...(has(PERMISSIONS.UPDATE_REQUEST) ? [{
                value: crudStates.update,
                label: "Update",
                icon: <ModeEditIcon fontSize="small" color="info" />
            }] : []),
            ...(has(PERMISSIONS.DELETE_REQUEST) ? [{
                value: crudStates.delete,
                label: "Delete",
                icon: <InfoIcon fontSize="small" color="error" />
            }] : []),
            {
                value: crudStates.acknowledgeReceipt,
                label: "Acknowledge Receipt",
                icon: <ToggleOffOutlined fontSize='small' color='info' />
            }
        ];

        if (hasApproveRequestPermission) {
            newOptions.unshift({
                value: crudStates.approve,
                label: "Approve Request",
                icon: <AddTaskIcon fontSize="small" color="primary" />
            });
        }

        if (hasRejectRequestPermission) {
            newOptions.push({
                value: crudStates.reject,
                label: "Reject Request",
                icon: <RemoveCircleOutlineIcon fontSize="small" color="error" />
            });
        }

        if (hasApproveIssuancePermission) {
            newOptions.push({
                value: crudStates.approveIssuance,
                label: "Approve Issuance",
                icon: <ThumbUpOffAltIcon fontSize='small' color='secondary' />
            });
        }

        if (hasAcknowledgeRequestPermission) {
            newOptions.push({
                value: crudStates.acknowledgeRequest,
                label: "Acknowledge Request",
                icon: <ThumbUpOffAltIcon fontSize='small' color='secondary' />
            });
        }

        if (hasIssueItemsPermission) {
            newOptions.push({
                value: crudStates.issue,
                label: "Issue Items",
                icon: <ExitToAppIcon fontSize='small' color='primary' />
            });
        }

        setOptions(newOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Handle changes to the request status filter
     * Updates the request list based on the selected status filter
     */
    const handleStatusChange = (status: string) => {
        // Each filter option maps to a status *group* (backend "status" hint + status codes).
        // Ids are resolved from the loaded catalogue at call time — never hardcoded.
        const groups: Record<string, { status: string; codes: ReadonlyArray<string> }> = {
            // "Approved at one stage, awaiting the next" — the in-progress approval chain.
            requestApproved:    { status: "PENDING",  codes: PENDING_REQUEST_CODES },
            requestAcknowledged:{ status: "PENDING",  codes: ['unitAcknowledged'] },
            requestRejected:    { status: "REJECTED", codes: ['requestRejected'] },
            requestCreated:     { status: "CREATED",  codes: ['requestCreated'] },
            requestIssued:      { status: "ISSUED",   codes: ['issued'] },
            issuanceApproved:   { status: "ISSUED",   codes: ['issuanceApproved'] },
            receiptAcknowledged:{ status: "ISSUED",   codes: ['receiptAcknowledged'] },
        };

        const group = groups[status];
        if (!group) {
            // Default (all) case
            fetchAllRequests({ statusIds: allRequestCsv, status: "CREATED" });
            setStatusIds(allRequestCsv);
            setSelectedStatus('all');
            return;
        }

        const statusId = statusIdsByCodes(statuses, group.codes);
        if (!statusId) return; // status catalogue not loaded yet
        fetchAllRequests({ status: group.status, statusIds: statusId });
        setSelectedStatus(status);
        setStatusIds(statusId);
    };

    // Render different modals based on the current state
    const renderModals = () => (
        <>
            {/* Reject Request Modal */}
            {crudStates.reject === modalState && (
                <ModalComponent
                    width="60%"
                    title="Reject Request"
                    open={open}
                    handleClose={handleClose}
                >
                    <RejectRequest
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        buttonText="Reject"
                    />
                </ModalComponent>
            )}

            {/* Approve Request Modal */}
            {crudStates.approve === modalState && (
                <ModalComponent
                    width="60%"
                    title="Approve Request"
                    open={open}
                    handleClose={handleClose}
                >
                    <ApproveRequest
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        buttonText="Approve"
                    />
                </ModalComponent>
            )}

            {/* Delete Request Modal */}
            {crudStates.delete === modalState && (
                <ModalComponent
                    width="40%"
                    title="Delete Request"
                    open={open}
                    handleClose={handleClose}
                >
                    <DeleteRequest
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        buttonText="Delete"
                    />
                </ModalComponent>
            )}
            {/* Acknowledge Request Modal */}
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
            {/* Acknowledge Receipt Modal */}
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
            {/* Approve Issuance Modal */}
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
    );

    return (
        <Box width={'100%'}>
            {renderModals()}
            <TableComponent
                endPoint={endPoint}
                loading={loading}
                count={count}
                exportData
                createAction
                createPermission={PERMISSIONS.CREATE_REQUEST}
                module={module}
                header={header}
                rows={requestTableData}
                columnHeaders={columnHeaders.filter(Boolean)}
                onCreationHandler={() => navigate(ROUTES.CREATE_REQUEST)}
                handleOptionClicked={handleOptionClicked}
                paginationMode="server"
                filterMode="server"
                params={{ statusIds: statusIds }}
                refresh
                filterOptions
                optionsfilterParams={{
                    status: "CREATED"
                }}
                status
                onStatusChange={handleStatusChange}
                selectedStatus={selectedStatus}
                dateRangePicker

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
                onApplyFilters={(filters) => fetchAllRequests(filters)}
            />
        </Box>
    );
};

export default Request;