import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, Grid } from '@mui/material';
import { FormHeader } from '../../../components/headers/TypographyComponent';
import { IFleet } from './interface';
import { fleetSchema } from './schema';
import FleetForm from './FleetForm';
import { createFleetService } from './service';
import { IResponseData } from '../../users/interface';
import { toast } from 'react-toastify';

const CreateFleet = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);

    const defaultUser: IFleet = {} as IFleet;

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IFleet>({
        mode: 'onChange',
        resolver: yupResolver(fleetSchema),
    });

    useEffect(() => {
        reset({ ...defaultUser });
    }, [reset]);

    const onSubmit = async (formData: IFleet) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            assetStatus_id: parseInt(formData?.assetStatus as string),
            unitOfMeasure_id: parseInt(formData?.unitOfMeasure as string),
            supplier_id: parseInt(formData?.supplier),
            fleetAssetCategory_id: parseInt(formData?.assetCategory_id)
        }
        const response = await createFleetService(request) as IResponseData;
        toast.success(response.data.message)
        setSendingRequest(false)
    };

    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <FormHeader header='Create Fleet' />
                    <form
                        style={{ width: "100%" }}
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <FleetForm
                            buttonText="Submit"
                            formState={formState}
                            control={control}
                            sendingRequest={sendingRequest}
                            register={register}
                        />
                    </form>
                </Grid>
            </Grid>
        </Card>
    )
}

export default CreateFleet