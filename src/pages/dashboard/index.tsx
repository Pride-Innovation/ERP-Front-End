/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo, useState } from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
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
import BranchSelector, { ISelectedBranch } from './BranchSelector';
import { useCategoryRegistry } from './categories';
import {
    useBranchAssetStats,
    useAssetsByBranch,
    useMonthlyStocking,
    useMyAssets,
    useAwaitingMyDecision,
    useOpenRequests,
    useRequestFulfilment,
    useRecentActivity,
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
import RecentActivity from './widgets/RecentActivity';

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

    /*
     * Which branch the page is focused on. Null means the roll-up.
     *
     * Only ever set by a viewer at ALL scope — the selector is not rendered below that, and the
     * server refuses a branch that is not the viewer's own, so a stale value could not widen
     * anything even if one were somehow set.
     */
    const [selectedBranch, setSelectedBranch] = useState<ISelectedBranch | null>(null);
    const focused = capabilities.scope === 'ALL' ? selectedBranch : null;
    const focusedBranchId = focused?.id ?? null;

    /*
     * What the page says it is showing.
     *
     * The chip and every widget subtitle read from the same value, so they cannot describe
     * different things — which is the whole reason the branch filter is one page-level control
     * rather than one per widget.
     */
    const scope = focused ? focused.name : scopeLabel(capabilities);
    /**
     * Subtitle for the scoped widgets — what the figures in them actually cover.
     *
     * At ALL scope with no branch chosen these are national, so they must not be labelled with the
     * viewer's own station: a Head Office administrator would read "Head Office" over figures for
     * the whole bank, which is the exact mislabel this work set out to remove.
     */
    const positionScope = focused?.name
        ?? (capabilities.scope === 'ALL'
            ? 'All branches & Head Office'
            : capabilities.branchName ?? 'your records');

    // Fetches live here, not in the widgets, so two widgets reading the same endpoint cause one
    // request rather than two.
    //
    // Every `enabled` flag below is the SAME expression as the `qualifies` predicate of the
    // widget that consumes it — see the specs further down. Keeping them literally identical is
    // what stops the dashboard firing a call the signed-in user is not allowed to make: an
    // earlier version hardcoded `true` for the two personal widgets, and an Officer (who holds
    // no READ_ASSET) got a 403 from `/assets/my-assets` on every page load.
    const seesRegister = capabilities.viewsAssets;
    const seesAllBranches = capabilities.viewAllBranches;
    const seesStock = capabilities.viewsStock;
    const seesRequests = capabilities.viewsRequests;
    const seesOwnRecords = capabilities.readsOwnRecords;

    // Only the stocking trend reads the category list, so nobody else pays for the lookup.
    const categories = useCategoryRegistry(seesStock);

    const branchStats = useBranchAssetStats(seesRegister, focusedBranchId);
    const assetsByBranch = useAssetsByBranch(seesAllBranches);
    const stocking = useMonthlyStocking(seesStock, focusedBranchId);
    const fulfilment = useRequestFulfilment(seesRequests, focusedBranchId);
    /*
     * Two questions, two calls.
     *
     * "Who is waiting on me" and "what is still open" were previously answered by one endpoint and
     * one widget, which is why neither was right: a queue titled "Needs Action" showed requests
     * nobody was being asked to act on, and a requester's own request vanished from it as soon as
     * the first approver touched it.
     */
    const awaitingMe = useAwaitingMyDecision(25, seesRequests);
    const openRequests = useOpenRequests(25, seesRequests, focusedBranchId);
    const myAssets = useMyAssets(seesOwnRecords);
    // The Records band. Gated on the same permission as the audit trail page itself, so nobody sees
    // a digest of activity they could not open in full.
    const seesActivity = capabilities.viewsAssets || capabilities.viewsRequests;
    const recentActivity = useRecentActivity(8, seesActivity);

    // The category widgets now consume the endpoint shapes directly — they need the condition
    // columns and the branch dimension, not a flattened {label, value} slice.
    const specs: IWidgetSpec[] = useMemo(() => [
        // ── Act ──────────────────────────────────────────────────────────────
        {
            id: 'work-queue',
            band: 'act',
            span: 12,
            // Matches `seesRequests` — the queue is fed by `/latest-pending-request`.
            qualifies: (c) => c.viewsRequests,
            render: () => <WorkQueue requests={awaitingMe} />,
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
            qualifies: (c) => c.readsOwnRecords && c.viewsRequests,
            render: () => <MyRequests requests={openRequests} currentUserId={currentUserId} />,
        },

        // ── Position ─────────────────────────────────────────────────────────
        {
            id: 'assets-by-category',
            band: 'position',
            span: 8,
            qualifies: (c) => c.viewsAssets,
            render: () => (
                <AssetsByCategory
                    stats={branchStats}
                    scope={positionScope}
                />
            ),
        },
        {
            id: 'asset-condition',
            band: 'position',
            span: 4,
            qualifies: (c) => c.viewsAssets,
            render: () => (
                <AssetCondition stats={branchStats} scope={positionScope} />
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
            qualifies: (c) => c.viewsStock,
            render: () => <StockTrend stocking={stocking} categories={categories} scope={scope} />,
        },
        {
            id: 'request-fulfilment',
            band: 'trend',
            span: 5,
            qualifies: (c) => c.viewsRequests,
            render: () => <RequestFulfilment fulfilment={fulfilment} scope={scope} />,
        },

        // ── Records ──────────────────────────────────────────────────────────
        {
            id: 'recent-activity',
            band: 'records',
            span: 12,
            // Anyone who can see assets or requests can see what has been happening to them; the
            // trail itself is where the full, filterable record lives.
            qualifies: (c) => c.viewsAssets || c.viewsRequests,
            render: () => <RecentActivity events={recentActivity} />,
        },
    ], [
        awaitingMe, openRequests, myAssets, branchStats, assetsByBranch, stocking, fulfilment,
        recentActivity,
        categories, scope, currentUserId,
        positionScope, seesRequests,
    ]);

    const bands = useMemo(() => resolveBands(specs, capabilities), [specs, capabilities]);

    /*
     * The icon states the reach, so it is driven by scope alone.
     *
     * It used to key off "does this viewer read any organisational data", which is a different
     * question and gave the wrong answer twice: a branch lead whose role had no permissions seeded
     * yet got the personal icon, and — because the login response omitted the user's branch
     * entirely — so did everyone else below Head Office. Scope now decides, and it matches the
     * label beside it.
     */
    const heroIcon = capabilities.scope === 'ALL'
        ? <PublicOutlinedIcon />
        : capabilities.scope === 'BRANCH' ? <AccountTreeOutlinedIcon /> : <PersonOutlineOutlinedIcon />;

    return (
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1600, mx: 'auto' }}>
            <PageHero
                title={`${greeting()}${capabilities.firstName ? `, ${capabilities.firstName}` : ''}`}
                subtitle={new Date().toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
                icon={heroIcon}
                actions={
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {/* Offered only at ALL scope: below that the server refuses any branch but
                            the viewer's own, so the control would promise something it cannot do. */}
                        {capabilities.scope === 'ALL' && (
                            <BranchSelector value={selectedBranch} onChange={setSelectedBranch} />
                        )}
                        <StatusChip
                            label={scope}
                            tone={capabilities.viewAllBranches ? 'brand' : 'neutral'}
                            icon={<DashboardOutlinedIcon sx={{ fontSize: 14 }} />}
                            size="md"
                        />
                    </Stack>
                }
            />

            {/* The headline numbers sit above the bands — they are the page's summary, not a section. */}
            {capabilities.viewsAssets && (
                <Box sx={{ mb: 4 }}>
                    <KpiBand stats={branchStats} scope={positionScope} />
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
