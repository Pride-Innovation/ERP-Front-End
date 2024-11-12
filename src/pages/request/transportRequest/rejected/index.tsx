import React, { useContext, useEffect, useState } from "react";
import { GridRowsProp } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { Grid } from "@mui/material";
import { IRequest } from "../../interface";
import RowContext from "../../../../context/row/RowContext";
import { RequestContext } from "../../../../context/request/RequestContext";
import { FileContext } from "../../../../context/file/FileContext";
import { fetchRowsService } from "../../../../core/apis/globalService";
import { requestMock } from "../../../../mocks/request";
import { ErrorMessage } from "../../../../core/apis/axiosInstance";
import { crudStates } from "../../../../utils/constants";
import { ROUTES } from "../../../../core/routes/routes";
import ModalComponent from "../../../../components/modal";
import TableComponent from "../../../../components/tables/TableComponent";
import RequestUtills from "../../assetRequest/utills";

const TransportRejectedRequest = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [modalState, setModalState] = useState<string>("");
    const [currentRequest, setCurrentRequest] = useState<IRequest>({} as IRequest);
    const { setRows, rows } = useContext(RowContext);
    const navigate = useNavigate();
    const { requestTableData } = useContext(RequestContext);
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
        handleClose
    } = RequestUtills();

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ page: 1, size: 10, endPoint }) as unknown as GridRowsProp;
            console.log(response, "response!!")
            setRows([...requestMock]);
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

    useEffect(() => { if (rows.length > 0) { handleRequest(requestMock) } }, [rows])

    useEffect(() => { filterRejectedRecords(requestTableData as Array<IRequest>) }, [requestTableData]);

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_REQUEST}/${moduleID}`);
                break;
            case crudStates.delete:
                setModalState(crudStates.delete)
                setCurrentRequest(determineCurrentRequest(moduleID as number, rows as IRequest[]))
                handleOpen();
                break;
            case crudStates.read:
                setModalState(crudStates.read)
                setCurrentRequest(determineCurrentRequest(moduleID as number, rows as IRequest[]))
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
    }, [fileData])

    return (
        <React.Fragment>
            {/* {crudStates.delete === modalState &&
                <ModalComponent width={"40%"} title='Delete Request' open={open} handleClose={handleClose}>
                    <DeleteRequest
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        request={currentRequest}
                    />
                </ModalComponent>
            }
            {crudStates.read === modalState &&
                <ModalComponent width={"60%"} title='Request Details' open={open} handleClose={handleClose}>
                    <RequestDetails open={open} handleClose={handleClose} data={currentRequest} />
                </ModalComponent>
            } */}
            {rows?.length > 0 && <Grid xs={12} container>
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={100}
                        exportData
                        module={module}
                        header={{ plural: "Rejected Requests", singular: "Rejected Requests" }}
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