/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../../../core/apis/axiosInstance';
import { IOptions } from '../../../components/tables/interface';

/**
 * Units of measure (Settings → Units of Measure): the one list a commodity's unit and an asset's unit
 * are chosen from. Stored lower-case ("pieces"); shown capitalised ("Pieces").
 *
 * <p>These calls throw on failure rather than returning the error as a value (trap #6), so a caller
 * cannot mistake a refusal for a list.
 */
export interface IUnitOfMeasure {
    id: number;
    name: string;
    active: boolean;
}

export const fetchUnitsOfMeasure = async (includeInactive = false): Promise<IUnitOfMeasure[]> => {
    const { data } = await axiosInstance.get('units-of-measure', { params: { includeInactive } });
    return Array.isArray(data) ? data : [];
};

export const createUnitOfMeasure = async (name: string): Promise<IUnitOfMeasure> => {
    const { data } = await axiosInstance.post('units-of-measure', { name });
    return data;
};

export const setUnitOfMeasureActive = async (id: number, active: boolean): Promise<IUnitOfMeasure> => {
    const { data } = await axiosInstance.put(`units-of-measure/${id}/active`, { active });
    return data;
};

/** "pieces" → "Pieces"; "metric tonnes" → "Metric tonnes". */
export const unitLabel = (name: string): string =>
    name ? name.charAt(0).toUpperCase() + name.slice(1) : name;

/** Stored form of a unit: trimmed, single-spaced, lower-case, blank as empty. Mirrors the server. */
export const normaliseUnit = (raw?: string | null): string =>
    (raw ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Dropdown options from the active units, keeping the record's current value selectable even if it
 * has since been switched off or was never on the list - the server accepts an unchanged unit, so
 * the form must be able to show it rather than open with the field empty.
 */
export const unitOptions = (units: IUnitOfMeasure[], current?: string | null): IOptions[] => {
    const options = units.map((u) => ({ label: unitLabel(u.name), value: u.name }));
    const value = normaliseUnit(current);
    if (value && !options.some((o) => o.value === value)) {
        options.unshift({ label: `${unitLabel(value)} (no longer offered)`, value });
    }
    return options;
};

/** The active units, loaded once per mount. A failure leaves an empty list and the reason. */
export const useUnitsOfMeasure = () => {
    const [units, setUnits] = useState<IUnitOfMeasure[]>([]);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setUnits(await fetchUnitsOfMeasure(false));
            setError(null);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || 'Could not load the units of measure.');
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return { units, error, reload: load };
};
