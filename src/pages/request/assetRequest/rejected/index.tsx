/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect } from "react";
import TableComponent from "../../../../components/tables/TableComponent";
import { Grid } from "@mui/material";
import RequestUtills from "../utills";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { RequestContext } from "../../../../context/request/RequestContext";
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import InfoIcon from '@mui/icons-material/Info';
import { crudStates } from "../../../../utils/constants";

const RejectedRequest = () => {
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
    const { requestTableData, setOptions } = useContext(RequestContext);

    const {
        handleOptionClicked,
        columnHeaders,
        endPoint,
        loading,
        fetchAllRequests,
        handleRequest,
        count
    } = RequestUtills()

    useEffect(() => {
        /**
         * This should contain the Status ID for Rejected Requests
         */
        const params = { statusId: 2 }
        fetchAllRequests(params);

        // setFileData({ file: "", module: "", jsonData: [] });
    }, []);

    useEffect(() => { handleRequest(requests) }, [requests]);

    useEffect(() => {
        setOptions([
            { value: crudStates.delete, label: "Delete", icon: <InfoIcon fontSize='small' color='error' /> },
            { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
        ])
    }, []);

    return (
        <Grid xs={12} container>

            {/* {crudStates.delete === modalState &&
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
            } */}
            {columnHeaders.length > 0 &&
                <TableComponent
                    endPoint={endPoint}
                    loading={loading}
                    count={count}
                    exportData
                    module="assets"
                    header={{ plural: "Rejected Requests", singular: "Rejected Requests" }}
                    rows={requestTableData}
                    columnHeaders={columnHeaders}
                    handleOptionClicked={handleOptionClicked}
                    params={{ statusId: 2 }}
                />
            }
        </Grid>
    )
}

export default RejectedRequest