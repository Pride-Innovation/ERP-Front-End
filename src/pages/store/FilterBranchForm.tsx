/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import BranchUtills from '../settings/branch/utills';
import { IOptions } from '../../components/tables/interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Autocomplete, TextField, Paper, alpha } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import StoreUtills from './utillls';
import { StoreContext } from '../../context/store';
import { autocompleteSx, PRIMARY_COLOR } from '../../components/forms/Autocomplete';

const FilterBranchForm = () => {
    const [optionsObject, setOptionsObject] = useState<{ branchesOptions: Array<IOptions> }>({ branchesOptions: [] });
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<IOptions | null>(null);
    const { setCurrentUserBranch, fetchStoresCommoditiesPerBranchPerAsset } = StoreUtills();
    const { branchId } = useContext(StoreContext);

    const handleOpen = () => {
        setOpen(true);
        (async () => {
            setLoading(true);
            await fetchAllBranches();
            setLoading(false);
        })();
    };

    const handleClose = () => {
        setOpen(false);
        setOptionsObject({ branchesOptions: [] });
    };

    const { fetchAllBranches } = BranchUtills();
    const { branches } = useSelector((state: RootState) => state.BranchStore);

    useEffect(() => {
        if (branches.length > 0) {
            setOptionsObject({
                branchesOptions: branches.map(branch => ({ label: branch.name, value: branch.id as number })) || [],
            });
        }
    }, [branches]);

    useEffect(() => {
        if (selectedBranch?.label && selectedBranch.value) {
            setCurrentUserBranch(selectedBranch.value as number);
        }
    }, [selectedBranch]);

    useEffect(() => {
        if (branchId) {
            fetchStoresCommoditiesPerBranchPerAsset();
        }
    }, [branchId]);

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