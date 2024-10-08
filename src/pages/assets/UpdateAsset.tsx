import { useForm } from "react-hook-form";
import { IAsset } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import AssetForm from "./AssetForm";
import { useParams } from "react-router";
import { assetsMock } from "../../mocks/assets";
import { assetSchema } from "./subroutes/request/schema";

const UpdateAsset = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<IAsset>(assetsMock[0]);

    useEffect(() => {
        setDefaultAsset(() => {
            return assetsMock.find(asset => asset?.id === parseInt(id as string)) as IAsset
        })
    }, [id]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IAsset>({
        mode: 'onChange',
        resolver: yupResolver(assetSchema),
    });

    useEffect(() => {
        reset({ ...defaultAsset });
    }, [defaultAsset]);

    const onSubmit = (formData: IAsset) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
        setSendingRequest(false)
    };

    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <Typography sx={{ my: 4, fontWeight: 600 }}>Update an Asset</Typography>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <AssetForm
                        buttonText="Submit"
                        formState={formState}
                        control={control}
                        sendingRequest={sendingRequest}
                        register={register}
                    />
                </form>
            </Grid>
        </Grid>
    )
}

export default UpdateAsset