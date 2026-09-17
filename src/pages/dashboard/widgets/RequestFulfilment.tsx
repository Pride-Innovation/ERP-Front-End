/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import { Bar } from 'react-chartjs-2';
import { neutral, surface } from '../../../utils/tokens';
import { FULFILMENT_COLOURS, SEGMENT_GAP_PX, axisStyle, tooltipStyle } from '../chartTheme';
import { IRequestFulfilment } from '../interface';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';

interface IRequestFulfilmentProps {
    fulfilment: IAsyncData<IRequestFulfilment[]>;
    scope: string;
}

/**
 * Requested vs actually delivered, per category, for the current year.
 *
 * Replaces a widget built entirely on a `MOCK_DATA` table of invented monthly submitted /
 * approved / rejected / pending counts. There is no endpoint behind a status-by-month
 * breakdown, so rather than keep fabricating one this answers the question the available data
 * genuinely supports — and arguably the more useful one: where is demand not being met.
 *
 * Two series, stacked horizontally, so each bar's full length is what was asked for and the
 * split shows how much of it landed. Both series are direct-labelled and legended.
 */
const RequestFulfilment = ({ fulfilment, scope }: IRequestFulfilmentProps) => {
    const { data, loading, failed, reload } = fulfilment;

    const rows = useMemo(
        () => [...data]
            .filter((row) => (Number(row.totalRequested) || 0) > 0)
            .sort((a, b) => (Number(b.totalRequested) || 0) - (Number(a.totalRequested) || 0)),
        [data],
    );

    const totals = rows.reduce(
        (acc, row) => ({
            requested: acc.requested + (Number(row.totalRequested) || 0),
            delivered: acc.delivered + (Number(row.totalDelivered) || 0),
        }),
        { requested: 0, delivered: 0 },
    );
    const fulfilmentRate = totals.requested > 0
        ? Math.round((totals.delivered / totals.requested) * 100)
        : 0;

    const plotHeight = Math.max(200, rows.length * 34);

    const chartData = {
        labels: rows.map((row) => row.assetType),
        datasets: [
            {
                label: 'Delivered',
                data: rows.map((row) => Number(row.totalDelivered) || 0),
                backgroundColor: FULFILMENT_COLOURS.delivered,
                borderColor: surface.card,
                borderWidth: { right: SEGMENT_GAP_PX } as any,
                borderRadius: 3,
                borderSkipped: false,
                barThickness: 18,
                maxBarThickness: 22,
                stack: 'requests',
            },
            {
                label: 'Outstanding',
                data: rows.map((row) => Math.max(
                    (Number(row.totalRequested) || 0) - (Number(row.totalDelivered) || 0),
                    0,
                )),
                backgroundColor: FULFILMENT_COLOURS.outstanding,
                borderRadius: 3,
                borderSkipped: false,
                barThickness: 18,
                maxBarThickness: 22,
                stack: 'requests',
            },
        ],
    };

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                ...tooltipStyle,
                callbacks: {
                    label: (context: any) => ` ${context.dataset.label}: ${(Number(context.raw) || 0).toLocaleString()}`,
                    footer: (items: any[]) => {
                        const total = items.reduce((sum, item) => sum + (Number(item.raw) || 0), 0);
                        return `Requested: ${total.toLocaleString()}`;
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
        { label: 'Delivered', colour: FULFILMENT_COLOURS.delivered, value: totals.delivered },
        { label: 'Outstanding', colour: FULFILMENT_COLOURS.outstanding, value: totals.requested - totals.delivered },
    ];

    return (
        <WidgetCard
            title="Request Fulfilment"
            subtitle={`This year · ${scope}`}
            icon={<AssignmentTurnedInOutlinedIcon />}
            helpText="How much of what was requested has actually been delivered, per category. The outstanding portion is demand still waiting to be met."
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={rows.length === 0}
            emptyTitle="No requests this year"
            emptyDescription="Fulfilment appears once requests have been raised against a category."
        >
            <Stack
                direction="row"
                alignItems="baseline"
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 1.5, flexWrap: 'wrap', rowGap: 1 }}
            >
                <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: neutral[900], lineHeight: 1 }}>
                        {fulfilmentRate}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: neutral[500] }}>
                        of {totals.requested.toLocaleString()} requested items delivered
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={2}>
                    {legend.map((entry) => (
                        <Stack key={entry.label} direction="row" alignItems="center" spacing={0.75}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: entry.colour }} />
                            <Typography variant="caption" sx={{ color: neutral[600] }}>
                                {entry.label}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, color: neutral[900], fontVariantNumeric: 'tabular-nums' }}
                            >
                                {Math.max(entry.value, 0).toLocaleString()}
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

export default RequestFulfilment;
