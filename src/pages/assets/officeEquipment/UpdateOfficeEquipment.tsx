import React, { useEffect, useState } from 'react'
import { IOfficeEquipment } from './interface';
import { useParams } from 'react-router';
import { officeEquipmentMock } from '../../../mocks/officeEquipment';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { officeEquipmentSchema } from './schema';
import { Card, Grid } from '@mui/material';
import { FormHeader } from '../../../components/headers/TypographyComponent';

const UpdateOfficeEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<IOfficeEquipment>(officeEquipmentMock[0]);

    useEffect(() => {
        setDefaultAsset(() => {
            return officeEquipmentMock.find(asset => asset?.id === parseInt(id as string)) as IOfficeEquipment
        })
    }, [id]);

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
        reset({ ...defaultAsset });
    }, [defaultAsset]);

    const onSubmit = (formData: IOfficeEquipment) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
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
                        Update Office Equipment
                    </form>
                </Grid>
            </Grid>
        </Card>
    )
}

export default UpdateOfficeEquipment