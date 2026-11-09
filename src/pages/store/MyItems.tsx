/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import { ROUTES } from '../../core/routes/routes';
import { PERMISSIONS } from '../../core/permissions/constants';
import usePermissions from '../../core/permissions/usePermissions';
import { PageHero, StatTile, StatusChip } from '../../components/layout';
import LoanerList from '../movement/LoanerList';
import { movementTypeLabel, statusLabel, statusTone } from '../movement/constants';
import { IAwayItem, IHeldItem, IIncomingMovement, IMyItems, awayWhereLabel, fetchMyItemsService, groupByCategory } from './myItemsData';
import { brand, neutral, border } from '../../utils/tokens';

const headSx = {
    '& th': {
        bgcolor: alpha(brand[500], 0.04),
        borderBottom: `1px solid ${border.subtle}`,
        fontWeight: 700, fontSize: '0.8rem', color: brand[700],
        textTransform: 'uppercase', letterSpacing: '0.05em',
        py: 1.4, whiteSpace: 'nowrap',
    },
};
const rowSx = { '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.2, fontSize: '0.875rem' } };

/**
 * What the signed-in person is accountable for: what they hold, what of theirs is away for repair or
 * disposal, and what is on its way to them.
 *
 * <p>Reads like a personal store without being one. Consumables are expensed when they are issued —
 * nobody records using a pen, so a personal balance would only ever grow and drift permanently wrong —
 * so this shows serialized assets and the movements bringing things to them.
 *
 * <p>"Away" is why this needed a server rule. Sending an asset for repair closes the holder's
 * assignment when Head Office receives it, so a list of assigned assets lost the laptop the moment it
 * reached the bench. The server reads who handed it over off the transfer, and the detail page admits
 * that person while it is away, so every row here opens.
 */
const MyItems = () => {
    const [items, setItems] = useState<IMyItems>({ held: [], away: [], incoming: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    const { has } = usePermissions();
    // The detail pages answer to their own route permissions; a link the route refuses is worse
    // than none.
    const mayOpenAsset = has(PERMISSIONS.READ_ASSET);
    const mayOpenMovement = has(PERMISSIONS.READ_MOVEMENT);
    const mayOpenRequest = has(PERMISSIONS.READ_REQUEST);

    const load = useCallback(async () => {
        try {
            setItems(await fetchMyItemsService());
            setError(false);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openAsset = (typeId?: number | null, id?: number) =>
        typeId != null && id != null ? () => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}/view/${id}`) : undefined;

    const openIncoming = (m: IIncomingMovement) => {
        // The request page shows the movements fulfilling it, and its requester may open it;
        // the movement register needs READ_MOVEMENT, which most requesters do not hold.
        if (m.requestId != null && mayOpenRequest) return () => navigate(`${ROUTES.READ_REQUEST}/${m.requestId}`);
        if (mayOpenMovement) return () => navigate(`${ROUTES.READ_MOVEMENT}/${m.id}`);
        return undefined;
    };

    const onLoan = items.held.filter((h) => h.onLoan).length;
    const show = (n: number) => (loading ? '…' : n);

    return (
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="My Items"
                subtitle="What you are accountable for, what of yours is away, and what is on its way to you"
                icon={<BadgeOutlinedIcon />}
                stat={{
                    value: loading ? '…' : items.held.length.toLocaleString(),
                    label: 'items with you',
                    helper: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                    <StatTile label="With You" value={show(items.held.length)} helper="you are accountable for these" icon={<DevicesOutlinedIcon />} accent="brand" />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatTile label="On Loan" value={show(onLoan)} helper="temporary, to be handed back" icon={<SwapHorizOutlinedIcon />} accent="gold" />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatTile label="Away" value={show(items.away.length)} helper="for repair or disposal" icon={<BuildOutlinedIcon />} accent="warning" />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatTile label="On Its Way" value={show(items.incoming.length)} helper="coming to you" icon={<LocalShippingOutlinedIcon />} accent="info" />
                </Grid>
            </Grid>

            {loading && (
                <Stack alignItems="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: brand[500] }} />
                </Stack>
            )}

            {!loading && error && (
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => { setLoading(true); load(); }}>Retry</Button>}>
                    Could not load your items. Please try again.
                </Alert>
            )}

            {!loading && !error && (
                <Stack spacing={3}>
                    {/* Loaners, with the way to hand one back. Renders nothing for people holding none. */}
                    <LoanerList
                        mode="mine"
                        emptyText={null}
                        onChanged={load}
                        heading={<SectionTitle title="On loan to you" caption="Hand a loaner back once your own asset is with you again." />}
                    />

                    <Section title="With you" caption="Assets assigned to you. You are accountable for these until they are transferred or returned.">
                        {items.held.length === 0 ? (
                            <EmptyRow icon={<Inventory2OutlinedIcon sx={{ fontSize: 34 }} />} text="You are not holding any assets." />
                        ) : (
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table size="small" sx={{ minWidth: 680 }}>
                                    <TableHead>
                                        <TableRow sx={headSx}>
                                            <TableCell>Asset</TableCell>
                                            <TableCell>Engraved No.</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="center">Open</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {groupByCategory(items.held).map((g) => [
                                            <GroupRow key={`g-${g.category}`} label={g.category} count={g.items.length} colSpan={5} />,
                                            ...g.items.map((a: IHeldItem) => (
                                                <TableRow key={a.id} hover sx={rowSx}>
                                                    <TableCell>
                                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[900] }}>{a.name || '—'}</Typography>
                                                        {a.model && <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>{a.model}</Typography>}
                                                    </TableCell>
                                                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.engravedNumber || a.serialNumber || '—'}</TableCell>
                                                    <TableCell sx={{ color: neutral[600] }}>{a.branchName || '—'}</TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={0.75}>
                                                            <StatusChip label={a.statusName || 'Unknown'} tone={a.statusCode === 'requireUpdate' ? 'info' : 'success'} />
                                                            {a.onLoan && <StatusChip label="On loan" tone="gold" />}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <OpenButton label={a.name} onClick={mayOpenAsset ? openAsset(a.assetTypeId, a.id) : undefined} />
                                                    </TableCell>
                                                </TableRow>
                                            )),
                                        ])}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Section>

                    {items.away.length > 0 && (
                        <Section title="Away for repair or disposal" caption="Assets you handed over that are not back yet. They stay listed here until they return to you.">
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table size="small" sx={{ minWidth: 680 }}>
                                    <TableHead>
                                        <TableRow sx={headSx}>
                                            <TableCell>Asset</TableCell>
                                            <TableCell>Where it is</TableCell>
                                            <TableCell>Sent</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="center">Open</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {groupByCategory(items.away).map((g) => [
                                            <GroupRow key={`g-${g.category}`} label={g.category} count={g.items.length} colSpan={5} />,
                                            ...g.items.map((a: IAwayItem) => (
                                                <TableRow key={a.id} hover sx={rowSx}>
                                                    <TableCell>
                                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[900] }}>{a.name || '—'}</Typography>
                                                        {a.engravedNumber && <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>{a.engravedNumber}</Typography>}
                                                    </TableCell>
                                                    <TableCell sx={{ color: neutral[700] }}>{awayWhereLabel(a)}</TableCell>
                                                    <TableCell sx={{ color: neutral[600], whiteSpace: 'nowrap' }}>{a.since ? moment(a.since).format('DD MMM YYYY') : '—'}</TableCell>
                                                    <TableCell>
                                                        {a.returning
                                                            ? <StatusChip label="On its way back to you" tone="info" />
                                                            : <StatusChip label={a.statusName || (a.purpose === 'disposal' ? 'Pending disposal' : 'In maintenance')} tone={a.purpose === 'disposal' ? 'danger' : 'pending'} />}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <OpenButton label={a.name} onClick={mayOpenAsset ? openAsset(a.assetTypeId, a.id) : undefined} />
                                                    </TableCell>
                                                </TableRow>
                                            )),
                                        ])}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Section>
                    )}

                    {items.incoming.length > 0 && (
                        <Section title="On its way to you" caption="Movements addressed to you, or fulfilling a request you raised, that are not complete yet.">
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table size="small" sx={{ minWidth: 760 }}>
                                    <TableHead>
                                        <TableRow sx={headSx}>
                                            <TableCell>Movement</TableCell>
                                            <TableCell>Items</TableCell>
                                            <TableCell>From</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Tracking No.</TableCell>
                                            <TableCell align="center">Open</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.incoming.map((m) => (
                                            <TableRow key={m.id} hover sx={rowSx}>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[900] }}>{movementTypeLabel(m.movementType ?? undefined)}</Typography>
                                                    <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>
                                                        #{m.id}{m.createDate ? ` · ${moment(m.createDate).format('DD MMM YYYY')}` : ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ color: neutral[700] }}>
                                                    {m.itemSummary || '—'}
                                                    <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>{m.itemCount} line{m.itemCount === 1 ? '' : 's'}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ color: neutral[600] }}>{m.fromName || '—'}</TableCell>
                                                <TableCell><StatusChip label={statusLabel(m.status ?? undefined)} tone={statusTone(m.status ?? undefined)} /></TableCell>
                                                <TableCell sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{m.trackingNumber || '—'}</TableCell>
                                                <TableCell align="center">
                                                    <OpenButton label={`movement ${m.id}`} onClick={openIncoming(m)} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Section>
                    )}
                </Stack>
            )}
        </Box>
    );
};

const SectionTitle = ({ title, caption }: { title: string; caption?: string }) => (
    <Box sx={{ mb: 1 }}>
        <Typography sx={{ fontWeight: 700, color: neutral[900] }}>{title}</Typography>
        {caption && <Typography variant="caption" sx={{ color: neutral[500] }}>{caption}</Typography>}
    </Box>
);

const Section = ({ title, caption, children }: { title: string; caption?: string; children: ReactNode }) => (
    <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, pt: 1.75, pb: 0.75, borderBottom: `1px solid ${border.subtle}` }}>
            <SectionTitle title={title} caption={caption} />
        </Box>
        {children}
    </Paper>
);

const GroupRow = ({ label, count, colSpan }: { label: string; count: number; colSpan: number }) => (
    <TableRow>
        <TableCell colSpan={colSpan} sx={{ bgcolor: alpha(neutral[900], 0.03), py: 0.9, fontWeight: 700, fontSize: '0.8rem', color: neutral[700], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label} · {count}
        </TableCell>
    </TableRow>
);

const EmptyRow = ({ icon, text }: { icon: ReactNode; text: string }) => (
    <Stack alignItems="center" spacing={1} sx={{ py: 5, color: neutral[400] }}>
        {icon}
        <Typography variant="body2">{text}</Typography>
    </Stack>
);

/** Absent rather than disabled when there is nowhere it may go: a dead control reads as broken. */
const OpenButton = ({ label, onClick }: { label?: string | null; onClick?: () => void }) =>
    onClick ? (
        <Tooltip arrow title="Open">
            <IconButton size="small" onClick={onClick} aria-label={`Open ${label ?? ''}`.trim()} sx={{ color: brand[600] }}>
                <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
        </Tooltip>
    ) : <Typography component="span" sx={{ color: neutral[300] }}>—</Typography>;

export default MyItems;
