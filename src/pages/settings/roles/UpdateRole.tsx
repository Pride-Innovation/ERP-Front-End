/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect } from 'react'
import { IRole, IRoleAxiosResponse, IUpdateRole } from '../interface';
import { useForm } from 'react-hook-form';
import { roleSchema } from './schema';
import { yupResolver } from '@hookform/resolvers/yup';
import RoleForm from './RoleForm';
import { updateRoleService } from './service';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { updateRole } from './slice';

const UpdateRole = ({ handleClose, sendingRequest, role }: IUpdateRole) => {
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
        reset({ ...role });
    }, [reset]);

    const onSubmit = async (formData: IRole) => {
        try {
            const response = await updateRoleService(formData, (role.id as number)) as IRoleAxiosResponse
            if (response.status === 201) {
                toast.success(`Role has been updated successfully`);
                dispatch(updateRole(response.data))
            }

        } catch (error) {
            console.log(error)
        }
        handleClose()
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <RoleForm
                handleClose={handleClose}
                buttonText="Submit"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
            />
        </form>
    )
}

export default UpdateRole