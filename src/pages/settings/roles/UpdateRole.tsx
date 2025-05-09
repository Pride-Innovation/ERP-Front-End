/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect } from 'react'
import { IRole, IUpdateRole } from '../interface';
import { useForm } from 'react-hook-form';
import { roleSchema } from './schema';
import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import RoleForm from './RoleForm';

const UpdateRole = ({ handleClose, sendingRequest, role }: IUpdateRole) => {

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IRole>({
        mode: 'onChange',
        resolver: yupResolver(roleSchema),
    });

    useEffect(() => {
        reset({ ...role });
    }, [reset]);

    const onSubmit = (formData: IRole) => {
        console.log(formData, "form data!!")
    };

    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <RoleForm
                        handleClose={handleClose}
                        buttonText="Submit"
                        formState={formState}
                        control={control}
                        sendingRequest={sendingRequest}
                        register={register}
                    />
                </form>
            </Grid>
        </Grid>
    )
}

export default UpdateRole