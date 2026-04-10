/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { alpha, Box, Breadcrumbs, Chip, Link, Stack, Typography } from '@mui/material';
import { IFleet, IFleetAxiosResponse } from './interface';
import { fleetSchema } from './schema';
import FleetForm from './FleetForm';
import { createFleetService } from './service';
import { toast } from 'react-toastify';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../core/routes/routes';

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

    const navigate = useNavigate();

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
                        <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_COLOR, fontWeight: 600 }}>Create</Typography>
                    </Breadcrumbs>
                </Stack>
                <Chip
                    icon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
                    label="New Fleet Item"
                    size="small"
                    sx={{
                        height: 26,
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        color: PRIMARY_COLOR,
                        fontWeight: 600,
                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
                        '& .MuiChip-icon': { color: PRIMARY_COLOR },
                        fontSize: '0.75rem',
                    }}
                />
            </Box>

            <form style={{ width: '100%' }} autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
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
    )
}

export default CreateFleet