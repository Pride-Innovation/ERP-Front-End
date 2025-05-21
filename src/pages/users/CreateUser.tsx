/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import UserForm from './UserForm';
import { ICreateUser, IUser, IUserCreationResponseAxiosResponse } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userSchema } from './schema';
import { Grid, Paper } from '@mui/material';
import { createUSerService } from './service';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addUser } from './slice';

const CreateUser = ({ handleClose }: ICreateUser) => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const defaultUser: IUser = {} as IUser;
    const dispatch = useDispatch<AppDispatch>()

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
    }, [reset]);

    const onSubmit = async (formData: IUser) => {
        setSendingRequest(true);
        try {
            const response = await createUSerService(formData) as IUserCreationResponseAxiosResponse;
            if (response.status === 201) {
                toast.success("User created successfully")
                dispatch(addUser(response.data.user))
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false);
        handleClose();
    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: "none", maxWidth: "1200px", mx: "auto" }}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <UserForm
                            handleClose={handleClose}
                            buttonText="Submit"
                            formState={formState}
                            control={control}
                            sendingRequest={sendingRequest}
                            register={register}
                        />
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
}

export default CreateUser;
