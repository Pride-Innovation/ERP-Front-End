import React, { useEffect, useState } from 'react'
import { IUser } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userSchema } from './schema';

const UpdateUsers = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);

    const defaultUser: IUser = {} as IUser;

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

    const onSubmit = (formData: IUser) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
    };
    return (
        <div>UpdateUsers</div>
    )
}

export default UpdateUsers