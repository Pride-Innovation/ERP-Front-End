/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Paper } from '@mui/material';
import TabComponent from '../../components/tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useContext, useEffect } from 'react';
import StoreUtills from './utillls';
import { StoreContext } from '../../context/store';


const BranchStoreReport = () => {
    const { branchId, currentAssetType, setStoreReportTableData } = useContext(StoreContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const {
        handleTableColumns,
        tableHeaders,
        setCurrentUserBranch,
        setCurrentAssetType,
        fetchStoresCommoditiesPerBranchPerAsset
    } = StoreUtills();

    useEffect(() => { handleTableColumns(assetTypes) }, [assetTypes]);
    useEffect(() => { setCurrentUserBranch() }, [])

    const handleTabChange = (value: string | number) => {
        setStoreReportTableData([])
        if (tableHeaders.length > 0) {
            setCurrentAssetType(tableHeaders[value as number]);
        }
    }

    useEffect(() => {
        if (currentAssetType.id !== null && branchId !== null) {
            fetchStoresCommoditiesPerBranchPerAsset()
        }
    }, [currentAssetType])

    return (
        <Box sx={{ p: 2, width: '100%' }}>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.07)',
                    bgcolor: '#fff',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ p: 2 }}>
                    {tableHeaders.length > 0
                        && <TabComponent
                            handleTabChange={handleTabChange}
                            headers={tableHeaders} />
                    }
                </Box>
            </Paper>
        </Box>
    );
};

export default BranchStoreReport;
