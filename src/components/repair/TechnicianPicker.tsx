/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { Autocomplete, Box, MenuItem, TextField, Typography } from '@mui/material';
import { fieldSx } from '../forms/Inputs';
import { autocompleteSx } from '../forms/Autocomplete';
import { DropdownPopper, DropdownPaper } from '../forms/modalChrome';
import { fetchRepairTechniciansService } from '../../pages/movement/service';
import { fetchConsultantsService } from '../../pages/settings/consultants/service';
import { IConsultant, IConsultantsAxiosResponse } from '../../pages/settings/consultants/interface';

export type TechnicianType = 'INTERNAL' | 'EXTERNAL';
export type RepairRouting = 'IT' | 'ADMIN' | 'EXTERNAL';

/** A staff member as `GET /movements/repair-technicians` returns them. */
export interface ITechnicianOption {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    title?: string | null;
}

export interface ITechnicianSelection {
    technicianType: TechnicianType | null;
    user: ITechnicianOption | null;
    consultant: IConsultant | null;
}

export const EMPTY_TECHNICIAN: ITechnicianSelection = { technicianType: null, user: null, consultant: null };

/** Whether a whole technician has been chosen: a kind, and somebody of that kind. */
export const isTechnicianChosen = (s: ITechnicianSelection): boolean =>
    (s.technicianType === 'INTERNAL' && !!s.user) || (s.technicianType === 'EXTERNAL' && !!s.consultant);

/** Whether the user has started choosing and not finished — a half-chosen technician is refused. */
export const isTechnicianPartial = (s: ITechnicianSelection): boolean =>
    s.technicianType !== null && !isTechnicianChosen(s);

/**
 * The fields every repair endpoint takes — the transfer, the return, the bench completion and the
 * assignment all read the same three. Empty when nothing was chosen, so an optional technician
 * sends nothing rather than a half-filled one.
 */
export const technicianPayload = (s: ITechnicianSelection) => {
    if (!isTechnicianChosen(s)) return {};
    return s.technicianType === 'INTERNAL'
        ? { technicianType: 'INTERNAL' as const, technicianUserId: s.user!.id }
        : { technicianType: 'EXTERNAL' as const, technicianConsultantId: s.consultant!.id };
};

const personLabel = (u: ITechnicianOption) =>
    `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || `User #${u.id}`;

/** The unit whose officers service a repair with this routing. */
const unitFor = (routing: RepairRouting) => (routing === 'ADMIN' ? 'Admin unit' : 'Infra unit');

interface Props {
    /** Where the repair is going or went. Decides whose officers are offered as internal technicians. */
    repairDestination: RepairRouting;
    value: ITechnicianSelection;
    onChange: (next: ITechnicianSelection) => void;
    required?: boolean;
    /** Shown under the kind selector; defaults to a sentence about whether it is optional. */
    helperText?: string;
}

/**
 * Who repaired it — chosen in two steps, the kind and then the person or vendor.
 *
 * <p>Replaced a free-text box that tied the repair to nobody, so the same officer appeared under
 * several spellings and a vendor could be typed onto an in-house job. The two lists are different
 * on purpose:
 *
 * <ul>
 *   <li><b>Internal officer</b> — members of the unit that services the routing: the Infra unit for
 *       an IT repair, the Admin unit for an Admin one. Not the branch-scoped staff picker, because
 *       both units sit at Head Office and serve the whole bank; a branch officer raising a repair
 *       would otherwise be offered nobody.</li>
 *   <li><b>External consultant</b> — the active consultants registered under Settings.</li>
 * </ul>
 *
 * <p>An external repair is worked on by the vendor it is sent to, so for that routing this picker
 * is not shown at all — the consultant chosen for the routing is recorded as the technician.
 */
const TechnicianPicker = ({ repairDestination, value, onChange, required = false, helperText }: Props) => {
    const [officers, setOfficers] = useState<ITechnicianOption[]>([]);
    const [officersLoading, setOfficersLoading] = useState(false);
    const [consultants, setConsultants] = useState<IConsultant[]>([]);
    const [consultantsLoading, setConsultantsLoading] = useState(false);

    const internalAllowed = repairDestination !== 'EXTERNAL';

    // The internal list depends on the routing, so it is re-read when the routing changes — and a
    // previously chosen officer is dropped, since they may not belong to the new unit.
    useEffect(() => {
        if (!internalAllowed) { setOfficers([]); return; }
        let cancelled = false;
        setOfficersLoading(true);
        (async () => {
            try {
                const r = (await fetchRepairTechniciansService(repairDestination)) as any;
                if (!cancelled) setOfficers(r?.status === 200 ? (r.data ?? []) : []);
            } finally {
                if (!cancelled) setOfficersLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [repairDestination, internalAllowed]);

    useEffect(() => {
        if (value.technicianType !== 'EXTERNAL' || consultants.length > 0) return;
        let cancelled = false;
        setConsultantsLoading(true);
        (async () => {
            try {
                const r = (await fetchConsultantsService(true)) as IConsultantsAxiosResponse;
                if (!cancelled && r?.status === 200) setConsultants(r.data ?? []);
            } finally {
                if (!cancelled) setConsultantsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [value.technicianType]); // eslint-disable-line react-hooks/exhaustive-deps

    // An internal officer chosen for one routing is not necessarily valid for another.
    useEffect(() => {
        if (value.technicianType === 'INTERNAL' && (!internalAllowed
            || (value.user && !officersLoading && officers.length > 0 && !officers.some((o) => o.id === value.user!.id)))) {
            onChange(EMPTY_TECHNICIAN);
        }
    }, [officers, internalAllowed]); // eslint-disable-line react-hooks/exhaustive-deps

    const kindHelper = helperText
        ?? (required
            ? 'Required — a closed repair must say who did the work.'
            : 'Optional now — it can be recorded once the bench decides, and must be by the time the repair closes.');

    return (
        <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
                select
                fullWidth
                required={required}
                sx={{ ...fieldSx, '& .MuiSelect-select': { paddingRight: '32px' } }}
                label="Technician"
                value={value.technicianType ?? ''}
                onChange={(e) => onChange({
                    technicianType: (e.target.value || null) as TechnicianType | null,
                    user: null,
                    consultant: null,
                })}
                helperText={kindHelper}
            >
                {!required && <MenuItem value=""><em>Not yet known</em></MenuItem>}
                <MenuItem value="INTERNAL" disabled={!internalAllowed}>
                    Internal officer — {unitFor(repairDestination)}
                </MenuItem>
                <MenuItem value="EXTERNAL">External consultant — registered in Settings</MenuItem>
            </TextField>

            {value.technicianType === 'INTERNAL' && (
                <Autocomplete
                    options={officers}
                    value={value.user}
                    loading={officersLoading}
                    fullWidth
                    getOptionLabel={personLabel}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    onChange={(_, v) => onChange({ ...value, user: v })}
                    PopperComponent={DropdownPopper}
                    PaperComponent={DropdownPaper}
                    noOptionsText={officersLoading ? 'Loading…' : `No active members in the ${unitFor(repairDestination)}`}
                    renderOption={(props, o) => (
                        <li {...props} key={o.id}>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }} noWrap>
                                    {personLabel(o)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }} noWrap>
                                    {[o.title, o.email].filter(Boolean).join(' · ')}
                                </Typography>
                            </Box>
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField {...params} required={required} label={`Officer (${unitFor(repairDestination)})`} sx={autocompleteSx} />
                    )}
                />
            )}

            {value.technicianType === 'EXTERNAL' && (
                <Autocomplete
                    options={consultants}
                    value={value.consultant}
                    loading={consultantsLoading}
                    fullWidth
                    getOptionLabel={(c) => (c.specialization ? `${c.name} — ${c.specialization}` : c.name)}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    onChange={(_, v) => onChange({ ...value, consultant: v })}
                    PopperComponent={DropdownPopper}
                    PaperComponent={DropdownPaper}
                    noOptionsText={consultantsLoading ? 'Loading…' : 'No active consultants — register one under Settings → Repair Consultants'}
                    renderInput={(params) => (
                        <TextField {...params} required={required} label="Repair consultant" sx={autocompleteSx} />
                    )}
                />
            )}
        </Box>
    );
};

export default TechnicianPicker;
