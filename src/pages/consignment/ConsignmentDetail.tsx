/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useEffect, useState } from 'react';
import {
    alpha, Autocomplete, Box, Button, Chip, IconButton, Paper, Stack,
    TextField, Tooltip, Typography,
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
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import { toast } from 'react-toastify';
import { brand, gold, neutral, border, radii, surface, status as statusTokens } from '../../utils/tokens';
import { StatusChip } from '../../components/layout';
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

/** Tone the whole dialog leans on, so the banner, rail and hero agree on one colour. */
const STATUS_ACCENT: Record<string, string> = {
    DRAFT: neutral[400],
    DISPATCHED: statusTokens.info.main,
    IN_TRANSIT: gold[500],
    ARRIVED: statusTokens.success.main,
    CANCELLED: statusTokens.danger.main,
};

/**
 * A titled panel with a tinted header band.
 *
 * <p>The dialog was a stack of undifferentiated white boxes; banding each section's head gives the
 * eye somewhere to land and makes the reading order obvious without adding a single divider.
 */
const Section = ({ title, icon, action, children, dense }: {
    title: string; icon: ReactNode; action?: ReactNode; children: ReactNode; dense?: boolean;
}) => (
    <Paper
        elevation={0}
        sx={{
            borderRadius: `${radii.lg}px`,
            border: `1px solid ${border.subtle}`,
            overflow: 'hidden',
            bgcolor: surface.card,
        }}
    >
        <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
                px: 2,
                py: 1.25,
                bgcolor: alpha(brand[500], 0.05),
                borderBottom: `1px solid ${alpha(brand[500], 0.12)}`,
            }}
        >
            <Box sx={{ display: 'flex', color: brand[600], '& .MuiSvgIcon-root': { fontSize: 16 } }}>{icon}</Box>
            <Typography
                sx={{
                    flex: 1,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: brand[700],
                }}
            >
                {title}
            </Typography>
            {action}
        </Stack>
        <Box sx={{ p: dense ? 1.25 : 2 }}>{children}</Box>
    </Paper>
);

/** Label above value. Used inside the facts grid. */
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
 * The journey itself, drawn rather than written.
 *
 * <p>Origin and destination were a single "A → B" string in a four-up fact grid, which is where the
 * one thing every reader opens this dialog for went to hide. Here it is the first thing on the page,
 * with the courier riding the dashed line between the two ends.
 */
const RouteHero = ({ from, to, courier, accent }: {
    from?: string | null; to?: string | null; courier?: string | null; accent: string;
}) => (
    <Paper
        elevation={0}
        sx={{
            p: { xs: 1.75, sm: 2.25 },
            borderRadius: `${radii.lg}px`,
            border: `1px solid ${border.subtle}`,
            background: `linear-gradient(135deg, ${alpha(brand[500], 0.05)} 0%, ${alpha(gold[500], 0.04)} 100%)`,
        }}
    >
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 2 },
                // Wraps rather than squeezes: two long branch names on a narrow dialog stack
                // instead of crushing the connector to nothing.
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
            }}
        >
            <Endpoint label="From" name={from} icon={<WarehouseOutlinedIcon />} />

            {/* Connector — dashed road with the courier sitting on it. */}
            <Box sx={{ flex: '1 1 80px', minWidth: 60, position: 'relative', px: 0.5 }}>
                <Box sx={{ borderTop: `2px dashed ${alpha(accent, 0.45)}`, mt: courier ? 1.25 : 0 }} />
                <Box
                    sx={{
                        position: 'absolute',
                        top: courier ? 0 : '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#fff',
                        border: `1px solid ${alpha(accent, 0.4)}`,
                        color: accent,
                    }}
                >
                    <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />
                </Box>
                {courier && (
                    <Typography
                        sx={{
                            mt: 0.75,
                            textAlign: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: neutral[500],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {courier}
                    </Typography>
                )}
            </Box>

            <Endpoint label="To" name={to} icon={<PlaceOutlinedIcon />} align="right" />
        </Box>
    </Paper>
);

/** One end of the route strip. */
const Endpoint = ({ label, name, icon, align = 'left' }: {
    label: string; name?: string | null; icon: ReactNode; align?: 'left' | 'right';
}) => (
    <Box sx={{ flex: '1 1 0', minWidth: 0, textAlign: align }}>
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start', mb: 0.35 }}
        >
            <Box sx={{ display: 'flex', color: neutral[400], '& .MuiSvgIcon-root': { fontSize: 13 } }}>{icon}</Box>
            <Typography
                sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: neutral[500] }}
            >
                {label}
            </Typography>
        </Stack>
        <Typography
            sx={{ fontSize: '0.86rem', fontWeight: 700, color: neutral[900], lineHeight: 1.3, wordBreak: 'break-word' }}
        >
            {name ?? '—'}
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
            /*
             * No status param: GET /movements declares only pageSize and pageNumber, so one was
             * being sent and silently ignored — Spring drops undeclared request params rather than
             * complaining. The filtering below is therefore the only thing narrowing this list, and
             * it has to mirror every rule ConsignmentService#addMovement enforces on write.
             */
            const r = (await fetchRowsService({
                pageNumber: 0, pageSize: 200, endPoint: 'movements',
            })) as any;
            const all: IMovement[] = r?.status === 200 ? r.data?.content ?? [] : [];
            setLoadable(all.filter((m) => {
                if (m.consignment) return false;
                /*
                 * Approved and not yet travelling. Without this the picker offered DRAFT movements
                 * still climbing their approval ladder, and COMPLETED ones that had already been
                 * delivered — both refused on submit with a message the user could do nothing about.
                 */
                if (m.status !== 'INITIATED') return false;
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

    const accent = STATUS_ACCENT[consignment.status] ?? brand[500];

    return (
        <Stack spacing={2}>
            {/* Where this consignment stands, in its own colour. Replaces the stock MUI Alert,
                which only ever spoke in blue or green and ignored the four states in between. */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.25,
                    p: 1.5,
                    borderRadius: `${radii.lg}px`,
                    bgcolor: alpha(accent, 0.07),
                    border: `1px solid ${alpha(accent, 0.25)}`,
                }}
            >
                <Box
                    sx={{
                        flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: alpha(accent, 0.15), color: accent,
                    }}
                >
                    <LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: neutral[900], lineHeight: 1.4 }}>
                        {consignmentStatusLabels[consignment.status]}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: neutral[600], lineHeight: 1.5 }}>
                        {consignmentStatusHelp[consignment.status]}
                        {consignment.status === 'ARRIVED' && consignment.landingStore?.name && (
                            <> Goods are in <strong>{consignment.landingStore.name}</strong>; each movement is handed over separately.</>
                        )}
                    </Typography>
                </Box>
            </Box>

            <RouteHero
                from={consignment.sourceLocation?.name}
                to={consignment.destLocation?.name}
                courier={consignment.courierService ?? consignment.courier?.name}
                accent={accent}
            />

            <Section title="Consignment details" icon={<LocalShippingOutlinedIcon />}>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' } }}>
                    <Fact label="Courier" icon={<LocalShippingOutlinedIcon />} value={consignment.courierService ?? consignment.courier?.name} />
                    <Fact label="Plate" icon={<DirectionsCarOutlinedIcon />} value={consignment.plateNumber} mono />
                    <Fact label="Tracking" icon={<QrCode2OutlinedIcon />} value={consignment.trackingNumber} mono />

                    {/* Dates only appear once there are dates — a draft has no journey to time yet. */}
                    {consignment.status !== 'DRAFT' && (
                        <>
                            <Fact label="Dispatched" icon={<EventOutlinedIcon />} value={fmtDate(consignment.dispatchDate)} />
                            <Fact label="Expected" icon={<EventOutlinedIcon />} value={fmtDate(consignment.expectedDeliveryDate)} />
                            <Fact label="Arrived" icon={<WhereToVoteOutlinedIcon />} value={fmtDate(consignment.arrivalDate)} />
                            <Fact label="Landed in" icon={<WarehouseOutlinedIcon />} value={consignment.landingStore?.name} />
                        </>
                    )}
                </Box>

                {consignment.remarks && (
                    <Box
                        sx={{
                            mt: 2, p: 1.5, borderRadius: `${radii.md}px`,
                            border: `1px dashed ${alpha(gold[500], 0.5)}`,
                            bgcolor: alpha(gold[500], 0.04),
                            display: 'flex', alignItems: 'flex-start', gap: 1,
                        }}
                    >
                        <NotesOutlinedIcon sx={{ fontSize: 15, color: statusTokens.warning.strong, mt: '1px', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.78rem', color: neutral[700], lineHeight: 1.5 }}>
                            <strong>Remarks:</strong> {consignment.remarks}
                        </Typography>
                    </Box>
                )}
            </Section>

            <Section
                title={`On this journey (${consignment.movementCount})`}
                icon={<Inventory2OutlinedIcon />}
                dense
                action={consignment.status === 'ARRIVED' && outstandingCount > 0 ? (
                    <Chip
                        size="small"
                        label={`${outstandingCount} awaiting hand-over`}
                        sx={{ height: 20, fontWeight: 700, fontSize: '0.65rem', bgcolor: alpha(gold[500], 0.16), color: statusTokens.warning.strong }}
                    />
                ) : undefined}
            >
                {(consignment.movements?.length ?? 0) === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 26, color: neutral[300], mb: 0.5 }} />
                        <Typography variant="body2" sx={{ color: neutral[500], fontSize: '0.8rem' }}>
                            Nothing loaded yet. Add the approved movements heading to{' '}
                            {consignment.destLocation?.name ?? 'this destination'}.
                        </Typography>
                    </Box>
                ) : (
                    /*
                     * A stacked list, not a table.
                     *
                     * Six columns of minimum widths added up to ~800px, wider than this dialog's
                     * body, so the table scrolled sideways. Each movement is now one card that
                     * reflows: the identity/route block flexes and the status-and-actions cluster
                     * drops beneath it when the dialog is narrow, so nothing ever overflows.
                     */
                    <Stack spacing={0.75}>
                        {consignment.movements!.map((m) => {
                            const handedOver = m.status === 'COMPLETED';
                            const awaiting = !handedOver && consignment.status === 'ARRIVED';

                            return (
                                <Box
                                    key={m.id}
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        gap: 1.25,
                                        px: 1.5,
                                        py: 1.25,
                                        borderRadius: `${radii.md}px`,
                                        bgcolor: surface.card,
                                        border: `1px solid ${border.subtle}`,
                                        transition: 'border-color 0.15s, background-color 0.15s',
                                        '&:hover': {
                                            borderColor: alpha(brand[500], 0.4),
                                            bgcolor: alpha(brand[500], 0.025),
                                        },
                                    }}
                                >
                                    {/* Identity and route — flexes, and wraps internally before it clips. */}
                                    <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
                                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.25 }}>
                                            <Typography sx={{ fontWeight: 700, color: brand[600], fontFamily: 'monospace', fontSize: '0.78rem' }}>
                                                #{m.id}
                                            </Typography>
                                            {m.requestId && (
                                                <Typography sx={{ color: neutral[400], fontSize: '0.63rem', fontFamily: 'monospace' }}>
                                                    REQ-{m.requestId}
                                                </Typography>
                                            )}
                                            <Box sx={{ width: '3px', height: '3px', borderRadius: '50%', bgcolor: neutral[300] }} />
                                            <Typography sx={{ color: neutral[600], fontWeight: 500, fontSize: '0.76rem' }}>
                                                {movementTypeLabel(m.movementType ?? undefined)}
                                            </Typography>
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={0.6}
                                            sx={{ mt: 0.35, flexWrap: 'wrap', rowGap: 0.2 }}
                                        >
                                            <Typography sx={{ color: neutral[500], fontSize: '0.73rem' }}>
                                                {m.sourceStoreName ?? '—'}
                                            </Typography>
                                            <ArrowForwardIcon sx={{ fontSize: 11, color: neutral[300], flexShrink: 0 }} />
                                            <Typography sx={{ fontWeight: 600, color: neutral[800], fontSize: '0.73rem' }}>
                                                {m.recipientName ?? m.destinationName ?? '—'}
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    {/* Count, status, actions — one cluster, so it drops as a unit. */}
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0, ml: 'auto' }}>
                                        <Tooltip title={`${m.itemCount} item${m.itemCount === 1 ? '' : 's'}`} arrow>
                                            <Box
                                                sx={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 0.4,
                                                    px: 0.9, height: 22, borderRadius: '6px',
                                                    bgcolor: alpha(brand[500], 0.08), color: brand[700],
                                                    fontSize: '0.7rem', fontWeight: 700,
                                                }}
                                            >
                                                <Inventory2OutlinedIcon sx={{ fontSize: 12 }} />
                                                {m.itemCount}
                                            </Box>
                                        </Tooltip>

                                        {/* After arrival the only distinction that matters is whether this
                                            one has reached its recipient yet. */}
                                        {handedOver ? (
                                            <StatusChip label="Handed over" tone="success" />
                                        ) : awaiting ? (
                                            <StatusChip label="Awaiting hand-over" tone="pending" />
                                        ) : (
                                            <StatusChip label={statusLabel(m.status ?? undefined)} tone={statusTone(m.status ?? undefined)} />
                                        )}

                                        <Stack direction="row" spacing={0.25}>
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
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Section>

            {editable && (
                <Section
                    title="Load a movement"
                    icon={<AddIcon />}
                    action={(
                        <Chip
                            size="small"
                            label={`${loadable.length} available`}
                            sx={{
                                height: 20, fontSize: '0.65rem', fontWeight: 700,
                                bgcolor: alpha(brand[500], 0.1), color: brand[700],
                            }}
                        />
                    )}
                >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
                        <Autocomplete
                            sx={{ flex: 1, width: '100%' }}
                            size="small"
                            options={loadable}
                            value={picked}
                            getOptionLabel={(m) => `#${m.id} — ${movementTypeLabel(m.movementType ?? undefined)}`}
                            isOptionEqualToValue={(o, v) => o.id === v.id}
                            onChange={(_, v) => setPicked(v)}
                            // Names all four conditions, because an empty picker is otherwise
                            // indistinguishable from a broken one — and the usual cause is a
                            // movement still sitting in DRAFT awaiting its approval.
                            noOptionsText={
                                `Nothing to load. A movement appears here once it is approved (Initiated), `
                                + `runs ${consignment.sourceLocation?.name ?? 'this origin'} → `
                                + `${consignment.destLocation?.name ?? 'this destination'}, and is not already `
                                + `on another consignment.`
                            }
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
                </Section>
            )}
        </Stack>
    );
};

export default ConsignmentDetail;
