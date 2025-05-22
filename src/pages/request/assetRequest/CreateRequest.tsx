/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Box,
    Divider,
    Grid,
    Typography,
    Paper
} from "@mui/material";
import RequestForm from "./RequestForm";
import { IRequest, IRequestAxiosResponse } from "../interface";
import { requestSchema } from "./schema";
import { RequestContext } from "../../../context/request/RequestContext";
import { validateInventoryItems } from "../../../utils/helpers";
import { toast } from "react-toastify";
import { createAssetRequestService } from "./service";

const CreateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState(false);
    const [signature, setSignature] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const { rows } = useContext(RequestContext);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IRequest>({
        mode: 'onChange',
        resolver: yupResolver(requestSchema),
    });

    useEffect(() => {
        reset({} as IRequest);
    }, [reset]);

    const onSubmit = async (formData: IRequest) => {
        setSendingRequest(true);
        const result = validateInventoryItems(rows);

        if (result.isValid && result.validData) {

            const payload = new FormData();
            payload.append("priority", formData.priority);
            payload.append("name", formData.name);
            payload.append("description", formData.description as string);

            if (file) payload.append("file", file);

            const formattedCommodities = result.validData.map(item => ({
                commodityId: item.id,
                quantity: item.quantity
            }));

            payload.append("requestCommodities", JSON.stringify(formattedCommodities));

            try {
                const response = await createAssetRequestService(payload) as IRequestAxiosResponse
                if (response.status === 201) {
                    toast.success("Request created successfully")
                }
            } catch (error) {
                console.log(error)
            }

        } else {
            toast.error(`Requests validation errors: ${result.errors}`)
        }
        setSendingRequest(false);
    };

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: "none", maxWidth: "1200px", mx: "auto" }}>
            <Typography
                sx={{
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#BC892C",
                    mb: 3
                }}
            >
                Create Request
            </Typography>
            <Divider sx={{ mb: 4 }} />
            <Box component="form" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <RequestForm
                            setFile={setFile}
                            file={file}
                            setImage={setSignature}
                            image={signature}
                            formState={formState}
                            control={control}
                            register={register}
                            sendingRequest={sendingRequest}
                            buttonText="Submit"
                        />
                    </Grid>

                </Grid>
            </Box>
        </Paper>
    );
};

export default CreateRequest;
