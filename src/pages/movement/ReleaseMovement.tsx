/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import {
    alpha, Box, Button, Chip, Divider, Fade,
    Paper, Stack, TextField, Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import { toast } from 'react-toastify';
import { IMovementAction } from './interface';
import { releaseMovementService } from './service';
import MovementUtills from './utills';
import ButtonComponent from '../../components/forms/Button';

const BLUE = '#2563EB';

const ReleaseMovement = ({
    movement,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText = 'Release Assets',
}: IMovementAction) => {
    const [comment, setComment] = useState('');
    const { updateMovementInStore } = MovementUtills();

    const officerName = movement.requestingOfficer
        ? `${movement.requestingOfficer.firstName} ${movement.requestingOfficer.lastName}`
        : '—';

    const handleRelease = async () => {
        setSendingRequest(true);
        try {
            const response = await releaseMovementService({ movementId: movement.id, comment }) as any;
            if (response?.status === 200 || response?.status === 201) {
                updateMovementInStore({ ...movement, status: { name: 'released' } });
                toast.success(response?.data?.message ?? 'Assets released successfully');
                handleClose();
            } else {
                toast.error(response?.data?.message ?? 'Failed to release assets');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Fade in timeout={300}>
            <Box>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2.5, borderBottom: `1px solid ${alpha(BLUE, 0.12)}`, bgcolor: alpha(BLUE, 0.04) }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: alpha(BLUE, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <LocalShippingOutlinedIcon sx={{ color: BLUE, fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BLUE }}>
                            Release Assets
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Confirm dispatch of assets for this movement.
                        </Typography>
                    </Box>
                </Stack>

                <Box sx={{ p: 2.5 }}>
                    {/* Movement summary */}
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha('#000', 0.07)}`, mb: 2.5 }}>
                        <Stack spacing={1.25}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <SwapHorizOutlinedIcon sx={{ fontSize: 15, color: '#08796C' }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#08796C', fontFamily: 'monospace' }}>
                                    {movement.referenceNo ?? '—'}
                                </Typography>
                                {movement.status?.name && (
                                    <Chip label={movement.status.name} size="small" sx={{ height: 18, fontSize: '0.66rem', fontWeight: 600 }} />
                                )}
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <PersonOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Assigned to: <strong>{officerName}</strong>
                                </Typography>
                            </Stack>
                            {movement.destination && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Destination: <strong>{movement.destination}</strong>
                                    {movement.destinationType && ` (${movement.destinationType})`}
                                </Typography>
                            )}
                            {movement.assetsCount !== undefined && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Assets to dispatch: <strong>{movement.assetsCount}</strong>
                                </Typography>
                            )}
                        </Stack>
                    </Paper>

                    {/* Comment */}
                    <Stack direction="row" spacing={1} alignItems="flex-start" mb={0.75}>
                        <CommentOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary', mt: 0.5 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Release Note (optional)
                        </Typography>
                    </Stack>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Any notes for the receiving party..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        size="small"
                        sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <Divider sx={{ mb: 2 }} />
                    <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                        <Button variant="outlined" onClick={handleClose} sx={{ borderRadius: 2, fontWeight: 600 }}>
                            Cancel
                        </Button>
                        <ButtonComponent
                            sendingRequest={sendingRequest}
                            buttonText={buttonText}
                            buttonColor="info"
                            variant="contained"
                            type="button"
                            handleClick={handleRelease}
                        />
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
};

export default ReleaseMovement;
