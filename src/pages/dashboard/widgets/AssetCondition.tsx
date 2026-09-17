/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { neutral } from '../../../utils/tokens';
import { CONDITION_COLOURS } from '../chartTheme';
import { IAssetTypeStats } from '../interface';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';

interface IAssetConditionProps {
    stats: IAsyncData<IAssetTypeStats[]>;
    scope: string;
}

/**
 * How the register splits across in-use / in-store / in-repair.
 *
 * This replaces a widget that was entirely fabricated — it carried a hardcoded `MOCK_TOTAL`
 * of 620 assets and four invented segments, presented on screen as if they were the bank's
 * real figures. Every number here now comes from `/assets/statistics`.
 *
 * Disposed is now a real segment. It was dropped when this widget was rebuilt because the
 * statistics projection did not return the field — and its absence turned out to be worse than
 * cosmetic: the server folded disposed assets into `assigned`, so the In Use figure counted items
 * the bank had already written off. The projection now returns it and the four counts partition the
 * total exactly.
 *
 * Form: a utilisation meter over three labelled counts. It was a stacked bar until "Assets by
 * Category" began showing the same three states per category — at which point this was the
 * fourth horizontal bar on one page and said nothing the chart above it did not. A meter asks a
 * different question (one ratio against its limit) and reads differently at a glance, which is
 * the point.
 *
 * The counts below the meter keep their swatches, so the condition colours still mean the same
 * thing here as they do in the chart above.
 */
const AssetCondition = ({ stats, scope }: IAssetConditionProps) => {
    const { data, loading, failed, reload } = stats;

    const segments = useMemo(() => {
        const totals = data.reduce(
            (acc, row) => ({
                inUse: acc.inUse + (Number(row.assigned) || 0),
                inStore: acc.inStore + (Number(row.unassigned) || 0),
                inRepair: acc.inRepair + (Number(row.inMaintenance) || 0),
                disposed: acc.disposed + (Number(row.disposed) || 0),
            }),
            { inUse: 0, inStore: 0, inRepair: 0, disposed: 0 },
        );

        return [
            {
                key: 'inUse',
                label: 'In Use',
                value: totals.inUse,
                colour: CONDITION_COLOURS.inUse,
                icon: <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />,
                hint: 'Assigned to a person or location.',
            },
            {
                key: 'inStore',
                label: 'In Store',
                value: totals.inStore,
                colour: CONDITION_COLOURS.inStore,
                icon: <Inventory2OutlinedIcon sx={{ fontSize: 15 }} />,
                hint: 'On the register but not yet assigned.',
            },
            {
                key: 'inRepair',
                label: 'In Repair',
                value: totals.inRepair,
                colour: CONDITION_COLOURS.inRepair,
                icon: <BuildOutlinedIcon sx={{ fontSize: 15 }} />,
                hint: 'Out of service for maintenance.',
            },
            {
                key: 'disposed',
                label: 'Disposed',
                value: totals.disposed,
                colour: CONDITION_COLOURS.disposed,
                icon: <DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />,
                hint: 'Written off. Still on the register, but no longer in service.',
            },
        ];
    }, [data]);

    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    /*
     * Utilisation is measured against the live estate, not the register.
     *
     * Including disposed assets in the denominator would make the figure fall every time something
     * was written off — which reads as the bank using its equipment less, when the opposite is
     * true. The meter answers "of what we still have, how much is deployed".
     */
    const disposed = segments.find((segment) => segment.key === 'disposed')?.value ?? 0;
    const live = total - disposed;
    const utilisation = live > 0 ? Math.round((segments[0].value / live) * 100) : 0;

    return (
        <WidgetCard
            title="Asset Condition"
            subtitle={scope}
            icon={<MonitorHeartOutlinedIcon />}
            helpText="How the estate splits between deployed, idle in a store, out for repair, and written off. The headline percentage is measured against what is still in service, so disposing of an asset does not make utilisation appear to fall."
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={total === 0}
            emptyTitle="No assets to assess"
            emptyDescription="Condition appears once there are assets on the register."
        >
            <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: neutral[900], lineHeight: 1 }}>
                    {utilisation}%
                </Typography>
                <Typography variant="body2" sx={{ color: neutral[500] }}>
                    in active use
                </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: neutral[500], mt: 0.5, display: 'block' }}>
                {live.toLocaleString()} in service
                {disposed > 0 && ` · ${disposed.toLocaleString()} disposed`}
            </Typography>

            {/* A meter, not a stacked bar. The three-way split now sits per category in "Assets by
                Category"; repeating it here as a second part-to-whole said the same thing twice in
                the same form. A meter answers a different question — one ratio against its limit —
                so the two widgets no longer look or read alike. Single hue on a neutral track,
                because there is only one quantity here. */}
            <Tooltip
                arrow
                placement="top"
                title={`${segments[0].value.toLocaleString()} of ${live.toLocaleString()} assets still in service are assigned`}
            >
                <Box
                    role="meter"
                    aria-valuenow={utilisation}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Share of the register in active use"
                    sx={{
                        height: 10,
                        borderRadius: 999,
                        mt: 2.5,
                        bgcolor: neutral[150],
                        overflow: 'hidden',
                        cursor: 'default',
                    }}
                >
                    <Box
                        sx={{
                            width: `${utilisation}%`,
                            height: '100%',
                            borderRadius: 999,
                            bgcolor: CONDITION_COLOURS.inUse,
                            transition: 'width 240ms ease-out',
                        }}
                    />
                </Box>
            </Tooltip>

            {/* Legend doubling as the direct-label row — identity is never colour alone. */}
            <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                {segments.map((segment) => (
                    <Stack key={segment.key} direction="row" alignItems="center" spacing={1.25}>
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '2px',
                                bgcolor: segment.colour,
                                flexShrink: 0,
                            }}
                        />
                        <Box sx={{ color: neutral[400], display: 'flex', alignItems: 'center' }}>
                            {segment.icon}
                        </Box>
                        <Tooltip title={segment.hint} arrow placement="top">
                            <Typography
                                variant="body2"
                                sx={{ color: neutral[600], flexGrow: 1, cursor: 'help' }}
                            >
                                {segment.label}
                            </Typography>
                        </Tooltip>
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: neutral[900], fontVariantNumeric: 'tabular-nums' }}
                        >
                            {segment.value.toLocaleString()}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ color: neutral[500], width: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                        >
                            {/* Disposed is a share of the whole register; the live states are a
                                share of what is still in service, matching the meter above. */}
                            {segment.key === 'disposed'
                                ? (total > 0 ? `${Math.round((segment.value / total) * 100)}%` : '—')
                                : (live > 0 ? `${Math.round((segment.value / live) * 100)}%` : '—')}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </WidgetCard>
    );
};

export default AssetCondition;
