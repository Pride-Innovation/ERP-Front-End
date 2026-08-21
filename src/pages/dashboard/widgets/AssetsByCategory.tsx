/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { Bar } from 'react-chartjs-2';
import { neutral, surface } from '../../../utils/tokens';
import { CONDITION_COLOURS, SEGMENT_GAP_PX, axisStyle, tooltipStyle } from '../chartTheme';
import { IAssetTypeStats } from '../interface';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';

interface IAssetsByCategoryProps {
    stats: IAsyncData<IAssetTypeStats[]>;
    scope: string;
}

/**
 * Assets per category, each bar split by condition — in use / in store / in repair.
 *
 * Previously this drew `total` alone as single-hue bars, and the condition split was aggregated
 * across every category by a separate widget. Both were using half of `/assets/statistics`: the
 * endpoint returns assigned / unassigned / inMaintenance *per category*, and collapsing that to
 * one number per category threw away the only thing the bar could not already say. Stacking it
 * answers "which categories have stock stuck in maintenance", which a total cannot.
 *
 * Colour encodes condition, never category. That distinction is what keeps this legal: three
 * fixed, validated states rather than one hue per category — twelve categories would exceed the
 * eight-hue ceiling, and colouring nominal categories by their own value would just re-encode bar
 * length. Identity stays on the axis label, where the long names have room.
 *
 * The teal↔blue pair sits in the 6–8 CVD floor band, so it ships only with secondary encoding:
 * a legend, direct totals, and a 2px surface gap between segments. Do not render it bare.
 */
const AssetsByCategory = ({ stats, scope }: IAssetsByCategoryProps) => {
    const { data, loading, failed, reload } = stats;

    const rows = useMemo(
        () => [...data]
            .filter((row) => (Number(row.total) || 0) > 0)
            .sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0)),
        [data],
    );

    const totals = rows.reduce(
        (acc, row) => ({
            inUse: acc.inUse + (Number(row.assigned) || 0),
            inStore: acc.inStore + (Number(row.unassigned) || 0),
            inRepair: acc.inRepair + (Number(row.inMaintenance) || 0),
            disposed: acc.disposed + (Number(row.disposed) || 0),
            all: acc.all + (Number(row.total) || 0),
        }),
        { inUse: 0, inStore: 0, inRepair: 0, disposed: 0, all: 0 },
    );

    // Grows with the category count so bars keep a comfortable thickness instead of
    // compressing into hairlines as more categories are configured.
    const plotHeight = Math.max(220, rows.length * 34);

    const segment = (
        label: string,
        colour: string,
        pick: (row: IAssetTypeStats) => number,
        gap: boolean,
    ) => ({
        label,
        data: rows.map(pick),
        backgroundColor: colour,
        ...(gap ? { borderColor: surface.card, borderWidth: { right: SEGMENT_GAP_PX } as any } : {}),
        borderRadius: 3,
        borderSkipped: false,
        barThickness: 18,
        maxBarThickness: 22,
        stack: 'condition',
    });

    const chartData = {
        labels: rows.map((row) => row.assetType),
        datasets: [
            segment('In Use', CONDITION_COLOURS.inUse, (row) => Number(row.assigned) || 0, true),
            segment('In Store', CONDITION_COLOURS.inStore, (row) => Number(row.unassigned) || 0, true),
            segment('In Repair', CONDITION_COLOURS.inRepair, (row) => Number(row.inMaintenance) || 0, true),
            // Last in the stack: an end-state belongs at the far end of the bar, and its grey reads
            // as a tail rather than competing with the live states beside it.
            segment('Disposed', CONDITION_COLOURS.disposed, (row) => Number(row.disposed) || 0, false),
        ],
    };

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 16 } },
        plugins: {
            legend: { display: false },
            tooltip: {
                ...tooltipStyle,
                callbacks: {
                    label: (context: any) => ` ${context.dataset.label}: ${(Number(context.raw) || 0).toLocaleString()}`,
                    footer: (items: any[]) => {
                        const total = items.reduce((sum, item) => sum + (Number(item.raw) || 0), 0);
                        return `Total: ${total.toLocaleString()}`;
                    },
                },
            },
        },
        scales: {
            x: {
                ...axisStyle,
                stacked: true,
                beginAtZero: true,
                ticks: { ...axisStyle.ticks, precision: 0 },
            },
            y: {
                ...axisStyle,
                stacked: true,
                grid: { display: false },
                ticks: { ...axisStyle.ticks, color: neutral[700], font: { size: 11.5 } },
            },
        },
    };

    const legend = [
        { label: 'In Use', colour: CONDITION_COLOURS.inUse, value: totals.inUse },
        { label: 'In Store', colour: CONDITION_COLOURS.inStore, value: totals.inStore },
        { label: 'In Repair', colour: CONDITION_COLOURS.inRepair, value: totals.inRepair },
        // Only shown where there is something to show — an all-zero swatch is noise on a legend
        // that already carries three entries.
        ...(totals.disposed > 0
            ? [{ label: 'Disposed', colour: CONDITION_COLOURS.disposed, value: totals.disposed }]
            : []),
    ];

    return (
        <WidgetCard
            title="Assets by Category"
            subtitle={scope}
            icon={<CategoryOutlinedIcon />}
            helpText="Every asset on the register grouped by category, and within each category by condition — in use, in store, out for repair, or written off. Categories come from Settings → Asset Categories, so a new category appears here automatically."
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={rows.length === 0}
            emptyTitle="No assets on the register"
            emptyDescription="Once assets are stocked and categorised they will appear here, ranked by count."
        >
            <Stack
                direction="row"
                alignItems="baseline"
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}
            >
                <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: neutral[900], lineHeight: 1 }}>
                        {totals.all.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: neutral[500] }}>
                        assets across {rows.length} {rows.length === 1 ? 'category' : 'categories'}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                    {legend.map((item) => (
                        <Stack key={item.label} direction="row" alignItems="center" spacing={0.6}>
                            <Box sx={{ width: 9, height: 9, borderRadius: '2px', bgcolor: item.colour, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.72rem', color: neutral[600] }}>
                                {item.label}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: neutral[800] }}>
                                {item.value.toLocaleString()}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </Stack>

            <Box sx={{ height: plotHeight, position: 'relative' }}>
                <Bar data={chartData} options={options} />
            </Box>
        </WidgetCard>
    );
};

export default AssetsByCategory;
