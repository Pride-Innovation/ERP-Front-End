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
import { alpha, Box, Paper, Stack, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { toast } from 'react-toastify';
import MovementForm from './MovementForm';
import { movementSchema } from './schema';
import { IMovement, IMovementFormData } from './interface';
import { findMovementByIdService, updateMovementService } from './service';
import { ROUTES } from '../../core/routes/routes';
import ButtonComponent from '../../components/forms/Button';
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
                            <EditOutlinedIcon />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                                Edit Movement
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Update the details of this movement request.
                            </Typography>
                        </Box>
                    </Stack>
                    <ButtonComponent
                        sendingRequest={false}
                        buttonText="Back"
                        buttonColor="inherit"
                        variant="outlined"
                        type="button"
                        handleClick={() => navigate(ROUTES.MOVEMENT)}
                    />
                </Box>
            </Paper>

            {/* Form */}
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
