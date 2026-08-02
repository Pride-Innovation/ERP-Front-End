/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { IDashboardCapabilities } from '../personas';

/**
 * Bands run top to bottom in this order on every dashboard, whoever is looking.
 *
 * Fixed order is the point: a junior officer and a Head Office administrator see different
 * widgets but the same *shape*, so neither has to relearn the page. A band with no qualifying
 * widgets is not rendered at all — nobody gets an empty heading.
 */
export type DashboardBand = 'act' | 'mine' | 'position' | 'trend' | 'records';

export const BAND_ORDER: DashboardBand[] = ['act', 'mine', 'position', 'trend', 'records'];

export const BAND_META: Record<DashboardBand, { title: string; subtitle: string }> = {
    act: {
        title: 'Needs Action',
        subtitle: 'Waiting on you or on someone you supervise.',
    },
    mine: {
        title: 'Mine',
        subtitle: 'What you personally hold and what you have asked for.',
    },
    position: {
        title: 'Position',
        subtitle: 'Where things stand right now.',
    },
    trend: {
        title: 'Trend',
        subtitle: 'How the position has been moving.',
    },
    records: {
        title: 'Records',
        subtitle: 'The underlying items.',
    },
};

export interface IWidgetSpec {
    /** Stable identifier — also the React key. */
    id: string;
    band: DashboardBand;
    /**
     * Whether this user qualifies. Reading straight off capabilities is what makes granting or
     * revoking a permission the only step needed to change what somebody sees.
     */
    qualifies: (capabilities: IDashboardCapabilities) => boolean;
    /** Grid width at the lg breakpoint (12-column). Below lg everything goes full width. */
    span: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    render: () => ReactNode;
}

/** Keeps only the widgets this user qualifies for, grouped into bands, in band order. */
export const resolveBands = (
    specs: IWidgetSpec[],
    capabilities: IDashboardCapabilities,
): Array<{ band: DashboardBand; widgets: IWidgetSpec[] }> =>
    BAND_ORDER
        .map((band) => ({
            band,
            widgets: specs.filter((spec) => spec.band === band && spec.qualifies(capabilities)),
        }))
        .filter((group) => group.widgets.length > 0);
