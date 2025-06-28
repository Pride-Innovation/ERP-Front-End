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
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import CommodityUtills from '../../settings/commodity/utills';

const UpdateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [signature, setSignature] = useState<string>("")
    const { id } = useParams<{ id: string }>();
    const [defaultRequest, setDefaultRequest] = useState<any>(requestMock[0]);
    const { setRows, rows } = useContext(RequestContext);
    const [file, setFile] = useState<File | null>(null);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);
    const { fetchAllCommodities } = CommodityUtills();

    useEffect(() => { fetchAllCommodities() }, []);

    const findAssetRequestById = async () => {
        try {
            const response = await findAssetRequestByIDService(id as string) as IRequestAxiosResponse;
            if (response.status === 200) {
                const { data } = response
                setDefaultRequest({ ...data, status: data.status?.id })
            }
        } catch (error) {
            console.log(error)
        }

    }

    useEffect(() => { findAssetRequestById() }, [id]);

    const handleRows = () => {
        if (defaultRequest?.commodities
            && commodities?.length > 0) {
            const rowData = (defaultRequest.commodities as Array<{
                commodity: ICommodity,
                quantity: number
            }>
            ).map((commodity, index) => ({
                id: Date.now() + index,
                name: commodity.commodity.name,
                groupName: commodity.commodity.groupName,
                quantity: commodity.quantity,
                commodityId: commodity.commodity.id,
                assetTypeId: commodity.commodity.assetType?.id,
            })) as Array<RowData>;

            setRows(rowData);
        }
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