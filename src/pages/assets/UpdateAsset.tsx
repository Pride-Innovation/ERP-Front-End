import { useForm } from "react-hook-form";
import { IAsset } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import {
    Card,
    Grid,
    SelectChangeEvent,
    Typography
} from "@mui/material";
import AssetForm from "./AssetForm";
import { useParams } from "react-router";
import { assetsMock } from "../../mocks/assets";
import { assetSchema } from "./schema";

const UpdateAsset = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<IAsset>(assetsMock[0]);
    const [option, setOption] = useState<string | undefined>('');

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
        setOption(defaultAsset.category)
    }, [defaultAsset]);

    const onSubmit = (formData: IAsset) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
        setSendingRequest(false)
    };

    const handleChange = (event: SelectChangeEvent) => {
        setOption(event.target.value as string);
    };

    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <Typography sx={{ mb: 4, fontWeight: 600, textTransform: "uppercase" }}>Update Asset</Typography>
                    <form
                        style={{ width: "100%" }}
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <AssetForm
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

export default UpdateAsset