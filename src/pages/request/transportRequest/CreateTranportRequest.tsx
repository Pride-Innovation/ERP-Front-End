import { useEffect, useState } from "react";
import { ITransportRequest } from "../interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, Grid, Typography } from "@mui/material";
import TransportRequestForm from "./TransportRequestForm";
import { transportRequestSchema } from "./schema";

const CreateTranportRequest = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const defaultRequest: ITransportRequest = {} as ITransportRequest;

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<ITransportRequest>({
        mode: 'onChange',
        resolver: yupResolver(transportRequestSchema),
    });

    useEffect(() => {
        reset({ ...defaultRequest });
    }, [reset]);

    const onSubmit = (formData: ITransportRequest) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
    };

    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <Typography sx={{ mb: 4, fontWeight: 600, textTransform: "uppercase", fontSize: '17px' }}>Create a Request</Typography>
                    <form
                        style={{ width: "100%" }}
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <TransportRequestForm
                            formState={formState}
                            control={control}
                            register={register}
                            sendingRequest={sendingRequest}
                            buttonText="Request Asset"
                        />
                    </form>
                </Grid>
            </Grid>
        </Card>
    )
}

export default CreateTranportRequest;