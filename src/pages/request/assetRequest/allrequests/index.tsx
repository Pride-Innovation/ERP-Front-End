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

const Request = () => {
    const { requestTableData } = useContext(RequestContext);
    const { fileData } = useContext(FileContext);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)

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
        currentRequest
    } = RequestUtills();

    useEffect(() => { fetchAllRequests() }, []);
    useEffect(() => { handleRequest(requests) }, [requests]);

    useEffect(() => {
        if (fileData.module === module) {
            console.log(fileData, "form data!!");
        }
    }, [fileData]);

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
                        searchAction
                    />
                }
            </Grid>
        </React.Fragment>
    )
}

export default Request