/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    alpha, Box, Chip, CircularProgress, Paper, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import { EmptyState } from '../../components/layout';
import { dataHeadCellSx, dataBodyCellSx, dataRowSx, dataSurfaceSx } from '../../components/tables/dataTableSx';
import { brand, neutral, status as statusTokens } from '../../utils/tokens';
import { fetchLedgerHistoryService } from './service';

/** One ledger entry, as the backend records it. */
interface ILedgerEntry {
    id: number;
    quantityDelta: number;
    balanceAfter: number;
    reason: string;
    sourceType?: string | null;
    sourceId?: number | null;
    note?: string | null;
    occurredAt?: string | null;
    actorId?: number | null;
}

/**
 * Plain-English labels for the ledger's reason vocabulary, with the colour each reads in.
 *
 * <p>The enum names are precise but internal — a storekeeper looking for "where did 40 reams go"
 * should not have to know that leaving a store on the way to another is `TRANSFER_OUT`.
 */
const REASON_META: Record<string, { label: string; tone: string }> = {
    RECEIPT: { label: 'Goods received', tone: statusTokens.success.strong },
    ISSUANCE: { label: 'Issued to a person', tone: statusTokens.info.strong },
    TRANSFER_OUT: { label: 'Sent to another store', tone: statusTokens.warning.strong },
    TRANSFER_IN: { label: 'Arrived from another store', tone: statusTokens.success.strong },
    CUSTODY_OUT: { label: 'Handed to a courier', tone: statusTokens.warning.strong },
    CUSTODY_IN: { label: 'Taken from a courier', tone: statusTokens.success.strong },
    RETURN_TO_STORE: { label: 'Returned by a holder', tone: statusTokens.success.strong },
    STOCK_TAKE: { label: 'Stock-take correction', tone: '#4338CA' },
    STOCK_REVERSAL: { label: 'Receipt reversed', tone: statusTokens.danger.main },
    UNSPECIFIED: { label: 'Not recorded', tone: neutral[500] },
};

const fmtWhen = (d?: string | null) =>
    (d ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }) : '—');

/**
 * How one commodity in one store reached its current quantity.
 *
 * <p>The balances table answers "how much is there"; this answers "why". Every module that touches
 * stock — stocking, issuance, each leg of a movement, stock takes — writes an entry here with its
 * reason, so a number that looks wrong can be traced to the act that produced it rather than to a
 * backend log.
 */
const LedgerHistoryModal = ({
    storeId,
    commodityId,
    storeName,
    commodityName,
    currentQuantity,
}: {
    storeId: number;
    commodityId: number;
    storeName?: string | null;
    commodityName?: string | null;
    currentQuantity: number;
}) => {
    const [entries, setEntries] = useState<ILedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = (await fetchLedgerHistoryService(storeId, commodityId)) as any;
                setEntries(res?.status === 200 ? res.data ?? [] : []);
            } finally {
                setLoading(false);
            }
        })();
    }, [storeId, commodityId]);

    /**
     * What the ledger says the balance should be — the newest entry's running total.
     *
     * <p>Shown beside the live balance because a mismatch is the whole point of keeping a ledger: it
     * means something moved stock without recording why.
     */
    const ledgerBalance = entries.length > 0 ? entries[0].balanceAfter : null;
    const outOfSync = ledgerBalance !== null && ledgerBalance !== currentQuantity;

    return (
        <Stack spacing={2.5}>
            <Stack
                direction="row" spacing={1.5} alignItems="flex-start"
                sx={{
                    p: 1.75, borderRadius: 2.5,
                    bgcolor: alpha(brand[500], 0.04),
                    border: `1px solid ${alpha(brand[500], 0.14)}`,
                }}
            >
                <Box sx={{
                    width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(brand[500], 0.1), color: brand[500],
                }}
                >
                    <HistoryOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.3 }}>
                        {commodityName ?? 'Commodity'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: neutral[600], fontSize: '0.78rem' }}>
                        {storeName ?? 'Store'} · every movement of this line, newest first
                    </Typography>
                </Box>
                <Stack alignItems="flex-end" spacing={0.25}>
                    <Typography variant="caption" sx={{ color: neutral[500], fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        ON HAND
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: neutral[900], fontVariantNumeric: 'tabular-nums' }}>
                        {currentQuantity.toLocaleString()}
                    </Typography>
                </Stack>
            </Stack>

            {outOfSync && (
                <Stack
                    direction="row" spacing={1.25} alignItems="center"
                    sx={{
                        p: 1.5, borderRadius: 2,
                        bgcolor: alpha(statusTokens.danger.main, 0.06),
                        border: `1px solid ${alpha(statusTokens.danger.main, 0.22)}`,
                    }}
                >
                    <Typography variant="caption" sx={{ color: statusTokens.danger.strong, fontWeight: 600 }}>
                        The ledger totals <strong>{ledgerBalance?.toLocaleString()}</strong> but the balance
                        reads <strong>{currentQuantity.toLocaleString()}</strong>. Something changed this line
                        without recording why — entries written before the ledger existed will also show this.
                    </Typography>
                </Stack>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={24} /></Box>
            ) : entries.length === 0 ? (
                <EmptyState
                    variant="inline"
                    title="No ledger entries"
                    description="Nothing has moved this line since the ledger began recording."
                    icon={<HistoryOutlinedIcon />}
                />
            ) : (
                <Paper elevation={0} sx={dataSurfaceSx}>
                    <TableContainer sx={{ maxHeight: 420 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...dataHeadCellSx, minWidth: 150 }}>When</TableCell>
                                    <TableCell sx={{ ...dataHeadCellSx, minWidth: 180 }}>What happened</TableCell>
                                    <TableCell sx={{ ...dataHeadCellSx, minWidth: 120 }}>Source</TableCell>
                                    <TableCell align="right" sx={{ ...dataHeadCellSx, minWidth: 90 }}>Change</TableCell>
                                    <TableCell align="right" sx={{ ...dataHeadCellSx, minWidth: 90 }}>Balance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {entries.map((e, i) => {
                                    const meta = REASON_META[e.reason] ?? { label: e.reason, tone: neutral[500] };
                                    const inward = e.quantityDelta > 0;
                                    return (
                                        <TableRow key={e.id} hover={false} sx={dataRowSx(i)}>
                                            <TableCell sx={{ ...dataBodyCellSx, color: neutral[600], whiteSpace: 'nowrap' }}>
                                                {fmtWhen(e.occurredAt)}
                                            </TableCell>
                                            <TableCell sx={dataBodyCellSx}>
                                                <Chip
                                                    size="small"
                                                    label={meta.label}
                                                    sx={{
                                                        height: 20, fontSize: '0.66rem', fontWeight: 700,
                                                        bgcolor: alpha(meta.tone, 0.1), color: meta.tone,
                                                    }}
                                                />
                                                {e.note && (
                                                    <Typography variant="caption" sx={{ color: neutral[500], display: 'block', mt: 0.4 }}>
                                                        {e.note}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ ...dataBodyCellSx, color: neutral[500], fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                                {e.sourceType ? `${e.sourceType}${e.sourceId ? ` #${e.sourceId}` : ''}` : '—'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ ...dataBodyCellSx, fontVariantNumeric: 'tabular-nums' }}>
                                                <Stack direction="row" spacing={0.4} alignItems="center" justifyContent="flex-end">
                                                    {inward
                                                        ? <SouthWestIcon sx={{ fontSize: 13, color: statusTokens.success.strong }} />
                                                        : <NorthEastIcon sx={{ fontSize: 13, color: statusTokens.danger.main }} />}
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            fontWeight: 700, fontSize: '0.8rem',
                                                            color: inward ? statusTokens.success.strong : statusTokens.danger.main,
                                                        }}
                                                    >
                                                        {inward ? '+' : ''}{e.quantityDelta.toLocaleString()}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{ ...dataBodyCellSx, fontWeight: 700, color: neutral[900], fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {e.balanceAfter.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <Tooltip title="Entries are written by whichever module moved the stock — stocking, issuance, movements, stock takes" arrow>
                <Typography variant="caption" sx={{ color: neutral[400], alignSelf: 'flex-start' }}>
                    {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} · running balance shown after each change
                </Typography>
            </Tooltip>
        </Stack>
    );
};

export default LedgerHistoryModal;
