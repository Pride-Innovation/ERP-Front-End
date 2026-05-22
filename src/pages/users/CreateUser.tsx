/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import UserForm from './UserForm';
import { ICreateUser, IUser, IUserCreationResponseAxiosResponse } from './interface';
import { userSchema } from './schema';
import { createUSerService } from './service';
import { AppDispatch } from '../../store';
import { addUser } from './slice';
import { IAsyncAutocompleteOption } from '../../components/forms/AsyncAutocomplete';

const CreateUser = ({ handleClose }: ICreateUser) => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [selectedBranch, setSelectedBranch] = useState<IAsyncAutocompleteOption | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    const isHeadOffice = Boolean(selectedBranch?.raw?.isHeadOffice);

    const {
        control,
        handleSubmit,
        formState,
        register,
        setValue,
    } = useForm<IUser>({
        mode: 'onChange',
        resolver: yupResolver(userSchema, { context: { isHeadOffice } }) as unknown as Resolver<IUser>,
        defaultValues: {
            firstName: '',
            lastName: '',
            otherName: '',
            email: '',
            gender: '',
            staffNumber: '',
            availability: 'present',
        } as Partial<IUser> as any,
    });

    const handleBranchChange = (option: IAsyncAutocompleteOption | null) => {
        setSelectedBranch(option);
        // Clear any previously chosen department when the duty station changes,
        // so a stale Head Office department never leaks into a branch submission.
        setValue('department' as any, null as any, { shouldValidate: true });
    };

    const onSubmit = async (formData: IUser) => {
        setSendingRequest(true);
        try {
            const payload = {
                ...formData,
                department: isHeadOffice ? formData.department : null,
            };
            const response = (await createUSerService(payload)) as IUserCreationResponseAxiosResponse;
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
            // Axios interceptor already shows a toast.
            console.error('CreateUser unexpected error:', error);
        }
        setSendingRequest(false);
    };

    return (
        <Box sx={{ overflowY: 'auto', pb: 1, maxWidth: 1200, mx: 'auto' }}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <UserForm
                    handleClose={handleClose}
                    buttonText="Create User"
                    formState={formState}
                    control={control}
                    sendingRequest={sendingRequest}
                    register={register}
                    mode="create"
                    initialBranch={selectedBranch}
                    onBranchChange={handleBranchChange}
                />
            </form>
        </Box>
    );
};

export default CreateUser;
