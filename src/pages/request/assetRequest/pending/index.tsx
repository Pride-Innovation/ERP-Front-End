/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import TableComponent from "../../../../components/tables/TableComponent";
import { Grid } from "@mui/material";
import RequestUtills from "../utills";
import { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { RequestContext } from "../../../../context/request/RequestContext";
import { crudStates } from "../../../../utils/constants";
import ModalComponent from "../../../../components/modal";
import AcknowledgeRequest from "../AcknowledgeRequest";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import AcknowledgeReceipt from "../AcknowledgeReceipt";

const PendingRequest = () => {
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
    const { requestTableData, setOptions } = useContext(RequestContext);

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
        setSendingRequest
    } = RequestUtills()

    useEffect(() => {
        /**
         * This should contain the Status ID for Pending Requests
         */
        const params = { statusIds: `${1},${2}` }
        fetchAllRequests(params);

        // setFileData({ file: "", module: "", jsonData: [] });
    }, []);


    useEffect(() => { handleRequest(requests) }, [requests]);

    useEffect(() => {
        setOptions([
            { value: crudStates.issue, label: "Issue Items", icon: <ExitToAppIcon fontSize='small' color='primary' /> },
            { value: crudStates.acknowledgeRequest, label: "Acknowledge Request", icon: <ThumbUpOffAltIcon fontSize='small' color='inherit' /> },
            { value: crudStates.acknowledgeReceipt, label: "Acknowledge Receipt", icon: <ToggleOffOutlinedIcon fontSize='small' color='info' /> },
        ])
    }, []);


    return (
        <Grid xs={12} container>

            {crudStates.acknowledgeRequest === modalState &&
                <ModalComponent width={"40%"} title='Acknowledge Request' open={open} handleClose={handleClose}>
                    <AcknowledgeRequest
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        buttonText="Acknowledge" />
                </ModalComponent>
            }
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
            {columnHeaders.length > 0 &&
                <TableComponent
                    endPoint={endPoint}
                    loading={loading}
                    count={count}
                    exportData
                    module="assets"
                    header={{ plural: "Pending Requests", singular: "Pending Requests" }}
                    rows={requestTableData}
                    columnHeaders={columnHeaders}
                    handleOptionClicked={handleOptionClicked}
                    params={{ statusIds: `${1},${2}` }}
                />
            }
        </Grid>
    )
}

export default PendingRequest