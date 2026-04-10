/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    alpha,
    Chip,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import { useContext, useEffect } from "react";
import StoreUtills from "./utillls";
import Loading from "../../components/loading";
import { StoreContext } from "../../context/store";
import BranchStoreReport from "./BranchStoreReport";
import AssetTypeUtills from "../settings/assetTypes/utills";
import FilterBranchForm from "./FilterBranchForm";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../core/routes/routes";
import { SvgIconComponent } from "@mui/icons-material";
// import ButtonComponent from "../../components/forms/Button";

export type StoreType = 'admin' | 'it' | 'disposal';

interface StoreViewPageProps {
    storeType: StoreType;
    title: string;
    subtitle: string;
    Icon: SvgIconComponent;
    gradient: string;
    accentColor: string;
}

const StoreViewPage = ({ storeType, title, subtitle, Icon, gradient, accentColor }: StoreViewPageProps) => {
    const { branchId, currentBranch } = useContext(StoreContext);
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const navigate = useNavigate();
    const {
        setCurrentUserBranch,
        fetchBranchDetails,
        sendingRequest,
    } = StoreUtills();

    useEffect(() => { setCurrentUserBranch(); }, []);
    useEffect(() => { fetchAllAssetTypes(); }, []);
    useEffect(() => { if (branchId) { fetchBranchDetails(branchId as number); } }, [branchId]);

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, width: '100%', minHeight: '85vh' }}>

            {/* ── Sidebar ── */}
            <Box
                component={Paper}
                elevation={0}
                sx={{
                    width: { xs: '100%', lg: 290 },
                    flexShrink: 0,
                    borderRadius: 3,
                    border: `1px solid ${alpha('#000', 0.07)}`,
                    bgcolor: '#FAFBFC',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: 'flex-start',
                    position: { lg: 'sticky' },
                    top: { lg: 24 },
                }}
            >
                {/* Sidebar gradient header */}
                <Box
                    sx={{
                        background: gradient,
                        p: 2.5,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Decorative circles */}
                    <Box sx={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
                    <Box sx={{ position: 'absolute', right: 20, bottom: -20, width: 50, height: 50, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

                    <Stack direction="row" alignItems="center" gap={1.5} sx={{ position: 'relative' }}>
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Icon sx={{ fontSize: 19, color: '#fff' }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem', display: 'block' }}>
                                Store
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                                {title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem' }}>
                                {subtitle}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    {/* Back to overview */}
                    <Box
                        onClick={() => navigate(ROUTES.STORE)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            cursor: 'pointer',
                            color: alpha(accentColor, 0.8),
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            '&:hover': { color: accentColor },
                            transition: 'color 0.2s',
                        }}
                    >
                        <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'inherit' }}>
                            Back to Store Overview
                        </Typography>
                    </Box>

                    <Divider sx={{ borderColor: alpha('#000', 0.06) }} />

                    {/* Branch Info Card */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: '#fff',
                            border: `1.5px solid ${alpha(accentColor, 0.18)}`,
                            borderRadius: 2.5,
                            boxShadow: `0 1px 4px ${alpha(accentColor, 0.06)}`,
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                            <Box
                                sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(accentColor, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <StorefrontOutlinedIcon sx={{ fontSize: 15, color: accentColor }} />
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{ color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}
                            >
                                Current Branch
                            </Typography>
                        </Stack>

                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                            {currentBranch?.name || '—'}
                        </Typography>

                        <Stack spacing={0.75}>
                            {currentBranch?.email && (
                                <Stack direction="row" alignItems="center" spacing={0.75}>
                                    <EmailOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.775rem' }}>
                                        {currentBranch.email}
                                    </Typography>
                                </Stack>
                            )}
                            {currentBranch?.telephone && (
                                <Stack direction="row" alignItems="center" spacing={0.75}>
                                    <PhoneOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.775rem' }}>
                                        {currentBranch.telephone}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>

                        {currentBranch?.name && (
                            <Chip
                                size="small"
                                label="Active"
                                sx={{
                                    mt: 1.5,
                                    height: 20,
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    bgcolor: alpha('#22c55e', 0.1),
                                    color: '#16a34a',
                                    border: `1px solid ${alpha('#22c55e', 0.25)}`,
                                    '& .MuiChip-label': { px: 1 },
                                }}
                            />
                        )}
                    </Box>

                    <Divider sx={{ borderColor: alpha('#000', 0.06) }} />

                    {/* Branch filter */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1.25}>
                            <TuneOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                                Filter by Branch
                            </Typography>
                        </Stack>
                        <FilterBranchForm />
                    </Box>
                </Box>
            </Box>

            {/* ── Main content ── */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {sendingRequest ? (
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border: `1px solid ${alpha('#000', 0.07)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 300,
                        }}
                    >
                        <Loading items="Store Commodity" />
                    </Paper>
                ) : (
                    <BranchStoreReport storeTitle={title} accentColor={accentColor} />
                )}
            </Box>
        </Box>
    );
};

export default StoreViewPage;
