import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, Grid } from "@mui/material";
import { FormHeader } from "../../../components/headers/TypographyComponent";
import { IFleet } from "./interface";
import { fleetsMock } from "../../../mocks/assets/fleet";
import { fleetSchema } from "./schema";

const UpdateFleet = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<IFleet>(fleetsMock[0]);
    const [option, setOption] = useState<string | undefined>('');

    useEffect(() => {
        setDefaultAsset(() => {
            return fleetsMock.find(asset => asset?.id === parseInt(id as string)) as IFleet
        })
    }, [id]);

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
                        <p> Update Fleet</p>
                    </form>
                </Grid>
            </Grid>
        </Card>
    )
}

export default UpdateFleet