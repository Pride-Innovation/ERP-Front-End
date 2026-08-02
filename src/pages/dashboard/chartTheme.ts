/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha } from '@mui/material';
import { border, neutral, surface } from '../../utils/tokens';

/**
 * Chart colours, validated rather than eyeballed.
 *
 * Every set below was run through the palette validator (lightness band, chroma floor, CVD
 * separation, normal-vision floor, contrast vs surface) against the light chart surface.
 *
 * One substitution is deliberate: the brand teal `#08796C` FAILS the chroma floor as a chart
 * mark — at 0.091 chroma it reads as gray when it becomes a large filled area. `CHART_TEAL`
 * below is the same hue pushed to a passing saturation. It is for *marks only*; UI chrome
 * still uses `brand[500]` from the tokens, so the two never appear side by side.
 */

/** Brand teal, saturated to clear the chroma floor. Marks only — never UI chrome. */
export const CHART_TEAL = '#0A8A79';

/**
 * Asset condition — a three-state part-to-whole.
 *
 * Validated as a set: all-pairs CVD ΔE 12.4 (deutan), normal-vision ΔE 20.5, all contrast
 * ratios >= 3:1. The teal↔blue tritan separation lands at 7.3, inside the 6–8 floor band,
 * which is legal only alongside secondary encoding — so these segments always ship with a
 * legend, direct value labels, and a 2px surface gap between them. Do not render them bare.
 */
export const CONDITION_COLOURS = {
    inUse: CHART_TEAL,
    inStore: '#3B82F6',
    inRepair: '#B45309',
} as const;

/** Requested vs delivered. Validated all-pairs: CVD ΔE 12.4, normal ΔE 22.6, contrast >= 3:1. */
export const FULFILMENT_COLOURS = {
    delivered: CHART_TEAL,
    outstanding: '#B45309',
} as const;

/**
 * Sequential teal ramp for magnitude — the heatmap's cell shading.
 *
 * One hue, light→dark, so more-is-darker is the only thing colour says here. Validated as an
 * ordinal ramp against the white card surface: lightness monotone, every adjacent gap >= 0.06 L,
 * light end 2.29:1 on surface, hue spread 2°.
 *
 * The pale end starts at brand[300] rather than brand[50]. The lighter tints were tried first and
 * failed the ramp's light-end contrast floor (brand[100] reaches only 1.41:1 against white), which
 * would have made the lowest band indistinguishable from an empty cell.
 */
export const SEQUENTIAL_TEAL: ReadonlyArray<string> = [
    '#73B8AB', // brand[300]
    '#3FA396', // brand[400]
    '#08796C', // brand[500]
    '#065E54', // brand[700]
    '#03413A', // brand[900]
];

/**
 * A cell with no assets at all.
 *
 * Deliberately outside the ramp: zero is "nothing here", not "a little", and giving it the
 * palest teal would make an empty branch read as a stocked one.
 */
export const EMPTY_CELL_FILL = neutral[100];

/** The de-emphasis gray for context marks — never carries identity on its own. */
export const CONTEXT_GRAY = neutral[300];

/** Gap punched between adjacent fills so segments read as separate marks. */
export const SEGMENT_GAP_PX = 2;

/** Tooltip styling shared by every chart, so hover looks the same everywhere. */
export const tooltipStyle = {
    backgroundColor: neutral[900],
    titleColor: '#fff',
    bodyColor: alpha('#fff', 0.88),
    padding: 10,
    cornerRadius: 6,
    displayColors: true,
    boxPadding: 4,
    titleFont: { size: 12, weight: 'bold' as const },
    bodyFont: { size: 12 },
};

/** Recessive grid and axis styling — the data should be the only thing with weight. */
export const axisStyle = {
    grid: {
        color: border.subtle,
        drawTicks: false,
    },
    border: { display: false },
    ticks: {
        color: neutral[500],
        font: { size: 11 },
        padding: 8,
    },
};

export const chartSurface = surface.card;
