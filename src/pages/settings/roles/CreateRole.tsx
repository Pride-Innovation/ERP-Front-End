/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from 'react-hook-form';
import { ICreateRole, IRoleAxiosResponse, IRoleFormValues } from '../interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { roleSchema } from './schema';
import RoleForm from './RoleForm';
import { createRoleService } from './service';
import { toast } from 'react-toastify';
import RoleUtills from './utills';

const CreateRole = ({ handleClose, sendingRequest, setSendingRequest }: ICreateRole) => {
    const { addRoleToStore } = RoleUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
    } = useForm<IRoleFormValues>({
        mode: 'onChange',
        resolver: yupResolver(roleSchema),
        defaultValues: { name: '', description: null },
    });

    const onSubmit = async (formData: IRoleFormValues) => {
        setSendingRequest(true);
        try {
            const response = await createRoleService({
                name: formData.name,
                description: formData.description || null,
            }) as IRoleAxiosResponse;
            if (response.status === 201) {
                addRoleToStore(response.data);
                toast.success(`Role '${response.data.name}' created successfully`, { position: 'bottom-right' });
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
                toast.error('Failed to create role. Please try again.', { position: 'bottom-right' });
            }
        } finally {
            setSendingRequest(false);
        }
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
    );
}

export default CreateRole