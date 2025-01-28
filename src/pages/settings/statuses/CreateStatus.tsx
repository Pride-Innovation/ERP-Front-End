import { Grid } from '@mui/material'
import StatusForm from './StatusForm'
import { ICreateStatus, IStatus } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { statusSchema } from './schema';
import { createStatusService } from './service';
import { IResponseData } from '../../users/interface';
import { toast } from 'react-toastify';
import StatusUtills from './Utills';

const CreateStatus = ({ sendingRequest, setSendingRequest, handleClose }: ICreateStatus) => {
    const defaultStatus: IStatus = {} as IStatus;
    const { addStatusToStore } = StatusUtills()
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IStatus>({
        mode: 'onChange',
        resolver: yupResolver(statusSchema),
    });

    useEffect(() => {
        reset({ ...defaultStatus });
    }, [reset]);

    const onSubmit = async (formData: IStatus) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            user_id: 1
        }
        const response = await createStatusService(request) as IResponseData;
        if (response.status === 'success') {
            addStatusToStore(response.data["0"] as unknown as IStatus)
            toast.success(response.data.message)
            setSendingRequest(false);
            handleClose()
        }
    };

    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <StatusForm
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

export default CreateStatus