/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { IAssetTypeAxiosResponse, IAssetTypeFormValues, ICreateAssetType } from './interface';
import AssetTypeUtills from './utills';
import AssetTypeForm from './AssetTypeForm';
import { assetTypeSchema } from './schema';
import { createAssetTypeService } from './service';

const CreateAssetType = ({
    handleClose,
    sendingRequest,
    setSendingRequest,
}: ICreateAssetType) => {
    const { addAssetTypeToStore } = AssetTypeUtills();

    const { control, handleSubmit, formState, register } = useForm<IAssetTypeFormValues>({
        mode: 'onChange',
        resolver: yupResolver(assetTypeSchema),
        defaultValues: {
            name: '',
            shortCode: '',
            description: '',
            ownerGroupEmail: '',
            depreciationRate: '',
            usefulLifeMonths: '',
            tracksAssets: false,
            repairable: true,
            repairDestination: 'IT',
        },
    });

    const onSubmit = async (formData: IAssetTypeFormValues) => {
        setSendingRequest(true);
        try {
            const response = await createAssetTypeService({
                name: formData.name.trim(),
                shortCode: formData.shortCode?.trim() || null,
                description: formData.description?.trim() || null,
                ownerGroupEmail: formData.ownerGroupEmail?.trim() || null,
                depreciationRate: formData.depreciationRate?.trim() ? Number(formData.depreciationRate) : null,
                usefulLifeMonths: formData.usefulLifeMonths?.trim() ? Number(formData.usefulLifeMonths) : null,
                tracksAssets: formData.tracksAssets === true,
                repairable: formData.repairable !== false,
                repairDestination: formData.repairDestination || null,
            }) as IAssetTypeAxiosResponse;
            if (response.status === 201) {
                addAssetTypeToStore(response.data);
                toast.success(`Category '${response.data.name}' created successfully`, { position: 'bottom-right' });
                handleClose();
            }
        } catch (error: any) {
            const properties = error?.response?.data?.properties;
            const detail = error?.response?.data?.detail;
            const message = error?.response?.data?.message;
            if (properties) {
                toast.error(Object.values(properties).join(', '), { position: 'bottom-right' });
            } else if (detail) {
                toast.error(detail, { position: 'bottom-right' });
            } else if (message) {
                toast.error(message, { position: 'bottom-right' });
            } else {
                toast.error('Failed to create asset category. Please try again.', { position: 'bottom-right' });
            }
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <AssetTypeForm
                handleClose={handleClose}
                buttonText="Create Category"
                formState={formState}
                control={control}
                register={register}
                sendingRequest={sendingRequest}
            />
        </form>
    );
};

export default CreateAssetType;
