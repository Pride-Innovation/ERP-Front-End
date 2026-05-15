/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect } from 'react';
import { IRegionAxiosResponse, IRegionFormValues, IUpdateRegion } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { regionSchema } from './schema';
import RegionUtills from './utills';
import { toast } from 'react-toastify';
import RegionForm from './RegionForm';
import { updateRegionService } from './service';

const UpdateRegion = ({
    sendingRequest,
    setSendingRequest,
    handleClose,
    region
}: IUpdateRegion) => {
    const { updateRegionInStore } = RegionUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IRegionFormValues>({
        mode: 'onChange',
        resolver: yupResolver(regionSchema),
        defaultValues: { name: region.name || '' },
    });

    useEffect(() => {
        if (region) {
            reset({ name: region.name || '' });
        }
    }, [region, reset]);

    const onSubmit = async (formData: IRegionFormValues) => {
        setSendingRequest(true);
        try {
            const response = await updateRegionService(
                { name: formData.name },
                region?.id as string
            ) as IRegionAxiosResponse;

            if (response.status === 200) {
                updateRegionInStore(response.data);
                toast.success('Region updated successfully', { position: 'bottom-right' });
                handleClose();
            }
        } catch (error: any) {
            const detail = error?.response?.data?.detail;
            const properties = error?.response?.data?.properties;
            const message = error?.response?.data?.message;
            if (properties?.name) {
                toast.error(properties.name, { position: 'bottom-right' });
            } else if (properties) {
                toast.error(Object.values(properties).join(', '), { position: 'bottom-right' });
            } else if (detail) {
                toast.error(detail, { position: 'bottom-right' });
            } else if (message) {
                toast.error(message, { position: 'bottom-right' });
            } else {
                toast.error('Failed to update region. Please try again.', { position: 'bottom-right' });
            }
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <form
            style={{ width: "100%" }}
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
        >
            <RegionForm
                handleClose={handleClose}
                buttonText="Update"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
            />
        </form>
    );
};

export default UpdateRegion;