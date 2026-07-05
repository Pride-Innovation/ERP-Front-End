/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import { SvgIconComponent } from '@mui/icons-material';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import StoreUtills from './utillls';
import Loading from '../../components/loading';
import { StoreContext } from '../../context/store';
import BranchStoreReport from './BranchStoreReport';
import CategorySummary from './CategorySummary';
import AssetTypeUtills from '../settings/assetTypes/utills';
import FilterBranchForm from './FilterBranchForm';
import { ROUTES } from '../../core/routes/routes';
import { PageHero } from '../../components/layout';

export type StoreType = 'admin' | 'it' | 'disposal';

interface StoreViewPageProps {
    storeType: StoreType;
    title: string;
    subtitle: string;
    Icon: SvgIconComponent;
    accentColor: string;
}

const StoreViewPage = ({ title, subtitle, Icon, accentColor }: StoreViewPageProps) => {
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
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <PageHero
                title={title}
                subtitle={subtitle}
                icon={<Icon />}
                actions={
                    <Button
                        onClick={() => navigate(ROUTES.STORE)}
                        startIcon={<ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            color: accentColor,
                            bgcolor: alpha(accentColor, 0.06),
                            border: `1px solid ${alpha(accentColor, 0.25)}`,
                            px: 1.75,
                            height: 36,
                            borderRadius: '8px',
                            flexShrink: 0,
                            '&:hover': {
                                bgcolor: alpha(accentColor, 0.12),
                                borderColor: alpha(accentColor, 0.45),
                            },
                        }}
                    >
                        Back to Stores
                    </Button>
                }
            />

            {/* Toolbar — current branch summary + branch filter */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent="space-between"
                sx={{ mb: 3 }}
            >
                {/* Current branch card */}
                <Paper
                    elevation={0}
                    sx={{
                        px: 2,
                        py: 1.5,
                        border: `1px solid ${alpha(accentColor, 0.18)}`,
                        borderRadius: 2,
                        bgcolor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        minWidth: 0,
                        flex: { xs: 1, md: '0 1 auto' },
                    }}
                >
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: alpha(accentColor, 0.1),
                            border: `1px solid ${alpha(accentColor, 0.2)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: accentColor,
                        }}
                    >
                        <StorefrontOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#94A3B8',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                fontSize: '0.65rem',
                                display: 'block',
                                lineHeight: 1,
                                mb: 0.4,
                            }}
                        >
                            Current branch
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}
                                noWrap
                                title={currentBranch?.name}
                            >
                                {currentBranch?.name || '—'}
                            </Typography>
                            {currentBranch?.name && (
                                <Chip
                                    size="small"
                                    label="Active"
                                    sx={{
                                        height: 18,
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        bgcolor: alpha('#22c55e', 0.1),
                                        color: '#15803d',
                                        border: `1px solid ${alpha('#22c55e', 0.25)}`,
                                        '& .MuiChip-label': { px: 0.75 },
                                    }}
                                />
                            )}
                        </Stack>
                        {(currentBranch?.email || currentBranch?.telephone) && (
                            <Stack direction="row" spacing={1.25} sx={{ mt: 0.4, flexWrap: 'wrap' }}>
                                {currentBranch?.email && (
                                    <Stack direction="row" alignItems="center" spacing={0.4}>
                                        <EmailOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }} noWrap>
                                            {currentBranch.email}
                                        </Typography>
                                    </Stack>
                                )}
                                {currentBranch?.telephone && (
                                    <Stack direction="row" alignItems="center" spacing={0.4}>
                                        <PhoneOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }} noWrap>
                                            {currentBranch.telephone}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        )}
                    </Box>
                </Paper>

                {/* Filter by branch */}
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flexShrink: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TuneOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                fontSize: '0.68rem',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Branch
                        </Typography>
                    </Stack>
                    <Box sx={{ minWidth: { xs: '100%', md: 260 } }}>
                        <FilterBranchForm />
                    </Box>
                </Stack>
            </Stack>

            {/* Items per category for the selected branch — moved here from the
                store landing page so that page stays a lightweight overview. */}
            <CategorySummary accentColor={accentColor} />

            {/* Main content */}
            {sendingRequest ? (
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha('#000', 0.08)}`,
                        p: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 280,
                        bgcolor: '#fff',
                    }}
                >
                    <Loading items="Store Commodity" />
                </Paper>
            ) : (
                <BranchStoreReport accentColor={accentColor} />
            )}
        </Box>
    );
};

export default StoreViewPage;
