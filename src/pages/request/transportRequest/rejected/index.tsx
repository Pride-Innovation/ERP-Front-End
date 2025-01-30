import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Grid } from "@mui/material";
import { FileContext } from "../../../../context/file/FileContext";
import { fetchRowsService } from "../../../../core/apis/globalService";
import { ErrorMessage } from "../../../../core/apis/axiosInstance";
import { crudStates } from "../../../../utils/constants";
import { ROUTES } from "../../../../core/routes/routes";
import TableComponent from "../../../../components/tables/TableComponent";
import { ITransportRequest } from "../../interface";
import { TransportRequestContext } from "../../../../context/request/TransportRequestContext";
import TransportRequestUtills from "../utills";
import ModalComponent from "../../../../components/modal";
import DeleteRequest from "../../DeleteRequest";
import RequestDetails from "../../RequestDetails";

const TransportRejectedRequest = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [modalState, setModalState] = useState<string>("");
    const [currentRequest, setCurrentRequest] = useState<ITransportRequest>({} as ITransportRequest);
    const navigate = useNavigate();
    const { transportRequestTableData } = useContext(TransportRequestContext);
    const { setFileData, fileData } = useContext(FileContext)

    const {
        columnHeaders,
        endPoint,
        handleRequest,
        module,
        determineCurrentRequest,
        handleOpen,
        open,
        filterRejectedRecords,
        rejectedRequests,
        handleClose,
        addAllTransportRequestsInStore,
        allTranportRequests
    } = TransportRequestUtills();

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ page: 1, size: 10, endPoint });
            const data = response?.data as ITransportRequest[]
            addAllTransportRequestsInStore(data)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchResources();
        setFileData({ file: "", module: "", jsonData: [] });
    }, []);

    useEffect(() => { if (allTranportRequests.length > 0) { handleRequest(allTranportRequests) } }, [allTranportRequests])

    useEffect(() => { filterRejectedRecords(transportRequestTableData as Array<ITransportRequest>) }, [transportRequestTableData]);

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_REQUEST}/${moduleID}`);
                break;
            case crudStates.delete:
                setModalState(crudStates.delete)
                setCurrentRequest(determineCurrentRequest(moduleID as number, allTranportRequests as ITransportRequest[]))
                handleOpen();
                break;
            case crudStates.read:
                setModalState(crudStates.read)
                setCurrentRequest(determineCurrentRequest(moduleID as number, allTranportRequests as ITransportRequest[]))
                handleOpen();
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        if (fileData.module === module) {
            console.log(fileData, "form data!!");
        }
    }, [fileData]);

    return (
        <React.Fragment>
            {crudStates.delete === modalState &&
                <ModalComponent width={"40%"} title='Delete Transport Request' open={open} handleClose={handleClose}>
                    <DeleteRequest
                        sendingRequest={loading}
                        setSendingRequest={setLoading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        request={currentRequest}
                    />
                </ModalComponent>
            }
            {crudStates.read === modalState &&
                <ModalComponent width={"60%"} title='Transport Request Details' open={open} handleClose={handleClose}>
                    <RequestDetails sendingRequest={loading} setSendingRequest={setLoading} open={open} handleClose={handleClose} data={currentRequest} />
                </ModalComponent>
            }
            {allTranportRequests?.length > 0 && <Grid xs={12} container>
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={100}
                        exportData
                        module={module}
                        header={{ plural: "Rejected Transport Requests", singular: "Rejected Requests" }}
                        rows={rejectedRequests}
                        columnHeaders={columnHeaders}
                        handleOptionClicked={handleOptionClicked}
                        paginationMode='client'
                    />
                }
            </Grid>}
        </React.Fragment>
    )
}

export default TransportRejectedRequest