/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useEffect, useState } from 'react';
import {
    alpha, Alert, Autocomplete, Box, Button, Chip, Divider, IconButton, Paper, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import WhereToVoteOutlinedIcon from '@mui/icons-material/WhereToVoteOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import { toast } from 'react-toastify';
import { brand, neutral, border } from '../../utils/tokens';
import { StatusChip } from '../../components/layout';
import { dataHeadCellSx, dataBodyCellSx, dataRowSx, dataSurfaceSx } from '../../components/tables/dataTableSx';
import { fetchRowsService, refusal } from '../../core/apis/globalService';
import { IConsignment, consignmentStatusHelp, consignmentStatusLabels } from './interface';
import { addMovementToConsignmentService, removeMovementFromConsignmentService } from './service';
import { IMovement } from '../movement/interface';
import {
    movementTypeLabel, statusLabel, statusTone,
    movementSourceLocationId, movementDestinationLocationId, sameLocation,
} from '../movement/constants';

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

const Fact = ({ label, value, icon, mono }: {
    label: string; value?: string | null; icon?: ReactNode; mono?: boolean;
}) => (
    <Box>
        <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mb: 0.35 }}>
            {icon && <Box sx={{ color: neutral[400], display: 'flex', '& .MuiSvgIcon-root': { fontSize: 13 } }}>{icon}</Box>}
            <Typography
                variant="caption"
                sx={{ color: neutral[500], textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, fontSize: '0.62rem' }}
            >
                {label}
            </Typography>
        </Stack>
        <Typography
            variant="body2"
            sx={{
                color: value ? neutral[800] : neutral[400],
                fontWeight: 600,
                fontFamily: mono && value ? 'monospace' : undefined,
                fontSize: '0.82rem',
            }}
        >
            {value || '—'}
        </Typography>
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
                if (!sameLocation(movementDestinationLocationId(m), consignment.destLocation?.id)) return false;
                /*
                 * The source has to match too. Leaving it out let the picker offer a movement the
                 * server then refused with "leaves from a different location than this consignment"
                 * — reachable for anyone who can see every branch, since their create form lists
                 * source stores across all of them. A movement with no resolvable origin is left in
                 * rather than hidden: the server treats a null source as "no objection".
                 */
                const source = movementSourceLocationId(m);
                return source == null || sameLocation(source, consignment.sourceLocation?.id);
            }));
        })();
    }, [editable, consignment.destLocation?.id, consignment.sourceLocation?.id, consignment.movementCount]);

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
                toast.error(refusal(res, 'That movement could not be loaded.'));
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
                toast.error(refusal(res, 'Could not remove that movement.'));
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
                    <Fact
                        label="Route"
                        icon={<PlaceOutlinedIcon />}
                        value={`${consignment.sourceLocation?.name ?? '—'} → ${consignment.destLocation?.name ?? '—'}`}
                    />
                    <Fact
                        label="Courier"
                        icon={<LocalShippingOutlinedIcon />}
                        value={consignment.courierService ?? consignment.courier?.name}
                    />
                    <Fact label="Plate" icon={<DirectionsCarOutlinedIcon />} value={consignment.plateNumber} mono />
                    <Fact label="Tracking" icon={<QrCode2OutlinedIcon />} value={consignment.trackingNumber} mono />
                </Box>

                {/* Dates only appear once there are dates — a draft has no journey to time yet. */}
                {consignment.status !== 'DRAFT' && (
                    <>
                        <Divider sx={{ my: 2, borderColor: border.subtle }} />
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' } }}>
                            <Fact label="Dispatched" icon={<EventOutlinedIcon />} value={fmtDate(consignment.dispatchDate)} />
                            <Fact label="Expected" icon={<EventOutlinedIcon />} value={fmtDate(consignment.expectedDeliveryDate)} />
                            <Fact label="Arrived" icon={<WhereToVoteOutlinedIcon />} value={fmtDate(consignment.arrivalDate)} />
                            <Fact label="Landed in" icon={<WarehouseOutlinedIcon />} value={consignment.landingStore?.name} />
                        </Box>
                    </>
                )}

                {consignment.remarks && (
                    <>
                        <Divider sx={{ my: 2, borderColor: border.subtle }} />
                        <Fact label="Remarks" value={consignment.remarks} />
                    </>
                )}
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
                    <Paper elevation={0} sx={dataSurfaceSx}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ ...dataHeadCellSx, minWidth: 130 }}>Movement</TableCell>
                                        <TableCell sx={{ ...dataHeadCellSx, minWidth: 150 }}>Type</TableCell>
                                        <TableCell sx={{ ...dataHeadCellSx, minWidth: 200 }}>From → For</TableCell>
                                        <TableCell sx={{ ...dataHeadCellSx, minWidth: 80 }} align="center">Items</TableCell>
                                        <TableCell sx={{ ...dataHeadCellSx, minWidth: 150 }}>Status</TableCell>
                                        <TableCell sx={{ ...dataHeadCellSx, minWidth: 90 }} align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {consignment.movements!.map((m, i) => (
                                        <TableRow key={m.id} hover={false} sx={dataRowSx(i)}>
                                            <TableCell sx={dataBodyCellSx}>
                                                <Stack spacing={0.15}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: brand[600], fontFamily: 'monospace' }}>
                                                        #{m.id}
                                                    </Typography>
                                                    {m.requestId && (
                                                        <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.6rem', fontFamily: 'monospace' }}>
                                                            REQ-{m.requestId}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={dataBodyCellSx}>
                                                <Typography variant="caption" sx={{ color: neutral[700], fontWeight: 500 }}>
                                                    {movementTypeLabel(m.movementType ?? undefined)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={dataBodyCellSx}>
                                                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                                                    <Typography variant="caption" sx={{ color: neutral[600] }} noWrap>
                                                        {m.sourceStoreName ?? '—'}
                                                    </Typography>
                                                    <ArrowForwardIcon sx={{ fontSize: 12, color: neutral[300], flexShrink: 0 }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: neutral[800] }} noWrap>
                                                        {m.recipientName ?? m.destinationName ?? '—'}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={dataBodyCellSx} align="center">
                                                <Box
                                                    sx={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                        px: 0.9, height: 22, borderRadius: '6px',
                                                        bgcolor: alpha(brand[500], 0.08), color: brand[700],
                                                        fontSize: '0.7rem', fontWeight: 700,
                                                    }}
                                                >
                                                    <Inventory2OutlinedIcon sx={{ fontSize: 12 }} />
                                                    {m.itemCount}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={dataBodyCellSx}>
                                                {/* After arrival the only distinction that matters is whether this
                                                    one has reached its recipient yet. */}
                                                {m.status === 'COMPLETED' ? (
                                                    <StatusChip label="Handed over" tone="success" />
                                                ) : consignment.status === 'ARRIVED' ? (
                                                    <StatusChip label="Awaiting hand-over" tone="pending" />
                                                ) : (
                                                    <StatusChip label={statusLabel(m.status ?? undefined)} tone={statusTone(m.status ?? undefined)} />
                                                )}
                                            </TableCell>
                                            <TableCell sx={dataBodyCellSx} align="right">
                                                <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                                                    <Tooltip title="Open movement" arrow>
                                                        <IconButton
                                                            size="small" onClick={() => onOpenMovement(m.id)}
                                                            sx={{ width: 26, height: 26, color: brand[600], '&:hover': { bgcolor: alpha(brand[500], 0.1) } }}
                                                        >
                                                            <OpenInNewIcon sx={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {editable && (
                                                        <Tooltip title="Take off this consignment" arrow>
                                                            <span>
                                                                <IconButton
                                                                    size="small" disabled={busy} onClick={() => remove(m.id)}
                                                                    sx={{ width: 26, height: 26, color: '#DC2626', '&:hover': { bgcolor: alpha('#DC2626', 0.1) } }}
                                                                >
                                                                    <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </Box>

            {editable && (
                <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, borderColor: alpha(brand[500], 0.25), bgcolor: alpha(brand[500], 0.02) }}
                >
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.25 }}>
                        <AddIcon sx={{ fontSize: 16, color: brand[600] }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900] }}>
                            Load a movement
                        </Typography>
                        <Chip
                            size="small"
                            label={`${loadable.length} available`}
                            sx={{
                                height: 20, fontSize: '0.65rem', fontWeight: 700,
                                bgcolor: alpha(brand[500], 0.1), color: brand[700],
                            }}
                        />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
                        <Autocomplete
                            sx={{ flex: 1, width: '100%' }}
                            size="small"
                            options={loadable}
                            value={picked}
                            getOptionLabel={(m) => `#${m.id} — ${movementTypeLabel(m.movementType ?? undefined)}`}
                            isOptionEqualToValue={(o, v) => o.id === v.id}
                            onChange={(_, v) => setPicked(v)}
                            noOptionsText={`No approved movements waiting for ${consignment.destLocation?.name ?? 'this destination'}`}
                            renderOption={(props, m) => (
                                <Box component="li" {...props} key={m.id}>
                                    <Stack sx={{ minWidth: 0 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: neutral[800] }}>
                                            #{m.id} — {movementTypeLabel(m.movementType ?? undefined)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: neutral[500], fontSize: '0.65rem' }}>
                                            {m.sourceStore?.name ?? '—'} → {m.destStore?.name
                                                ?? (m.recipientUser ? `${m.recipientUser.firstName} ${m.recipientUser.lastName}` : '—')}
                                            {' · '}{m.items?.length ?? 0} item{(m.items?.length ?? 0) === 1 ? '' : 's'}
                                        </Typography>
                                    </Stack>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Approved movements heading this way…"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px', bgcolor: '#fff', fontSize: '0.8rem',
                                            '& fieldset': { borderColor: border.subtle },
                                            '&:hover fieldset': { borderColor: brand[500] },
                                            '&.Mui-focused fieldset': { borderColor: brand[500] },
                                        },
                                    }}
                                />
                            )}
                        />
                        <Button
                            variant="contained" startIcon={<AddIcon />} disabled={!picked || busy} onClick={add}
                            sx={{
                                height: 40, px: 2.5, borderRadius: '8px', textTransform: 'none',
                                fontWeight: 600, whiteSpace: 'nowrap',
                                bgcolor: brand[500], '&:hover': { bgcolor: brand[700] },
                            }}
                        >
                            Load
                        </Button>
                    </Stack>
                </Paper>
            )}
        </Stack>
    );
};

export default ConsignmentDetail;
