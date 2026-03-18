/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { IOfficeEquipment, IOfficeEquipmentAxiosResponse } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Box,
    Card,
    Chip,
    Container,
    Stack,
    Typography,
    alpha,
} from "@mui/material";
import { officeEquipmentSchema } from "./schema";
import OfficeEquipmentForm from "./OfficeEquipmentForm";
import { toast } from "react-toastify";
import { createOfficeEquipmentService } from "./service";
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal green

const CreateOfficeEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const defaultUser: IOfficeEquipment = {} as IOfficeEquipment;

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
        reset({ ...defaultUser });
    }, [reset]);

    const onSubmit = async (formData: IOfficeEquipment) => {
        setSendingRequest(true);
        try {
            const response = await createOfficeEquipmentService(formData) as IOfficeEquipmentAxiosResponse;
            if (response.status === 201) {
                toast.success("Office equipment created successfully!");
                reset({ ...defaultUser });
            } else {
                toast.error("Failed to create office equipment");
            }
        } catch (error) {
            console.error("Error creating office equipment:", error);
            toast.error("Failed to create office equipment. Please try again.");
        }
        setSendingRequest(false);
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
                        <BusinessCenterOutlinedIcon sx={{ color: PRIMARY_COLOR, fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: PRIMARY_COLOR, lineHeight: 1.2 }}>
                            Create Office Equipment
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Fill in the details below to register a new office asset
                        </Typography>
                    </Box>
                </Stack>
                <Chip
                    icon={<AddCircleOutlineIcon sx={{ fontSize: 15 }} />}
                    label="New Asset"
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
                    <form
                        style={{ width: "100%" }}
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <OfficeEquipmentForm
                            buttonText="Save Equipment"
                            formState={formState}
                            control={control}
                            sendingRequest={sendingRequest}
                            register={register}
                            trigger={trigger}
                        />
                    </form>
                </Box>
            </Card>
        </Container>
    );
};

export default CreateOfficeEquipment;