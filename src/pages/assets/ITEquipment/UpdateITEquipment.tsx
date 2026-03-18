/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IITEquipment, IITEquipmentAxiosResponse } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ITEquipmentSchema } from "./schema";
import {
    Box,
    Card,
    Chip,
    Container,
    SelectChangeEvent,
    Stack,
    Typography,
    alpha,
} from "@mui/material";
import ITEquipmentForm from "./ITEquipmentForm";
import { itEquipmentMock } from "../../../mocks/itEquipment";
import { getITEquipmentByIDService, updateITEquipmentService } from "./service";
import Loading from "../../../components/loading";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { updateITAsset } from "./slice";
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { ROUTES } from "../../../core/routes/routes";
import ITEquipmentUtills from "./utills";

const PRIMARY_COLOR = '#08796C'; // Teal green


const UpdateITEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<any>(itEquipmentMock[0]);
    const [option, setOption] = useState<string | undefined>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [params, setParams] = useState<Record<string, any>>({});
    const [assetName, setAssetName] = useState<string>("IT Equipment");
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { calculateNetBookValue } = ITEquipmentUtills();
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
        trigger
    } = useForm<IITEquipment>({
        mode: 'onChange',
        resolver: yupResolver(ITEquipmentSchema),
    });

    const findITEquipmentByID = async () => {

        setLoading(true);
        try {
            const response = await getITEquipmentByIDService(id as string) as IITEquipmentAxiosResponse;

            if (response.status === 200) {
                const netBookValue = calculateNetBookValue(response.data);
                setAssetName(response.data.assetName || "IT Equipment");

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
                    // assetDepreciationRate: response.data.assetDepreciationRate ? response.data.assetDepreciationRate : "",
                    hostname: response.data.hostname ? response.data.hostname : "",
                    detailNetBookValue: netBookValue,
                    make: response.data.make ? response.data.make : "",
                    model: response.data.model ? response.data.model : "",
                    serialNumber: response.data.serialNumber ? response.data.serialNumber : "",
                    lpoNumber: response.data.stock?.lpoNumber,
                    assetDepreciationRate: "33.33%"
                });
            } else {
                toast.error("Failed to load asset details");
            }
        } catch (error) {
            console.error("Error fetching IT equipment:", error);
            toast.error("Failed to load asset details");
        }
        setLoading(false);
    };

    useEffect(() => { findITEquipmentByID(); }, [id]);

    useEffect(() => {
        reset({ ...defaultAsset });
        setOption(defaultAsset.category as string);
    }, [defaultAsset, reset]);

    const onSubmit = async (formData: IITEquipment) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            assetStatus: 8, // This is the asset status for IT Equipment ie Issuance Available
            assetType: 2 // This is the IT Equipment asset type
        }
        try {
            const response = await updateITEquipmentService(request, id as string) as IITEquipmentAxiosResponse;
            if (response.status === 201) {
                toast.success("Asset updated successfully");
                dispatch(updateITAsset(response.data));
            } else {
                toast.error("Failed to update asset");
            }
        } catch (error) {
            console.error("Error updating asset:", error);
            toast.error("Failed to update asset. Please try again.");
        } finally {
            setSendingRequest(false);
            navigate(ROUTES.LIST_ASSETS);
        }
    };

    const handleChange = (event: SelectChangeEvent) => {
        setOption(event.target.value as string);
    };

    return (
        <Container maxWidth="xl" sx={{
            py: 3,
            bgcolor: '#F5F8F7',
            borderRadius: 2,
            boxShadow: `0 1px 4px ${alpha('#000', 0.06)}, 0 4px 20px ${alpha('#000', 0.04)}`,
            border: `1px solid ${alpha(PRIMARY_COLOR, 0.08)}`
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                pb: 2.5,
                borderBottom: `1px solid ${alpha('#000', 0.06)}`
            }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        width: 44, height: 44,
                        borderRadius: 2,
                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.15)}`
                    }}>
                        <ComputerOutlinedIcon sx={{ color: PRIMARY_COLOR, fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: PRIMARY_COLOR, lineHeight: 1.2 }}>
                            Update IT Equipment
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Editing: {assetName}
                        </Typography>
                    </Box>
                </Stack>
                <Chip
                    icon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                    label="Editing"
                    size="small"
                    sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        color: PRIMARY_COLOR,
                        fontWeight: 600,
                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
                        '& .MuiChip-icon': { color: PRIMARY_COLOR }
                    }}
                />
            </Box>
            <Card
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.08)}`,
                    overflow: 'visible',
                    boxShadow: `0 1px 3px ${alpha('#000', 0.05)}`
                }}
            >
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    {loading ? (
                        <Box sx={{ py: 8 }}>
                            <Loading items='IT Equipment' />
                        </Box>
                    ) : (
                        <form
                            style={{ width: "100%" }}
                            autoComplete="off"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <ITEquipmentForm
                                option={option}
                                handleChange={handleChange}
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

export default UpdateITEquipment;