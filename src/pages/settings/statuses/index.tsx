import { Box } from "@mui/material"
import ButtonComponent from "../../../components/forms/Button"
import { useState } from "react";
import { IStatus } from "./interface";
import StatusUtills from "./Utills";
import { crudStates } from "../../../utils/constants";
import StatusDetails from "./StatusDetails";

const Statuses = () => {
    const [currentStatus, setCurrentStatus] = useState<IStatus>({} as IStatus);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { handleClose, handleOpen, setModalState, statuses } = StatusUtills()

    const createStatus = () => {
        setModalState(crudStates.create);
        handleOpen()
    }

    const updateStatus = (status: IStatus) => {
        setCurrentStatus(status)
        setModalState(crudStates.update);
        handleOpen()
    }

    const deleteStatus = (status: IStatus) => {
        setCurrentStatus(status)
        setModalState(crudStates.delete);
        handleOpen()
    }
    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                mb: 4,
                alignItems: "center",
            }}>
                <Box>
                    <ButtonComponent
                        handleClick={createStatus}
                        sendingRequest={false}
                        buttonText="Create Status"
                        variant='contained'
                        buttonColor='info'
                        type='button' />
                </Box>
            </Box>
            <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap={3}
                sx={{
                    width: "100%",
                    alignItems: "center",
                }}>
                {
                    statuses.map(status => (
                        <StatusDetails
                            status={status}
                            deleteStatus={deleteStatus}
                            updateStatus={updateStatus}
                        />
                    ))
                }
            </Box>
        </Box>
    )
}

export default Statuses