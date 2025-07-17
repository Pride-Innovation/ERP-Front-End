/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import TableComponent from "../../../../components/tables/TableComponent";
import { Grid } from "@mui/material";
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
    } = RequestUtills()

    useEffect(() => {
        /**
         * This should contain the Status ID for Request Issued for Approval and Issuance Approved.
         */
        const params = { statusIds: `${5},${6},${7}`, status: "ISSUED" }
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

    return (
        <Grid xs={12} container>

            {crudStates.acknowledgeReceipt === modalState &&
                <ModalComponent width={"40%"} title='Acknowledge Receipt' open={open} handleClose={handleClose}>
                    <AcknowledgeReceipt
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        buttonText="Acknowledge" />
                </ModalComponent>
            }

            {crudStates.approveIssuance === modalState &&
                <ModalComponent width={"40%"} title='Approve Issuance' open={open} handleClose={handleClose}>
                    <ApproveIssuance
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        buttonText="Approve" />
                </ModalComponent>
            }
            {columnHeaders.length > 0 &&
                <TableComponent
                    endPoint={endPoint}
                    loading={loading}
                    count={count}
                    exportData
                    module="assets"
                    header={{ plural: "Issue Requests", singular: "Issued Requests" }}
                    rows={requestTableData}
                    columnHeaders={columnHeaders}
                    handleOptionClicked={handleOptionClicked}
                    params={{ statusIds: `${5},${6},${7}` }}
                />
            }
        </Grid>
    )
}

export default IssuedRequest