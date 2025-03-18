import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Grid } from "@mui/material";
import { IRequest, IRequestResponse } from "../../interface";
import { RequestContext } from "../../../../context/request/RequestContext";
import { FileContext } from "../../../../context/file/FileContext";
import { fetchRowsService } from "../../../../core/apis/globalService";
import { ErrorMessage } from "../../../../core/apis/axiosInstance";
import { crudStates } from "../../../../utils/constants";
import { ROUTES } from "../../../../core/routes/routes";
import ModalComponent from "../../../../components/modal";
import DeleteRequest from "../../DeleteRequest";
import TableComponent from "../../../../components/tables/TableComponent";
import RequestUtills from "../utills";
import RequestDetails from "../../RequestDetails";

const Request = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [modalState, setModalState] = useState<string>("");
    const [currentRequest, setCurrentRequest] = useState<IRequest>({} as IRequest);
    const navigate = useNavigate();
    const { requestTableData } = useContext(RequestContext);
    const { setFileData, fileData } = useContext(FileContext)

    const {
        columnHeaders,
        endPoint,
        header,
        handleRequest,
        module,
        determineCurrentRequest,
        handleClose,
        handleOpen,
        open,
        assetsRequests,
        addAllRequestsInStore
    } = RequestUtills();

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint }) as IRequestResponse;
            addAllRequestsInStore(response.content);

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

    useEffect(() => { if (assetsRequests.length > 0) { handleRequest(assetsRequests) } }, [assetsRequests])

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_REQUEST}/${moduleID}`);
                break;
            case crudStates.delete:
                setModalState(crudStates.delete)
                setCurrentRequest(determineCurrentRequest(moduleID as number, assetsRequests as IRequest[]))
                handleOpen();
                break;
            case crudStates.read:
                setModalState(crudStates.read)
                setCurrentRequest(determineCurrentRequest(moduleID as number, assetsRequests as IRequest[]))
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
                <ModalComponent width={"40%"} title='Delete Request' open={open} handleClose={handleClose}>
                    <DeleteRequest
                        setSendingRequest={setLoading}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        request={currentRequest}
                    />
                </ModalComponent>
            }
            {crudStates.read === modalState &&
                <ModalComponent width={"60%"} title='Request Details' open={open} handleClose={handleClose}>
                    <RequestDetails sendingRequest={loading} setSendingRequest={setLoading} open={open} handleClose={handleClose} data={currentRequest} />
                </ModalComponent>
            }
            {assetsRequests?.length > 0 && <Grid xs={12} container>
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={100}
                        exportData
                        createAction
                        importData
                        module={module}
                        header={header}
                        rows={requestTableData}
                        columnHeaders={columnHeaders}
                        onCreationHandler={() => navigate(ROUTES.CREATE_REQUEST)}
                        handleOptionClicked={handleOptionClicked}
                        paginationMode='client'
                    />
                }
            </Grid>}
        </React.Fragment>
    )
}

export default Request