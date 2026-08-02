/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import {
    Chart as ChartJS,
    LineElement,
    BarElement,
    PointElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import { PageHero, PageSection, StatusChip } from '../../components/layout';
import { neutral } from '../../utils/tokens';
import RoutesUtills from '../../core/routes/utills';
import useDashboardCapabilities, { scopeLabel } from './personas';
import { useCategoryRegistry } from './categories';
import {
    useBranchAssetStats,
    useAssetsByBranch,
    useMonthlyStocking,
    useMyAssets,
    usePendingRequests,
    useRequestFulfilment,
} from './useDashboardData';
import { BAND_META, IWidgetSpec, resolveBands } from './widgets/registry';
import KpiBand from './widgets/KpiBand';
import AssetsByCategory from './widgets/AssetsByCategory';
import AssetCondition from './widgets/AssetCondition';
import BranchCategoryHeatmap from './widgets/BranchCategoryHeatmap';
import StockTrend from './widgets/StockTrend';
import RequestFulfilment from './widgets/RequestFulfilment';
import WorkQueue from './widgets/WorkQueue';
import MyAssets from './widgets/MyAssets';
import MyRequests from './widgets/MyRequests';

ChartJS.register(
    LineElement, BarElement, PointElement, ArcElement,
    CategoryScale, LinearScale, Title, Tooltip, Legend, Filler,
);

const greeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

/**
 * The dashboard.
 *
 * One shell, one widget registry. There is no longer a dashboard file per role — the previous
 * arrangement had three, two of which were copies of each other, behind a router that compared
 * `title.role.name` against title-shaped strings ("Branch Manager") that no seeded role ever
 * carried. Only SUPER_ADMIN ever matched, so in practice every other user in the bank was being
 * shown the personal dashboard regardless of what they actually do.
 *
 * What replaces it: each widget declares the permission it needs and the band it belongs to,
 * and the shell renders whatever the viewer qualifies for. A person who both approves requests
 * and leads a branch gets both sets — something a single role name cannot express. Granting or
 * revoking a permission is the whole mechanism; no code changes to move someone between views.
 */
const Dashboard = () => {
    const capabilities = useDashboardCapabilities();
    const { getCurrentUser } = RoutesUtills();
    const currentUserId = getCurrentUser()?.id ?? null;

    const scope = scopeLabel(capabilities);
    const seesOrgData = capabilities.readsAssets || capabilities.readsStore || capabilities.readsRequests;

    // Fetches live here, not in the widgets, so two widgets reading the same endpoint cause one
    // request rather than two.
    //
    // Every `enabled` flag below is the SAME expression as the `qualifies` predicate of the
    // widget that consumes it — see the specs further down. Keeping them literally identical is
    // what stops the dashboard firing a call the signed-in user is not allowed to make: an
    // earlier version hardcoded `true` for the two personal widgets, and an Officer (who holds
    // no READ_ASSET) got a 403 from `/assets/my-assets` on every page load.
    const seesRegister = capabilities.readsAssets;
    const seesAllBranches = capabilities.viewAllBranches;
    const seesStock = capabilities.readsStore || capabilities.readsInventory;
    const seesRequests = capabilities.readsRequests;
    const seesOwnRecords = capabilities.readsOwnRecords;

    // Only the stocking trend reads the category list, so nobody else pays for the lookup.
    const categories = useCategoryRegistry(seesStock);

    const branchStats = useBranchAssetStats(seesRegister);
    const assetsByBranch = useAssetsByBranch(seesAllBranches);
    const stocking = useMonthlyStocking(seesStock);
    const fulfilment = useRequestFulfilment(seesRequests);
    const pendingRequests = usePendingRequests(25, seesRequests);
    const myAssets = useMyAssets(seesOwnRecords);

    // The category widgets now consume the endpoint shapes directly — they need the condition
    // columns and the branch dimension, not a flattened {label, value} slice.
    const specs: IWidgetSpec[] = useMemo(() => [
        // ── Act ──────────────────────────────────────────────────────────────
        {
            id: 'work-queue',
            band: 'act',
            span: 12,
            // Matches `seesRequests` — the queue is fed by `/latest-pending-request`.
            qualifies: (c) => c.readsRequests,
            render: () => <WorkQueue requests={pendingRequests} scope={scope} />,
        },

        // ── Mine ─────────────────────────────────────────────────────────────
        {
            id: 'my-assets',
            band: 'mine',
            span: seesRequests ? 6 : 12,
            // Matches `seesOwnRecords`.
            qualifies: (c) => c.readsOwnRecords,
            render: () => <MyAssets assets={myAssets} />,
        },
        {
            id: 'my-requests',
            band: 'mine',
            span: 6,
            // Matches `seesRequests`: this filters the open-request queue down to the viewer's
            // own rows, so without READ_REQUEST there is nothing to filter and the widget is
            // withheld rather than shown empty.
            qualifies: (c) => c.readsOwnRecords && c.readsRequests,
            render: () => <MyRequests requests={pendingRequests} currentUserId={currentUserId} />,
        },

        // ── Position ─────────────────────────────────────────────────────────
        {
            id: 'assets-by-category',
            band: 'position',
            span: 8,
            qualifies: (c) => c.readsAssets,
            render: () => (
                <AssetsByCategory
                    stats={branchStats}
                    scope={capabilities.branchName ?? 'your branch'}
                />
            ),
        },
        {
            id: 'asset-condition',
            band: 'position',
            span: 4,
            qualifies: (c) => c.readsAssets,
            render: () => (
                <AssetCondition stats={branchStats} scope={capabilities.branchName ?? 'your branch'} />
            ),
        },
        {
            id: 'assets-all-branches',
            band: 'position',
            span: 12,
            qualifies: (c) => c.viewAllBranches,
            render: () => <BranchCategoryHeatmap cells={assetsByBranch} />,
        },

        // ── Trend ────────────────────────────────────────────────────────────
        {
            id: 'stock-trend',
            band: 'trend',
            span: 7,
            qualifies: (c) => c.readsStore || c.readsInventory,
            render: () => <StockTrend stocking={stocking} categories={categories} scope={scope} />,
        },
        {
            id: 'request-fulfilment',
            band: 'trend',
            span: 5,
            qualifies: (c) => c.readsRequests,
            render: () => <RequestFulfilment fulfilment={fulfilment} scope={scope} />,
        },
    ], [
        pendingRequests, myAssets, branchStats, assetsByBranch, stocking, fulfilment,
        categories, scope, currentUserId,
        capabilities.branchName, seesRequests,
    ]);

    const bands = useMemo(() => resolveBands(specs, capabilities), [specs, capabilities]);

    const heroIcon = capabilities.viewAllBranches
        ? <PublicOutlinedIcon />
        : seesOrgData ? <AccountTreeOutlinedIcon /> : <PersonOutlineOutlinedIcon />;

    return (
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1600, mx: 'auto' }}>
            <PageHero
                title={`${greeting()}${capabilities.firstName ? `, ${capabilities.firstName}` : ''}`}
                subtitle={new Date().toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
                icon={heroIcon}
                actions={
                    <StatusChip
                        label={scope}
                        tone={capabilities.viewAllBranches ? 'brand' : 'neutral'}
                        icon={<DashboardOutlinedIcon sx={{ fontSize: 14 }} />}
                        size="md"
                    />
                }
            />

            {/* The headline numbers sit above the bands — they are the page's summary, not a section. */}
            {capabilities.readsAssets && (
                <Box sx={{ mb: 4 }}>
                    <KpiBand stats={branchStats} scope={capabilities.branchName ?? 'Your branch'} />
                </Box>
            )}

            {bands.map(({ band, widgets }) => (
                <PageSection
                    key={band}
                    title={BAND_META[band].title}
                    subtitle={BAND_META[band].subtitle}
                >
                    <Grid container spacing={2.5} alignItems="stretch">
                        {widgets.map((widget) => (
                            <Grid item xs={12} lg={widget.span} key={widget.id}>
                                {widget.render()}
                            </Grid>
                        ))}
                    </Grid>
                </PageSection>
            ))}

            {bands.length === 0 && (
                <Typography variant="body2" sx={{ color: neutral[500], textAlign: 'center', py: 8 }}>
                    There is nothing to show on your dashboard yet.
                </Typography>
            )}
        </Box>
    );
};

export default Dashboard;
