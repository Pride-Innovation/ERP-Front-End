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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import { toast } from 'react-toastify';
import { IMovementAction } from './interface';
import { approveMovementService } from './service';
import MovementUtills from './utills';
import ButtonComponent from '../../components/forms/Button';

const PRIMARY = '#08796C';

const ApproveMovement = ({
    movement,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText = 'Approve Movement',
}: IMovementAction) => {
    const [comment, setComment] = useState('');
    const { updateMovementInStore } = MovementUtills();

    const officerName = movement.requestingOfficer
        ? `${movement.requestingOfficer.firstName} ${movement.requestingOfficer.lastName}`
        : '—';

    const handleApprove = async () => {
        setSendingRequest(true);
        try {
            const response = await approveMovementService({ movementId: movement.id, comment }) as any;
            if (response?.status === 200 || response?.status === 201) {
                updateMovementInStore({ ...movement, status: { name: 'approved' } });
                toast.success(response?.data?.message ?? 'Movement approved successfully');
                handleClose();
            } else {
                toast.error(response?.data?.message ?? 'Failed to approve movement');
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
                <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2.5, borderBottom: `1px solid ${alpha(PRIMARY, 0.12)}`, bgcolor: alpha(PRIMARY, 0.04) }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: alpha(PRIMARY, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircleOutlineIcon sx={{ color: PRIMARY, fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY }}>
                            Approve Movement
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Review and approve this movement request.
                        </Typography>
                    </Box>
                </Stack>

                <Box sx={{ p: 2.5 }}>
                    {/* Movement summary card */}
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha('#000', 0.07)}`, mb: 2.5 }}>
                        <Stack spacing={1.25}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <SwapHorizOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, fontFamily: 'monospace' }}>
                                    {movement.referenceNo ?? '—'}
                                </Typography>
                                {movement.status?.name && (
                                    <Chip label={movement.status.name} size="small" sx={{ height: 18, fontSize: '0.66rem', fontWeight: 600 }} />
                                )}
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <PersonOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Officer: <strong>{officerName}</strong>
                                </Typography>
                            </Stack>
                            {movement.destination && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Destination: <strong>{movement.destination}</strong>
                                    {movement.destinationType && ` (${movement.destinationType})`}
                                </Typography>
                            )}
                            {movement.reason && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Reason: {movement.reason}
                                </Typography>
                            )}
                        </Stack>
                    </Paper>

                    {/* Comment */}
                    <Stack direction="row" spacing={1} alignItems="flex-start" mb={0.75}>
                        <CommentOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary', mt: 0.5 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Approval Comment (optional)
                        </Typography>
                    </Stack>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add a note for the audit trail..."
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
                            buttonColor="primary"
                            variant="contained"
                            type="button"
                            handleClick={handleApprove}
                        />
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
};

export default ApproveMovement;
