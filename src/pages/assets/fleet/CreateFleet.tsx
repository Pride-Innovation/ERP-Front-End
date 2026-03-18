/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { alpha, Box, Card, Chip, Container, Stack, Typography } from '@mui/material';
import { IFleet, IFleetAxiosResponse } from './interface';
import { fleetSchema } from './schema';
import FleetForm from './FleetForm';
import { createFleetService } from './service';
import { toast } from 'react-toastify';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal green

const CreateFleet = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const defaultUser: IFleet = {} as IFleet;

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
        reset({ ...defaultUser });
    }, [reset]);

    const onSubmit = async (formData: IFleet) => {
        setSendingRequest(true);
        try {
            const response = await createFleetService(formData) as IFleetAxiosResponse
            if (response.status === 201) {
                toast.success("Fleet created successfully!");
                reset({ ...defaultUser });
            } else {
                toast.error("Failed to create fleet");
            }
        } catch (error) {
            console.error("Error creating Fleet:", error);
            toast.error("Failed to create fleet. Please try again.");
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
                            Create Fleet Item
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Fill in the details below to register a new fleet vehicle
                        </Typography>
                    </Box>
                </Stack>
                <Chip
                    icon={<AddCircleOutlineIcon sx={{ fontSize: 15 }} />}
                    label="New Vehicle"
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
                        <FleetForm
                            buttonText="Save Fleet"
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
    )
}

export default CreateFleet