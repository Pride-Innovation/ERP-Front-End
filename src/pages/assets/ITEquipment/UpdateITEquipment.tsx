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
    Avatar,
    Box,
    Card,
    Container,
    SelectChangeEvent,
    Typography,
    alpha,
    useMediaQuery,
    useTheme
} from "@mui/material";
import ITEquipmentForm from "./ITEquipmentForm";
import { itEquipmentMock } from "../../../mocks/itEquipment";
import { getITEquipmentByIDService, updateITEquipmentService } from "./service";
import Loading from "../../../components/loading";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { updateITAsset } from "./slice";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
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
    const theme = useTheme();
    const navigate = useNavigate();
    const { calculateNetBookValue } = ITEquipmentUtills();

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
                    <AddCircleOutlineIcon />
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
                        Update Asset Details
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: alpha('#000', 0.6) }}
                    >
                        Fill in the details below to submit the updated Asset Details
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