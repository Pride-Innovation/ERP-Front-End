import { useEffect, useState } from "react";
import { IOfficeEquipment } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, Grid } from "@mui/material";
import { FormHeader } from "../../../components/headers/TypographyComponent";
import { officeEquipmentSchema } from "./schema";
import OfficeEquipmentForm from "./OfficeEquipmentForm";

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

    const onSubmit = (formData: IOfficeEquipment) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
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