/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import {
    alpha, Box, Button, Chip, Divider, MenuItem,
    Stack, TextField, Typography,
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
import { fieldSx } from '../../components/forms/Inputs';

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

/** Uppercase micro-label with a trailing rule — the same section idiom as Repair & Disposal. */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ pt: 0.5 }}>
        <Typography
            variant="caption"
            sx={{
                fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#94A3B8', fontSize: '0.66rem', whiteSpace: 'nowrap',
            }}
        >
            {children}
        </Typography>
        <Divider sx={{ flex: 1, borderColor: '#EEF2F7' }} />
    </Stack>
);

/** Styled menu for TextField `select` fields — matches Repair & Disposal's Repair Destination select. */
const selectMenuProps = {
    MenuProps: {
        PaperProps: {
            elevation: 4,
            sx: {
                mt: 0.5, borderRadius: '8px',
                boxShadow: `0 4px 24px ${alpha('#000', 0.12)}`,
                '& .MuiMenuItem-root': {
                    fontSize: '0.875rem', minHeight: 40, px: 2,
                    '&:hover': { backgroundColor: alpha(PRIMARY, 0.06) },
                    '&.Mui-selected': {
                        backgroundColor: alpha(PRIMARY, 0.1),
                        color: PRIMARY, fontWeight: 500,
                    },
                },
            },
        },
    },
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
        <Stack spacing={2.25}>
            {/* Action identity bar — same treatment as the Repair & Disposal flow header */}
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(meta.color, 0.05),
                    border: `1px solid ${alpha(meta.color, 0.16)}`,
                }}
            >
                <Box
                    sx={{
                        width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                        bgcolor: alpha(meta.color, 0.12), color: meta.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        '& svg': { fontSize: 19 },
                    }}
                >
                    {meta.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.25 }}>
                        {meta.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>
                        {meta.subtitle}
                    </Typography>
                </Box>
            </Stack>

            {/* Movement summary */}
            <SectionLabel>Movement</SectionLabel>
            <Box
                sx={{
                    p: 1.75, borderRadius: 2,
                    border: '1px solid #E8EDF3', bgcolor: '#FAFBFC',
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, fontFamily: 'monospace' }}>
                        #{movement.id}
                    </Typography>
                    <Chip label={movementTypeLabel(movement.movementType)} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY }} />
                    <Chip label={statusCfg.label} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: statusCfg.bg, color: statusCfg.color }} />
                </Stack>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 1 }}>
                    {movement.sourceStore?.name ?? '—'} → {movement.destStore?.name ?? (movement.recipientUser ? `${movement.recipientUser.firstName} ${movement.recipientUser.lastName}` : '—')}
                </Typography>
            </Box>

            {/* Action-specific fields */}
            {action === 'dispatch' && (
                <>
                    <SectionLabel>Logistics</SectionLabel>
                    <TextField fullWidth sx={fieldSx} label="Courier Service" value={courierService} onChange={(e) => setCourierService(e.target.value)} />
                    <TextField fullWidth sx={fieldSx} label="Tracking Number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                    {/* Plain CSS grid — MUI Grid's negative-margin spacing shifts fields out of
                        line with the full-width inputs above it inside a Stack. */}
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, alignItems: 'start' }}>
                        <TextField fullWidth sx={fieldSx} type="date" label="Dispatch Date" InputLabelProps={{ shrink: true }} value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} />
                        <TextField fullWidth sx={fieldSx} type="date" label="Expected Delivery" InputLabelProps={{ shrink: true }} value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} />
                    </Box>
                </>
            )}

            {action === 'receive' && (
                <>
                    <SectionLabel>Receipt</SectionLabel>
                    <TextField
                        select fullWidth sx={{ ...fieldSx, '& .MuiSelect-select': { paddingRight: '32px' } }}
                        label="Receipt Status" value={receiptStatus}
                        onChange={(e) => setReceiptStatus(e.target.value as ReceiptStatus)}
                        SelectProps={selectMenuProps}
                    >
                        {(Object.keys(receiptStatusLabels) as ReceiptStatus[]).filter((k) => k !== 'PENDING').map((k) => (
                            <MenuItem key={k} value={k}>{receiptStatusLabels[k]}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth multiline rows={2} label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)}
                        sx={{ ...fieldSx, '& .MuiInputBase-input': { padding: 0, fontSize: '0.875rem', lineHeight: 1.5 } }}
                    />
                </>
            )}

            {action === 'approve' && (
                <>
                    <SectionLabel>Comment — optional</SectionLabel>
                    <TextField
                        fullWidth multiline rows={2} placeholder="Add a comment…" value={remarks} onChange={(e) => setRemarks(e.target.value)}
                        sx={{ ...fieldSx, '& .MuiInputBase-input': { padding: 0, fontSize: '0.875rem', lineHeight: 1.5 } }}
                    />
                </>
            )}

            {action === 'reject' && (
                <>
                    <SectionLabel>Reason — required</SectionLabel>
                    <TextField
                        fullWidth multiline rows={3} placeholder="Explain why this movement is being rejected…" value={reason} onChange={(e) => setReason(e.target.value)}
                        sx={{ ...fieldSx, '& .MuiInputBase-input': { padding: 0, fontSize: '0.875rem', lineHeight: 1.5 } }}
                    />
                </>
            )}

            {action === 'complete' && (
                <>
                    <SectionLabel>Remarks — optional</SectionLabel>
                    <TextField
                        fullWidth multiline rows={3} placeholder="Add any remarks…" value={remarks} onChange={(e) => setRemarks(e.target.value)}
                        sx={{ ...fieldSx, '& .MuiInputBase-input': { padding: 0, fontSize: '0.875rem', lineHeight: 1.5 } }}
                    />
                </>
            )}

            {action === 'cancel' && (
                <>
                    <SectionLabel>Cancellation reason — required</SectionLabel>
                    <TextField
                        fullWidth multiline rows={3} placeholder="Explain why this movement is being cancelled…" value={reason} onChange={(e) => setReason(e.target.value)}
                        sx={{ ...fieldSx, '& .MuiInputBase-input': { padding: 0, fontSize: '0.875rem', lineHeight: 1.5 } }}
                    />
                </>
            )}

            {action === 'in-transit' && (
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Confirm that this movement has left the source location and is in transit.
                </Typography>
            )}

            {/* Footer */}
            <Divider sx={{ borderColor: '#EEF2F7' }} />
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button
                    variant="outlined"
                    onClick={handleClose}
                    sx={{
                        borderRadius: '8px', fontWeight: 600, textTransform: 'none',
                        color: '#64748B', borderColor: '#E2E8F0',
                        '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                    }}
                >
                    Close
                </Button>
                <ButtonComponent
                    sendingRequest={sendingRequest}
                    buttonText={meta.cta}
                    buttonColor="primary"
                    variant="contained"
                    type="button"
                    handleClick={run}
                />
            </Stack>
        </Stack>
    );
};

export default MovementActionModal;
