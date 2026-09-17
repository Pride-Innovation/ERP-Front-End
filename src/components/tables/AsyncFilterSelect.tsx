/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Box, CircularProgress, TextField, Typography, alpha } from '@mui/material';

import { IFilterOptionPage } from './interface';

type Option = { value: string | number; label: string };

interface IAsyncFilterSelectProps {
    label: string;
    placeholder?: string;
    /** The currently selected id, as held in the toolbar's `filterValues`. */
    value: string | number | '';
    onChange: (value: string | number | '', option: Option | null) => void;
    fetchOptions: (query: string, page: number, pageSize: number) => Promise<IFilterOptionPage>;
    primary: string;
    muted: string;
    border: string;
}

const PAGE_SIZE = 10;

/**
 * A column filter whose options come from the server, one debounced page at a time.
 *
 * <p>For filters whose options are a table rather than a list — people, suppliers, commodities. A
 * `select` would have to load every row before the panel opens, and a `text` filter makes the user
 * guess at spellings and then matches on a name, so two people called Okello are one filter.
 *
 * <p>Mirrors the behaviour of the form-side `AsyncAutocomplete` — ten records, debounced refetch on
 * every keystroke, "Load more" at the foot of the list — but is not that component: the form one is
 * bound to react-hook-form (`control`, `name`), and a column filter is a plain value in the
 * toolbar's own state. Sharing the behaviour without sharing the binding is the point.
 *
 * <p>Styled from the tokens the toolbar passes in, so it sits with the `select` and `text` filters
 * rather than looking like a form control that wandered in.
 */
const AsyncFilterSelect = ({
    label, placeholder, value, onChange, fetchOptions, primary, muted, border,
}: IAsyncFilterSelectProps) => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    /** The chosen option, kept so its label survives a result set that no longer contains it. */
    const [selected, setSelected] = useState<Option | null>(null);

    // Guards against a slow first request landing after a faster later one and overwriting it.
    const requestId = useRef(0);

    const load = async (query: string, nextPage: number) => {
        const id = ++requestId.current;
        setLoading(true);
        try {
            const res = await fetchOptions(query, nextPage, PAGE_SIZE);
            if (id !== requestId.current) return;
            setOptions(prev => (nextPage === 0 ? res.options : [...prev, ...res.options]));
            setTotal(res.totalElements);
            setPage(nextPage);
        } catch {
            if (id === requestId.current) { setOptions([]); setTotal(0); }
        } finally {
            if (id === requestId.current) setLoading(false);
        }
    };

    // Debounced: one request per pause in typing, not one per keystroke.
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => { load(input, 0); }, 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, open]);

    // The selected option stays in the list, so clearing the search never blanks the field.
    const visible = useMemo(() => {
        if (!selected) return options;
        return options.some(o => String(o.value) === String(selected.value))
            ? options
            : [selected, ...options];
    }, [options, selected]);

    // The toolbar owns the value, so a "clear all" out there has to empty this too.
    useEffect(() => {
        if (value === '' || value === null || value === undefined) setSelected(null);
    }, [value]);

    const hasMore = options.length < total;

    return (
        <Box>
            <Typography sx={{
                fontSize: '0.67rem', fontWeight: 700, color: '#64748B',
                textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5,
            }}>
                {label}
            </Typography>
            <Autocomplete<Option>
                size="small"
                sx={{ minWidth: 200 }}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                options={visible}
                loading={loading}
                value={selected}
                onChange={(_, opt) => {
                    setSelected(opt);
                    onChange(opt ? opt.value : '', opt);
                }}
                onInputChange={(_, v, reason) => { if (reason === 'input') setInput(v); }}
                getOptionLabel={(o) => o.label}
                isOptionEqualToValue={(o, v) => String(o.value) === String(v.value)}
                // The server has already filtered; filtering again here would hide valid matches
                // whose label differs from what was typed.
                filterOptions={(x) => x}
                noOptionsText={loading ? 'Searching…' : 'No matches'}
                ListboxProps={{
                    onScroll: (e) => {
                        const el = e.currentTarget;
                        if (!hasMore || loading) return;
                        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
                            load(input, page + 1);
                        }
                    },
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={placeholder ?? `Any ${label.toLowerCase()}…`}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: 34, borderRadius: '8px', fontSize: '0.8rem',
                                bgcolor: selected ? alpha(primary, 0.04) : '#fff',
                                color: selected ? primary : muted,
                                fontWeight: selected ? 600 : 400,
                                '& fieldset': { borderColor: selected ? alpha(primary, 0.16) : border },
                                '&:hover fieldset': { borderColor: alpha(primary, 0.4) },
                                '&.Mui-focused fieldset': { borderColor: primary, borderWidth: 1.5 },
                            },
                        }}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress size={13} sx={{ color: primary, mr: 0.5 }} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />
        </Box>
    );
};

export default AsyncFilterSelect;
