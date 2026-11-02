/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { neutral, surface } from '../../../utils/tokens';
import { SEGMENT_GAP_PX, labelInkOn, tooltipStyle } from '../chartTheme';
import { IFulfilmentRings, IFulfilmentSlice, pct } from './fulfilmentRings';

/** A slice narrower than this share of the ring gets no label on the chart; the legend has it. */
const MIN_LABELLED_SHARE = 6;

const Swatch = ({ colour, size = 10 }: { colour: string; size?: number }) => (
    <Box sx={{ width: size, height: size, borderRadius: '50%', bgcolor: colour, flexShrink: 0 }} />
);

/**
 * Request Fulfilment as two rings: the outer ring is each category's share of what was requested,
 * the inner ring splits every slice into delivered (the slice's colour) and outstanding (its tint).
 *
 * The inner ring is fed raw counts, not percentages, so each slice's two parts add up to exactly the
 * slice above them and the rings line up by construction.
 *
 * The legend is the full table: every slice's share, delivered and outstanding, as counts and
 * percentages. That is what makes the small slices, the pale tints and "Other" readable, so it is
 * never optional. It lists the least delivered first - "where is demand not being met" is the
 * question the bar view answered by length, and a ring cannot.
 */
const FulfilmentRingsView = ({ rings }: { rings: IFulfilmentRings }) => {
    const { slices, requested } = rings;

    const byNeed = useMemo(
        () => [...slices].sort((a, b) => a.deliveredRate - b.deliveredRate || b.requested - a.requested),
        [slices],
    );

    /** Inner-ring index -> its slice and which half of it. */
    const innerPart = (index: number): { slice: IFulfilmentSlice; delivered: boolean } => ({
        slice: slices[Math.floor(index / 2)],
        delivered: index % 2 === 0,
    });

    const data = {
        labels: slices.map((slice) => slice.label),
        datasets: [
            {
                label: 'Requested',
                data: slices.map((slice) => slice.requested),
                backgroundColor: slices.map((slice) => slice.colour),
                borderColor: surface.card,
                borderWidth: SEGMENT_GAP_PX,
                weight: 1,
            },
            {
                label: 'Fulfilment',
                data: slices.flatMap((slice) => [slice.delivered, slice.outstanding]),
                backgroundColor: slices.flatMap((slice) => [slice.colour, slice.tint]),
                borderColor: surface.card,
                borderWidth: SEGMENT_GAP_PX,
                weight: 1.25,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '38%',
        layout: { padding: 4 },
        plugins: {
            legend: { display: false },
            tooltip: {
                ...tooltipStyle,
                callbacks: {
                    title: () => '',
                    label: (context: any) => {
                        if (context.datasetIndex === 0) {
                            const slice = slices[context.dataIndex];
                            return ` ${slice.label}: ${slice.requested.toLocaleString()} requested (${pct(slice.share)} of all)`;
                        }
                        const { slice, delivered } = innerPart(context.dataIndex);
                        const value = delivered ? slice.delivered : slice.outstanding;
                        const share = delivered ? slice.deliveredRate : 100 - slice.deliveredRate;
                        return ` ${slice.label} · ${delivered ? 'Delivered' : 'Outstanding'}: ${value.toLocaleString()} (${pct(share)})`;
                    },
                },
            },
            datalabels: {
                font: { size: 10.5, weight: 'bold' },
                textAlign: 'center',
                color: (context: any) => {
                    const fills = context.dataset.backgroundColor as string[];
                    return labelInkOn(fills[context.dataIndex]);
                },
                display: (context: any) => {
                    const value = Number(context.dataset.data[context.dataIndex]) || 0;
                    return value > 0 && (value / requested) * 100 >= MIN_LABELLED_SHARE;
                },
                formatter: (_value: number, context: any) => {
                    if (context.datasetIndex === 0) {
                        return pct(slices[context.dataIndex].share);
                    }
                    const { slice, delivered } = innerPart(context.dataIndex);
                    return pct(delivered ? slice.deliveredRate : 100 - slice.deliveredRate);
                },
            },
        },
    } as any;

    /*
     * Laid out by the card's own width, not the window's - CSS container queries.
     *
     * This first switched to side-by-side on the `md` breakpoint, which is the *window*. The card's
     * width depends on the dashboard grid, the sidebar and its neighbour, so on a small laptop the
     * window passed 900px while the card was ~560px: the fixed 260px ring left the legend a ~100px
     * column, every word wrapped onto its own line, and the card grew to three times its neighbour's
     * height. Measuring the card itself cannot be fooled by any of those.
     *
     *   content >= 560px : ring left, legend right (a ~600px card, after its own padding)
     *   narrower         : ring on top, legend full width beneath
     *   legend < 380px: the progress bars go, the figures stay
     */
    return (
        <Box sx={{ containerType: 'inline-size', containerName: 'fulfilment' }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    rowGap: 2.5,
                    columnGap: 3,
                    '@container fulfilment (min-width: 560px)': {
                        gridTemplateColumns: '240px minmax(0, 1fr)',
                        alignItems: 'center',
                    },
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 230, mx: 'auto', '@container fulfilment (min-width: 560px)': { maxWidth: 240 } }}>
                    <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
                        {/* The plugin is typed for every chart type; this chart is a doughnut. */}
                        <Doughnut data={data} options={options} plugins={[ChartDataLabels as any]} />
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 800, color: neutral[900], lineHeight: 1.1 }}>
                                {requested.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: neutral[500], lineHeight: 1.2 }}>
                                requested
                            </Typography>
                        </Stack>
                    </Box>
                    <Typography
                        variant="caption"
                        component="p"
                        sx={{ color: neutral[500], textAlign: 'center', mt: 1, mb: 0 }}
                    >
                        Outer: share · Inner: delivered / outstanding
                    </Typography>
                </Box>

                <FulfilmentLegend slices={byNeed} />
            </Box>
        </Box>
    );
};

/**
 * One row per category - share, delivered of requested, and a bar filling in the category's colour
 * over its own tint, so the row reads like its slice of the inner ring. Outstanding is what the bar
 * leaves unfilled and the gap between the two counts, so it needs no line of its own.
 */
const FulfilmentLegend = ({ slices }: { slices: IFulfilmentSlice[] }) => {
    const figure = { color: neutral[900], fontWeight: 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right' } as const;
    const heading = { color: neutral[500], fontWeight: 600, textAlign: 'right' } as const;
    const bar = { '@container legend (max-width: 379px)': { display: 'none' } } as const;

    return (
        <Box sx={{ containerType: 'inline-size', containerName: 'legend', minWidth: 0 }}>
            <Box
                role="table"
                aria-label="Request fulfilment by category, least delivered first"
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto auto 52px auto',
                    columnGap: 1.5,
                    rowGap: 0.75,
                    alignItems: 'center',
                    '@container legend (max-width: 379px)': {
                        gridTemplateColumns: 'minmax(0, 1fr) auto auto auto',
                    },
                }}
            >
                <Typography variant="caption" sx={{ color: neutral[500], fontWeight: 600 }}>Least delivered first</Typography>
                <Typography variant="caption" sx={heading}>Share</Typography>
                <Typography variant="caption" sx={heading}>Delivered</Typography>
                <Box sx={bar} />
                <Box />

                {slices.map((slice) => (
                    <Box key={slice.key} role="row" sx={{ display: 'contents' }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }} title={slice.label}>
                            <Swatch colour={slice.colour} />
                            <Typography variant="body2" sx={{ color: neutral[900], fontWeight: 600 }} noWrap>
                                {slice.label}
                            </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ ...figure, color: neutral[600], fontWeight: 500 }}>
                            {pct(slice.share)}
                        </Typography>
                        <Typography variant="caption" sx={figure}>
                            {slice.delivered.toLocaleString()} / {slice.requested.toLocaleString()}
                        </Typography>
                        <Box
                            aria-hidden
                            sx={{ ...bar, height: 6, borderRadius: 3, bgcolor: slice.tint, overflow: 'hidden' }}
                        >
                            <Box sx={{ width: `${slice.deliveredRate}%`, height: '100%', bgcolor: slice.colour }} />
                        </Box>
                        <Typography variant="caption" sx={{ ...figure, minWidth: 34 }}>
                            {pct(slice.deliveredRate)}
                        </Typography>
                        {slice.members.length > 1 && (
                            <Typography
                                variant="caption"
                                sx={{ gridColumn: '1 / -1', color: neutral[500], pl: 2.5, mt: -0.5 }}
                            >
                                {slice.members.join(', ')}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default FulfilmentRingsView;
