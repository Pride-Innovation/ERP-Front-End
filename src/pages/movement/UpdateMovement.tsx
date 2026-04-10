/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import { alpha, Box, Breadcrumbs, Chip, Link, Stack, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { toast } from 'react-toastify';
import MovementForm from './MovementForm';
import { movementSchema } from './schema';
import { IMovement, IMovementFormData } from './interface';
import { findMovementByIdService, updateMovementService } from './service';
import { ROUTES } from '../../core/routes/routes';
import MovementUtills from './utills';

const PRIMARY = '#08796C';

const UpdateMovement = () => {
    const [sendingRequest, setSendingRequest] = useState(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { updateMovementInStore } = MovementUtills();

    const { register, control, handleSubmit, formState, reset } = useForm<IMovementFormData>({
        mode: 'onChange',
        resolver: yupResolver(movementSchema) as any,
    });

    const loadMovement = async () => {
        if (!id) return;
        try {
            const response = await findMovementByIdService(id) as any;
            if (response?.status === 200) {
                const m: IMovement = response.data;
                reset({
                    officerId: m.requestingOfficer?.id ?? '',
                    destination: m.destination ?? '',
                    destinationType: m.destinationType ?? '',
                    reason: m.reason ?? '',
                    expectedReturnDate: m.expectedReturnDate ?? '',
                } as IMovementFormData);
            }
        } catch (error) {
            toast.error('Could not load movement');
        }
    };

    useEffect(() => { loadMovement(); }, [id]);

    const onSubmit = async (data: IMovementFormData) => {
        if (!id) return;
        setSendingRequest(true);
        try {
            const response = await updateMovementService(data, id) as any;
            if (response?.status === 200) {
                updateMovementInStore({ id, ...data } as any);
                toast.success(response?.data?.message ?? 'Movement updated successfully');
                navigate(ROUTES.MOVEMENT);
            } else {
                toast.error(response?.data?.message ?? 'Failed to update movement');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setSendingRequest(false);
        }
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
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        onClick={() => navigate(ROUTES.MOVEMENT)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            cursor: 'pointer',
                            color: alpha(PRIMARY, 0.85),
                            px: 1.5,
                            py: 0.6,
                            borderRadius: 1.5,
                            border: `1px solid ${alpha(PRIMARY, 0.22)}`,
                            bgcolor: alpha(PRIMARY, 0.04),
                            transition: 'all 0.18s ease',
                            '&:hover': {
                                bgcolor: alpha(PRIMARY, 0.09),
                                borderColor: alpha(PRIMARY, 0.4),
                                color: PRIMARY,
                            },
                        }}
                    >
                        <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'inherit' }}>
                            Back to Movements
                        </Typography>
                    </Box>

                    <Breadcrumbs
                        separator="›"
                        sx={{
                            '& .MuiBreadcrumbs-separator': { color: alpha('#000', 0.3), mx: 0.5 },
                            display: { xs: 'none', sm: 'flex' },
                        }}
                    >
                        <Link
                            underline="hover"
                            onClick={() => navigate(ROUTES.ASSETS_MANAGEMENT)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                            <HomeOutlinedIcon sx={{ fontSize: 14 }} />
                            Home
                        </Link>
                        <Link
                            underline="hover"
                            onClick={() => navigate(ROUTES.MOVEMENT)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                            <SwapHorizOutlinedIcon sx={{ fontSize: 14 }} />
                            Movements
                        </Link>
                        <Typography sx={{ fontSize: '0.75rem', color: PRIMARY, fontWeight: 600 }}>
                            Edit Movement
                        </Typography>
                    </Breadcrumbs>
                </Stack>

                <Chip
                    icon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                    label={`Editing Movement #${id}`}
                    size="small"
                    sx={{
                        height: 26,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: alpha('#0369a1', 0.07),
                        color: '#0369a1',
                        border: `1px solid ${alpha('#0369a1', 0.2)}`,
                        '& .MuiChip-icon': { color: '#0369a1' },
                    }}
                />
            </Box>

            {/* ── Form ── */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <MovementForm
                    register={register}
                    control={control}
                    formState={formState}
                    sendingRequest={sendingRequest}
                    buttonText="Save Changes"
                />
            </Box>
        </Box>
    );
};

export default UpdateMovement;
