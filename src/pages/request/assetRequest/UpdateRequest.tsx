import { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Divider, Grid, Typography } from '@mui/material';
import RequestForm from './RequestForm';
import { requestMock } from '../../../mocks/request';
import { IRequest } from '../interface';
import { requestSchema } from './schema';
import { updateAssetRequestService } from './service';
import { IResponseData } from '../../users/interface';
import { toast } from 'react-toastify';

const UpdateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [signature, setSignature] = useState<string>("")
    const { id } = useParams<{ id: string }>();
    const [defaultRequest, setDefaultRequest] = useState<IRequest>(requestMock[0]);

    useEffect(() => {
        setDefaultRequest(() => {
            return requestMock.find(asset => asset?.id === parseInt(id as string)) as IRequest
        })
    }, [id]);

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
    }, [defaultRequest]);

    const onSubmit = async (formData: IRequest) => {
        setSendingRequest(true);
        const request = new FormData();

        request.append("Narration", formData.Narration as string);
        request.append("desc", formData.desc as string);
        request.append("fromPosition", formData.fromPosition as string)
        request.append("name", formData.name as string)
        request.append("position", formData.position as string)
        request.append("priority", formData.priority as string)
        request.append("quantity", (formData.quantity as number).toString())
        request.append("requestDate", formData.requestDate as string)
        request.append("requester_id", (formData.requester?.id as number).toString())
        request.append("status", formData.status as string)
        request.append("timeOfSubmissionOfRequest", formData.timeOfSubmissionOfRequest as string)
        request.append("signature", signature)

        const response = await updateAssetRequestService({
            ...request,
            signature: signature
        }, id as string) as IResponseData;
        toast.success(response.data.message);
        setSendingRequest(false)
    };

    return (
        <Card sx={{ py: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <Typography sx={{
                        mb: 4,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: '17px',
                        px: 4
                    }}>Update Request</Typography>
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
                                buttonText="Request Asset"
                            />
                        </form>
                    </Box>
                </Grid>
            </Grid>
        </Card>
    )
}

export default UpdateRequest