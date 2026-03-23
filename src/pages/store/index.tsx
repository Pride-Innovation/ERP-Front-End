/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import {
    Box,
    alpha,
    Divider,
    Grid,
    Paper,
    Typography,
    useTheme,
} from "@mui/material";
import RoofingOutlinedIcon from '@mui/icons-material/RoofingOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useContext, useEffect } from "react";
import StoreUtills from "./utillls";
import Loading from "../../components/loading";
import { StoreContext } from "../../context/store";
import BranchStoreReport from "./BranchStoreReport";
import AssetTypeUtills from "../settings/assetTypes/utills";
import FilterBranchForm from "./FilterBranchForm";

const Store = () => {
    const theme = useTheme();
    const { branchId, currentBranch } = useContext(StoreContext);
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const {
        setCurrentUserBranch,
        fetchBranchDetails,
        sendingRequest,
    } = StoreUtills()

    useEffect(() => { setCurrentUserBranch() }, []);
    useEffect(() => { fetchAllAssetTypes() }, []);

    useEffect(() => { if (branchId) { fetchBranchDetails(branchId as number) } }, [branchId]);

    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                minHeight: "85vh",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                borderRadius: 2.5,
                overflow: "hidden",
                border: `1px solid ${alpha('#000', 0.07)}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
        >
            {/* Sidebar */}
            <Box
                sx={{
                    width: { xs: "100%", md: "320px" },
                    flexShrink: 0,
                    bgcolor: '#FAFBFC',
                    borderRight: { md: `1px solid ${alpha('#000', 0.07)}` },
                    borderBottom: { xs: `1px solid ${alpha('#000', 0.07)}`, md: 'none' },
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {/* Sidebar header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <RoofingOutlinedIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                    </Box>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.secondary.main,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            fontSize: '0.8125rem',
                        }}
                    >
                        Store Report
                    </Typography>
                </Box>

                <Divider />

                {/* Branch Info Card */}
                <Box
                    sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        border: `1.5px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <StorefrontOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Current Branch
                        </Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        {currentBranch?.name || '—'}
                    </Typography>
                    {currentBranch?.email && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {currentBranch.email}
                        </Typography>
                    )}
                    {currentBranch?.telephone && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {currentBranch.telephone}
                        </Typography>
                    )}
                </Box>

                {/* Filter branch form */}
                <FilterBranchForm />
            </Box>

            {/* Main content */}
            <Box
                sx={{
                    bgcolor: theme.palette.background.paper,
                }}
            >
                {sendingRequest ? (
                    <Loading items="Store Commodity" />
                ) : (
                    <Grid container xs>
                        <BranchStoreReport />
                    </Grid>
                )}
            </Box>
        </Paper>
    );
};

export default Store;