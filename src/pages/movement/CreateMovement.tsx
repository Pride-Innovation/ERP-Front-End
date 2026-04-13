/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { alpha, Box, Breadcrumbs, Chip, Link, Stack, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { toast } from 'react-toastify';
import MovementForm from './MovementForm';
import { movementSchema } from './schema';
import { IMovementFormData } from './interface';
import { createMovementService } from './service';
import { ROUTES } from '../../core/routes/routes';

const PRIMARY = '#08796C';

const CreateMovement = () => {
    const [sendingRequest, setSendingRequest] = useState(false);
    const navigate = useNavigate();

    const [movementFiles, setMovementFiles] = useState<File[]>([]);

    const { register, control, handleSubmit, formState, reset, setValue } = useForm<IMovementFormData>({
        mode: 'onChange',
        resolver: yupResolver(movementSchema) as any,
    });

    const onSubmit = async (data: IMovementFormData) => {
        setSendingRequest(true);
        try {
            const response = await createMovementService(data) as any;
            if (response?.status === 201 || response?.status === 200) {
                toast.success(response?.data?.message ?? 'Movement created successfully');
                reset();
                navigate(ROUTES.MOVEMENT);
            } else {
                toast.error(response?.data?.message ?? 'Failed to create movement');
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
                            New Movement
                        </Typography>
                    </Breadcrumbs>
                </Stack>

                <Chip
                    icon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
                    label="New Movement Request"
                    size="small"
                    sx={{
                        height: 26,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: alpha(PRIMARY, 0.08),
                        color: PRIMARY,
                        border: `1px solid ${alpha(PRIMARY, 0.2)}`,
                        '& .MuiChip-icon': { color: PRIMARY },
                    }}
                />
            </Box>

            {/* ── Form ── */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <MovementForm
                    register={register}
                    control={control}
                    formState={formState}
                    setValue={setValue}
                    sendingRequest={sendingRequest}
                    buttonText="Submit Movement"
                    onFilesChange={setMovementFiles}
                />
            </Box>
        </Box>
    );
};

export default CreateMovement;
