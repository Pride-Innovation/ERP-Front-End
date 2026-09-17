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
    const { branchId, currentAssetType, storeType } = useContext(StoreContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const {
        handleTableColumns,
        tableHeaders,
        setCurrentAssetType,
        fetchStoresCommoditiesPerBranchPerAsset
    } = StoreUtills();

    useEffect(() => { handleTableColumns(assetTypes); }, [assetTypes]); // eslint-disable-line react-hooks/exhaustive-deps

    /*
     * This used to call `setCurrentUserBranch()` with no argument on mount, which resolves the
     * signed-in user's **own** branch — fighting the `?branchId=` the page had just read from the
     * URL. It won or lost by effect ordering: the parent's write landed second and usually won, but
     * on the path where the branch has to be looked up (a user with no branch on their account) the
     * await put this one last and it silently replaced the branch that was asked for.
     *
     * The page owns that decision, and it is the only place that can check the branch is one this
     * viewer may see. A panel inside it does not get a second opinion.
     */

    /**
     * The tab bar hands back an index; the category is what the rest of the page runs on.
     *
     * <p>The two are kept as one fact — `currentAssetType` — rather than two that can drift, which
     * they did: `TabComponent` chose its own index from a stale category→position map while the
     * fetch ran on whatever `currentAssetType` happened to hold.
     */
    const handleTabChange = (value: string | number) => {
        const picked = tableHeaders[value as number];
        if (picked) setCurrentAssetType(picked);
    };

    /*
     * `branchId` is a dependency, and its absence was the bug.
     *
     * Without it, changing branch never reloaded the table. That went unnoticed because the only
     * branch-driven refetch lived inside `FilterBranchForm` — which renders **only at ALL scope**,
     * so it happened to cover the very users who could change branch through the picker, and nobody
     * else. A branch user arriving with `?branchId=` got whichever rows were already in the context.
     *
     * `storeType` is here because the Admin / IT / Disposal pages all render the same `StoreViewPage`
     * and switching between them does not remount this component.
     */
    useEffect(() => {
        fetchStoresCommoditiesPerBranchPerAsset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAssetType, storeType, branchId]);

    // The tab bar renders from the same value the fetch uses, so they cannot disagree.
    const activeTab = Math.max(0, tableHeaders.findIndex(h => h.id === currentAssetType?.id));

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
                    activeTab={activeTab}
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
