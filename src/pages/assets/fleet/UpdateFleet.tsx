/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, Grid } from "@mui/material";
import { FormHeader } from "../../../components/headers/TypographyComponent";
import { IFleet } from "./interface";
import { fleetsMock } from "../../../mocks/fleet";
import { fleetSchema } from "./schema";
import FleetForm from "./FleetForm";
import { getFleetEquipmentByIDService, updateFleetEquipmentService } from "./service";
import { IResponseData } from "../../users/interface";
import { toast } from "react-toastify";

const UpdateFleet = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<IFleet>(fleetsMock[0]);

    const findFleetEquipmentByID = async () => {
        const response = await getFleetEquipmentByIDService(id as string);
        setDefaultAsset({
            ...response,
            // assetCategory_id: (response?.FleetAssetCategory_id).toString(),
            supplier: (response?.supplier_id).toString(),
            unitOfMeasure: (response?.unitOfMeasure_id).toString(),
            user_id: (response?.user_id).toString(),
            assetStatus: (response?.assetStatus_id).toString()
        })
    }

    useEffect(() => { findFleetEquipmentByID() }, [id]);

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
        reset({ ...defaultAsset });
    }, [defaultAsset]);

    const onSubmit = async (formData: IFleet) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            branch_id: parseInt(formData.branch_id as string),
            assetStatus_id: parseInt(formData.assetStatus as string),
            FleetAssetCategory_id: parseInt(formData.assetCategory_id),
            unitOfMeasure_id: parseInt(formData.unitOfMeasure),
            supplier_id: parseInt(formData.supplier),
            user_id: parseInt(formData.user_id as string),
        }

        const response = await updateFleetEquipmentService(request, id as string) as IResponseData;
        toast.success(response.data.message)
        setSendingRequest(false)
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

export default UpdateFleet