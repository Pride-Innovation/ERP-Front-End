/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { ITransportRequest } from "../interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, Grid, Typography } from "@mui/material";
import TransportRequestForm from "./TransportRequestForm";
import { transportRequestSchema } from "./schema";
import { createTranportRequestService } from "./service";
import moment from "moment";
import { IResponseData } from "../../users/interface";
import { toast } from "react-toastify";

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

    const onSubmit = async (formData: ITransportRequest) => {

        const date = new Date().toUTCString();

        setSendingRequest(true);
        const request = {
            ...formData,
            requester_id: 1,
            requestDate: moment(date).format('YYYY-MM-DD HH:mm:ss'),
            timeOfSubmissionOfRequest: moment(date).format('YYYY-MM-DD HH:mm:ss'),
            timeVehicleIsRequired: moment(formData.timeVehicleIsRequired).format('YYYY-MM-DD HH:mm:ss')
        }

        const response = await createTranportRequestService(request) as IResponseData;
        toast.success(response.data.message)
        setSendingRequest(false)
    };

    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <Typography sx={{ mb: 4, fontWeight: 600, textTransform: "uppercase", fontSize: '17px' }}>Request for Transport</Typography>
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

export default CreateTranportRequest;