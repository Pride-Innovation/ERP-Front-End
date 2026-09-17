/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import BranchUtills from '../settings/branch/utills';
import { IOptions } from '../../components/tables/interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Autocomplete, TextField, Paper, alpha } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import StoreUtills from './utillls';
import { autocompleteSx, PRIMARY_COLOR } from '../../components/forms/Autocomplete';
import { useDebounce } from '../../hooks/useDebounce';

const FilterBranchForm = () => {
    const [optionsObject, setOptionsObject] = useState<{ branchesOptions: Array<IOptions> }>({ branchesOptions: [] });
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<IOptions | null>(null);
    const [inputText, setInputText] = useState('');
    const debouncedInput = useDebounce(inputText, 500);
    const { setCurrentUserBranch } = StoreUtills();

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setInputText('');
    };

    const { fetchAllBranches } = BranchUtills();
    const { branches } = useSelector((state: RootState) => state.BranchStore);

    // The branches list is paginated (first 10) — the first page alone can't reach every branch.
    // Like the Supplier field on the inventory form, re-query the backend by name as the user
    // types (debounced), so any branch is reachable. Also runs on open for the initial page.
    useEffect(() => {
        if (!open) return;
        (async () => {
            setLoading(true);
            await fetchAllBranches({ name: debouncedInput || undefined });
            setLoading(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedInput, open]);

    useEffect(() => {
        setOptionsObject({
            branchesOptions: branches.map(branch => ({ label: branch.name, value: branch.id as number })) || [],
        });
    }, [branches]);

    useEffect(() => {
        if (selectedBranch?.label && selectedBranch.value) {
            setCurrentUserBranch(selectedBranch.value as number);
        }
    }, [selectedBranch]);

    const CustomPaper = ({ children, ...props }: any) => (
        <Paper
            {...props}
            elevation={4}
            sx={{
                mt: 0.5,
                borderRadius: '10px',
                boxShadow: `0 4px 24px ${alpha('#000', 0.12)}`,
                '& .MuiAutocomplete-listbox': {
                    padding: '4px 0',
                    '& .MuiAutocomplete-option': {
                        fontSize: '0.875rem',
                        minHeight: 38,
                        px: 2,
                        '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.06) },
                        '&[aria-selected="true"]': {
                            backgroundColor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            fontWeight: 500,
                        },
                    },
                },
            }}
        >
            {children}
        </Paper>
    );

    return (
        <Autocomplete
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            getOptionLabel={(option) => option.label as string}
            options={optionsObject.branchesOptions}
            value={selectedBranch}
            onChange={(_, value) => setSelectedBranch(value)}
            // Options are already server-filtered by name — don't re-filter them client-side,
            // or a lagging input would hide freshly returned matches.
            filterOptions={(x) => x}
            onInputChange={(_, value, reason) => {
                if (reason === 'input') setInputText(value);
                if (reason === 'clear') setInputText('');
            }}
            noOptionsText={loading ? 'Searching…' : 'No branches match'}
            loading={loading}
            size="small"
            PaperComponent={CustomPaper}
            sx={{
                '& .MuiAutocomplete-popupIndicator': { color: alpha(PRIMARY_COLOR, 0.6) },
                '& .MuiAutocomplete-clearIndicator': { color: alpha(PRIMARY_COLOR, 0.5) },
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Select Branch"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                    sx={autocompleteSx}
                />
            )}
        />
    );
};

export default FilterBranchForm;