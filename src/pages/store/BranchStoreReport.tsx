/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import TabComponent from '../../components/tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useContext, useEffect } from 'react';
import StoreUtills from './utillls';
import { StoreContext } from '../../context/store';

interface BranchStoreReportProps {
    storeTitle?: string;
    accentColor?: string;
}

const BranchStoreReport = ({ storeTitle, accentColor }: BranchStoreReportProps) => {
    const theme = useTheme();
    const resolvedAccent = accentColor ?? theme.palette.primary.main;
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>

            {/* ── Standalone header card ── */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha('#000', 0.07)}`,
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${alpha(resolvedAccent, 0.05)} 0%, ${alpha('#fff', 0)} 100%)`,
                }}
            >
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                bgcolor: alpha(resolvedAccent, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CategoryOutlinedIcon sx={{ fontSize: 16, color: resolvedAccent }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.68rem', display: 'block' }}>
                                Inventory
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                {storeTitle ? `${storeTitle} — Stock Report` : 'Branch Store Report'}
                            </Typography>
                        </Box>
                    </Stack>

                    {tableHeaders.length > 0 && (
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
                            {tableHeaders.length} asset {tableHeaders.length === 1 ? 'type' : 'types'}
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* ── Table rendered directly — no wrapper, no padding ── */}
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
