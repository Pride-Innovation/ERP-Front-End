/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import BranchUtills from '../settings/branch/utills'
import { IOptions } from '../../components/tables/interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Autocomplete, TextField } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import StoreUtills from './utillls';
import { StoreContext } from '../../context/store';


const FilterBranchForm = () => {
    const [optionsObject, setOptionsObject] = useState<{
        branchesOptions: Array<IOptions>;
    }>({ branchesOptions: [] });
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<IOptions | null>(null);
    const { setCurrentUserBranch, fetchStoresCommoditiesPerBranchPerAsset } = StoreUtills()
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
    const { branches } = useSelector((state: RootState) => state.BranchStore)

    useEffect(() => {
        if (branches.length > 0) {
            setOptionsObject({
                branchesOptions: branches?.map(branch => ({ label: branch.name, value: branch.id as number })) || [],
            });
        }
    }, [branches]);

    useEffect(() => {
        if (selectedBranch?.label && selectedBranch.value) {
            setCurrentUserBranch(selectedBranch.value as number)
        }
    }, [selectedBranch])


    useEffect(() => {
        if (branchId) {
            fetchStoresCommoditiesPerBranchPerAsset()
        }
    }, [branchId]);
    

    return (
        <Autocomplete
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            getOptionLabel={(option) => option.label as string}
            options={optionsObject.branchesOptions}
            value={selectedBranch}
            onChange={(_, value) => {
                setSelectedBranch(value);
            }}
            loading={loading}
            size='small'
            color='primary'
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Select Branch"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    )
}

export default FilterBranchForm;