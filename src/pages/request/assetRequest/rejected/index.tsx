/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect } from "react";
import TableComponent from "../../../../components/tables/TableComponent";
import { Box, Card } from "@mui/material";
import RequestUtills from "../utills";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { RequestContext } from "../../../../context/request/RequestContext";
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import InfoIcon from '@mui/icons-material/Info';
import { crudStates } from "../../../../utils/constants";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ModalComponent from "../../../../components/modal";
import DeleteRequest from "../../DeleteRequest";

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
        count,
        modalState,
        handleClose,
        open,
        currentRequest,
        sendingRequest,
        setSendingRequest
    } = RequestUtills()

    useEffect(() => {
        /**
         * This should contain the Status ID for Rejected Requests
         */
        const params = { statusIds: 2, status: "REJECTED" }
        fetchAllRequests(params);

        // setFileData({ file: "", module: "", jsonData: [] });
    }, []);

    useEffect(() => { handleRequest(requests) }, [requests]);

    useEffect(() => {
        setOptions([
            { value: crudStates.delete, label: "Delete", icon: <InfoIcon fontSize='small' color='error' /> },
            { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
            { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> },
        ])
    }, []);


    const renderModals = () => (
        <>
            {
                crudStates.delete === modalState &&
                <ModalComponent width={"40%"} title='Delete Request' open={open} handleClose={handleClose}>
                    <DeleteRequest
                        request={currentRequest}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        buttonText="Delete" />
                </ModalComponent>
            }
        </>)
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
                        module="assets"
                        header={{ plural: "Rejected Requests", singular: "Rejected Requests" }}
                        rows={requestTableData}
                        columnHeaders={columnHeaders}
                        handleOptionClicked={handleOptionClicked}
                        params={{ statusIds: 2 }}
                    />
                }
            </Card>
        </Box>
    )
}
export default RejectedRequest