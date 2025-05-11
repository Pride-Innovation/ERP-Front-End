/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect } from 'react'
import { ICreateRole, IRole, IRoleAxiosResponse } from '../interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { roleSchema } from './schema';
import { Grid } from '@mui/material';
import RoleForm from './RoleForm';
import { createRoleService } from './service';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { addRole } from './slice';

const CreateRole = ({ handleClose, sendingRequest }: ICreateRole) => {
    const defaultUser: IRole = {} as IRole;
    const dispatch = useDispatch<AppDispatch>();

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
        reset({ ...defaultUser });
    }, [reset]);

    const onSubmit = async (formData: IRole) => {
        try {
            const response = await createRoleService(formData) as IRoleAxiosResponse;
            if (response.status === 200) {
                toast.success(`Role ${response.data.name} has been created successfully`);
                dispatch(addRole(response.data))
            }
        } catch (error) {
            console.log(error)
        }
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
    );
}

export default CreateRole