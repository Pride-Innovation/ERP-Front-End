/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AssetTypeUtills from '../settings/assetTypes/utills';
import { IAssetType } from '../settings/assetTypes/interface';

/**
 * Asset categories are configuration, not code.
 *
 * Everything here derives from whatever is in Settings → Asset Categories. The dashboard used to
 * hardcode "IT Equipment" / "Office Equipment" / "Fleet" / "Stationery"; three of those four no
 * longer exist (the seed now defines twelve categories, with Computers, Furniture and
 * Vehicle/Fleet replacing them), so every name comparison silently failed and the charts drew
 * zeros. Adding a category in Settings is the only step required to see it on the dashboard.
 */

/**
 * Normalises a category name to the key shape the reporting endpoints use.
 * `/assets/statistics` is keyed by the name with spaces stripped and lower-cased;
 * `/monthly-asset-stock` camel-cases it. Both collapse to the same value here.
 */
export const categoryKey = (name: string): string =>
    (name || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

/**
 * Categories are NOT colour-coded, and that is deliberate.
 *
 * With twelve of them, a categorical palette is the wrong tool: eight distinguishable hues is
 * the ceiling, and generating a ninth produces a colour indistinguishable from an existing one
 * under colour-vision deficiency. So a category never owns a hue — it is identified by its axis
 * or column label, which also gives the long names somewhere to sit. That reads at any category
 * count and survives someone adding a thirteenth in Settings.
 *
 * Where category charts do carry colour, it encodes something else entirely and the category
 * dimension stays on the labels:
 *   - *state* — in use / in store / in repair (`CONDITION_COLOURS`), stacked within each bar;
 *   - *fulfilment* — delivered / outstanding (`FULFILMENT_COLOURS`);
 *   - *magnitude* — the sequential ramp shading the branch × category heatmap
 *     (`SEQUENTIAL_TEAL`), where darker simply means more.
 *
 * All three are small fixed sets, validated in `chartTheme.ts`.
 */

export interface IDashboardCategory {
    id: number | string;
    name: string;
    key: string;
    shortCode: string | null;
    /** True = serialized register (Computers, Vehicle/Fleet…). False = consumable (Stationery…). */
    tracksAssets: boolean;
}

export interface ICategoryRegistry {
    all: IDashboardCategory[];
    /** Categories whose stocking creates trackable asset records — the asset register. */
    tracked: IDashboardCategory[];
    /** Consumable categories — these flow through the store, they are not a register. */
    consumable: IDashboardCategory[];
    /** Look a category up by any spelling of its name. */
    byKey: (name: string) => IDashboardCategory | undefined;
    loaded: boolean;
}

/**
 * Loads the category list once and exposes it in the shapes the widgets need.
 * Fetches only when the store is empty — several widgets call this on the same page.
 *
 * @param enabled pass false when no widget on screen consumes categories, so the page does
 *                not issue a request whose result nobody reads.
 */
export const useCategoryRegistry = (enabled = true): ICategoryRegistry => {
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { fetchAllAssetTypes } = AssetTypeUtills();

    useEffect(() => {
        if (!enabled) return;
        if (!assetTypes || assetTypes.length === 0) fetchAllAssetTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]);

    return useMemo(() => {
        const all: IDashboardCategory[] = (assetTypes || []).map((type: IAssetType) => ({
            id: type.id ?? type.name,
            name: type.name,
            key: categoryKey(type.name),
            shortCode: type.shortCode ?? null,
            tracksAssets: type.tracksAssets === true,
        }));

        const lookup = new Map(all.map((category) => [category.key, category]));

        return {
            all,
            tracked: all.filter((category) => category.tracksAssets),
            consumable: all.filter((category) => !category.tracksAssets),
            byKey: (name: string) => lookup.get(categoryKey(name)),
            loaded: all.length > 0,
        };
    }, [assetTypes]);
};

/*
 * `rankCategories` / `rollupCategories` / `ICategorySlice` lived here to feed the old
 * {label, value} bar widgets. Both category widgets now sort the endpoint rows directly — they
 * need the condition columns and the branch dimension, which a flattened slice cannot carry — so
 * the helpers had no callers left. Removed rather than kept as dead exports; git history has them
 * if a future widget wants the "Other" rollup back.
 */
