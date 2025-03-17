import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Card, Divider, Grid, Typography } from "@mui/material";
import RequestForm from "./RequestForm";
import { IRequest } from "../interface";
import { requestSchema } from "./schema";
import moment from "moment";
import { createAssetRequestService } from "./service";
import { IResponseData } from "../../users/interface";
import { toast } from "react-toastify";

const CreateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [signature, setSignature] = useState<string>("")
    const defaultRequest: IRequest = {} as IRequest;

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
        reset({ ...defaultRequest });
    }, [reset]);

    const onSubmit = async (formData: IRequest) => {
        setSendingRequest(true);
        const response = await createAssetRequestService(formData) as IResponseData;
        toast.success(response.data.message)
        setSendingRequest(false)
    };

    return (
        <Card sx={{ py: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <Typography sx={{ mb: 4, px: 4, fontWeight: 600, textTransform: "uppercase", fontSize: '17px' }}>Create a Request</Typography>
                    <Divider sx={{ mb: 4 }} />
                    <Box sx={{ px: 4 }}>
                        <form
                            style={{ width: "100%" }}
                            autoComplete="off"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <RequestForm
                                setImage={setSignature}
                                image={signature}
                                formState={formState}
                                control={control}
                                register={register}
                                sendingRequest={sendingRequest}
                                buttonText="Submit"
                            />
                        </form>
                    </Box>
                </Grid>
            </Grid>
        </Card>
    )
}

export default CreateRequest;