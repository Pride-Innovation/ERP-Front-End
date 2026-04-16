/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import UserForm from './UserForm';
import { ICreateUser, IUser, IUserCreationResponseAxiosResponse } from './interface';
import { Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userSchema } from './schema';
import { Box } from '@mui/material';
import { createUSerService } from './service';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addUser } from './slice';

const CreateUser = ({ handleClose }: ICreateUser) => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const defaultUser: IUser = { availability: 'present' } as IUser;
    const dispatch = useDispatch<AppDispatch>()

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IUser>({
        mode: 'onChange',
        resolver: yupResolver(userSchema) as unknown as Resolver<IUser>,
    });

    useEffect(() => {
        reset({ ...defaultUser });
    }, [reset]);

    const onSubmit = async (formData: IUser) => {
        setSendingRequest(true);
        try {
            const response = await createUSerService(formData) as IUserCreationResponseAxiosResponse;
            if (response.status === 201) {
                if (response.data?.response?.status === 'failed') {
                    toast.error(
                        response.data.response.message ||
                        'User was not saved because the verification email could not be delivered. Please contact the system administrator.'
                    );
                } else {
                    toast.success(
                        response.data?.response?.message ||
                        'User created successfully. A verification email has been sent.'
                    );
                    dispatch(addUser(response.data.user));
                    handleClose();
                }
            }
        } catch (error) {
            // Axios interceptor already shows the toast; log for debugging only
            console.error('CreateUser unexpected error:', error);
        }
        setSendingRequest(false);
    };

    return (
        <Box sx={{ overflowY: 'auto', pb: 1, maxWidth: '1200px', mx: 'auto' }}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <UserForm
                    handleClose={handleClose}
                    buttonText="Create User"
                    formState={formState}
                    control={control}
                    sendingRequest={sendingRequest}
                    register={register}
                    mode="create"
                />
            </form>
        </Box>
    );
}

export default CreateUser;
