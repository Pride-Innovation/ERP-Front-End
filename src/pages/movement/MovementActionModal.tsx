/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import {
    alpha, Box, Button, Chip, Divider, Fade, MenuItem,
    Paper, Stack, TextField, Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { toast } from 'react-toastify';
import { IMovementAction } from './interface';
import { movementTypeLabel, receiptStatusLabels, ReceiptStatus, getStatusConfig } from './constants';
import {
    dispatchMovementService, markInTransitService, receiveMovementService,
    completeMovementService, cancelMovementService,
    approveMovementService, rejectMovementService,
} from './service';
import ButtonComponent from '../../components/forms/Button';

const PRIMARY = '#08796C';

type ActionKind = 'dispatch' | 'in-transit' | 'receive' | 'complete' | 'cancel' | 'approve' | 'reject';

const ACTION_META: Record<ActionKind, { title: string; subtitle: string; icon: JSX.Element; color: string; cta: string }> = {
    approve: { title: 'Approve Movement', subtitle: 'Approve this movement so it can proceed up the approval ladder.', icon: <CheckCircleOutlineIcon />, color: '#15803D', cta: 'Approve' },
    reject: { title: 'Reject Movement', subtitle: 'Reject this movement. It will be cancelled and the initiator notified.', icon: <HighlightOffIcon />, color: '#B91C1C', cta: 'Reject' },
    dispatch: { title: 'Dispatch Movement', subtitle: 'Capture courier and tracking details for this inter-location movement.', icon: <LocalShippingOutlinedIcon />, color: '#2563EB', cta: 'Dispatch' },
    'in-transit': { title: 'Mark In Transit', subtitle: 'Flag this dispatched movement as currently in transit.', icon: <FlightTakeoffOutlinedIcon />, color: '#4338CA', cta: 'Mark In Transit' },
    receive: { title: 'Receive Movement', subtitle: 'Acknowledge receipt at the destination and apply inventory effects.', icon: <AssignmentTurnedInOutlinedIcon />, color: '#047857', cta: 'Confirm Receipt' },
    complete: { title: 'Complete Movement', subtitle: 'Complete this intra-location movement and apply inventory effects.', icon: <TaskAltOutlinedIcon />, color: '#15803D', cta: 'Complete' },
    cancel: { title: 'Cancel Movement', subtitle: 'Cancel this movement. No inventory effects will be applied.', icon: <CancelOutlinedIcon />, color: '#B91C1C', cta: 'Cancel Movement' },
};

interface Props extends IMovementAction {
    action: ActionKind;
}

const MovementActionModal = ({ action, movement, handleClose, sendingRequest, setSendingRequest, onDone }: Props) => {
    const meta = ACTION_META[action];

    const [courierService, setCourierService] = useState(movement.courierService ?? '');
    const [trackingNumber, setTrackingNumber] = useState(movement.trackingNumber ?? '');
    const [dispatchDate, setDispatchDate] = useState('');
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [receiptStatus, setReceiptStatus] = useState<ReceiptStatus>('RECEIVED_OK');
    const [remarks, setRemarks] = useState('');
    const [reason, setReason] = useState('');

    const statusCfg = getStatusConfig(movement.status);

    const run = async () => {
        if (!movement.id) return;
        setSendingRequest(true);
        try {
            let response: any;
            switch (action) {
                case 'approve':
                    response = await approveMovementService(movement.id, remarks || undefined);
                    break;
                case 'reject':
                    if (!reason.trim()) {
                        toast.error('Please give a reason for rejecting.');
                        setSendingRequest(false);
                        return;
                    }
                    response = await rejectMovementService(movement.id, reason);
                    break;
                case 'dispatch':
                    response = await dispatchMovementService(movement.id, {
                        courierService: courierService || null,
                        trackingNumber: trackingNumber || null,
                        dispatchDate: dispatchDate ? new Date(dispatchDate).toISOString() : null,
                        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : null,
                    });
                    break;
                case 'in-transit':
                    response = await markInTransitService(movement.id);
                    break;
                case 'receive':
                    response = await receiveMovementService(movement.id, { receiptStatus, remarks: remarks || null });
                    break;
                case 'complete':
                    response = await completeMovementService(movement.id, remarks);
                    break;
                case 'cancel':
                    response = await cancelMovementService(movement.id, reason);
                    break;
            }
            if (response?.status === 200 || response?.status === 201) {
                toast.success(`Movement ${meta.cta.toLowerCase()} successful`);
                onDone?.(response.data);
                handleClose();
            } else {
                toast.error(response?.data?.message ?? `Failed to ${meta.cta.toLowerCase()} movement`);
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Fade in timeout={250}>
            <Box>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2.5, borderBottom: `1px solid ${alpha(meta.color, 0.15)}`, bgcolor: alpha(meta.color, 0.04) }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: alpha(meta.color, 0.12), color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {meta.icon}
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: meta.color }}>{meta.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{meta.subtitle}</Typography>
                    </Box>
                </Stack>

                <Box sx={{ p: 2.5 }}>
                    {/* Movement summary */}
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha('#000', 0.07)}`, mb: 2.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                            <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, fontFamily: 'monospace' }}>
                                #{movement.id}
                            </Typography>
                            <Chip label={movementTypeLabel(movement.movementType)} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY }} />
                            <Chip label={statusCfg.label} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: statusCfg.bg, color: statusCfg.color }} />
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                            {movement.sourceStore?.name ?? '—'} → {movement.destStore?.name ?? (movement.recipientUser ? `${movement.recipientUser.firstName} ${movement.recipientUser.lastName}` : '—')}
                        </Typography>
                    </Paper>

                    {/* Action-specific fields */}
                    {action === 'dispatch' && (
                        <Stack spacing={2} sx={{ mb: 2.5 }}>
                            <TextField label="Courier Service" size="small" fullWidth value={courierService} onChange={(e) => setCourierService(e.target.value)} />
                            <TextField label="Tracking Number" size="small" fullWidth value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                            <Stack direction="row" spacing={2}>
                                <TextField label="Dispatch Date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} />
                                <TextField label="Expected Delivery" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} />
                            </Stack>
                        </Stack>
                    )}

                    {action === 'receive' && (
                        <Stack spacing={2} sx={{ mb: 2.5 }}>
                            <TextField select label="Receipt Status" size="small" fullWidth value={receiptStatus} onChange={(e) => setReceiptStatus(e.target.value as ReceiptStatus)}>
                                {(Object.keys(receiptStatusLabels) as ReceiptStatus[]).filter((k) => k !== 'PENDING').map((k) => (
                                    <MenuItem key={k} value={k}>{receiptStatusLabels[k]}</MenuItem>
                                ))}
                            </TextField>
                            <TextField label="Remarks" size="small" fullWidth multiline rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </Stack>
                    )}

                    {action === 'approve' && (
                        <TextField label="Comment (optional)" size="small" fullWidth multiline rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} sx={{ mb: 2.5 }} />
                    )}

                    {action === 'reject' && (
                        <TextField label="Reason for rejection" size="small" fullWidth multiline rows={3} value={reason} onChange={(e) => setReason(e.target.value)} sx={{ mb: 2.5 }} />
                    )}

                    {action === 'complete' && (
                        <TextField label="Remarks (optional)" size="small" fullWidth multiline rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} sx={{ mb: 2.5 }} />
                    )}

                    {action === 'cancel' && (
                        <TextField label="Cancellation Reason" size="small" fullWidth multiline rows={3} value={reason} onChange={(e) => setReason(e.target.value)} sx={{ mb: 2.5 }} />
                    )}

                    {action === 'in-transit' && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                            Confirm that this movement has left the source location and is in transit.
                        </Typography>
                    )}

                    <Divider sx={{ mb: 2 }} />
                    <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                        <Button variant="outlined" onClick={handleClose} sx={{ borderRadius: 2, fontWeight: 600 }}>Close</Button>
                        <ButtonComponent
                            sendingRequest={sendingRequest}
                            buttonText={meta.cta}
                            buttonColor="primary"
                            variant="contained"
                            type="button"
                            handleClick={run}
                        />
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
};

export default MovementActionModal;
