/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo, useState } from 'react';
import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Line } from 'react-chartjs-2';
import { alpha } from '@mui/material/styles';
import { border, neutral } from '../../../utils/tokens';
import { CHART_TEAL, axisStyle, tooltipStyle } from '../chartTheme';
import { IMonthlyStockRow } from '../interface';
import { IAsyncData } from '../useDashboardData';
import { ICategoryRegistry, categoryKey } from '../categories';
import WidgetCard from './WidgetCard';

interface IStockTrendProps {
    stocking: IAsyncData<IMonthlyStockRow[]>;
    categories: ICategoryRegistry;
    scope: string;
}

const ALL = '__all__';

/** Turns "2026-03" into "Mar 26"; passes anything else through untouched. */
const monthLabel = (raw: string): string => {
    const match = /^(\d{4})-(\d{2})$/.exec(raw || '');
    if (!match) return raw;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
};

/**
 * Six months of stocking volume.
 *
 * Replaces a widget whose entire dataset was hardcoded — it carried invented 2024/2025 arrays
 * keyed by "IT Equipment" / "Office Equipment" / "Fleet", categories that no longer exist.
 *
 * One line, not twelve. A line per category would be unreadable at the current category count,
 * so the default view is the total and a filter focuses a single category. That keeps one
 * series on screen at a time, which needs no legend and no categorical palette.
 *
 * The category keys are read from the response rather than assumed, so a category added in
 * Settings shows up in the filter without a code change.
 */
const StockTrend = ({ stocking, categories, scope }: IStockTrendProps) => {
    const { data, loading, failed, reload } = stocking;
    const [selected, setSelected] = useState<string>(ALL);

    // Every key except `month` is a category total. Reading them off the payload is what keeps
    // this working as categories are renamed or added server-side.
    const seriesKeys = useMemo(() => {
        const keys = new Set<string>();
        data.forEach((row) => {
            Object.keys(row).forEach((key) => {
                if (key !== 'month') keys.add(key);
            });
        });
        return Array.from(keys);
    }, [data]);

    /** Maps a payload key back to its configured display name where one exists. */
    const displayName = useMemo(() => {
        const lookup = new Map<string, string>();
        seriesKeys.forEach((key) => {
            const match = categories.all.find((category) => category.key === categoryKey(key));
            lookup.set(key, match?.name ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim());
        });
        return lookup;
    }, [seriesKeys, categories.all]);

    const points = useMemo(
        () => data.map((row) => {
            if (selected === ALL) {
                return seriesKeys.reduce((total, key) => total + (Number(row[key]) || 0), 0);
            }
            return Number(row[selected]) || 0;
        }),
        [data, seriesKeys, selected],
    );

    const labels = useMemo(() => data.map((row) => monthLabel(row.month)), [data]);
    const periodTotal = points.reduce((sum, point) => sum + point, 0);

    const chartData = {
        labels,
        datasets: [
            {
                label: selected === ALL ? 'All categories' : displayName.get(selected) ?? selected,
                data: points,
                borderColor: CHART_TEAL,
                backgroundColor: alpha(CHART_TEAL, 0.08),
                borderWidth: 2,
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: CHART_TEAL,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                ...tooltipStyle,
                callbacks: {
                    label: (context: any) => ` ${(Number(context.raw) || 0).toLocaleString()} items stocked`,
                },
            },
        },
        scales: {
            x: { ...axisStyle, grid: { display: false } },
            y: {
                ...axisStyle,
                beginAtZero: true,
                ticks: { ...axisStyle.ticks, precision: 0 },
            },
        },
    };

    return (
        <WidgetCard
            title="Stocking Trend"
            subtitle={`Last 6 months · ${scope}`}
            icon={<TrendingUpIcon />}
            helpText="Quantities received into stock each month. Use the filter to focus a single category; the default shows every category combined."
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={data.length === 0}
            emptyTitle="No stocking recorded"
            emptyDescription="Once goods are received against an order, monthly volumes appear here."
            actions={
                <Select
                    size="small"
                    value={selected}
                    onChange={(event) => setSelected(event.target.value)}
                    sx={{
                        minWidth: 160,
                        fontSize: '0.78rem',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: border.default },
                    }}
                >
                    <MenuItem value={ALL} sx={{ fontSize: '0.8rem' }}>All categories</MenuItem>
                    {seriesKeys.map((key) => (
                        <MenuItem key={key} value={key} sx={{ fontSize: '0.8rem' }}>
                            {displayName.get(key)}
                        </MenuItem>
                    ))}
                </Select>
            }
        >
            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: neutral[900], lineHeight: 1 }}>
                    {periodTotal.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: neutral[500] }}>
                    items stocked over the period
                </Typography>
            </Stack>
            <Box sx={{ height: 260, position: 'relative' }}>
                <Line data={chartData} options={options} />
            </Box>
        </WidgetCard>
    );
};

export default StockTrend;
