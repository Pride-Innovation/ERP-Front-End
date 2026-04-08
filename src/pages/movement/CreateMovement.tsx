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
import { alpha, Box, Paper, Stack, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
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

    const { register, control, handleSubmit, formState, reset } = useForm<IMovementFormData>({
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
        <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
            {/* Page header */}
            <Paper
                elevation={0}
                sx={{ borderRadius: 3, border: `1px solid ${alpha(PRIMARY, 0.14)}`, overflow: 'hidden', mb: 3 }}
            >
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${PRIMARY} 0%, #BC892C 100%)` }} />
                <Box sx={{ px: { xs: 2.5, md: 4 }, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY }}>
                            <AddCircleOutlineIcon />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                                New Asset Movement
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Initiate a new movement request for assets.
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </Paper>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <MovementForm
                    register={register}
                    control={control}
                    formState={formState}
                    sendingRequest={sendingRequest}
                    buttonText="Submit Movement"
                />
            </Box>
        </Box>
    );
};

export default CreateMovement;
