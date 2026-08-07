/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo, useState } from 'react';
import {
    alpha, Alert, Box, Button, Checkbox, Chip, Paper, Stack,
    TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import { toast } from 'react-toastify';
import { brand, neutral, border, status as statusTokens } from '../../utils/tokens';
import { movementTypeLabel } from '../movement/constants';
import { receiveConsignmentService } from './service';
import { IConsignment, IConsignmentMovement } from './interface';

type Receipt = 'RECEIVED_OK' | 'RECEIVED_WITH_DISCREPANCY';

interface LineState {
    selected: boolean;
    receiptStatus: Receipt;
    remarks: string;
}

/**
 * Hands the landed items to their recipients, several movements at once.
 *
 * <p>Each row is still a separate hand-over — one person signing for their own items — but a branch
 * clearing a van of ten movements should not have to open ten screens to do it.
 *
 * <p>Rows are ticked by default and can be unticked: receiving assigns assets to a named person, so
 * anyone who has not actually collected must be left out rather than quietly marked as having taken
 * delivery. A discrepancy requires a note; without one there is nothing to investigate later.
 */
const ReceiveConsignment = ({
    consignment,
    handleClose,
    onReceived,
}: {
    consignment: IConsignment;
    handleClose: () => void;
    onReceived: () => void | Promise<void>;
}) => {
    const outstanding = useMemo(
        () => (consignment.movements ?? []).filter(
            (m) => m.status !== 'COMPLETED' && m.status !== 'CANCELLED'),
        [consignment.movements],
    );

    const [lines, setLines] = useState<Record<number, LineState>>(() =>
        Object.fromEntries(outstanding.map((m) => [
            m.id, { selected: true, receiptStatus: 'RECEIVED_OK' as Receipt, remarks: '' },
        ])));
    const [remarks, setRemarks] = useState('');
    const [sending, setSending] = useState(false);

    const update = (id: number, patch: Partial<LineState>) =>
        setLines((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

    const selectedCount = Object.values(lines).filter((l) => l.selected).length;
    const allSelected = selectedCount === outstanding.length && outstanding.length > 0;

    const toggleAll = () =>
        setLines((prev) => Object.fromEntries(
            Object.entries(prev).map(([id, l]) => [id, { ...l, selected: !allSelected }])));

    const submit = async () => {
        const chosen = outstanding.filter((m) => lines[m.id]?.selected);
        if (chosen.length === 0) {
            toast.warning('Tick at least one movement to hand over.');
            return;
        }
        const missingNote = chosen.find(
            (m) => lines[m.id].receiptStatus !== 'RECEIVED_OK' && !lines[m.id].remarks.trim());
        if (missingNote) {
            toast.warning(`Movement #${missingNote.id} is marked with a discrepancy — say what was wrong.`);
            return;
        }

        setSending(true);
        try {
            const res = (await receiveConsignmentService(consignment.id, {
                remarks: remarks || null,
                movements: chosen.map((m) => ({
                    movementId: m.id,
                    receiptStatus: lines[m.id].receiptStatus,
                    remarks: lines[m.id].remarks.trim() || null,
                })),
            })) as any;

            if (res?.status === 200) {
                const left = outstanding.length - chosen.length;
                toast.success(left > 0
                    ? `${chosen.length} handed over. ${left} still outstanding.`
                    : `All ${chosen.length} movement(s) handed over.`);
                await onReceived();
            } else {
                toast.error(res?.data?.message ?? 'Could not complete the hand-over.');
            }
        } finally {
            setSending(false);
        }
    };

    if (outstanding.length === 0) {
        return (
            <Stack spacing={2.5}>
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Everything on this consignment has been handed over. Nothing left outstanding.
                </Alert>
                <Stack direction="row" justifyContent="flex-end">
                    <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Close
                    </Button>
                </Stack>
            </Stack>
        );
    }

    return (
        <Stack spacing={2.5}>
            <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                The goods are in <strong>{consignment.landingStore?.name ?? 'the branch store'}</strong>. Handing a
                movement over assigns its assets to the recipient and draws its items out of that store.
                <strong> Untick anyone who has not collected yet</strong> — they stay outstanding and can be handed
                over later.
            </Alert>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900] }}>
                    Outstanding ({outstanding.length})
                </Typography>
                <Button size="small" onClick={toggleAll} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    {allSelected ? 'Untick all' : 'Tick all'}
                </Button>
            </Stack>

            <Stack spacing={1.25}>
                {outstanding.map((m: IConsignmentMovement) => {
                    const line = lines[m.id];
                    const flagged = line.receiptStatus !== 'RECEIVED_OK';
                    return (
                        <Paper
                            key={m.id}
                            variant="outlined"
                            sx={{
                                p: 1.5, borderRadius: 2,
                                borderColor: line.selected ? alpha(brand[500], 0.35) : border.subtle,
                                bgcolor: line.selected ? alpha(brand[500], 0.03) : 'transparent',
                                transition: 'border-color .15s ease, background-color .15s ease',
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <Checkbox
                                    checked={line.selected}
                                    onChange={(e) => update(m.id, { selected: e.target.checked })}
                                    sx={{ p: 0.5, mt: -0.25 }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: neutral[900] }}>
                                            #{m.id} · {m.recipientName ?? m.destinationName ?? 'Unnamed recipient'}
                                        </Typography>
                                        {m.requestId && (
                                            <Chip size="small" label={`REQ ${m.requestId}`}
                                                sx={{ fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(brand[500], 0.1), color: brand[700] }} />
                                        )}
                                    </Stack>
                                    <Typography variant="caption" sx={{ color: neutral[500] }}>
                                        {movementTypeLabel(m.movementType ?? undefined)} · {m.itemCount} item(s)
                                    </Typography>

                                    {line.selected && (
                                        <Box sx={{ mt: 1.25 }}>
                                            <ToggleButtonGroup
                                                exclusive
                                                size="small"
                                                value={line.receiptStatus}
                                                onChange={(_, v) => v && update(m.id, { receiptStatus: v })}
                                                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, py: 0.25, px: 1.25 } }}
                                            >
                                                <ToggleButton value="RECEIVED_OK">Received OK</ToggleButton>
                                                <ToggleButton
                                                    value="RECEIVED_WITH_DISCREPANCY"
                                                    sx={{ '&.Mui-selected': { color: statusTokens.warning.strong, bgcolor: alpha(statusTokens.warning.main, 0.12) } }}
                                                >
                                                    Discrepancy
                                                </ToggleButton>
                                            </ToggleButtonGroup>

                                            {flagged && (
                                                <TextField
                                                    fullWidth required size="small" sx={{ mt: 1 }}
                                                    label="What was wrong?"
                                                    placeholder="e.g. 1 of 3 reams missing"
                                                    value={line.remarks}
                                                    onChange={(e) => update(m.id, { remarks: e.target.value })}
                                                />
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Stack>
                        </Paper>
                    );
                })}
            </Stack>

            <TextField
                fullWidth multiline rows={2} label="Notes for this hand-over (optional)"
                value={remarks} onChange={(e) => setRemarks(e.target.value)}
            />

            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Cancel
                </Button>
                <Button
                    onClick={submit} disabled={sending || selectedCount === 0} variant="contained"
                    startIcon={<AssignmentTurnedInOutlinedIcon />}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    {sending ? 'Handing over…' : `Hand over ${selectedCount} of ${outstanding.length}`}
                </Button>
            </Stack>
        </Stack>
    );
};

export default ReceiveConsignment;
