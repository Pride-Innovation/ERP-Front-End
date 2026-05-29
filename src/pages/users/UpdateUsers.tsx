/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import { IUpdateUser, IUser, IUserAxiosResponse } from './interface';
import { userSchema } from './schema';
import UserForm from './UserForm';
import { updateUSerService } from './service';
import { AppDispatch } from '../../store';
import { updateUser } from './slice';
import { IAsyncAutocompleteOption } from '../../components/forms/AsyncAutocomplete';

const UpdateUsers = ({ handleClose, sendingRequest, setSendingRequest, user }: IUpdateUser) => {
    const dispatch = useDispatch<AppDispatch>();

    // Hydrate the async fields from the user's existing nested objects so the
    // form shows the correct labels without an extra network round-trip.
    const initialTitle: IAsyncAutocompleteOption | null = useMemo(
        () => (user?.title ? { value: user.title.id as number, label: user.title.name, raw: user.title } : null),
        [user?.title?.id]
    );
    const initialBranchOption: IAsyncAutocompleteOption | null = useMemo(
        () =>
            user?.branch
                ? { value: user.branch.id as number, label: user.branch.name, raw: user.branch }
                : null,
        [user?.branch?.id]
    );
    const initialDepartmentOption: IAsyncAutocompleteOption | null = useMemo(
        () =>
            user?.department
                ? { value: user.department.id as number, label: user.department.name, raw: user.department }
                : null,
        [user?.department?.id]
    );
    const initialUnitOption: IAsyncAutocompleteOption | null = useMemo(
        () => {
            const u = (user as any)?.unit;
            return u && typeof u === 'object'
                ? { value: u.id as number, label: u.name, raw: u }
                : null;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [(user as any)?.unit?.id]
    );

    const [selectedBranch, setSelectedBranch] = useState<IAsyncAutocompleteOption | null>(initialBranchOption);
    const isHeadOffice = Boolean(selectedBranch?.raw?.isHeadOffice);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
        setValue,
    } = useForm<IUser>({
        mode: 'onChange',
        resolver: yupResolver(userSchema, { context: { isHeadOffice } }) as unknown as Resolver<IUser>,
    });

    // Reset whenever the user changes (e.g. navigating between users).
    useEffect(() => {
        reset({
            ...user,
            title: user?.title?.id as any,
            branch: user?.branch?.id as any,
            department: user?.department?.id as any,
            unit: (typeof (user as any)?.unit === 'object' ? (user as any)?.unit?.id : (user as any)?.unit) ?? null,
            availability: user?.availability ?? 'present',
            otherName: user?.otherName ?? '',
        } as any);
        setSelectedBranch(initialBranchOption);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleBranchChange = (option: IAsyncAutocompleteOption | null) => {
        setSelectedBranch(option);
        setValue('department' as any, null as any, { shouldValidate: true });
        setValue('unit' as any, null as any, { shouldValidate: true });
    };

    const clearUnit = () => setValue('unit' as any, null as any, { shouldValidate: true });

    const onSubmit = async (formData: IUser) => {
        setSendingRequest(true);
        try {
            const payload = {
                ...formData,
                department: isHeadOffice ? formData.department : null,
                unit: isHeadOffice ? formData.unit : null,
            };
            const response = (await updateUSerService(payload, user.id as number)) as IUserAxiosResponse;
            if (response.status === 200 || response.status === 201) {
                toast.success('User updated successfully');
                dispatch(updateUser(response.data));
                handleClose();
            }
        } catch (error) {
            console.error('UpdateUsers unexpected error:', error);
        }
        setSendingRequest(false);
    };

    return (
        <Box sx={{ overflowY: 'auto', pb: 1, maxWidth: 1200, mx: 'auto' }}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <UserForm
                    handleClose={handleClose}
                    buttonText="Save Changes"
                    formState={formState}
                    control={control}
                    sendingRequest={sendingRequest}
                    register={register}
                    mode="update"
                    initialTitle={initialTitle}
                    initialBranch={selectedBranch}
                    initialDepartment={initialDepartmentOption}
                    initialUnit={initialUnitOption}
                    onBranchChange={handleBranchChange}
                    onDepartmentChange={clearUnit}
                />
            </form>
        </Box>
    );
};

export default UpdateUsers;
