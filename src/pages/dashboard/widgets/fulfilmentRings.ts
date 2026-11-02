/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { FULFILMENT_RING_COLOURS, FULFILMENT_RING_OTHER, ringTint } from '../chartTheme';
import { IRequestFulfilment } from '../interface';

/** Categories shown as their own slice; the rest fold into "Other". The palette has five slots. */
export const RING_SLICES = FULFILMENT_RING_COLOURS.length;

export interface IFulfilmentSlice {
    key: string;
    label: string;
    /** The categories this slice stands for - one, or several for "Other". */
    members: string[];
    requested: number;
    delivered: number;
    outstanding: number;
    /** Share of everything requested, 0-100. */
    share: number;
    /** Share of this slice's own requests that were delivered, 0-100. */
    deliveredRate: number;
    colour: string;
    tint: string;
}

export interface IFulfilmentRings {
    slices: IFulfilmentSlice[];
    requested: number;
    delivered: number;
}

const count = (value: unknown) => Number(value) || 0;
const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

/**
 * The same rows the bar view draws, arranged as two rings: the outer one each category's share of
 * what was requested, the inner one the delivered / outstanding split inside each slice.
 *
 * The figures are not changed, only grouped. Requested and delivered pass through as the endpoint
 * sent them, and "Other" is a plain sum of the categories it names, so the totals equal the bar
 * view's to the item. Delivered is capped at requested only so the inner ring's two parts can never
 * overrun the slice above them; the query counts delivered as a subset of requested, so the cap
 * does not bite.
 *
 * Largest first, ties by name, so the same data always draws the same ring.
 */
export const buildFulfilmentRings = (rows: IRequestFulfilment[]): IFulfilmentRings => {
    const categories = rows
        .map((row) => {
            const requested = count(row.totalRequested);
            return { name: row.assetType, requested, delivered: Math.min(count(row.totalDelivered), requested) };
        })
        .filter((row) => row.requested > 0)
        .sort((a, b) => b.requested - a.requested || a.name.localeCompare(b.name));

    const requested = categories.reduce((sum, row) => sum + row.requested, 0);
    const delivered = categories.reduce((sum, row) => sum + row.delivered, 0);

    const slice = (key: string, label: string, members: typeof categories, colour: string): IFulfilmentSlice => {
        const req = members.reduce((sum, row) => sum + row.requested, 0);
        const del = members.reduce((sum, row) => sum + row.delivered, 0);
        return {
            key,
            label,
            members: members.map((row) => row.name),
            requested: req,
            delivered: del,
            outstanding: req - del,
            share: percent(req, requested),
            deliveredRate: percent(del, req),
            colour,
            tint: ringTint(colour),
        };
    };

    const slices = categories
        .slice(0, RING_SLICES)
        .map((row, index) => slice(row.name, row.name, [row], FULFILMENT_RING_COLOURS[index]));

    const rest = categories.slice(RING_SLICES);
    if (rest.length > 0) {
        // A lone remainder keeps its own name; it is grey only because the palette has run out.
        const label = rest.length === 1 ? rest[0].name : `Other (${rest.length})`;
        slices.push(slice('__other', label, rest, FULFILMENT_RING_OTHER));
    }

    return { slices, requested, delivered };
};

/** Whole percentages for display. */
export const pct = (value: number): string => `${Math.round(value)}%`;
