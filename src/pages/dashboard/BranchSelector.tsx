/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { MenuItem, Select, Skeleton } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { fetchAllBranches, ReferenceOption } from '../users/service/referenceData';
import { neutral, brand } from '../../utils/tokens';

export interface ISelectedBranch {
    id: number;
    name: string;
}

interface IBranchSelectorProps {
    /** null means the roll-up across every branch. */
    value: ISelectedBranch | null;
    onChange: (branch: ISelectedBranch | null) => void;
}

/**
 * Focuses the whole dashboard on one branch, or shows the roll-up across all of them.
 *
 * <p>One control for the page rather than one per widget. Three widgets wanted a branch filter —
 * the stocking trend, the position band and request fulfilment — and giving each its own would let
 * them disagree: the page would show one branch's stock next to another's fulfilment with nothing
 * saying so. A single selector cannot contradict itself.
 *
 * <p>Rendered only for a viewer whose scope is ALL. Below that the server refuses a branch that is
 * not the viewer's own, so offering the control would be offering something that cannot work.
 */
const BranchSelector = ({ value, onChange }: IBranchSelectorProps) => {
    const [branches, setBranches] = useState<ReferenceOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchAllBranches()
            .then((rows) => { if (!cancelled) setBranches(rows); })
            .catch(() => { /* the selector simply stays on the roll-up */ })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    if (loading) return <Skeleton variant="rounded" width={190} height={32} />;

    return (
        <Select
            size="small"
            value={value === null ? 'all' : String(value.id)}
            onChange={(event) => {
                const next = event.target.value;
                if (next === 'all') { onChange(null); return; }
                // The name travels with the id so every widget subtitle can say which branch it is
                // showing without a second lookup — and cannot disagree with the selector.
                const chosen = branches.find((b) => String(b.value) === next);
                onChange(chosen ? { id: Number(chosen.value), name: chosen.label } : null);
            }}
            startAdornment={
                <AccountTreeOutlinedIcon sx={{ fontSize: 15, color: brand[500], mr: 0.75 }} />
            }
            sx={{
                height: 32,
                minWidth: 190,
                bgcolor: '#fff',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: neutral[800],
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brand[500] },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: brand[500] },
                '& .MuiSelect-select': { py: 0.5, display: 'flex', alignItems: 'center' },
            }}
            MenuProps={{
                PaperProps: {
                    sx: { maxHeight: 360, borderRadius: '10px', border: '1px solid #E8EDF3' },
                },
            }}
        >
            {/* The roll-up stays first and is the default, so the page opens on the widest view a
                viewer at this scope is entitled to. */}
            <MenuItem value="all" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                All branches &amp; Head Office
            </MenuItem>
            {branches.map((branch) => (
                <MenuItem key={branch.value} value={String(branch.value)} sx={{ fontSize: '0.8rem' }}>
                    {branch.label}
                </MenuItem>
            ))}
        </Select>
    );
};

export default BranchSelector;
