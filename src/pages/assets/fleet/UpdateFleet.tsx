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
    Card,
    Chip,
    Container,
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
                        <LocalShippingOutlinedIcon sx={{ color: PRIMARY_COLOR, fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: PRIMARY_COLOR, lineHeight: 1.2 }}>
                            Update Fleet Vehicle
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
                        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                            <Loading items='Office Equipment' />
                        </Box>
                    ) : (
                        <form
                            style={{ width: "100%" }}
                            autoComplete="off"
                            onSubmit={handleSubmit(onSubmit)}
                        >
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
            </Card>
        </Container>
    )
}

export default UpdateFleet;