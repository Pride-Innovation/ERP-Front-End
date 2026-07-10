/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ROUTES } from '../../core/routes/routes';
import AssetTypeUtills from '../settings/assetTypes/utills';

/**
 * Landing element for `/assets-mgt/assets` — replaces the old hardcoded
 * redirect to `/assets/office-equipment`. Reads the configured asset
 * categories and forwards to the first one's parameterised route
 * (`/assets/general/{typeId}`). This means *any* asset category configured
 * in Settings becomes a valid landing target without touching code.
 */
const AssetsLanding = () => {
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { fetchAllAssetTypes } = AssetTypeUtills();

    useEffect(() => {
        if (assetTypes.length === 0) fetchAllAssetTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (assetTypes.length === 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240, gap: 1.5 }}>
                <CircularProgress size={24} sx={{ color: '#08796C' }} />
                <Typography variant="caption" color="text.secondary">
                    Loading asset categories…
                </Typography>
            </Box>
        );
    }

    // Land on the first category that tracks serialized assets — consumable categories
    // have no asset register page (their stock lives on the Store pages).
    const first = assetTypes.find((t) => t.tracksAssets === true) ?? assetTypes[0];
    return <Navigate to={`${ROUTES.LIST_GENERAL_ASSETS}/${first.id}`} replace />;
};

export default AssetsLanding;
