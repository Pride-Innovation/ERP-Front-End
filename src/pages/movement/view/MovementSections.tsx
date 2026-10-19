/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { brand, neutral } from '../../../utils/tokens';
import { IMovement, IMovementItem } from '../interface';
import { Field, GroupLabel, listSx, PersonValue } from './parts';

/**
 * The bodies of the Items and Details cards on the movement detail page.
 *
 * <p>Both used to carry more structure than their content: Items was a full data table — its own
 * border inside the card's, an uppercase tinted head, zebra rows and a row-number column — for what
 * is usually a handful of lines; Details gave each person a different accent colour, put every label
 * in letter-spaced capitals and quoted the remarks in italics. They now share the Documents card's
 * vocabulary (`./parts`), so the page reads as one design rather than three.
 */

const MONO = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "2 assets · 14 units" — the card's subtitle, without the "(s)". */
export const itemsSummary = (items: IMovementItem[]): string => {
    if (items.length === 0) return 'Assets and consumables on this movement';
    const assets = items.filter((it) => it.asset).length;
    const units = items.reduce((sum, it) => sum + (it.asset ? 1 : Number(it.quantity) || 0), 0);
    return `${plural(assets, 'asset')} · ${plural(units, 'unit')} in total`;
};

// ── Items ───────────────────────────────────────────────────────────────────

const ItemRow = ({ item }: { item: IMovementItem }) => {
    const isAsset = !!item.asset;
    const name = (isAsset ? item.asset?.assetName : item.commodity?.name) ?? 'Unnamed item';
    const reference = isAsset ? (item.asset?.engravedNumber || item.serialNumber || item.assetTag) : null;
    const qty = isAsset ? 1 : Number(item.quantity) || 0;
    return (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1.5, py: 1.25 }}>
            <Box sx={{
                width: 32, height: 32, borderRadius: '6px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: neutral[100], color: neutral[500],
            }}
            >
                {isAsset ? <FingerprintIcon sx={{ fontSize: 16 }} /> : <Inventory2OutlinedIcon sx={{ fontSize: 16 }} />}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap title={name} sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[800], lineHeight: 1.4 }}>
                    {name}
                </Typography>
                <Typography noWrap sx={{ fontSize: '0.8rem', color: neutral[500], lineHeight: 1.4 }}>
                    {isAsset ? 'Serialized asset' : 'Consumable'}
                    {reference && (
                        <>
                            <Box component="span" sx={{ mx: 0.75, color: neutral[300] }}>·</Box>
                            <Box component="span" sx={{ fontFamily: MONO, letterSpacing: '-0.01em', color: neutral[600] }}>{reference}</Box>
                        </>
                    )}
                </Typography>
            </Box>
            <Typography sx={{ flexShrink: 0, fontSize: '0.875rem', fontWeight: 600, color: neutral[800], fontVariantNumeric: 'tabular-nums' }}>
                {qty}
                <Box component="span" sx={{ fontWeight: 400, color: neutral[500], ml: 0.5 }}>{qty === 1 ? 'unit' : 'units'}</Box>
            </Typography>
        </Stack>
    );
};

/**
 * Past this many lines the list scrolls inside the card, so a large replenishment does not push the
 * documents and details off the bottom of the screen.
 */
const SCROLL_AFTER = 8;

export const ItemList = ({ items }: { items: IMovementItem[] }) => {
    if (items.length === 0) {
        return <Typography sx={{ fontSize: '0.875rem', color: neutral[500] }}>No items are listed on this movement.</Typography>;
    }
    return (
        <Box sx={{ ...listSx, ...(items.length > SCROLL_AFTER && { maxHeight: 58 * SCROLL_AFTER, overflowY: 'auto' }) }}>
            {items.map((it, i) => <ItemRow key={it.id ?? i} item={it} />)}
        </Box>
    );
};

// ── Details ─────────────────────────────────────────────────────────────────

const fmtDate = (d?: string | null) =>
    (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null);
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const fullName = (u?: { firstName?: string; lastName?: string } | null) =>
    (u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || null : null);

/** The record's life as a short vertical timeline: a filled dot for what has happened. */
const RecordTimeline = ({ entries }: { entries: Array<[string, string | null | undefined]> }) => (
    <Box>
        {entries.map(([label, value], i) => {
            const last = i === entries.length - 1;
            return (
                <Stack key={label} direction="row" spacing={1.5} alignItems="stretch">
                    <Stack alignItems="center" sx={{ width: 10, flexShrink: 0, pt: 0.6 }}>
                        <Box sx={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            bgcolor: value ? brand[500] : '#fff',
                            border: `1.5px solid ${value ? brand[500] : neutral[300]}`,
                        }}
                        />
                        {!last && <Box sx={{ width: '1.5px', flex: 1, bgcolor: neutral[200], my: 0.5 }} />}
                    </Stack>
                    <Box sx={{ pb: last ? 0 : 1.75, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: neutral[500], mb: 0.25 }}>{label}</Typography>
                        {value ? (
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[800] }}>
                                {fmtDate(value)}
                                <Box component="span" sx={{ fontWeight: 400, color: neutral[500], ml: 0.75 }}>{fmtTime(value)}</Box>
                            </Typography>
                        ) : (
                            <Typography sx={{ fontSize: '0.875rem', color: neutral[400] }}>Not yet</Typography>
                        )}
                    </Box>
                </Stack>
            );
        })}
    </Box>
);

/**
 * Three groups — who was involved, how it was received, how the record moved — side by side on a
 * wide screen with a hairline between them, stacked on a narrow one.
 */
export const DetailsPanel = ({ movement, recipient, receiptStatus }: {
    movement: IMovement;
    recipient?: string | null;
    /** Rendered by the page, which owns the receipt-status vocabulary. */
    receiptStatus?: ReactNode;
}) => {
    const initiator = fullName(movement.initiator);
    const officer = fullName(movement.receivingOfficer);
    const received = !!movement.receiptDate || !!officer;
    const linked = [
        movement.request ? `Request #${movement.request.id}` : null,
        movement.repair ? `Repair #${movement.repair.id}` : null,
    ].filter(Boolean).join(' · ');

    return (
        <Box sx={{
            display: 'grid', gap: { xs: 3, md: 0 }, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            '& > *': { px: { md: 3 } },
            '& > *:first-of-type': { pl: { md: 0 } },
            '& > *:last-of-type': { pr: { md: 0 } },
            '& > * + *': { borderLeft: { md: `1px solid ${neutral[100]}` } },
        }}
        >
            <Box>
                <GroupLabel>Parties</GroupLabel>
                <Stack spacing={1.75}>
                    <Field label="Initiated by">{initiator && <PersonValue name={initiator} />}</Field>
                    {recipient && <Field label="Recipient"><PersonValue name={recipient} /></Field>}
                    {linked && <Field label="Linked to">{linked}</Field>}
                </Stack>
            </Box>

            <Box>
                <GroupLabel>Receiving</GroupLabel>
                <Stack spacing={1.75}>
                    {/* Before receipt the fields would each say so; once is enough. */}
                    {received ? (
                        <>
                            <Field label="Received by">{officer && <PersonValue name={officer} />}</Field>
                            <Field label="Received on">{fmtDate(movement.receiptDate)}</Field>
                        </>
                    ) : (
                        <Typography sx={{ fontSize: '0.875rem', color: neutral[500] }}>Not received yet.</Typography>
                    )}
                    {receiptStatus != null && <Field label="Condition on receipt">{receiptStatus}</Field>}
                    {movement.remarks && (
                        <Field label="Remarks">
                            <Typography sx={{ fontSize: '0.875rem', color: neutral[700], lineHeight: 1.55, wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                                {movement.remarks}
                            </Typography>
                        </Field>
                    )}
                </Stack>
            </Box>

            <Box>
                <GroupLabel>Record</GroupLabel>
                <RecordTimeline entries={[
                    ['Created', movement.createDate],
                    ['Last modified', movement.lastModified],
                    ['Completed', movement.completionDate],
                ]}
                />
            </Box>
        </Box>
    );
};
