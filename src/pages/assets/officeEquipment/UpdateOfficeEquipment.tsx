/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react'
import { IOfficeEquipment, IOfficeEquipmentAxiosResponse } from './interface';
import { useParams } from 'react-router';
import { officeEquipmentMock } from '../../../mocks/officeEquipment';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { officeEquipmentSchema } from './schema';
import { Card, Grid } from '@mui/material';
import { FormHeader } from '../../../components/headers/TypographyComponent';
import OfficeEquipmentForm from './OfficeEquipmentForm';
import { getOfficeEquipmentByIDService } from './service';


const UpdateOfficeEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<IOfficeEquipment>(officeEquipmentMock[0]);

    const findOfficeEquipmentByID = async () => {
        const response = await getOfficeEquipmentByIDService(id as string) as IOfficeEquipmentAxiosResponse;
        if (response.status === 200) {
            setDefaultAsset({
                ...response.data
            })
        }
    }

    useEffect(() => { findOfficeEquipmentByID(); }, [id]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IOfficeEquipment>({
        mode: 'onChange',
        resolver: yupResolver(officeEquipmentSchema),
    });

    useEffect(() => {
        console.log(defaultAsset, "default asset information!!")
        reset({ ...defaultAsset });
    }, [defaultAsset]);

    const onSubmit = async (formData: IOfficeEquipment) => {
        setSendingRequest(true);

        // const response = await updateOfficeEquipmentService(request, id as string) as IResponseData;
        // toast.success(response.data.message)
        setSendingRequest(false)
    };

    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <FormHeader header="Update Office Equipment" />
                    <form
                        style={{ width: "100%" }}
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <OfficeEquipmentForm
                            buttonText="Submit"
                            formState={formState}
                            control={control}
                            sendingRequest={sendingRequest}
                            register={register} />
                    </form>
                </Grid>
            </Grid>
        </Card>
    )
}

export default UpdateOfficeEquipment