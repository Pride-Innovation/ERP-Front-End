/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack, Typography } from '@mui/material'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ButtonComponent from '../../components/forms/Button';
import { IDisable, IUserAxiosResponse } from './interface';
import { deleteUserService } from './service';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { toast } from 'react-toastify';
import { updateUser } from './slice';

const DisableUserAccount = ({
    user,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText,
}: IDisable) => {
    const dispatch = useDispatch<AppDispatch>();
    const handleDisable = async () => {
        setSendingRequest(true)
        try {
            const response = await deleteUserService(user.id as number) as IUserAxiosResponse;
            if (response.status === 204) {
                toast.success("User account disabled successfully!!")
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
                    Are you sure you want to disable this user account?
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

export default DisableUserAccount