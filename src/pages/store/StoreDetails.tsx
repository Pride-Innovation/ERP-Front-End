/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Paper,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import { StoreContext } from '../../context/store';
import { StatusChip } from '../../components/layout';
import { REASON_META, ILedgerEntry } from './LedgerHistoryModal';
import { IIssuedCommodity, ILastIssuedCommodity } from './interface';
import { fetchLastIssuedCommodityService, fetchLedgerHistoryService } from './service';
import { brand, gold, neutral, border, surface, status as statusTokens } from '../../utils/tokens';

const PRIMARY = brand[500];
const SECONDARY = gold[500];

/** Newest ledger entries shown inline — the full list lives behind the balances table's history icon. */
const RECENT_ENTRY_LIMIT = 5;

const fmtDate = (d?: string | null) =>
    (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null);

const fmtDateTime = (d?: string | null) =>
    (d ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }) : null);

const fullName = (u?: { firstName?: string; lastName?: string; otherName?: string | null } | null) =>
    (u ? [u.firstName, u.otherName, u.lastName].filter(Boolean).join(' ') : null);

/** Plain-English label for the store container a balance sits in. */
const STORE_TYPE_LABEL: Record<string, string> = {
    ADMIN: 'Admin store',
    IT: 'IT store',
    DISPOSAL: 'Disposal store',
    COURIER: 'Courier custody',
};

/**
 * How healthy this line is.
 *
 * <p>The reorder level is the storekeeper's own threshold, so it decides the verdict whenever one is
 * set. Lines with no threshold (`minLevel = 0`) can never be flagged by the backend, so they fall
 * back to a generic quantity read — and are called out as unmonitored elsewhere in the modal.
 */
const stockHealth = (quantity: number, minLevel: number) => {
    if (quantity <= 0) return { label: 'Out of stock', tone: 'danger' as const, color: statusTokens.danger.main };
    if (minLevel > 0) {
        if (quantity <= minLevel) return { label: 'Low stock', tone: 'pending' as const, color: statusTokens.warning.strong };
        if (quantity <= minLevel * 1.5) return { label: 'Running low', tone: 'pending' as const, color: statusTokens.warning.strong };
        return { label: 'In stock', tone: 'success' as const, color: statusTokens.success.strong };
    }
    if (quantity < 5) return { label: 'Low stock', tone: 'pending' as const, color: statusTokens.warning.strong };
    if (quantity < 10) return { label: 'Moderate', tone: 'pending' as const, color: statusTokens.warning.strong };
    return { label: 'In stock', tone: 'success' as const, color: statusTokens.success.strong };
};

interface DetailRowProps {
    icon: React.ReactNode;
    label: string;
    value?: React.ReactNode;
    accent?: string;
}

const DetailRow = ({ icon, label, value, accent = PRIMARY }: DetailRowProps) => (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
            sx={{
                mt: 0.15,
                width: 28,
                height: 28,
                borderRadius: 1.25,
                bgcolor: alpha(accent, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}
        >
            <Box sx={{ fontSize: 15, color: accent, display: 'flex' }}>{icon}</Box>
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block' }}>
                {label}
            </Typography>
            {typeof value === 'string' || typeof value === 'number' || value == null ? (
                <Typography variant="body2" sx={{ fontWeight: 500, color: value ? 'text.primary' : 'text.disabled', wordBreak: 'break-word' }}>
                    {value ?? '—'}
                </Typography>
            ) : value}
        </Box>
    </Stack>
);

const SectionHeader = ({ title, accent = PRIMARY, action }: { title: string; accent?: string; action?: React.ReactNode }) => (
    <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
        <Box sx={{ height: 14, width: 3, borderRadius: 2, bgcolor: accent }} />
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: accent, fontSize: '0.72rem' }}>
            {title}
        </Typography>
        {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
    </Stack>
);

/** A bordered block — one per topic, so the modal reads as sections rather than one long list. */
const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${border.subtle}`,
            bgcolor: surface.card,
        }}
    >
        {children}
    </Paper>
);

/** One headline number with its caption — the row of figures under the hero. */
const MetricTile = ({
    label, value, hint, color = neutral[900], accent = PRIMARY,
}: { label: string; value: React.ReactNode; hint?: string; color?: string; accent?: string }) => (
    <Paper
        elevation={0}
        sx={{
            px: 1.75, py: 1.5, height: '100%', borderRadius: 2,
            border: `1px solid ${border.subtle}`,
            bgcolor: alpha(accent, 0.02),
        }}
    >
        <Typography variant="caption" sx={{ color: neutral[500], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.62rem', display: 'block' }}>
            {label}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color, lineHeight: 1.4, fontVariantNumeric: 'tabular-nums' }}>
            {value}
        </Typography>
        {hint && (
            <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.66rem' }}>
                {hint}
            </Typography>
        )}
    </Paper>
);

/**
 * Everything known about one line of stock: what it is, where it sits, how healthy the quantity is,
 * who last received it, and how it reached its current number.
 *
 * <p>The balances table answers "how much"; this answers the questions a storekeeper asks next
 * before acting on a row — is it below its reorder level, whose store is it in, and what moved it.
 */
const StoreDetails = ({ handleClose }: { handleClose: () => void }) => {
    const { curentStoreData } = useContext(StoreContext);

    const [lastIssued, setLastIssued] = useState<IIssuedCommodity | null>(null);
    const [issuedLoading, setIssuedLoading] = useState<boolean>(true);
    const [entries, setEntries] = useState<ILedgerEntry[]>([]);
    const [ledgerLoading, setLedgerLoading] = useState<boolean>(true);

    const commodityId = curentStoreData?.commodity?.id;
    const containerId = curentStoreData?.store?.id;

    useEffect(() => {
        if (!commodityId) { setIssuedLoading(false); return; }
        let cancelled = false;
        (async () => {
            setIssuedLoading(true);
            try {
                const response = await fetchLastIssuedCommodityService(commodityId) as ILastIssuedCommodity;
                // The endpoint answers 200 with an empty body when the commodity has never
                // been issued, so an absent payload is a normal outcome, not a failure.
                if (!cancelled) setLastIssued(response?.status === 200 ? response.data ?? null : null);
            } finally {
                if (!cancelled) setIssuedLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [commodityId]);

    useEffect(() => {
        if (!commodityId || !containerId) { setLedgerLoading(false); return; }
        let cancelled = false;
        (async () => {
            setLedgerLoading(true);
            try {
                const response = await fetchLedgerHistoryService(containerId, commodityId) as any;
                if (!cancelled) setEntries(response?.status === 200 ? response.data ?? [] : []);
            } finally {
                if (!cancelled) setLedgerLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [commodityId, containerId]);

    const qty = curentStoreData?.quantity ?? 0;
    const minLevel = curentStoreData?.minLevel ?? 0;
    const health = stockHealth(qty, minLevel);
    const monitored = minLevel > 0;
    const storeType = curentStoreData?.store?.storeType ?? '';
    const suppliers = curentStoreData?.commodity?.suppliers ?? [];
    const issuance = lastIssued?.issuance;
    const requester = issuance?.requester;
    const requesterBranch = requester?.branch?.name ?? requester?.title?.branch?.name ?? null;
    const recent = entries.slice(0, RECENT_ENTRY_LIMIT);
    /** The newest entry is the most recent thing that touched this line — a better "as at" than lastModified alone. */
    const lastMovement = entries[0]?.occurredAt ?? curentStoreData?.lastModified ?? null;

    return (
        <Stack spacing={2.5} sx={{ width: '100%' }}>

            {/* Hero — what this line is, and how much of it there is */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.75}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: alpha(PRIMARY, 0.04),
                    border: `1px solid ${alpha(PRIMARY, 0.14)}`,
                }}
            >
                <Box sx={{
                    width: 42, height: 42, borderRadius: 2, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY,
                }}
                >
                    <Inventory2OutlinedIcon sx={{ fontSize: 22 }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: neutral[900], lineHeight: 1.3 }}>
                        {curentStoreData?.commodity?.name ?? 'Commodity'}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ mt: 0.6, flexWrap: 'wrap' }} useFlexGap>
                        {curentStoreData?.commodity?.assetType?.name && (
                            <StatusChip label={curentStoreData.commodity.assetType.name} tone="brand" />
                        )}
                        {curentStoreData?.commodity?.groupName && (
                            <StatusChip label={curentStoreData.commodity.groupName} tone="neutral" variant="outlined" />
                        )}
                        {storeType && (
                            <StatusChip label={STORE_TYPE_LABEL[storeType] ?? storeType} tone="gold" variant="outlined" />
                        )}
                    </Stack>
                </Box>

                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.4} sx={{ flexShrink: 0 }}>
                    <Typography variant="caption" sx={{ color: neutral[500], fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em' }}>
                        ON HAND
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', lineHeight: 1, color: health.color, fontVariantNumeric: 'tabular-nums' }}>
                        {qty.toLocaleString()}
                    </Typography>
                    <StatusChip label={health.label} tone={health.tone} />
                </Stack>
            </Stack>

            {/* A line with no reorder level runs to zero without ever raising an alert — say so here,
                where somebody looking at the row can act on it. */}
            {!monitored && (
                <Stack
                    direction="row" spacing={1.25} alignItems="center"
                    sx={{
                        px: 1.75, py: 1.25, borderRadius: 2,
                        bgcolor: alpha(statusTokens.warning.main, 0.07),
                        border: `1px solid ${alpha(statusTokens.warning.main, 0.25)}`,
                    }}
                >
                    <WarningAmberOutlinedIcon sx={{ fontSize: 17, color: statusTokens.warning.strong }} />
                    <Typography variant="caption" sx={{ color: statusTokens.warning.strong, fontWeight: 600 }}>
                        No reorder level is set for this line, so it will never be flagged as low however far it falls.
                        Set one from the Inventory balances table.
                    </Typography>
                </Stack>
            )}

            {/* The figures a storekeeper checks before acting on the row */}
            <Grid container spacing={1.5}>
                <Grid item xs={6} sm={3}>
                    <MetricTile label="On hand" value={qty.toLocaleString()} hint={curentStoreData?.commodity?.groupName ?? undefined} color={health.color} />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <MetricTile
                        label="Reorder at"
                        value={monitored ? minLevel.toLocaleString() : '—'}
                        hint={monitored ? 'Flagged at or below' : 'Not monitored'}
                        color={monitored ? neutral[900] : neutral[400]}
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <MetricTile
                        label="Cover"
                        value={monitored ? `${(qty / minLevel).toFixed(1)}×` : '—'}
                        hint={monitored ? 'of the reorder level' : 'no threshold set'}
                        color={monitored ? health.color : neutral[400]}
                        accent={SECONDARY}
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <MetricTile
                        label="Last movement"
                        value={fmtDate(lastMovement) ?? '—'}
                        hint={fmtDateTime(lastMovement) ? 'as recorded in the ledger' : 'nothing recorded yet'}
                        accent={SECONDARY}
                    />
                </Grid>
            </Grid>

            {/* Commodity + location, side by side */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <SectionCard>
                        <SectionHeader title="Commodity" accent={PRIMARY} />
                        <Stack spacing={1.6}>
                            <DetailRow
                                icon={<CategoryOutlinedIcon fontSize="inherit" />}
                                label="Commodity"
                                value={curentStoreData?.commodity?.name}
                            />
                            <DetailRow
                                icon={<LayersOutlinedIcon fontSize="inherit" />}
                                label="Unit of Measure"
                                value={curentStoreData?.commodity?.groupName}
                            />
                            <DetailRow
                                icon={<DescriptionOutlinedIcon fontSize="inherit" />}
                                label="Asset Type"
                                value={curentStoreData?.commodity?.assetType?.name}
                            />
                            <DetailRow
                                icon={<LocalShippingOutlinedIcon fontSize="inherit" />}
                                label="Approved Suppliers"
                                value={suppliers.length > 0 ? (
                                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', mt: 0.25 }} useFlexGap>
                                        {suppliers.map((s) => (
                                            <Chip
                                                key={s.id}
                                                size="small"
                                                label={s.name}
                                                sx={{
                                                    height: 20, fontSize: '0.68rem', fontWeight: 600,
                                                    bgcolor: alpha(PRIMARY, 0.07), color: brand[700],
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                ) : null}
                            />
                        </Stack>
                    </SectionCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <SectionCard>
                        <SectionHeader title="Where it is held" accent={SECONDARY} />
                        <Stack spacing={1.6}>
                            <DetailRow
                                icon={<StorefrontOutlinedIcon fontSize="inherit" />}
                                label="Store"
                                value={curentStoreData?.store?.name ?? (storeType ? STORE_TYPE_LABEL[storeType] ?? storeType : null)}
                                accent={SECONDARY}
                            />
                            <DetailRow
                                icon={<LocationCityOutlinedIcon fontSize="inherit" />}
                                label="Branch"
                                value={curentStoreData?.branch?.name}
                                accent={SECONDARY}
                            />
                            <DetailRow
                                icon={<PhoneIphoneOutlinedIcon fontSize="inherit" />}
                                label="Telephone"
                                value={curentStoreData?.branch?.telephone}
                                accent={SECONDARY}
                            />
                            <DetailRow
                                icon={<EmailOutlinedIcon fontSize="inherit" />}
                                label="Email"
                                value={curentStoreData?.branch?.email}
                                accent={SECONDARY}
                            />
                            <DetailRow
                                icon={<UpdateOutlinedIcon fontSize="inherit" />}
                                label="Line opened / last updated"
                                value={[fmtDate(curentStoreData?.createDate), fmtDate(curentStoreData?.lastModified)]
                                    .filter(Boolean).join(' → ') || null}
                                accent={SECONDARY}
                            />
                        </Stack>
                    </SectionCard>
                </Grid>
            </Grid>

            {/* Last issued — real data, from the issuance that most recently took this commodity out */}
            <SectionCard>
                <SectionHeader title="Last issued" accent={PRIMARY} />
                {issuedLoading ? (
                    <Stack spacing={1}>
                        <Skeleton height={20} width="60%" />
                        <Skeleton height={20} width="45%" />
                    </Stack>
                ) : !issuance ? (
                    <Typography variant="body2" sx={{ color: neutral[400] }}>
                        This commodity has not been issued to anyone yet.
                    </Typography>
                ) : (
                    <Grid container spacing={1.6}>
                        <Grid item xs={12} sm={6}>
                            <DetailRow
                                icon={<EventNoteOutlinedIcon fontSize="inherit" />}
                                label="Date issued"
                                value={fmtDateTime(issuance.createDate)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DetailRow
                                icon={<PersonOutlineOutlinedIcon fontSize="inherit" />}
                                label="Issued to"
                                value={[fullName(requester), requesterBranch].filter(Boolean).join(' – ') || null}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DetailRow
                                icon={<Inventory2OutlinedIcon fontSize="inherit" />}
                                label="Quantity issued"
                                value={`${(lastIssued?.quantity ?? 0).toLocaleString()}${curentStoreData?.commodity?.groupName ? ` ${curentStoreData.commodity.groupName}` : ''}`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DetailRow
                                icon={<PersonOutlineOutlinedIcon fontSize="inherit" />}
                                label="Issued by"
                                value={fullName(issuance.issuer)}
                            />
                        </Grid>
                        {issuance.status?.name && (
                            <Grid item xs={12}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                                        Status
                                    </Typography>
                                    <StatusChip label={issuance.status.name} tone="info" />
                                </Stack>
                            </Grid>
                        )}
                        {issuance.comment && (
                            <Grid item xs={12}>
                                <Typography variant="caption" sx={{ color: neutral[500], fontStyle: 'italic' }}>
                                    “{issuance.comment}”
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                )}
            </SectionCard>

            {/* Recent stock movement — why the number is what it is */}
            <SectionCard>
                <SectionHeader
                    title="Recent stock movement"
                    accent={PRIMARY}
                    action={entries.length > RECENT_ENTRY_LIMIT ? (
                        <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.68rem' }}>
                            newest {RECENT_ENTRY_LIMIT} of {entries.length}
                        </Typography>
                    ) : undefined}
                />
                {ledgerLoading ? (
                    <Stack spacing={1}>
                        <Skeleton height={20} />
                        <Skeleton height={20} width="80%" />
                    </Stack>
                ) : !containerId ? (
                    <Typography variant="body2" sx={{ color: neutral[400] }}>
                        This balance is not linked to a store container, so its ledger cannot be traced.
                    </Typography>
                ) : recent.length === 0 ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <HistoryOutlinedIcon sx={{ fontSize: 17, color: neutral[300] }} />
                        <Typography variant="body2" sx={{ color: neutral[400] }}>
                            Nothing has moved this line since the ledger began recording.
                        </Typography>
                    </Stack>
                ) : (
                    <Stack divider={<Divider sx={{ borderColor: border.subtle }} />}>
                        {recent.map((e) => {
                            const meta = REASON_META[e.reason] ?? { label: e.reason, tone: neutral[500] };
                            const inward = e.quantityDelta > 0;
                            return (
                                <Stack
                                    key={e.id}
                                    direction="row"
                                    spacing={1.25}
                                    alignItems="center"
                                    sx={{ py: 1 }}
                                >
                                    <Box sx={{
                                        width: 26, height: 26, borderRadius: 1.25, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        bgcolor: alpha(inward ? statusTokens.success.main : statusTokens.danger.main, 0.09),
                                        color: inward ? statusTokens.success.strong : statusTokens.danger.main,
                                    }}
                                    >
                                        {inward
                                            ? <SouthWestIcon sx={{ fontSize: 14 }} />
                                            : <NorthEastIcon sx={{ fontSize: 14 }} />}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: meta.tone, fontSize: '0.82rem' }}>
                                            {meta.label}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: neutral[500], fontSize: '0.68rem' }}>
                                            {fmtDateTime(e.occurredAt) ?? 'date not recorded'}
                                            {e.note ? ` · ${e.note}` : ''}
                                        </Typography>
                                    </Box>
                                    <Stack alignItems="flex-end" sx={{ flexShrink: 0 }}>
                                        <Typography sx={{
                                            fontWeight: 700, fontSize: '0.82rem',
                                            fontVariantNumeric: 'tabular-nums',
                                            color: inward ? statusTokens.success.strong : statusTokens.danger.main,
                                        }}
                                        >
                                            {inward ? '+' : ''}{e.quantityDelta.toLocaleString()}
                                        </Typography>
                                        <Tooltip title="Running balance after this change" arrow>
                                            <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.66rem', fontVariantNumeric: 'tabular-nums' }}>
                                                → {e.balanceAfter.toLocaleString()}
                                            </Typography>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            );
                        })}
                    </Stack>
                )}
            </SectionCard>

            {/* Footer action */}
            <Box>
                <Divider sx={{ borderColor: border.subtle, mb: 2 }} />
                <Stack direction="row" justifyContent="flex-end">
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        color="primary"
                        sx={{
                            minWidth: 140,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '8px',
                            boxShadow: 'none',
                            '&:hover': { boxShadow: 'none' },
                        }}
                    >
                        Close
                    </Button>
                </Stack>
            </Box>
        </Stack>
    );
};

export default StoreDetails;
