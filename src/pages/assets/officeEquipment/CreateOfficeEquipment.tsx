/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { IOfficeEquipment } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, Grid } from "@mui/material";
import { FormHeader } from "../../../components/headers/TypographyComponent";
import { officeEquipmentSchema } from "./schema";
import OfficeEquipmentForm from "./OfficeEquipmentForm";
import { createOfficeEquipmentService } from "./service";
import { IResponseData } from "../../users/interface";
import { toast } from "react-toastify";

const CreateOfficeEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const defaultUser: IOfficeEquipment = {} as IOfficeEquipment;

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
        reset({ ...defaultUser });
    }, [reset]);

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

        const response = await createOfficeEquipmentService(request) as IResponseData;
        toast.success(response.data.message)
        setSendingRequest(false)
    };


    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <FormHeader header='Create Office Equipment' />
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

export default CreateOfficeEquipment