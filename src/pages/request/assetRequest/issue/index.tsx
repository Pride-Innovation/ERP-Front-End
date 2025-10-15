/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import TableComponent from "../../../../components/tables/TableComponent";
import { Box, Card, Grid } from "@mui/material";
import RequestUtills from "../utills";
import { useContext, useEffect, useState } from "react";
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
import { IPermission } from "../../../settings/interface";
import { permissionsMock } from "../../../../mocks/settings";
import RoutesUtills from "../../../../core/routes/utills";

const IssuedRequest = () => {
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
    const { requestTableData, setOptions } = useContext(RequestContext);
    const [permissions, setPermissions] = useState<IPermission[]>([] as IPermission[]);
    const { getCurrentUser } = RoutesUtills();
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [statusIds, setStatusIds] = useState<string>(`${5},${6},${7}`); // Default to '1' for "Request Created"


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

    const params = { statusIds: statusIds, status: "ISSUED" }

    useEffect(() => {
        /**
         * This should contain the Status ID for Request Issued for Approval and Issuance Approved.
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
        if (!permissions || permissions.length === 0) return;

        const hasApproveIssuancePermission = permissions.some(
            (perm) => perm.name === permissionsMock.find(p => p.name === "APPROVE_ISSUANCE")?.name
        );

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
    }, [permissions]);


    useEffect(() => {
        if (getCurrentUser()?.title?.role?.permissions) {
            setPermissions(getCurrentUser()?.title?.role?.permissions || []);
        }
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
                        module="issued requests"
                        header={{ plural: "Issue Requests", singular: "Issued Requests" }}
                        rows={requestTableData}
                        columnHeaders={columnHeaders}
                        handleOptionClicked={handleOptionClicked}
                        params={{ statusIds: statusIds }}
                        refresh
                        status
                        optionsfilterParams={
                            {
                                status: "ISSUED"
                            }
                        }
                        onStatusChange={handleStatusChange}
                        selectedStatus={selectedStatus}
                        filterOptions
                    />
                }
            </Card>
        </Box>
    )
}

export default IssuedRequest;