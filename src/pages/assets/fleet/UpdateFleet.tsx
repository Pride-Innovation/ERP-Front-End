/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    alpha,
    Box,
    Breadcrumbs,
    Chip,
    Link,
    Stack,
    Typography,
} from "@mui/material";
import { IFleet, IFleetAxiosResponse } from "./interface";
import { fleetsMock } from "../../../mocks/fleet";
import { fleetSchema } from "./schema";
import FleetForm from "./FleetForm";
import {
    getFleetEquipmentByIDService,
    updateFleetEquipmentService
} from "./service";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import Loading from "../../../components/loading";
import { toast } from "react-toastify";
import { updateFleetAsset } from "./slice";
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../core/routes/routes";

// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal green

const UpdateFleet = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<any>(fleetsMock[0]);
    const [params, setParams] = useState<Record<string, any>>();
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const [assetName, setAssetName] = useState<string>("Fleet Item");
    const navigate = useNavigate();

    const findFleetEquipmentByID = async () => {
        setLoading(true)
        try {
            const response = await getFleetEquipmentByIDService(id as string) as IFleetAxiosResponse;

            if (response.status === 200) {
                setAssetName(response.data.assetName || "Fleet Item");

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
                })
            } else {
                toast.error("Failed to load asset details");
            }
        } catch (error) {
            console.error("Error fetching office equipment:", error);
            toast.error("Failed to load asset details");
        }

        setLoading(false)
    }

    useEffect(() => { findFleetEquipmentByID() }, [id]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
        trigger
    } = useForm<IFleet>({
        mode: 'onChange',
        resolver: yupResolver(fleetSchema),
    });

    useEffect(() => {
        reset({ ...defaultAsset });
    }, [defaultAsset, reset]);

    const onSubmit = async (formData: IFleet) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            assetStatus: 8, // This is the asset status for Fleet Equipment ie Issuance Available
            assetType: 55 // This is the Fleet Equipment asset type
        }
        try {
            const response = await updateFleetEquipmentService(request, id as string) as IFleetAxiosResponse
            if (response.status === 201) {
                toast.success("Asset Updated Successfully")
                dispatch(updateFleetAsset(response.data))
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false)
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                width: '100%',
                maxWidth: 1400,
                mx: 'auto',
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 2 },
            }}
        >
            {/* ── Page Nav Bar ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        onClick={() => navigate(ROUTES.LIST_FLEET)}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer',
                            color: alpha(PRIMARY_COLOR, 0.85), px: 1.5, py: 0.6, borderRadius: 1.5,
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.22)}`, bgcolor: alpha(PRIMARY_COLOR, 0.04),
                            transition: 'all 0.18s ease',
                            '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.09), borderColor: alpha(PRIMARY_COLOR, 0.4), color: PRIMARY_COLOR },
                        }}
                    >
                        <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'inherit' }}>
                            Back to Fleet
                        </Typography>
                    </Box>
                    <Breadcrumbs separator="›" sx={{ '& .MuiBreadcrumbs-separator': { color: alpha('#000', 0.3), mx: 0.5 }, display: { xs: 'none', sm: 'flex' } }}>
                        <Link underline="hover" onClick={() => navigate(ROUTES.ASSETS_MANAGEMENT)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <HomeOutlinedIcon sx={{ fontSize: 14 }} />Home
                        </Link>
                        <Link underline="hover" onClick={() => navigate(ROUTES.LIST_FLEET)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />Fleet
                        </Link>
                        <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_COLOR, fontWeight: 600 }}>Edit — {assetName}</Typography>
                    </Breadcrumbs>
                </Stack>
                <Chip
                    icon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                    label={`Editing: ${assetName}`}
                    size="small"
                    sx={{
                        height: 26,
                        bgcolor: alpha('#1565C0', 0.07),
                        color: '#1565C0',
                        fontWeight: 600,
                        border: `1px solid ${alpha('#1565C0', 0.2)}`,
                        '& .MuiChip-icon': { color: '#1565C0' },
                        fontSize: '0.75rem',
                    }}
                />
            </Box>

            {loading ? (
                <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                    <Loading items='Fleet' />
                </Box>
            ) : (
                <form style={{ width: '100%' }} autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                    <FleetForm
                        buttonText="Submit"
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
    )
}

export default UpdateFleet;