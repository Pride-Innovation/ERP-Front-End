/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { IITEquipment } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ITEquipmentSchema } from "./schema";
import { Card, Grid, SelectChangeEvent } from "@mui/material";
import { FormHeader } from "../../../components/headers/TypographyComponent";
import ITEquipmentForm from "./ITEquipmentForm";
import { itEquipmentMock } from "../../../mocks/itEquipment";
import { getITEquipmentByIDService } from "./service";

const UpdateITEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<IITEquipment>(itEquipmentMock[0]);
    const [option, setOption] = useState<string | undefined>('');

    const findITEquipmentByID = async () => {
        const response = await getITEquipmentByIDService(id as string);
        setDefaultAsset({
            ...response,
            assetCategory_id: (response?.ItAssetCategory_id).toString(),
            supplier: (response?.supplier_id).toString(),
            unitOfMeasure: (response?.unitOfMeasure_id).toString(),
            user_id: (response?.user_id).toString(),
            assetSubCategory_id: null,
            assetStatus: (response?.assetStatus_id).toString()
        });
    }

    useEffect(() => { findITEquipmentByID(); }, [id]);

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
        reset({ ...defaultAsset });
        setOption(defaultAsset.category as string)
    }, [defaultAsset]);

    const onSubmit = async (formData: IITEquipment) => {
        setSendingRequest(true);

        setSendingRequest(false)
    };

    const handleChange = (event: SelectChangeEvent) => {
        setOption(event.target.value as string);
    };

    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <FormHeader header="Update Asset" />
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

export default UpdateITEquipment;