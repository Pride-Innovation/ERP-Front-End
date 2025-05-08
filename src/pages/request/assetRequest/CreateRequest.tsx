import { useEffect, useState } from "react";
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
import { IRequest } from "../interface";
import { requestSchema } from "./schema";
import { createAssetRequestService } from "./service";
import { IResponseData } from "../../users/interface";
import { toast } from "react-toastify";
import RoutesUtills from "../../../core/routes/utills";

const CreateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState(false);
    const [signature, setSignature] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const { getCurrentUser } = RoutesUtills();

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

        const currentUserID = getCurrentUser()?.id;
        const formPayload = new FormData();

        formPayload.append("priority", formData.priority);
        formPayload.append("quantity", String(formData.quantity));
        formPayload.append("name", formData.name);
        formPayload.append("status", String(formData.status));
        if (file) formPayload.append("file", file);
        formPayload.append("requesterId", currentUserID);

        const response = await createAssetRequestService(formPayload) as IResponseData;
        toast.success(response?.data?.message || "Request submitted");
        setSendingRequest(false);
    };

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: 3, maxWidth: "1200px", mx: "auto" }}>
            <Typography
                sx={{
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#BC892C",
                    mb: 3
                }}
            >
                Create a Request
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
