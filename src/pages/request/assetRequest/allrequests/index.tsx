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
import { crudStates } from "../../../../utils/constants";
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
import RoutesUtills from "../../../../core/routes/utills";
import { IPermission } from "../../../settings/interface";
import { permissionsMock } from "../../../../mocks/settings";
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
    const { getCurrentUser } = RoutesUtills();
    const [permissions, setPermissions] = useState<IPermission[]>([] as IPermission[]);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [statusIds, setStatusIds] = useState<string>(`${1},${2},${3},${4},${5},${6},${7}`); // Default to '1' for "Request Created"
    const { setRequestStatusIds } = useContext(RequestContext);
    const { tableStartDate, tableEndDate } = useContext(FormContext);

    const navigate = useNavigate();


    useEffect(() => {
        setRequestStatusIds(statusIds.split(',').map(id => parseInt(id, 10)));
    }, [statusIds]);

    const {
        columnHeaders,
        endPoint,
        header,
        module,
        handleClose,
        open,
        fetchAllRequests,
        modalState,
        handleOptionClicked,
        count,
        handleRequest,
        loading,
        currentRequest,
    } = RequestUtills();


    useEffect(() => {
        const params = {
            statusIds,
            status: "CREATED",
            startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
            endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
        }; // Fetching requests with status Asset Request Created ID

        fetchAllRequests(params);
    }, []);


    useEffect(() => {
        if (tableStartDate && tableEndDate) {
            const params = {
                statusIds,
                status: "CREATED",
                startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
                endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
            }; // Fetching requests with status Asset Request Created ID

            fetchAllRequests(params);
        }
    }, [tableStartDate, tableEndDate]);

    useEffect(() => {
        handleRequest(requests);
    }, [requests]);

    /**
     * Effect to set options based on permissions
     */
    useEffect(() => {
        if (!permissions || permissions.length === 0) return;

        const hasApproveRequestPermission = permissions.some(
            (perm) => perm.name === permissionsMock.find(p => p.name === "APPROVE_REQUEST")?.name
        );

        const hasRejectRequestPermission = permissions.some(
            (perm) => perm.name === permissionsMock.find(p => p.name === "REJECT_REQUEST")?.name
        );

        const hasApproveIssuancePermission = permissions.some(
            (perm) => perm.name === permissionsMock.find(p => p.name === "APPROVE_ISSUANCE")?.name
        );

        const hasAcknowledgeRequestPermission = permissions.some(
            (perm) => perm.name === permissionsMock.find(p => p.name === "ACKNOWLEDGE_REQUEST")?.name
        );

        const hasIssueItemsPermission = permissions.some(
            (perm) => perm.name === permissionsMock.find(p => p.name === "ISSUE_ITEMS")?.name
        );

        const newOptions = [
            {
                value: crudStates.read,
                label: "View Details",
                icon: <RemoveRedEyeIcon fontSize="small" color="inherit" />
            },
            {
                value: crudStates.update,
                label: "Update",
                icon: <ModeEditIcon fontSize="small" color="info" />
            },
            {
                value: crudStates.delete,
                label: "Delete",
                icon: <InfoIcon fontSize="small" color="error" />
            },
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
    }, [permissions]);

    useEffect(() => {
        if (getCurrentUser()?.title?.role?.permissions) {
            setPermissions(getCurrentUser()?.title?.role?.permissions || []);
        }
    }, []);

    /**
     * Handle changes to the request status filter
     * Updates the request list based on the selected status filter
     */
    const handleStatusChange = (status: string) => {
        let param;
        let statusId;

        switch (status) {
            // PENDING status group
            case 'requestApproved':
                param = { status: "PENDING", statusIds: '3' };
                statusId = '3';
                break;

            case 'requestAcknowledged':
                param = { status: "PENDING", statusIds: '4' };
                statusId = '4';
                break;

            // REJECTED status group
            case 'requestRejected':
                param = { status: "REJECTED", statusIds: '2' };
                statusId = '2';
                break;

            // CREATED status group
            case 'requestCreated':
                param = { status: "CREATED", statusIds: '1' };
                statusId = '1';
                break;

            // ISSUED status group
            case 'requestIssued':
                param = { status: "ISSUED", statusIds: '5' };
                statusId = '5';
                break;

            case 'issuanceApproved':
                param = { status: "ISSUED", statusIds: '6' };
                statusId = '6';
                break;

            case 'receiptAcknowledged':
                param = { status: "ISSUED", statusIds: '7' };
                statusId = '7';
                break;

            // Default (all) case
            default:
                fetchAllRequests({ statusIds, status: "CREATED" });
                setSelectedStatus('all');
                return; // Exit early for the default case
        }

        // For all non-default cases:
        fetchAllRequests(param);
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
        <Box width={'100%'} sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {renderModals()}
            <TableComponent
                endPoint={endPoint}
                loading={loading}
                count={count}
                exportData
                createAction
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