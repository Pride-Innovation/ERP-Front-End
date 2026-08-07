/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    alpha, Alert, Autocomplete, Box, Button, Chip, Divider, Paper, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { toast } from 'react-toastify';
import { brand, neutral, border } from '../../utils/tokens';
import { fetchRowsService } from '../../core/apis/globalService';
import { IConsignment, consignmentStatusHelp, consignmentStatusLabels } from './interface';
import { addMovementToConsignmentService, removeMovementFromConsignmentService } from './service';
import { IMovement } from '../movement/interface';
import { movementTypeLabel } from '../movement/constants';

const Fact = ({ label, value }: { label: string; value?: string | null }) => (
    <Box>
        <Typography variant="caption" sx={{ color: neutral[500], textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 700 }}>
            {label}
        </Typography>
        <Typography variant="body2" sx={{ color: neutral[800], fontWeight: 600 }}>{value || '—'}</Typography>
    </Box>
);

/**
 * What is on this journey, and what may still be loaded onto it.
 *
 * <p>Only movements that are approved, inter-location and heading to this destination can be added —
 * the same rules the server enforces, applied here so the picker never offers something that will be
 * refused.
 */
const ConsignmentDetail = ({
    consignment,
    onChanged,
    onOpenMovement,
}: {
    consignment: IConsignment;
    onChanged: () => void | Promise<void>;
    onOpenMovement: (movementId: number) => void;
}) => {
    const [loadable, setLoadable] = useState<IMovement[]>([]);
    const [picked, setPicked] = useState<IMovement | null>(null);
    const [busy, setBusy] = useState(false);

    const editable = consignment.status === 'DRAFT';
    const outstandingCount = (consignment.movements ?? [])
        .filter((m) => m.status !== 'COMPLETED' && m.status !== 'CANCELLED').length;

    useEffect(() => {
        if (!editable) { setLoadable([]); return; }
        (async () => {
            const r = (await fetchRowsService({
                pageNumber: 0, pageSize: 200, endPoint: 'movements', params: { status: 'INITIATED' },
            })) as any;
            const all: IMovement[] = r?.status === 200 ? r.data?.content ?? [] : [];
            setLoadable(all.filter((m) => {
                if (m.consignment) return false;
                if (m.movementCategory !== 'INTER_LOCATION') return false;
                const dest = m.destStore?.location?.id ?? m.recipientUser?.branch?.id;
                return dest != null && dest === consignment.destLocation?.id;
            }));
        })();
    }, [editable, consignment.destLocation?.id, consignment.movementCount]);

    const add = async () => {
        if (!picked?.id) return;
        setBusy(true);
        try {
            const res = (await addMovementToConsignmentService(consignment.id, picked.id)) as any;
            if (res?.status === 200) {
                toast.success('Loaded onto this consignment.');
                setPicked(null);
                await onChanged();
            } else {
                toast.error(res?.data?.message ?? 'That movement could not be loaded.');
            }
        } finally {
            setBusy(false);
        }
    };

    const remove = async (movementId: number) => {
        setBusy(true);
        try {
            const res = (await removeMovementFromConsignmentService(consignment.id, movementId)) as any;
            if (res?.status === 200) {
                toast.success('Taken off this consignment.');
                await onChanged();
            } else {
                toast.error(res?.data?.message ?? 'Could not remove that movement.');
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={2.5}>
            <Alert
                severity={consignment.status === 'ARRIVED' ? 'success' : 'info'}
                sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}
            >
                <strong>{consignmentStatusLabels[consignment.status]}.</strong>{' '}
                {consignmentStatusHelp[consignment.status]}
                {consignment.status === 'ARRIVED' && consignment.landingStore?.name && (
                    <> Goods are in <strong>{consignment.landingStore.name}</strong>; each movement is handed over separately.</>
                )}
            </Alert>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: border.subtle }}>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' } }}>
                    <Fact label="Route" value={`${consignment.sourceLocation?.name ?? '—'} → ${consignment.destLocation?.name ?? '—'}`} />
                    <Fact label="Courier" value={consignment.courierService ?? consignment.courier?.name} />
                    <Fact label="Plate" value={consignment.plateNumber} />
                    <Fact label="Tracking" value={consignment.trackingNumber} />
                </Box>
            </Paper>

            <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900] }}>
                        On this journey ({consignment.movementCount})
                    </Typography>
                    {consignment.status === 'ARRIVED' && outstandingCount > 0 && (
                        <Chip
                            size="small"
                            label={`${outstandingCount} awaiting hand-over`}
                            sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: alpha('#F59E0B', 0.14), color: '#B45309' }}
                        />
                    )}
                </Stack>

                {(consignment.movements?.length ?? 0) === 0 ? (
                    <Typography variant="body2" sx={{ color: neutral[500] }}>
                        Nothing loaded yet. Add the approved movements heading to {consignment.destLocation?.name ?? 'this destination'}.
                    </Typography>
                ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: border.subtle, overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: neutral[50] }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Movement</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>From</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>For</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Items</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {consignment.movements!.map((m) => (
                                    <TableRow key={m.id} hover>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                            #{m.id}
                                            {m.requestId ? (
                                                <Chip size="small" label={`REQ ${m.requestId}`}
                                                    sx={{ ml: 0.75, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(brand[500], 0.1), color: brand[700] }} />
                                            ) : null}
                                        </TableCell>
                                        <TableCell sx={{ color: neutral[700] }}>{movementTypeLabel(m.movementType ?? undefined)}</TableCell>
                                        <TableCell sx={{ color: neutral[600] }}>{m.sourceStoreName ?? '—'}</TableCell>
                                        <TableCell sx={{ color: neutral[600] }}>{m.recipientName ?? m.destinationName ?? '—'}</TableCell>
                                        <TableCell align="right" sx={{ color: neutral[700] }}>{m.itemCount}</TableCell>
                                        <TableCell>
                                            {/* After arrival the only distinction that matters is whether this
                                                one has reached its recipient yet. */}
                                            {m.status === 'COMPLETED' ? (
                                                <Chip size="small" label="Handed over"
                                                    sx={{ fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha('#10B981', 0.12), color: '#047857' }} />
                                            ) : consignment.status === 'ARRIVED' ? (
                                                <Chip size="small" label="Awaiting hand-over"
                                                    sx={{ fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha('#F59E0B', 0.14), color: '#B45309' }} />
                                            ) : (
                                                <Typography variant="caption" sx={{ color: neutral[600] }}>{m.status}</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Button size="small" onClick={() => onOpenMovement(m.id)} sx={{ minWidth: 0 }}>
                                                    <OpenInNewIcon fontSize="small" />
                                                </Button>
                                                {editable && (
                                                    <Button size="small" color="error" disabled={busy}
                                                        onClick={() => remove(m.id)} sx={{ minWidth: 0 }}>
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </Button>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {editable && (
                <>
                    <Divider />
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900], mb: 1 }}>
                            Load a movement
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                            <Autocomplete
                                sx={{ flex: 1 }}
                                options={loadable}
                                value={picked}
                                getOptionLabel={(m) => `#${m.id} — ${movementTypeLabel(m.movementType ?? undefined)}`}
                                isOptionEqualToValue={(o, v) => o.id === v.id}
                                onChange={(_, v) => setPicked(v)}
                                noOptionsText={`No approved movements waiting for ${consignment.destLocation?.name ?? 'this destination'}`}
                                renderInput={(params) => <TextField {...params} label="Approved movements heading this way" />}
                            />
                            <Button
                                variant="contained" startIcon={<AddIcon />} disabled={!picked || busy} onClick={add}
                                sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
                            >
                                Load
                            </Button>
                        </Stack>
                    </Box>
                </>
            )}
        </Stack>
    );
};

export default ConsignmentDetail;
