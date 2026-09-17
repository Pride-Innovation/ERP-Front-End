/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Alert,
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
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import StoreUtills from './utillls';
import { StoreContext } from '../../context/store';
import BranchStoreReport from './BranchStoreReport';
import StoreAssetsPanel from './StoreAssetsPanel';
import CategorySummary from './CategorySummary';
import AssetTypeUtills from '../settings/assetTypes/utills';
import FilterBranchForm from './FilterBranchForm';
import useAccessScope from '../../core/permissions/useAccessScope';
import { ROUTES } from '../../core/routes/routes';
import { PageHero } from '../../components/layout';
import { brand, neutral, surface, status } from '../../utils/tokens';

export type StoreType = 'admin' | 'it' | 'disposal';

/**
 * Accent colour per store container — the single source of truth.
 *
 * The landing page's quick-link pills and these three pages render the same store identity, so
 * holding the values in two places let them drift: the landing page moved onto design tokens
 * while the page wrappers still carried raw hex for the very same colours.
 *
 * IT's blue is deliberately not `status.info.main` (#3B82F6). That is a brighter,
 * notification-grade blue; this is an identity colour, so it keeps its own value until the
 * palette gains a proper slot for it.
 */
export const STORE_ACCENT: Record<StoreType, string> = {
    admin: brand[500],
    it: '#0369a1',
    disposal: status.warning.strong,
};

interface StoreViewPageProps {
    storeType: StoreType;
    title: string;
    subtitle: string;
    Icon: SvgIconComponent;
    accentColor: string;
}

const StoreViewPage = ({ storeType, title, subtitle, Icon, accentColor }: StoreViewPageProps) => {
    const { branchId, currentBranch, setStoreType, storeError, resetStoreView } = useContext(StoreContext);

    /** Set when a `?branchId=` was asked for that this viewer may not see. */
    const [refusedBranch, setRefusedBranch] = useState(false);

    /*
     * Whether this viewer can actually reach more than one branch.
     *
     * The picker below is offered only at ALL scope. `GET /store` resolves the branch through
     * `AccessScopeService` and refuses one the caller may not see, so below ALL every option but the
     * viewer's own came back 403 — a control whose every choice is an error reads as a broken page
     * rather than as a boundary. Nothing is lost by hiding it: the branch is already named in the
     * header beside it.
     *
     * Mirrors the inventory page, and `useAccessScope` mirrors `AccessScopeService` — if the two
     * drift, this either hides a control someone is entitled to or offers one the server refuses.
     */
    const { scopeFor, canView } = useAccessScope();
    const seesEveryBranch = scopeFor('INVENTORY', 'VIEW') === 'ALL';
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {
        setCurrentUserBranch,
        fetchBranchDetails,
    } = StoreUtills();

    // Scope every balance query on this page to the store container it represents
    // (Admin / IT / Disposal) — without this, all three pages show the same branch-wide list.
    useEffect(() => {
        setStoreType(storeType);
        return () => setStoreType('');
    }, [storeType]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Which branch this page opens on, and whether the viewer is allowed to ask for it.
     *
     * <h2>The URL is an input like any other</h2>
     * `?branchId=` comes from the landing page's drill-down, which is itself scoped — below ALL it
     * lists only the viewer's own branch. But a URL is also typed, bookmarked and shared, so a
     * branch user can arrive asking for Head Office's Admin store.
     *
     * <p>The server refuses that (`GET /store` calls `branchScope.requireAccessTo`, which refuses
     * rather than substituting), so nothing leaks. What went wrong was everything after the refusal:
     * the failure was swallowed, the table kept the **previous** branch's rows, and the header card
     * read "Current branch: Head Office" — because `GET /branches/{id}` is deliberately open to any
     * login and answered happily. The page asserted you were looking at a store it had just been
     * refused.
     *
     * <p>So the branch is checked here, against the same rule the server applies, before any of the
     * page's requests are built. Out of reach falls back to the viewer's own branch and says so,
     * instead of firing a page-load's worth of requests that will all be refused.
     *
     * <p>The reset matters as much: this context is mounted at the application root and survives
     * navigation, so without it the previous visit's rows, tabs and counts are what the new page
     * renders while it waits.
     */
    useEffect(() => {
        resetStoreView();

        const asked = searchParams.get('branchId');
        if (!asked) {
            setRefusedBranch(false);
            setCurrentUserBranch(undefined);
            return;
        }

        const wanted = Number(asked);
        if (!Number.isFinite(wanted) || !canView('INVENTORY', { branchId: wanted })) {
            setRefusedBranch(true);
            setCurrentUserBranch(undefined);
            return;
        }

        setRefusedBranch(false);
        setCurrentUserBranch(wanted);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);
    useEffect(() => { fetchAllAssetTypes(); }, []);
    useEffect(() => { if (branchId) { fetchBranchDetails(branchId as number); } }, [branchId]);

    return (
        // Same gutters as the store landing page, My Items and Stock Take. Without these the
        // three store pages sat on the app shell's padding alone, so stepping in from the
        // landing page visibly shifted the content outwards.
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
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
                        bgcolor: surface.card,
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
                                color: neutral[400],
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
                                sx={{ fontWeight: 700, color: neutral[800], lineHeight: 1.2 }}
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
                                        bgcolor: alpha(status.success.main, 0.1),
                                        color: status.success.strong,
                                        border: `1px solid ${alpha(status.success.main, 0.25)}`,
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

                {/* Filter by branch — only for someone who can reach more than one. The label goes
                    with it: a lone "Branch" caption over nothing reads as a control that failed to
                    load. */}
                {seesEveryBranch && (
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
                )}
            </Stack>

            {refusedBranch && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    That branch is outside what you can see, so this page has opened your own branch
                    instead.
                </Alert>
            )}

            {/* A refusal or a failed load, said plainly. It used to reach a console.log, which left
                the previous branch's rows standing as though they were this branch's. */}
            {storeError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {storeError}
                </Alert>
            )}

            {/* Items per category for the selected branch — moved here from the
                store landing page so that page stays a lightweight overview. */}
            <CategorySummary accentColor={accentColor} />

            {/*
              * Main content, always mounted.
              *
              * <p>This used to swap the whole block for a spinner while `sendingRequest` was true.
              * That was unreachable code — the flag belonged to a `StoreUtills()` instance that never
              * fetched anything — and making the flag real (it is shared state now) would have turned
              * it into an <b>infinite loop</b>: unmounting `BranchStoreReport` mid-fetch destroys the
              * component whose effect started it, and remounting it when the fetch ends starts
              * another. A table that is reloading should say so in place; it should not take the page
              * with it, and the grid already has `loading` for exactly this.
              */}
            <Stack spacing={3}>
                {/* Consumables live as StoreBalance rows; assets hang off Asset.currentStore.
                    The IT and Disposal stores hold only assets, so showing them the balance
                    table alone made them look permanently empty. Admin stores hold both. */}
                {storeType === 'admin' && <BranchStoreReport accentColor={accentColor} />}
                <StoreAssetsPanel
                    branchId={branchId as number | null}
                    storeType={storeType.toUpperCase()}
                    accentColor={accentColor}
                />
            </Stack>
        </Box>
    );
};

export default StoreViewPage;
