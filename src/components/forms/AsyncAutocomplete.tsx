/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Autocomplete,
    Box,
    CircularProgress,
    Paper,
    Popper,
    TextField,
    Typography,
    alpha,
} from '@mui/material';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    SyntheticEvent,
} from 'react';
import { Control, Controller, FieldError, FieldValues, Path } from 'react-hook-form';
import { useDebounce } from '../../hooks/useDebounce';
import { autocompleteSx, PRIMARY_COLOR } from './Autocomplete';

export interface IAsyncAutocompleteOption {
    value: string | number;
    label: string;
    raw?: any;
}

export interface IAsyncAutocompletePage {
    options: Array<IAsyncAutocompleteOption>;
    totalElements: number;
}

export interface IAsyncAutocompleteProps<TForm extends FieldValues> {
    control: Control<TForm>;
    name: Path<TForm>;
    label: string;
    error?: FieldError;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    /**
     * Server-side fetcher. Called on open and on every debounced input change.
     * MUST be paginated — returns ten records by default. Implementations should
     * always honour `page` and `pageSize`.
     */
    fetchPage: (query: string, page: number, pageSize: number) => Promise<IAsyncAutocompletePage>;
    /**
     * Optional initial selection used to hydrate the field on the Update form
     * without a network round-trip. Carries the option that matches the form's
     * current value so the visible label is correct immediately.
     */
    initialOption?: IAsyncAutocompleteOption | null;
    pageSize?: number;
    debounceMs?: number;
    /** Notifies parent of the FULL selected option (id + label + raw) — used to derive dependent fields. */
    onOptionChange?: (option: IAsyncAutocompleteOption | null) => void;
    /** Re-fetches the first page whenever this key changes. Use to refresh when an upstream filter (e.g. branchId) changes. */
    refetchKey?: string | number | null;
}

/**
 * Server-paginated, debounced autocomplete with react-hook-form integration.
 * - Loads 10 records on first open.
 * - Refetches the first page (debounced) on every keystroke.
 * - "Load more" appears at the bottom of the list when more pages are available.
 * - Preserves the currently selected option in the visible options list so the
 *   chip/label never disappears when the result set changes.
 */
const AsyncAutocomplete = <TForm extends FieldValues>({
    control,
    name,
    label,
    error,
    required = false,
    disabled = false,
    placeholder,
    fetchPage,
    initialOption,
    pageSize = 10,
    debounceMs = 400,
    onOptionChange,
    refetchKey = null,
}: IAsyncAutocompleteProps<TForm>) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const debouncedInput = useDebounce(inputValue, debounceMs);

    const [options, setOptions] = useState<IAsyncAutocompleteOption[]>(
        initialOption ? [initialOption] : []
    );
    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);

    const [selected, setSelected] = useState<IAsyncAutocompleteOption | null>(
        initialOption ?? null
    );

    // Tracks the most recent fetch so stale responses don't overwrite fresh ones.
    const reqIdRef = useRef(0);

    const loadPage = useCallback(
        async (query: string, pageNumber: number, append: boolean) => {
            const currentReq = ++reqIdRef.current;
            setLoading(true);
            try {
                const result = await fetchPage(query, pageNumber, pageSize);
                if (currentReq !== reqIdRef.current) return; // stale
                setTotalElements(result.totalElements);
                setOptions(prev => {
                    if (!append) {
                        // Keep the currently selected option in the list so its label stays visible
                        const selectedNotInPage =
                            selected && !result.options.find(o => o.value === selected.value)
                                ? [selected]
                                : [];
                        return [...selectedNotInPage, ...result.options];
                    }
                    const existingValues = new Set(prev.map(o => o.value));
                    const merged = [...prev];
                    for (const o of result.options) {
                        if (!existingValues.has(o.value)) merged.push(o);
                    }
                    return merged;
                });
                setPage(pageNumber);
            } finally {
                if (currentReq === reqIdRef.current) setLoading(false);
            }
        },
        [fetchPage, pageSize, selected]
    );

    // First-open: load page 0. Also re-runs whenever `refetchKey` changes (e.g. branch swap for the Department field).
    useEffect(() => {
        if (!open) return;
        loadPage('', 0, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, refetchKey]);

    // Debounced search whenever the user types.
    useEffect(() => {
        if (!open) return;
        loadPage(debouncedInput.trim(), 0, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedInput]);

    // Sync local "selected" when the parent provides a fresh initialOption (Update form switching users).
    useEffect(() => {
        if (initialOption && initialOption.value !== selected?.value) {
            setSelected(initialOption);
            setOptions(prev => {
                if (prev.find(o => o.value === initialOption.value)) return prev;
                return [initialOption, ...prev];
            });
        }
        if (!initialOption && selected !== null && !open) {
            // Parent cleared the field externally — only reset when popup is closed to avoid flicker mid-edit.
            setSelected(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialOption?.value]);

    const hasMore = useMemo(() => options.length < totalElements, [options.length, totalElements]);

    const renderListboxFooter = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, color: 'text.secondary' }}>
                    <CircularProgress size={14} sx={{ color: PRIMARY_COLOR }} />
                    <Typography variant="caption">Searching…</Typography>
                </Box>
            );
        }
        if (hasMore) {
            return (
                <Box
                    role="button"
                    onMouseDown={e => {
                        e.preventDefault();
                        loadPage(debouncedInput.trim(), page + 1, true);
                    }}
                    sx={{
                        p: 1.25,
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: PRIMARY_COLOR,
                        borderTop: `1px dashed ${alpha(PRIMARY_COLOR, 0.25)}`,
                        '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.06) },
                    }}
                >
                    Load more ({totalElements - options.length} remaining)
                </Box>
            );
        }
        return null;
    };

    const CustomPaper = ({ children, ...props }: any) => (
        <Paper
            {...props}
            elevation={4}
            sx={{
                mt: 0.5,
                borderRadius: '8px',
                boxShadow: `0 4px 24px ${alpha('#000', 0.12)}`,
            }}
        >
            {children}
            {renderListboxFooter()}
        </Paper>
    );

    const CustomPopper = (props: any) => (
        <Popper
            {...props}
            placement="bottom-start"
            style={{ ...props.style, zIndex: 1500 }}
        />
    );

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <Autocomplete
                    value={selected}
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    options={options}
                    loading={loading}
                    disabled={disabled}
                    fullWidth
                    PopperComponent={CustomPopper}
                    PaperComponent={CustomPaper}
                    isOptionEqualToValue={(o, v) => o.value === v.value}
                    getOptionLabel={(o) => o?.label ?? ''}
                    filterOptions={(x) => x} // server-side filter — never re-filter locally
                    noOptionsText={loading ? 'Searching…' : 'No matches'}
                    onInputChange={(_e: SyntheticEvent, val) => setInputValue(val)}
                    onChange={(_e, val) => {
                        setSelected(val);
                        field.onChange(val ? val.value : null);
                        onOptionChange?.(val);
                    }}
                    sx={{
                        '& .MuiAutocomplete-popupIndicator': { color: alpha(PRIMARY_COLOR, 0.6) },
                        '& .MuiAutocomplete-clearIndicator': { color: alpha(PRIMARY_COLOR, 0.5) },
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={required ? `${label} *` : label}
                            placeholder={placeholder}
                            error={Boolean(error)}
                            helperText={error?.message}
                            sx={autocompleteSx}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading ? (
                                            <CircularProgress size={16} sx={{ color: PRIMARY_COLOR, mr: 1 }} />
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            )}
        />
    );
};

export default AsyncAutocomplete;
