import { useEffect, useState } from 'react';
import UserForm from './UserForm';
import { ICreateUser, IResponseData, IUser } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userSchema } from './schema';
import { Grid } from '@mui/material';
import { createUSerService } from './service';
import { toast } from 'react-toastify';
import { ErrorMessage } from '../../utils/constants';

const CreateUser = ({ handleClose }: ICreateUser) => {
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
        data.append('availability', formData.availability ? "present" : "absent");

        const roles = ["Super Admin", "Admin"];

        data.append('password', "12345678");
        data.append('password_confirmation', "12345678");


        roles.forEach((role, index) => {
            data.append(`roles[${index}]`, role);
        });

        try {
            const response = await createUSerService(data) as IResponseData;
            if (response.status === "success") {
                handleClose();
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
    );
}

export default CreateUser;
