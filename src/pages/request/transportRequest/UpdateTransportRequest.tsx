import { useEffect, useState } from "react";
import { ITransportRequest } from "../interface";
import { useParams } from "react-router";
import { transportRequest } from "../../../mocks/request";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { transportRequestSchema } from "./schema";
import { Card, Grid, Typography } from "@mui/material";
import TransportRequestForm from "./TransportRequestForm";
import { findTranportRequestByIDService, updateTranportRequestService } from "./service";
import { toast } from "react-toastify";
import { IResponseData } from "../../users/interface";

const UpdateTransportRequest = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultRequest, setDefaultRequest] = useState<ITransportRequest>(transportRequest[0]);

    const findTranportRequestByID = async () => {
        const response = await findTranportRequestByIDService(id as string);
        setDefaultRequest(response)
    }

    useEffect(() => { findTranportRequestByID() }, [id]);

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

    const onSubmit = async (formData: ITransportRequest) => {
        setSendingRequest(true);
        const { id, requester, signature, ...data } = formData
        const request = { requester_id: formData?.requester?.id, ...data }

        const response = await updateTranportRequestService({ ...request, }, id as string) as IResponseData;
        toast.success(response.data.message);
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
                            buttonText="Submit"
                        />
                    </form>
                </Grid>
            </Grid>
        </Card>
    )
}

export default UpdateTransportRequest