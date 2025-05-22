/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { useContext, useEffect } from "react";
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

const Request = () => {
    const { requestTableData } = useContext(RequestContext);
    const { fileData } = useContext(FileContext);
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
        loading
    } = RequestUtills();

    useEffect(() => { fetchAllRequests() }, []);
    useEffect(() => {
        if (requests.length > 0) {
            handleRequest(requests)
        }
    }, [requests]);

    useEffect(() => {
        if (fileData.module === module) {
            console.log(fileData, "form data!!");
        }
    }, [fileData]);

    return (
        <React.Fragment>
            {crudStates.delete === modalState &&
                <ModalComponent width={"40%"} title='Delete Request' open={open} handleClose={handleClose}>
                    {/* <DeleteRequest
                        setSendingRequest={setLoading}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        request={currentRequest}
                    /> */}
                    <p>Delete Request</p>
                </ModalComponent>
            }
            {crudStates.read === modalState &&
                <ModalComponent width={"60%"} title='Request Details' open={open} handleClose={handleClose}>
                    {/* <RequestDetails sendingRequest={loading} setSendingRequest={setLoading} open={open} handleClose={handleClose} data={currentRequest} /> */}
                    <p>REquest Details</p>
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
                    />
                }
            </Grid>
        </React.Fragment>
    )
}

export default Request