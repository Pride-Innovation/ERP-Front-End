/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Typography, alpha } from '@mui/material';
import TabComponent from '../../components/tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useContext, useEffect } from 'react';
import StoreUtills from './utillls';
import { StoreContext } from '../../context/store';

interface BranchStoreReportProps {
    accentColor?: string;
}

const BranchStoreReport = ({ accentColor }: BranchStoreReportProps) => {
    const { branchId, currentAssetType, setStoreReportTableData } = useContext(StoreContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const {
        handleTableColumns,
        tableHeaders,
        setCurrentUserBranch,
        setCurrentAssetType,
        fetchStoresCommoditiesPerBranchPerAsset
    } = StoreUtills();

    useEffect(() => { handleTableColumns(assetTypes); }, [assetTypes]);
    useEffect(() => { setCurrentUserBranch(); }, []);

    const handleTabChange = (value: string | number) => {
        setStoreReportTableData([]);
        if (tableHeaders.length > 0) {
            setCurrentAssetType(tableHeaders[value as number]);
        }
    };

    useEffect(() => {
        if (currentAssetType.id !== null && branchId !== null) {
            fetchStoresCommoditiesPerBranchPerAsset();
        }
    }, [currentAssetType]);

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: '#fff',
                borderRadius: 2,
                border: `1px solid ${alpha(accentColor ?? '#000', accentColor ? 0.12 : 0.08)}`,
                overflow: 'hidden',
            }}
        >
            {tableHeaders.length > 0 ? (
                <TabComponent
                    handleTabChange={handleTabChange}
                    headers={tableHeaders}
                    tabPadding={0}
                />
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 8,
                        color: 'text.disabled',
                    }}
                >
                    <Typography variant="body2">No asset types configured.</Typography>
                </Box>
            )}
        </Box>
    );
};

export default BranchStoreReport;
