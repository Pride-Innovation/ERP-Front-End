/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Divider, Grid, Typography } from '@mui/material';
import RequestForm from './RequestForm';
import { requestMock } from '../../../mocks/request';
import { IRequest } from '../interface';
import { requestSchema } from './schema';
import { findAssetRequestByIDService, updateAssetRequestService } from './service';
import { IResponseData } from '../../users/interface';
import { toast } from 'react-toastify';

const UpdateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [signature, setSignature] = useState<string>("")
    const { id } = useParams<{ id: string }>();
    const [defaultRequest, setDefaultRequest] = useState<IRequest>(requestMock[0]);

    const findAssetRequestById = async () => {
        const response = await findAssetRequestByIDService(id as string);
        setDefaultRequest({ ...response, status: response?.status?.id })
    }

    useEffect(() => { findAssetRequestById() }, [id]);

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
        request.append("priority", formData.priority)
        request.append("quantity", (formData.quantity as number).toString())
        request.append("name", formData.name)
        request.append("status", formData.status as unknown as string)
        request.append("description", formData.description as string)
        // request.append("file", "file")

        const response = await updateAssetRequestService(request, id as string) as IResponseData;
        console.log(response, "request updated!!")

        // toast.success(response.data.message);
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