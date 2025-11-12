/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo } from 'react';
import { IRegion, IUpdateRegion } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { regionSchema } from './schema';
import RegionUtills from './utills';
import { IResponseData } from '../../users/interface';
import { toast } from 'react-toastify';
import { Grid, Paper } from '@mui/material';
import RegionForm from './RegionForm';
import { updateRegionService } from './service';

const UpdateRegion = ({
    sendingRequest,
    setSendingRequest,
    handleClose,
    region
}: IUpdateRegion) => {
    const { updateRegionInStore } = RegionUtills();

    const defaultValues = useMemo(() => ({
        name: region.name || '',
    }), [region]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IRegion>({
        mode: 'onChange',
        resolver: yupResolver(regionSchema) as any,
        defaultValues: defaultValues,
    });

    useEffect(() => {
        if (region) {
            reset({
                name: region.name || '',
            });
        }
    }, [region, reset]);

    const onSubmit = async (formData: IRegion) => {
        setSendingRequest(true);

        try {
            const updateData = {
                name: formData.name,
            };

            const response = await updateRegionService(
                updateData,
                region?.id as string
            ) as IResponseData;

            if (response.status === 'success') {
                const updatedRegion = response.data[0] as unknown as IRegion;
                updateRegionInStore(updatedRegion);

                toast.success(response.data.message || 'Region updated successfully');
                handleClose();
            } else {
                toast.error('Failed to update region');
            }
        } catch (error) {
            console.error('Error updating region:', error);
            toast.error('An error occurred while updating the region');
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Paper
            elevation={3}
            sx={{
                borderRadius: 3,
                boxShadow: "none",
                maxWidth: "800px",
                mx: "auto"
            }}
        >
            <form
                style={{ width: "100%" }}
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <RegionForm
                            handleClose={handleClose}
                            buttonText="Update"
                            formState={formState}
                            control={control}
                            sendingRequest={sendingRequest}
                            register={register}
                        />
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default UpdateRegion;