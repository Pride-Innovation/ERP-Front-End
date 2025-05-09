/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react'
import { IResponseData, IUpdateUser, IUser } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userSchema } from './schema';
import { UserContext } from '../../context/user/UserContext';
import { Grid } from '@mui/material';
import UserForm from './UserForm';
import { updateUSerService } from './service';
import { toast } from 'react-toastify';
import { ErrorMessage } from '../../utils/constants';
import UserUtils from './utils';

const UpdateUsers = ({ handleClose }: IUpdateUser) => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { user } = useContext(UserContext);
    const { replaceUpdatedUser } = UserUtils()
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
        reset({ ...user });
    }, [reset]);

    const onSubmit = async (formData: IUser) => {
        setSendingRequest(true);

        const data = new FormData();
        data.append('email', formData.email);
        data.append('name', formData.firstName + " " + formData.lastName + " " + formData.otherName);
        data.append('title', formData.title);
        data.append('reportsTo', "1");
        data.append('department_id', "1");
        data.append('gender', formData.gender);
        data.append('staffNumber', formData.staffNumber);
        data.append('availability', (formData?.availability as string));

        data.append('password', "12345678");
        data.append('password_confirmation', "12345678");

        const roles = formData?.role as unknown as Array<string>
        roles?.forEach((role, index) => {
            data.append(`roles[${index}]`, role);
        });

        try {
            const response = await updateUSerService(data, (user?.id as string)) as IResponseData;
            if (response.status === "success") {
                handleClose();
                const updatedUser: IUser = { ...(response["data"]?.[0] as IUser), id: user?.id }
                replaceUpdatedUser((user?.id as string), updatedUser)
                return toast.success(response?.data?.message)
            }
            return toast.error(ErrorMessage)
        } catch (error) {
            console.log(error)
            toast.error(ErrorMessage)
        }
        setSendingRequest(false);
    };

    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <UserForm
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

export default UpdateUsers