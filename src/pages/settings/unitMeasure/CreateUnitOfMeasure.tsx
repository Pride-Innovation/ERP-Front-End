import { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { Grid } from '@mui/material';
import UnitOfMeasureForm from './UnitOfMeasureForm';
import { ICreateUnitOfMeasure, IUnitOfMeasure } from './interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { unitMeasureSchema } from './schema';
import { IResponseData } from '../../users/interface';
import { createUnitMeasureService } from './service';
import UnitMeasureUtills from './Utills';
import { toast } from 'react-toastify';

const CreateUnitOfMeasure = ({ handleClose, sendingRequest, setSendingRequest }: ICreateUnitOfMeasure) => {
    const defaultUnitOfMeasure: IUnitOfMeasure = {} as IUnitOfMeasure;
    const { addUnitOfMeasureToStore } = UnitMeasureUtills()

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
        reset({ ...defaultUnitOfMeasure });
    }, [reset]);

    const onSubmit = async (formData: IUnitOfMeasure) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            user_id: 1
        }
        const response = await createUnitMeasureService(request) as IResponseData;
        if (response.status === 'success') {
            addUnitOfMeasureToStore(response.data["0"] as unknown as IUnitOfMeasure)
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

export default CreateUnitOfMeasure