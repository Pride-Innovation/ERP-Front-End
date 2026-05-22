/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import TableComponent from "../../../../components/tables/TableComponent";
import { Box, Card } from "@mui/material";
import RequestUtills from "../utills";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { RequestContext } from "../../../../context/request/RequestContext";
import { crudStates } from "../../../../utils/constants";
import ModalComponent from "../../../../components/modal";
import AcknowledgeRequest from "../AcknowledgeRequest";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import usePermissions from "../../../../core/permissions/usePermissions";
import { PERMISSIONS } from "../../../../core/permissions/constants";

const PendingRequest = () => {
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
    const { requestTableData, setOptions, setRequestStatusIds } = useContext(RequestContext);
    const { has } = usePermissions();
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [statusIds, setStatusIds] = useState<string>(`${3},${4}`); // Default to '1' for "Request Created"

    useEffect(() => {
        setRequestStatusIds(statusIds.split(',').map(id => parseInt(id, 10)));
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
        currentRequest,
        sendingRequest,
        setSendingRequest,
        // module
    } = RequestUtills()

    const params = { statusIds: statusIds, status: "PENDING" };

    useEffect(() => {
        /**
         * This should contain the Status ID for Pending Requests
         */
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
        const hasIssueRequestPermission = has(PERMISSIONS.ISSUE_ITEMS);
        const hasAcknowledgeRequestPermission = has(PERMISSIONS.ACKNOWLEDGE_REQUEST);

        const newOptions = [
            {
                value: crudStates.read,
                label: "View Details",
                icon: <RemoveRedEyeIcon fontSize='small'
                    color='inherit' />
            }
        ];

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

            default:
                fetchAllRequests(params);
                setSelectedStatus('all');
                return; // Exit early for the default case
        }

        // For all non-default cases:
        fetchAllRequests(param);
        setSelectedStatus(status);
        setStatusIds(statusId);
    }

    const renderModals = () => (
        <>
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
        </>)

    return (
        <Box width={'100%'} sx={{
            px: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {renderModals()}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: "1500px",
                    overflow: 'hidden',
                    border: "none",
                    bgcolor: 'white'
                }}
            >

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
                        params={{ statusIds: statusIds }}
                        filterOptions
                        refresh
                        optionsfilterParams={
                            {
                                status: "PENDING"
                            }
                        }
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
                        onApplyFilters={(filters) => fetchAllRequests(filters)}
                    />
                }
            </Card>
        </Box>
    )
}

export default PendingRequest