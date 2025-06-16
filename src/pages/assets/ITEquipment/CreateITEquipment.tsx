/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react'
import { IITEquipment, IITEquipmentAxiosResponse } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ITEquipmentSchema } from './schema';
import { Card, Grid, SelectChangeEvent } from '@mui/material';
import ITEquipmentForm from './ITEquipmentForm';
import { FormHeader } from '../../../components/headers/TypographyComponent';
import { createITEquipmentService } from './service';
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
        try {
            const response = await createITEquipmentService(formData) as IITEquipmentAxiosResponse
            if (response.status === 201) {
                toast.success("Asset created successfully!!")
            }
        } catch (error) {
            console.log(error)
        }
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