import { useEffect, useState } from "react";
import { ITransportRequest } from "../interface";
import { useParams } from "react-router";
import { transportRequest } from "../../../mocks/request";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { transportRequestSchema } from "./schema";
import { Card, Grid, Typography } from "@mui/material";
import TransportRequestForm from "./TransportRequestForm";

const UpdateTransportRequest = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultRequest, setDefaultRequest] = useState<ITransportRequest>(transportRequest[0]);

    useEffect(() => {
        setDefaultRequest(() => {
            return transportRequest.find(asset => asset?.id === parseInt(id as string)) as ITransportRequest
        })
    }, [id]);

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
    }, [defaultRequest]);

    const onSubmit = (formData: ITransportRequest) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
        setSendingRequest(false)
    };

    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <Typography sx={{ mb: 4, fontWeight: 600, textTransform: "uppercase", fontSize: '17px' }}>Update Transport Request</Typography>
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

export default UpdateTransportRequest