import { useEffect, useState } from 'react'
import { IITEquipment } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ITEquipmentSchema } from './schema';
import { Card, Grid, SelectChangeEvent } from '@mui/material';
import ITEquipmentForm from './ITEquipmentForm';
import { FormHeader } from '../../../components/headers/TypographyComponent';
import { createITEquipmentService } from './service';

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
        console.log(formData, "formdata, request")
        setSendingRequest(true);
        const request = {
            ...formData,
            // assetSubCategory_id: 1,
            branch_id: 1,
            assetStatus_id: 1,
            ItAssetCategory_id: 1,
            unitOfMeasure_id: 1,
            supplier_id: 1,
            engravedNumber: 1,
            user_id: 1,
            desc: "Test Decription",

            /** Extra fields */
            ram: "8GB",
            cpuSpeed: "2.7GH",
            hardDiskSize: "500GB",
            macAddress: "128H1234455",
            ipAddress: "143543ERTYY",
            interfaceType: "223"
        }

        // const response = await createITEquipmentService(request) as IITEquipment;
        // console.log(response, "created IT Equipment!!!")
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