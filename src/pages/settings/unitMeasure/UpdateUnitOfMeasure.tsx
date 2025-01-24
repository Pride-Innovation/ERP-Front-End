import { useForm } from 'react-hook-form';
import { IUnitOfMeasure, IUpdateUnitOfMeasure } from './interface';
import { useEffect } from 'react';
import { Grid } from '@mui/material';
import UnitOfMeasureForm from './UnitOfMeasureForm';
import UnitMeasureUtills from './Utills';
import { unitMeasureSchema } from './schema';
import { yupResolver } from '@hookform/resolvers/yup';
import { updateUnitMeasureService } from './service';
import { IResponseData } from '../../users/interface';
import { toast } from 'react-toastify';

const UpdateUnitOfMeasure = ({ unitOfMeasure, handleClose, sendingRequest, setSendingRequest }: IUpdateUnitOfMeasure) => {
    const { updateUnitOfMeasureInStore } = UnitMeasureUtills()
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IUnitOfMeasure>({
        mode: 'onChange',
        resolver: yupResolver(unitMeasureSchema),
    });

    useEffect(() => {
        reset({ ...unitOfMeasure });
    }, [reset]);

    const onSubmit = async (formData: IUnitOfMeasure) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            user_id: 1
        }

        const response = await updateUnitMeasureService(request, formData?.id as string) as IResponseData;
        if (response.status === 'success') {
            updateUnitOfMeasureInStore(response.data[0] as unknown as IUnitOfMeasure)
            toast.success(response.data.message)
            setSendingRequest(false);
            handleClose()
        }
        setSendingRequest(true);
    };
    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <UnitOfMeasureForm
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

export default UpdateUnitOfMeasure