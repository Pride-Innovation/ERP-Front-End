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
    Avatar,
    Box,
    Card,
    Container,
    Typography,
    alpha,
    useMediaQuery,
    useTheme
} from "@mui/material";
import { officeEquipmentSchema } from "./schema";
import OfficeEquipmentForm from "./OfficeEquipmentForm";
import { toast } from "react-toastify";
import { createOfficeEquipmentService } from "./service";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal green

const CreateOfficeEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
                        Create Office Equipment
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ color: alpha('#000', 0.6) }}
                    >
                        Fill in the details below to submit a new office equipment
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