import { useEffect, useState } from 'react'
import { IITEquipment } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ITEquipmentSchema } from './schema';
import { Card, Grid, SelectChangeEvent } from '@mui/material';
import ITEquipmentForm from './ITEquipmentForm';
import { FormHeader } from '../../../components/headers/TypographyComponent';
import { createITEquipmentService } from './service';
import { IResponseData } from '../../users/interface';
import { toast } from 'react-toastify';

const CreateITEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [option, setOption] = useState<string | undefined>('');

    const defaultUser: IITEquipment = {} as IITEquipment;

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IITEquipment>({
        mode: 'onChange',
        resolver: yupResolver(ITEquipmentSchema),
    });

    useEffect(() => {
        reset({ ...defaultUser });
    }, [reset]);

    const onSubmit = async (formData: IITEquipment) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            branch_id: parseInt(formData.branch_id as string),
            assetStatus_id: parseInt(formData.assetStatus as string),
            ItAssetCategory_id: parseInt(formData.assetCategory_id),
            unitOfMeasure_id: parseInt(formData.unitOfMeasure),
            supplier_id: parseInt(formData.supplier),
            user_id: parseInt(formData.user_id as string),
            desc: "Test Decription",

            /** Extra fields */
            ram: "8GB",
            cpuSpeed: "2.7GH",
            hardDiskSize: "500GB",
            macAddress: "128H1234455",
            ipAddress: "143543ERTYY",
            interfaceType: "223"
        }

        const response = await createITEquipmentService(request) as IResponseData;
        toast.success(response.data.message)
        setSendingRequest(false)
    };

    const handleChange = (event: SelectChangeEvent) => {
        setOption(event.target.value as string);
    };

    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <FormHeader header='Create IT Equipment' />
                    <form
                        style={{ width: "100%" }}
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <ITEquipmentForm
                            option={option}
                            handleChange={handleChange}
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

export default CreateITEquipment