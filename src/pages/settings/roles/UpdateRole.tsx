import { useEffect, useState } from 'react'
import { IRole } from '../interface';
import { useForm } from 'react-hook-form';
import { roleSchema } from './schema';
import { yupResolver } from '@hookform/resolvers/yup';
import { rolesMock } from '../../../mocks/settings';
import { Grid } from '@mui/material';
import RoleForm from './RoleForm';
import RoleUtills from './utills';

const UpdateRole = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const role = rolesMock[0];
    const { handleClose } = RoleUtills();

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

    const onSubmit = (formData: IRole) => {
        setSendingRequest(true);
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
    )
}

export default UpdateRole