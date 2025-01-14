import { useEffect, useState } from 'react'
import { IOfficeEquipment } from './interface';
import { useParams } from 'react-router';
import { officeEquipmentMock } from '../../../mocks/officeEquipment';
import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import { officeEquipmentSchema } from './schema';
import { Card, Grid } from '@mui/material';
import { FormHeader } from '../../../components/headers/TypographyComponent';
import OfficeEquipmentForm from './OfficeEquipmentForm';
import { getOfficeEquipmentByIDService, updateOfficeEquipmentService } from './service';
import { IResponseData } from '../../users/interface';
import { toast } from 'react-toastify';

const UpdateOfficeEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<IOfficeEquipment>(officeEquipmentMock[0]);

    const findOfficeEquipmentByID = async () => {
        const response = await getOfficeEquipmentByIDService(id as string);
        setDefaultAsset({
            ...response,
            assetCategory_id: (response?.OfficeEquipmentAssetCategory_id).toString(),
            supplier: (response?.supplier_id).toString(),
            unitOfMeasure: (response?.unitOfMeasure_id).toString(),
            user_id: (response?.user_id).toString(),
            assetStatus: (response?.assetStatus_id).toString()
        })
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
        // resolver: yupResolver(officeEquipmentSchema),
    });

    useEffect(() => {
        console.log(defaultAsset, "default asset information!!")
        reset({ ...defaultAsset });
    }, [defaultAsset]);

    const onSubmit = async (formData: IOfficeEquipment) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            branch_id: parseInt(formData.branch_id as string),
            assetStatus_id: parseInt(formData.assetStatus as string),
            OfficeEquipmentAssetCategory_id: parseInt(formData.assetCategory_id),
            unitOfMeasure_id: parseInt(formData.unitOfMeasure),
            supplier_id: parseInt(formData.supplier),
            user_id: parseInt(formData.user_id as string),
        }
        const response = await updateOfficeEquipmentService(request, id as string) as IResponseData;
        toast.success(response.data.message)
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