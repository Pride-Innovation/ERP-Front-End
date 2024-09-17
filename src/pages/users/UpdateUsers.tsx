import { useContext, useEffect, useState } from 'react'
import { IUpdateUser, IUser } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userSchema } from './schema';
import { UserContext } from '../../context/UserContext';
import { Grid } from '@mui/material';
import UserForm from './UserForm';

const UpdateUsers = ({ handleClose }: IUpdateUser) => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { user } = useContext(UserContext);

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

    const onSubmit = (formData: IUser) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
        setSendingRequest(false)
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