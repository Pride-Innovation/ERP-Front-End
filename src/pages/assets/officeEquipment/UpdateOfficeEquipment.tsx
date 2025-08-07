/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { IOfficeEquipment, IOfficeEquipmentAxiosResponse } from './interface';
import { useParams } from 'react-router';
import { officeEquipmentMock } from '../../../mocks/officeEquipment';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { officeEquipmentSchema } from './schema';
import {
    Avatar,
    Box,
    Card,
    Container,
    Typography,
    alpha,
    useMediaQuery,
    useTheme
} from '@mui/material';
import OfficeEquipmentForm from './OfficeEquipmentForm';
import { getOfficeEquipmentByIDService, updateOfficeEquipmentService } from './service';
import Loading from '../../../components/loading';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { updateOfficeAsset } from './slice';
import EditIcon from '@mui/icons-material/Edit';

// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal green

const UpdateOfficeEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<any>(officeEquipmentMock[0]);
    const [params, setParams] = useState<Record<string, any>>({});
    const [assetName, setAssetName] = useState<string>("Office Equipment");
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const findOfficeEquipmentByID = async () => {
        setLoading(true);
        try {
            const response = await getOfficeEquipmentByIDService(id as string) as IOfficeEquipmentAxiosResponse;
            if (response.status === 200) {
                setAssetName(response.data.assetName || "Office Equipment");

                setParams({
                    branchName: response.data.branch?.name,
                    assignedToFirstName: response.data.assignedTo?.firstName,
                    lpoNumber: response.data.stock?.lpoNumber,
                    supplierName: response.data.supplier?.name
                });

                setDefaultAsset({
                    ...response.data,
                    supplier: response.data.supplier?.id,
                    assignedTo: response.data.assignedTo?.id,
                    branch: response.data.branch?.id,
                    assetStatus: response.data.assetStatus?.id,
                    assetType: response.data.assetType?.id,
                    category: response.data.commodity?.id,
                    engravedNumber: response.data.engravedNumber ? response.data.engravedNumber : "",
                    unitOfMeasure: response.data.unitOfMeasure ? response.data.unitOfMeasure : "",
                    netValueB: response.data.netValueB ? response.data.netValueB : "",
                    assetDepreciationRate: response.data.assetDepreciationRate ? response.data.assetDepreciationRate : "",
                    hostname: response.data.hostname ? response.data.hostname : "",
                    detailNetBookValue: response.data.detailNetBookValue ? response.data.detailNetBookValue : "",
                    make: response.data.make ? response.data.make : "",
                    lpoNumber: response.data.stock?.lpoNumber
                });
            } else {
                toast.error("Failed to load asset details");
            }
        } catch (error) {
            console.error("Error fetching office equipment:", error);
            toast.error("Failed to load asset details");
        }
        setLoading(false);
    };

    useEffect(() => { findOfficeEquipmentByID(); }, [id]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
        trigger
    } = useForm<IOfficeEquipment>({
        mode: 'onChange',
        resolver: yupResolver(officeEquipmentSchema),
    });

    useEffect(() => {
        reset({ ...defaultAsset });
    }, [defaultAsset, reset]);

    const onSubmit = async (formData: IOfficeEquipment) => {
        setSendingRequest(true);
        try {
            const response = await updateOfficeEquipmentService(formData, id as string) as IOfficeEquipmentAxiosResponse;
            if (response.status === 201) {
                toast.success("Asset updated successfully");
                dispatch(updateOfficeAsset(response.data));
            } else {
                toast.error("Failed to update asset");
            }
        } catch (error) {
            console.error("Error updating asset:", error);
            toast.error("Failed to update asset. Please try again.");
        }
        setSendingRequest(false);
    };

    return (
        <Container maxWidth="xl" sx={{
            py: 3,
            bgcolor: '#F3F7FB',
            borderRadius: 2,
            border: `1px solid ${alpha('#000', 0.08)}`
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                    sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.12),
                        color: PRIMARY_COLOR,
                        mr: 2,
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 }
                    }}
                >
                    <EditIcon />
                </Avatar>
                <Box>
                    <Typography
                        variant={isMobile ? "h6" : "h5"}
                        sx={{
                            fontWeight: 600,
                            color: PRIMARY_COLOR,
                            mb: 0.5
                        }}
                    >
                        Update {assetName}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: alpha('#000', 0.6) }}
                    >
                        Fill in the details below to update this office equipment
                    </Typography>
                </Box>
            </Box>

            <Card
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha('#000', 0.08)}`,
                    overflow: 'visible'
                }}
            >
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    {loading ? (
                        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                            <Loading items='Office Equipment' />
                        </Box>
                    ) : (
                        <form
                            style={{ width: "100%" }}
                            autoComplete="off"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <OfficeEquipmentForm
                                buttonText="Update Equipment"
                                formState={formState}
                                control={control}
                                sendingRequest={sendingRequest}
                                register={register}
                                lpoParams={{ lpoNumber: params?.lpoNumber }}
                                userParams={{ firstName: params?.assignedToFirstName }}
                                supplierParams={{ name: params?.supplierName }}
                                branchParams={{ name: params?.branchName }}
                                trigger={trigger}
                            />
                        </form>
                    )}
                </Box>
            </Card>
        </Container>
    );
};

export default UpdateOfficeEquipment;