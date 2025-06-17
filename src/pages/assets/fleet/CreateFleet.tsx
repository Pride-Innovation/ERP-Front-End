/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, Grid } from '@mui/material';
import { FormHeader } from '../../../components/headers/TypographyComponent';
import { IFleet, IFleetAxiosResponse } from './interface';
import { fleetSchema } from './schema';
import FleetForm from './FleetForm';
import { createFleetService } from './service';
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
        try {
            const response = await createFleetService(formData) as IFleetAxiosResponse
            if (response.status === 201) {
                toast.success("Asset created successfully!!")
            }
        } catch (error) {
            console.log(error)
        }
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