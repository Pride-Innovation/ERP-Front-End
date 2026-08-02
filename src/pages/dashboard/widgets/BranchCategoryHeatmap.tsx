/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo, useState } from 'react';
import { Box, Button, Stack, Tooltip, Typography, alpha } from '@mui/material';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import { border, neutral } from '../../../utils/tokens';
import { EMPTY_CELL_FILL, SEGMENT_GAP_PX, SEQUENTIAL_TEAL } from '../chartTheme';
import { IBranchAssetCell } from '../interface';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';

interface IBranchCategoryHeatmapProps {
    cells: IAsyncData<IBranchAssetCell[]>;
}

/** Branches shown before the "show all" toggle. 54 are seeded; a dashboard widget cannot be 54 rows tall. */
const DEFAULT_ROW_LIMIT = 12;

const CELL_W = 74;
const CELL_H = 30;
const ROW_LABEL_W = 172;
/** Fixed so every column header occupies the same band and the first cell row lines up. */
const HEADER_H = 32;

/** Assets with no branch yet still count towards their category — they need a row, not silence. */
const UNASSIGNED = 'Unassigned';

/**
 * Assets across every branch, as a branch × category grid.
 *
 * This replaces a second copy of the "Assets by Category" bar chart. That widget was the same
 * component rendered twice — identical form, identical single hue — which is what made the page
 * read as monotonous, and its title promised a branch breakdown the endpoint could not deliver:
 * `/dashboard-asset-report` grouped by category alone. The new `/by-branch` route adds the
 * dimension, so the title is now accurate.
 *
 * Form: a heatmap, because the job is "compare magnitude across a grid" — two categorical axes
 * with one measure. Colour is sequential (one hue, light→dark), so hue says *how many* and
 * nothing else; identity is carried entirely by the row and column labels. A categorical palette
 * here would be wrong twice over — the categories have no natural order to encode, and twelve of
 * them exceeds what any palette keeps distinguishable.
 *
 * Every cell also carries its value as text, so the grid is readable without relying on colour
 * and needs no separate table view.
 */
const BranchCategoryHeatmap = ({ cells }: IBranchCategoryHeatmapProps) => {
    const { data, loading, failed, reload } = cells;
    const [showAll, setShowAll] = useState(false);

    const { branches, categories, lookup, max, total } = useMemo(() => {
        const byBranch = new Map<string, number>();
        const byCategory = new Map<string, number>();
        const grid = new Map<string, number>();
        let highest = 0;
        let sum = 0;

        data.forEach((cell) => {
            const branch = cell.branchName ?? UNASSIGNED;
            const category = cell.assetTypeName;
            const count = Number(cell.totalCount) || 0;

            byBranch.set(branch, (byBranch.get(branch) ?? 0) + count);
            byCategory.set(category, (byCategory.get(category) ?? 0) + count);
            grid.set(`${branch}|${category}`, count);
            if (count > highest) highest = count;
            sum += count;
        });

        // Both axes sorted by total, so the densest branches and categories sit top-left and the
        // reader's eye lands on the bulk of the register first.
        const rankByTotal = (counts: Map<string, number>): string[] =>
            Array.from(counts.keys()).sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));

        const rankedBranches = rankByTotal(byBranch);
        const rankedCategories = rankByTotal(byCategory);

        return {
            branches: rankedBranches,
            categories: rankedCategories,
            lookup: grid,
            max: highest,
            total: sum,
        };
    }, [data]);

    const visibleBranches = showAll ? branches : branches.slice(0, DEFAULT_ROW_LIMIT);
    const hidden = branches.length - visibleBranches.length;

    /**
     * Bands are cut on the square root of the count, not linearly.
     *
     * A handful of large branches would otherwise flatten every small one into the palest band,
     * and "which branches hold nothing" is exactly what this grid is for.
     */
    const fillFor = (count: number): string => {
        if (count <= 0) return EMPTY_CELL_FILL;
        if (max <= 0) return SEQUENTIAL_TEAL[0];
        const ratio = Math.sqrt(count) / Math.sqrt(max);
        const index = Math.min(
            SEQUENTIAL_TEAL.length - 1,
            Math.floor(ratio * SEQUENTIAL_TEAL.length),
        );
        return SEQUENTIAL_TEAL[index];
    };

    // The two darkest bands need light text on them; the pale end keeps dark ink.
    const inkFor = (count: number): string => {
        if (count <= 0) return neutral[400];
        const fill = fillFor(count);
        const darkBands = SEQUENTIAL_TEAL.slice(-3);
        return darkBands.includes(fill) ? '#fff' : neutral[900];
    };

    return (
        <WidgetCard
            title="Assets Across All Branches"
            subtitle={`${total.toLocaleString()} assets · ${branches.length} ${branches.length === 1 ? 'branch' : 'branches'} · ${categories.length} categories`}
            icon={<GridViewOutlinedIcon />}
            helpText="Every asset on the register, counted by the branch holding it and its category. Darker cells hold more. Branches and categories are both ordered by total, so the busiest sit top-left."
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={branches.length === 0}
            emptyTitle="No assets on the register"
            emptyDescription="Once assets are stocked and assigned to branches they will appear here."
        >
            <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
                <Box sx={{ minWidth: ROW_LABEL_W + categories.length * CELL_W }}>
                    {/* Column headers. Clamped to two lines with the full name on hover: the
                        longest seeded category is "Financial & Banking Equipment", which would
                        otherwise wrap to four lines and leave the header row ragged and tall.
                        Rotating them would be worse — angled text is harder to read than clipped
                        text, and the tooltip recovers whatever the clamp cuts. */}
                    <Stack direction="row" alignItems="flex-end" sx={{ mb: 0.5, height: HEADER_H }}>
                        <Box sx={{ width: ROW_LABEL_W, flexShrink: 0 }} />
                        {categories.map((category) => (
                            <Box
                                key={category}
                                // Same right gap as the cells below, and no left padding, so a
                                // header sits flush with the column it names.
                                sx={{ width: CELL_W, flexShrink: 0, pr: `${SEGMENT_GAP_PX}px` }}
                            >
                                <Tooltip arrow placement="top" title={category}>
                                    <Typography
                                        sx={{
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            color: neutral[600],
                                            lineHeight: 1.25,
                                            letterSpacing: '0.01em',
                                            cursor: 'default',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {category}
                                    </Typography>
                                </Tooltip>
                            </Box>
                        ))}
                    </Stack>

                    {visibleBranches.map((branch) => (
                        <Stack direction="row" key={branch} alignItems="center" sx={{ mb: `${SEGMENT_GAP_PX}px` }}>
                            <Box sx={{ width: ROW_LABEL_W, flexShrink: 0, pr: 1.5 }}>
                                <Typography
                                    noWrap
                                    title={branch}
                                    sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: branch === UNASSIGNED ? neutral[500] : neutral[800],
                                        fontStyle: branch === UNASSIGNED ? 'italic' : 'normal',
                                    }}
                                >
                                    {branch}
                                </Typography>
                            </Box>
                            {categories.map((category) => {
                                const count = lookup.get(`${branch}|${category}`) ?? 0;
                                return (
                                    <Box key={category} sx={{ width: CELL_W, flexShrink: 0, pr: `${SEGMENT_GAP_PX}px` }}>
                                        <Tooltip
                                            arrow
                                            placement="top"
                                            title={`${branch} · ${category}: ${count.toLocaleString()} ${count === 1 ? 'asset' : 'assets'}`}
                                        >
                                            <Box
                                                sx={{
                                                    height: CELL_H,
                                                    borderRadius: '4px',
                                                    bgcolor: fillFor(count),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'default',
                                                    transition: 'outline-color 120ms',
                                                    outline: '2px solid transparent',
                                                    outlineOffset: '-2px',
                                                    '&:hover': { outlineColor: alpha(neutral[900], 0.35) },
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        fontVariantNumeric: 'tabular-nums',
                                                        color: inkFor(count),
                                                    }}
                                                >
                                                    {count > 0 ? count.toLocaleString() : '–'}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    </Box>
                                );
                            })}
                        </Stack>
                    ))}
                </Box>
            </Box>

            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${border.subtle}`, flexWrap: 'wrap', gap: 1 }}
            >
                {hidden > 0 || showAll ? (
                    <Button
                        size="small"
                        onClick={() => setShowAll((open) => !open)}
                        sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                        {showAll
                            ? `Show top ${DEFAULT_ROW_LIMIT} branches`
                            : `Show all ${branches.length} branches`}
                    </Button>
                ) : (
                    <Box />
                )}

                {/* Scale legend — a sequential ramp is unreadable without one. */}
                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography sx={{ fontSize: '0.68rem', color: neutral[500] }}>Fewer</Typography>
                    <Stack direction="row" spacing={`${SEGMENT_GAP_PX}px`}>
                        <Box sx={{ width: 16, height: 10, borderRadius: '2px', bgcolor: EMPTY_CELL_FILL, border: `1px solid ${border.subtle}` }} />
                        {SEQUENTIAL_TEAL.map((step) => (
                            <Box key={step} sx={{ width: 16, height: 10, borderRadius: '2px', bgcolor: step }} />
                        ))}
                    </Stack>
                    <Typography sx={{ fontSize: '0.68rem', color: neutral[500] }}>More</Typography>
                </Stack>
            </Stack>
        </WidgetCard>
    );
};

export default BranchCategoryHeatmap;
