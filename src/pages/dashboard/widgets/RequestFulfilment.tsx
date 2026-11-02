/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo, useState } from 'react';
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import { Bar } from 'react-chartjs-2';
import { neutral, surface } from '../../../utils/tokens';
import { FULFILMENT_COLOURS, SEGMENT_GAP_PX, axisStyle, tooltipStyle } from '../chartTheme';
import { IRequestFulfilment } from '../interface';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';
import FulfilmentRingsView from './FulfilmentRingsView';
import { buildFulfilmentRings } from './fulfilmentRings';

type FulfilmentView = 'rings' | 'bars';

/** Each viewer's last choice, in their own browser. A convenience only: unreadable means the default. */
const VIEW_KEY = 'dashboard.requestFulfilment.view';

const readView = (): FulfilmentView => {
    try {
        return window.localStorage.getItem(VIEW_KEY) === 'bars' ? 'bars' : 'rings';
    } catch {
        return 'rings';
    }
};

const saveView = (view: FulfilmentView) => {
    try {
        window.localStorage.setItem(VIEW_KEY, view);
    } catch {
        // Private window or blocked storage: the choice simply is not remembered.
    }
};

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
 * Two views of the same rows, switched in the header, and the rings are the default:
 *   - **Rings** (`FulfilmentRingsView`): each category's share of requests, split into delivered and
 *     outstanding. Largest five categories, the rest as "Other".
 *   - **Bars**: two series stacked horizontally, so each bar's full length is what was asked for and
 *     the split shows how much of it landed. Every category, side by side.
 * Both read the same `fulfilment` rows and the headline above them is shared, so switching changes
 * the picture and never the figures.
 */
const RequestFulfilment = ({ fulfilment, scope }: IRequestFulfilmentProps) => {
    const { data, loading, failed, reload } = fulfilment;
    const [view, setView] = useState<FulfilmentView>(readView);
    const rings = useMemo(() => buildFulfilmentRings(data), [data]);

    const changeView = (_event: unknown, next: FulfilmentView | null) => {
        if (!next) return; // a second click on the selected button: keep the view
        setView(next);
        saveView(next);
    };

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
            helpText={view === 'rings'
                ? 'How much of what was requested has actually been delivered, per category. Outer ring: each category\'s share of everything requested; the five largest have their own colour and the rest are grouped as Other. Inner ring: the solid part was delivered, the pale part is still outstanding. The table lists the least delivered first.'
                : 'How much of what was requested has actually been delivered, per category. The outstanding portion is demand still waiting to be met.'}
            actions={
                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={view}
                    onChange={changeView}
                    aria-label="Chart view"
                    sx={{ '& .MuiToggleButton-root': { px: 1, py: 0.5, color: neutral[500] } }}
                >
                    {/* `title`, not a Tooltip: the group hands its selection to its direct children. */}
                    <ToggleButton value="rings" aria-label="Rings view" title="Rings">
                        <DonutLargeOutlinedIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="bars" aria-label="Bars view" title="Bars">
                        <BarChartOutlinedIcon fontSize="small" />
                    </ToggleButton>
                </ToggleButtonGroup>
            }
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

                {/* The bars' two colours need this key; the rings carry their own legend. */}
                {view === 'bars' && <Stack direction="row" spacing={2}>
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
                </Stack>}
            </Stack>

            {view === 'rings' ? (
                <FulfilmentRingsView rings={rings} />
            ) : (
                <Box sx={{ height: plotHeight, position: 'relative' }}>
                    <Bar data={chartData} options={options} />
                </Box>
            )}
        </WidgetCard>
    );
};

export default RequestFulfilment;
