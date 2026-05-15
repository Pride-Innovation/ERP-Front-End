/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect } from 'react'
import { IRoleAxiosResponse, IRoleFormValues, IUpdateRole } from '../interface';
import { useForm } from 'react-hook-form';
import { roleSchema } from './schema';
import { yupResolver } from '@hookform/resolvers/yup';
import RoleForm from './RoleForm';
import { updateRoleService } from './service';
import { toast } from 'react-toastify';
import RoleUtills from './utills';

const UpdateRole = ({ handleClose, sendingRequest, setSendingRequest, role }: IUpdateRole) => {
    const { updateRoleInStore } = RoleUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
    } = useForm<IRoleFormValues>({
        mode: 'onChange',
        resolver: yupResolver(roleSchema),
        defaultValues: {
            name: role.name || '',
            description: role.description || null,
        },
    });

    useEffect(() => {
        if (role) {
            reset({
                name: role.name || '',
                description: role.description || null,
            });
        }
    }, [role, reset]);

    const onSubmit = async (formData: IRoleFormValues) => {
        setSendingRequest(true);
        try {
            const response = await updateRoleService(
                { name: formData.name, description: formData.description || null },
                role.id as number
            ) as IRoleAxiosResponse;
            if (response.status === 200) {
                updateRoleInStore(response.data);
                toast.success('Role updated successfully', { position: 'bottom-right' });
                handleClose();
            }
        } catch (error: any) {
            const properties = error?.response?.data?.properties;
            const detail = error?.response?.data?.detail;
            const message = error?.response?.data?.message;
            if (properties) {
                toast.error(Object.values(properties).join(', '), { position: 'bottom-right' });
            } else if (detail) {
                toast.error(detail, { position: 'bottom-right' });
            } else if (message) {
                toast.error(message, { position: 'bottom-right' });
            } else {
                toast.error('Failed to update role. Please try again.', { position: 'bottom-right' });
            }
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <RoleForm
                handleClose={handleClose}
                buttonText="Update"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
            />
        </form>
    )
}

export default UpdateRole