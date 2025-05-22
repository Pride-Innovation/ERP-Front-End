/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Divider, Grid, Paper, Typography } from '@mui/material';
import RequestForm from './RequestForm';
import { requestMock } from '../../../mocks/request';
import { IRequest, IRequestAxiosResponse } from '../interface';
import { requestSchema } from './schema';
import { findAssetRequestByIDService, updateAssetRequestService } from './service';
import { RequestContext } from '../../../context/request/RequestContext';
import { ICommodity } from '../../settings/commodity/interface';
import { RowData } from '../../../components/forms/interface';
import { validateInventoryItems } from '../../../utils/helpers';
import { toast } from 'react-toastify';

const UpdateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [signature, setSignature] = useState<string>("")
    const { id } = useParams<{ id: string }>();
    const [defaultRequest, setDefaultRequest] = useState<IRequest>(requestMock[0]);
    const { setRows, rows } = useContext(RequestContext);
    const [file, setFile] = useState<File | null>(null);

    const findAssetRequestById = async () => {
        const response = await findAssetRequestByIDService(id as string);
        setDefaultRequest({ ...response, status: response?.status?.id })
    }

    useEffect(() => { findAssetRequestById() }, [id]);

    const handleRows = () => {
        const commodities = defaultRequest?.commodities as Array<{ commodity: ICommodity, quantity: number }>
        const rowData = commodities.map(commodity => ({
            id: commodity.commodity.id,
            name: commodity.commodity.name,
            groupName: commodity.commodity.groupName,
            quantity: commodity.quantity
        })) as Array<RowData>;

        setRows(rowData);
    }

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
        handleRows()
        reset({ ...defaultRequest });
    }, [defaultRequest]);

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
                const response = await updateAssetRequestService(payload, id as string) as IRequestAxiosResponse
                if (response.status === 201) {
                    toast.success("Request updated successfully")
                }
            } catch (error) {
                console.log(error)
            }

        } else {
            toast.error(`Requests validation errors: ${result.errors}`)
        }

        setSendingRequest(false)
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
                Update Request
            </Typography>
            <Divider sx={{ mb: 4 }} />
            <Box component="form" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <RequestForm
                            setImage={setSignature}
                            setFile={setFile}
                            image={signature}
                            formState={formState}
                            control={control}
                            register={register}
                            sendingRequest={sendingRequest}
                            buttonText="Update"
                        />
                    </Grid>

                </Grid>
            </Box>
        </Paper>
    )
}

export default UpdateRequest