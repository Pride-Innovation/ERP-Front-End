/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    useContext,
    useEffect,
    useRef,
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
import {
    REQUEST_EXPORT_MAX_ROWS as EXPORT_MAX_ROWS,
    REQUEST_SEARCH_KEY,
    REQUEST_SORT_FIELDS,
    buildRequestColumnFilters,
    buildRequestFilterSummary,
    toRequestParams,
} from "../requestTableConfig";
import useStaffOptions from "../useStaffOptions";
import TableUtills from "../../../../components/tables/utills";
import { fetchRowsService } from "../../../../core/apis/globalService";
import { IRequest } from "../../interface";
import { toast } from "react-toastify";
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
    /*
     * The staff directory behind the "Requested By" and "Approver" pickers.
     *
     * Branch-scoped on the server, so the list offered matches what this listing can actually return.
     */
    const fetchStaffOptions = useStaffOptions();

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
        buildRequestExportRows,
        loading,
        currentRequest,
    } = RequestUtills();

    // Branded Cover + Data workbook, and the reports-style PDF.
    const { generateExcelFromRows, generatePDFFromRows } = TableUtills({ moduleName: 'request', tableKey: 'assetRequests' });

    /**
     * The params currently in force, so turning a page can reissue the same query.
     *
     * Every fetch on this page goes through {@link runQuery} for that reason: paging previously
     * rebuilt its request through the shared pagination path, which knew nothing of the status ids
     * or the date range assembled here and quietly dropped both past page one.
     */
    const activeParams = useRef<Record<string, any>>({});

    const runQuery = (params: Record<string, any>) => {
        activeParams.current = params;
        fetchAllRequests(params);
    };

    /**
     * Exports what the filters describe, not the page on screen.
     *
     * <p>Rows are refetched because the table holds one page: exporting it would turn a filter
     * matching four hundred requests into a file of ten. The same reason the users page does it.
     */
    const handleExport = async (format: 'pdf' | 'excel') => {
        const meta = {
            filters: buildRequestFilterSummary(activeParams.current, statuses, 'All'),
            title: 'Asset Requests',
        };
        try {
            const response: any = await fetchRowsService({
                pageNumber: 0,
                pageSize: EXPORT_MAX_ROWS,
                endPoint,
                params: activeParams.current,
            });

            const content: IRequest[] = response?.data?.content ?? [];
            if (content.length === 0) {
                toast.info('No requests match the current filters.');
                return;
            }
            if (content.length >= EXPORT_MAX_ROWS) {
                toast.warning(
                    `Export capped at ${EXPORT_MAX_ROWS.toLocaleString()} rows — narrow the filters for the full set.`
                );
            }

            // The table's own mapper, so the export carries resolved requester and approver names
            // and a formatted date rather than nested entity graphs.
            const rows = buildRequestExportRows(content);
            if (format === 'excel') generateExcelFromRows(rows, meta);
            else await generatePDFFromRows(rows, meta);
        } catch (error) {
            console.error('Request export failed', error);
            toast.error('Could not build the export. Please try again.');
        }
    };

    // Close the modal and re-fetch so the list shows the request's updated
    // state after an action (status/approver change) instead of going stale.
    const handleClose = () => {
        closeModal();
        runQuery({
            statusIds,
            startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
            endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
        });
    };


    // Load the full (all-statuses) list once the status catalogue resolves the group ids.
    // Only drives the default "all" view; per-status filters go through handleStatusChange.
    useEffect(() => {
        if (allRequestCsv && selectedStatus === 'all') {
            setStatusIds(allRequestCsv);
            runQuery({
                statusIds: allRequestCsv,
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
                startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
                endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
            }; // Fetching requests with status Asset Request Created ID

            runQuery(params);
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
            runQuery({ statusIds: allRequestCsv });
            setStatusIds(allRequestCsv);
            setSelectedStatus('all');
            return;
        }

        const statusId = statusIdsByCodes(statuses, group.codes);
        if (!statusId) return; // status catalogue not loaded yet
        runQuery({ status: group.status, statusIds: statusId });
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
                tableKey="assetRequests"
                endPoint={endPoint}
                loading={loading}
                count={count}
                exportData
                onExport={handleExport}
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
                status
                onStatusChange={handleStatusChange}
                selectedStatus={selectedStatus}
                dateRangePicker

                /*
                 * Keys must be parameters GET /requests declares — Spring drops the rest silently,
                 * so a wrong key looks like a working filter that returns everything.
                 *
                 * Three were doing that: `assetName` (the endpoint takes `name`), `requestedFrom`
                 * (not a parameter at all), and a `createdAt` range against an endpoint expecting
                 * `startDate`/`endDate`. The Status dropdown offered Active/Disabled/Locked — user
                 * account states, copied from the users page and never adapted.
                 */
                columnFilters={buildRequestColumnFilters(statuses, fetchStaffOptions)}
                /*
                 * Merged over the tab's base parameters rather than replacing them, so the status
                 * chip above the table survives a filter being applied.
                 */
                onApplyFilters={(filters) =>
                    runQuery(toRequestParams(
                        { statusIds: statusIds || allRequestCsv },
                        filters,
                    ))}
                onPaginationChange={(model) => fetchAllRequests(activeParams.current, model)}
                searchKey={REQUEST_SEARCH_KEY}
                serverSortFields={REQUEST_SORT_FIELDS}
            />
        </Box>
    );
};

export default Request;