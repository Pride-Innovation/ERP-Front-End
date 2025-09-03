/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import { IUpdateUser, IUser, IUserAxiosResponse } from './interface';
import { Box, Paper } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userSchema } from './schema';
import UserForm from './UserForm';
import { AutocompleteContext } from '../../context/autocomplete';
import { updateUSerService } from './service';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { updateUser } from './slice';

const UpdateUsers = ({ handleClose, sendingRequest, setSendingRequest, user }: IUpdateUser) => {
    const [defaultUser, setDefaultUser] = useState<any>(user);
    const { setDisplayDepartment } = useContext(AutocompleteContext);
    const dispatch = useDispatch<AppDispatch>();

    const handleFormAutoFillOnUpdate = () => {
        if (user.department || user.branch?.id === 1) { setDisplayDepartment(true) }

        setDefaultUser({
            ...user,
            title: user?.title?.id,
            branch: user?.branch?.id,
            department: user.department?.id
        })
    }

    useEffect(() => { handleFormAutoFillOnUpdate() }, [user]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IUser>({
        mode: 'onChange',
        resolver: yupResolver(userSchema),
    });

    useEffect(() => {
        reset({ ...defaultUser });
    }, [defaultUser]);

    const onSubmit = async (formData: IUser) => {
        setSendingRequest(true);
        try {
            const response = await updateUSerService(formData, user.id as number) as IUserAxiosResponse;
            if (response.status === 201) {
                toast.success("User updated successfully");
                dispatch(updateUser(response.data))
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false);
        handleClose()
    };

    return (
        <Box sx={{ overflowY: 'auto', pb: 1 }}>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    boxShadow: "none",
                    maxWidth: "1200px",
                    mx: "auto",
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.08)'
                }}
            >
                <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                    <UserForm
                        handleClose={handleClose}
                        buttonText="Submit"
                        formState={formState}
                        control={control}
                        sendingRequest={sendingRequest}
                        register={register}
                    />
                </form>
            </Paper>
        </Box>
    )
}

export default UpdateUsers