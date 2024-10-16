import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { IITEquipment } from "./interface";
import { assetsMock } from "../../../mocks/assets";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ITEquipmentSchema } from "./schema";
import { Card, Grid, SelectChangeEvent } from "@mui/material";
import { FormHeader } from "../../../components/headers/TypographyComponent";
import ITEquipmentForm from "./ITEquipmentForm";

const UpdateITEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<IITEquipment>(assetsMock[0]);
    const [option, setOption] = useState<string | undefined>('');

    useEffect(() => {
        setDefaultAsset(() => {
            return assetsMock.find(asset => asset?.id === parseInt(id as string)) as IITEquipment
        })
    }, [id]);

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
        setOption(defaultAsset.category)
    }, [defaultAsset]);

    const onSubmit = (formData: IITEquipment) => {
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

export default UpdateITEquipment