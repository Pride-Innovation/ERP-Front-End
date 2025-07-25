/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, {
    useContext,
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router";
import { Grid } from "@mui/material";
import { RequestContext } from "../../../../context/request/RequestContext";
import { FileContext } from "../../../../context/file/FileContext";
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

const Request = () => {
    const { requestTableData, setOptions } = useContext(RequestContext);
    const { fileData } = useContext(FileContext);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
    const { getCurrentUser } = RoutesUtills();
    const [permissions, setPermissions] = useState<IPermission[]>([] as IPermission[]);

    const navigate = useNavigate()

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
        const params = { statusIds: 1, status: "CREATED" } // Fetching requests with status Asset Request Created ID
        fetchAllRequests(params)
    }, []);

    useEffect(() => { 
        console.log(requests, "requests in all requests page!!")
        handleRequest(requests) 
    }, [requests]);

    useEffect(() => {
        if (fileData.module === module) {
            console.log(fileData, "form data!!");
        }
    }, [fileData]);


    /**
     * * Effect to set options based on permissions
     * @returns {void}
     * This effect checks the permissions of the current user and sets the options for the request actions accordingly.
     */
    useEffect(() => {
        if (!permissions || permissions.length === 0) return;

        const hasApproveRequestPermission = permissions.some(
            (perm) => perm.name === permissionsMock.find(p => p.name === "APPROVE_REQUEST")?.name
        );

        const hasRejectRequestPermission = permissions.some(
            (perm) => perm.name === permissionsMock.find(p => p.name === "REJECT_REQUEST")?.name
        );

        const newOptions = [
            {
                value: crudStates.delete,
                label: "Delete",
                icon: <InfoIcon fontSize="small" color="error" />
            },
            {
                value: crudStates.update,
                label: "Update",
                icon: <ModeEditIcon fontSize="small" color="info" />
            },
            {
                value: crudStates.read,
                label: "View Details",
                icon: <RemoveRedEyeIcon fontSize="small" color="inherit" />
            }
        ];

        if (hasApproveRequestPermission) {
            newOptions.push({
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

        setOptions(newOptions);
    }, [permissions]);

    useEffect(() => {
        if (getCurrentUser()?.title?.role?.permissions) {
            setPermissions(getCurrentUser()?.title?.role?.permissions || []);
        }
    }, []);

    return (
        <React.Fragment>
            {crudStates.reject === modalState &&
                <ModalComponent width={"40%"} title='Reject Request' open={open} handleClose={handleClose}>
                    <RejectRequest
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        buttonText="Reject" />
                </ModalComponent>
            }
            {crudStates.approve === modalState &&
                <ModalComponent width={"40%"} title='Approve Request' open={open} handleClose={handleClose}>
                    <ApproveRequest
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        buttonText="Approve" />
                </ModalComponent>
            }
            <Grid xs={12} container>
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={count}
                        exportData
                        createAction
                        importData
                        module={module}
                        header={header}
                        rows={requestTableData}
                        columnHeaders={columnHeaders}
                        onCreationHandler={() => navigate(ROUTES.CREATE_REQUEST)}
                        handleOptionClicked={handleOptionClicked}
                        paginationMode='server'
                        filterMode="server"
                        params={{ statusIds: 1 }}
                        refresh
                        filterOptions
                        optionsfilterParams={
                            {
                                status: "CREATED"
                            }
                        }
                    />
                }
            </Grid>
        </React.Fragment>
    )
}

export default Request