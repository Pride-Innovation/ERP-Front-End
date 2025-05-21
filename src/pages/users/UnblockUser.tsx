import React from 'react'
import { IUnBolock, IUserAxiosResponse } from './interface';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { unBlockUserService } from './service';
import { toast } from 'react-toastify';
import { updateUser } from './slice';
import { Grid, Stack, Typography } from '@mui/material';
import ButtonComponent from '../../components/forms/Button';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';


const UnblockUser = ({ sendingRequest, setSendingRequest, user, handleClose, buttonText }: IUnBolock) => {
    const dispatch = useDispatch<AppDispatch>();
    const handleDisable = async () => {
        setSendingRequest(true)
        try {
            const response = await unBlockUserService(user.id as number) as IUserAxiosResponse;
            if (response.status === 204) {
                toast.success("User account unblocked successfully!!")
                dispatch(updateUser(response.data))
            }

        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false)
        handleClose()
    }

    return (
        <Grid item container spacing={4} xs={12}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to unblock this user account?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <AccountCircleOutlinedIcon color="primary" />
                    <Typography variant="h6" color="primary">
                        {user.firstName} {user.lastName} {user.otherName}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        {user.title?.name}
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
                        handleClick={() => handleDisable()}
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

export default UnblockUser