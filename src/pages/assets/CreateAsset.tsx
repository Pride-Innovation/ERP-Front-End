import { useForm } from "react-hook-form";
import { IAsset } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { assetSchema } from "./schema";
import { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import AssetForm from "./AssetForm";

const CreateAsset = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const defaultUser: IAsset = {} as IAsset;

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
        reset({ ...defaultUser });
    }, [reset]);

    const onSubmit = (formData: IAsset) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
    };

    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <Typography sx={{ my: 4, fontWeight: 600 }}>Creat an Asset</Typography>
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

export default CreateAsset