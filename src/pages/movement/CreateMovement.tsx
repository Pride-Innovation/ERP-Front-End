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
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { toast } from 'react-toastify';
import MovementForm from './MovementForm';
import { movementSchema } from './schema';
import { IMovementCreatePayload, IMovementFormData, IMovementItemDraft } from './interface';
import { createMovementService } from './service';
import { noApproverError } from './constants';
import NoApproverDialog from './NoApproverDialog';
import { ROUTES } from '../../core/routes/routes';
import { brand } from '../../utils/tokens';

const P = brand[500];

const CreateMovement = () => {
    const [sendingRequest, setSendingRequest] = useState(false);
    const [items, setItems] = useState<IMovementItemDraft[]>([]);
    /** The server's "no approver" explanation, while the confirm-and-proceed dialog is open. */
    const [noApprover, setNoApprover] = useState<string | null>(null);
    /** The form values to resubmit once the user confirms — the form itself is unchanged. */
    const [pendingData, setPendingData] = useState<IMovementFormData | null>(null);
    const navigate = useNavigate();

    const { register, control, handleSubmit, formState, reset, setValue, watch } = useForm<IMovementFormData>({
        mode: 'onChange',
        resolver: yupResolver(movementSchema) as any,
        defaultValues: { destinationKind: 'STORE', movementType: '' },
    });

    /**
     * @param bypassReason set only on the second attempt, once the server has reported that no
     *                     approver exists and the user has confirmed they want to continue
     */
    const onSubmit = async (data: IMovementFormData, bypassReason?: string) => {
        if (items.length === 0) {
            toast.warning('Add at least one item to move.');
            return;
        }
        const payload: IMovementCreatePayload = {
            movementType: data.movementType as IMovementCreatePayload['movementType'],
            sourceStoreId: data.sourceStoreId,
            destStoreId: data.destinationKind === 'STORE' ? data.destStoreId ?? null : null,
            recipientUserId: data.destinationKind === 'USER' ? data.recipientUserId ?? null : null,
            // Deliberately not sent: courier, tracking number and delivery dates. They belong to the
            // dispatch, not to the obligation — see the Journey note in MovementForm.
            remarks: data.remarks || null,
            // Deliberately not sent: the server derives this from the movement category. Sending a
            // client-chosen value is what allowed a cross-location movement to skip approval.
            items: items.map((i) => ({ assetId: i.assetId ?? null, commodityId: i.commodityId ?? null, quantity: i.quantity })),
            ...(bypassReason ? { proceedWithoutApproval: true, bypassReason } : {}),
        };

        setSendingRequest(true);
        try {
            const response = (await createMovementService(payload)) as any;
            if (response?.status === 201 || response?.status === 200) {
                toast.success(bypassReason
                    ? 'Movement created without approval — the exception has been recorded.'
                    : 'Movement created successfully');
                setNoApprover(null);
                reset();
                setItems([]);
                navigate(ROUTES.MOVEMENT);
                return;
            }

            // Not a dead end: the server is reporting that approval is impossible and asking whether
            // to proceed. Offer that as a deliberate second step.
            const noApproverMessage = noApproverError(response);
            if (noApproverMessage) {
                setPendingData(data);
                setNoApprover(noApproverMessage);
                return;
            }
            toast.error(response?.response?.data?.detail ?? response?.data?.message ?? 'Failed to create movement');
        } catch {
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
                maxWidth: 980,
                mx: 'auto',
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 2 },
            }}
        >
            {/* ── Page Nav Bar ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        onClick={() => navigate(ROUTES.MOVEMENT)}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer',
                            color: alpha(P, 0.85), px: 1.5, py: 0.6, borderRadius: 1.5,
                            border: `1px solid ${alpha(P, 0.22)}`, bgcolor: alpha(P, 0.04),
                            transition: 'all 0.18s ease',
                            '&:hover': { bgcolor: alpha(P, 0.09), borderColor: alpha(P, 0.4), color: P },
                        }}
                    >
                        <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'inherit' }}>
                            Back to Movements
                        </Typography>
                    </Box>
                    <Breadcrumbs separator="›" sx={{ '& .MuiBreadcrumbs-separator': { color: alpha('#000', 0.3), mx: 0.5 }, display: { xs: 'none', sm: 'flex' } }}>
                        <Link underline="hover" onClick={() => navigate(ROUTES.ASSETS_MANAGEMENT)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <HomeOutlinedIcon sx={{ fontSize: 14 }} />Home
                        </Link>
                        <Link underline="hover" onClick={() => navigate(ROUTES.MOVEMENT)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <SwapHorizOutlinedIcon sx={{ fontSize: 14 }} />Movements
                        </Link>
                        <Typography sx={{ fontSize: '0.75rem', color: P, fontWeight: 600 }}>Create</Typography>
                    </Breadcrumbs>
                </Stack>
                <Chip
                    icon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
                    label="New Movement"
                    size="small"
                    sx={{ height: 26, fontSize: '0.72rem', fontWeight: 600, bgcolor: alpha(P, 0.08), color: P, border: `1px solid ${alpha(P, 0.2)}`, '& .MuiChip-icon': { color: P } }}
                />
            </Box>

            {/* ── Form ── */}
            <Box component="form" onSubmit={handleSubmit((data) => onSubmit(data))} noValidate sx={{ width: '100%' }}>
                <MovementForm
                    register={register}
                    control={control}
                    formState={formState}
                    setValue={setValue}
                    watch={watch}
                    items={items}
                    setItems={setItems}
                    sendingRequest={sendingRequest}
                    buttonText="Create Movement"
                />
            </Box>

            <NoApproverDialog
                open={!!noApprover}
                message={noApprover}
                busy={sendingRequest}
                handleClose={() => { setNoApprover(null); setPendingData(null); }}
                onConfirm={(reason) => { if (pendingData) onSubmit(pendingData, reason); }}
            />
        </Box>
    );
};

export default CreateMovement;
