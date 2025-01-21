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
import { getFleetEquipmentByIDService } from "./service";

const UpdateFleet = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<IFleet>(fleetsMock[0]);

    const findFleetEquipmentByID = async () => {
        const response = await getFleetEquipmentByIDService(id as string);
        setDefaultAsset({
            ...response,
            assetCategory_id: (response?.FleetAssetCategory_id).toString(),
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

    const onSubmit = (formData: IFleet) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
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