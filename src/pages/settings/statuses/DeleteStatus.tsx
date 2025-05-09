/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack, Typography } from "@mui/material"
import DownloadingOutlinedIcon from '@mui/icons-material/DownloadingOutlined';
import { IDeleteStatus } from "./interface";
import ButtonComponent from "../../../components/forms/Button";
import { toast } from "react-toastify";
import { deleteStatusService } from "./service";
import StatusUtills from "./Utills";

const DeleteStatus = ({
    status,
    handleClose,
    sendingRequest,
    buttonText,
    setSendingRequest
}: IDeleteStatus) => {
    const { removeStatusFromStore } = StatusUtills()
    const deleteBranch = async () => {
        setSendingRequest(true)
        const response = await deleteStatusService(status?.id as number);
        setSendingRequest(false)
        if (response?.status === "success") {
            removeStatusFromStore(status)
            handleClose();
            toast.success(response?.data?.message)
        }
    }
    return (
        <Grid item container spacing={4} xs={12}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to delete this Status?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <DownloadingOutlinedIcon color="primary" />
                    <Typography variant="h6" color="primary">
                        {status.name}
                    </Typography>
                </Stack>
            </Grid>
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                <Stack direction="row" spacing={3} sx={{ width: "50%" }}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor='info'
                        type='button'
                        variant="outlined"
                        sendingRequest={false}
                        buttonText="Close"
                    />
                    <ButtonComponent
                        handleClick={deleteBranch}
                        buttonColor='error'
                        type='submit'
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                    />
                </Stack>
            </Grid>
        </Grid>
    )
}

export default DeleteStatus