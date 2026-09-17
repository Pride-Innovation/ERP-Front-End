/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Chip,
    Divider,
    Switch,
    Tooltip,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import { IPermission, IRole, IRoleAxiosResponse } from '../interface';
import { assignPermissionToRoleService, removePermissionFromRoleService } from './service';
import { MODULE_CRUD_PERMISSION_NAMES } from './utills';
import { updateRole } from './slice';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import { AppDispatch } from '../../../store';

/** One grantable permission as this page presents it. */
interface IPermissionMeta {
    /** Section this row is filed under. Omitted entries fall under the first group. */
    group?: string;
    name: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}

/*
 * Metadata for each grantable permission, in the order they are shown.
 *
 * `group` splits the list into labelled sections. Without it the dashboard permissions would sit
 * among the action ones as seven more identical rows, and the two answer quite different questions:
 * an action permission says what you may *do*, a dashboard permission says what you may *see and
 * how far*. They are configured by different people for different reasons.
 *
 * This list is curated for wording and grouping — it is NOT the list of what can be granted. Any
 * permission the backend seeds that appears neither here nor in the module CRUD grid above is
 * rendered under "Other permissions" from the live /permissions response, so a permission can never
 * again exist in the database, be enforced by the API, and have no control anywhere in Settings.
 */
const ACTION_PERMISSIONS: IPermissionMeta[] = [
    {
        name: 'APPROVE_REQUEST',
        label: 'Approve Request',
        description: 'Can approve or recommend asset requests through the workflow',
        icon: <ThumbUpOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#2E7D32',
        bg: '#E8F5E9',
    },
    {
        name: 'REJECT_REQUEST',
        label: 'Reject Request',
        description: 'Can reject asset requests and provide feedback for revisions',
        icon: <ThumbDownOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#C62828',
        bg: '#FFEBEE',
    },
    {
        name: 'ISSUE_ITEMS',
        label: 'Issue Items',
        description: 'Can issue stocked items to requestors from the store',
        icon: <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#0277BD',
        bg: '#E1F5FE',
    },
    {
        name: 'ACKNOWLEDGE_REQUEST',
        label: 'Acknowledge Request',
        description: 'Can acknowledge receipt of a request on behalf of admin / infrastructure',
        icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#6A1B9A',
        bg: '#F3E5F5',
    },
    {
        name: 'APPROVE_ISSUANCE',
        label: 'Approve Issuance',
        description: 'Can approve an issuance before items are handed over to the requestor',
        icon: <VerifiedOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#00695C',
        bg: '#E0F2F1',
    },

    // ── Asset lifecycle actions ──────────────────────────────────────────────
    // The row menu on the asset register. Split out of the Asset module's Create and Update boxes
    // above because the API matched on the HTTP verb: every POST under /assets/** answered to
    // CREATE_ASSET, so whoever could register an asset could also reassign one to another officer
    // and import a spreadsheet of several thousand; whoever could correct a model number could hand
    // the asset into a store.
    /*
     * An asset's trail. Carved out of READ_ASSET, so they read as narrowing rather than granting:
     * the asset's branch scope still applies on top, and holding one gives the trail of assets the
     * person can already see.
     *
     * Every role that held READ_ASSET at the moment of the split was backfilled with both, once, so
     * nobody lost a tab they had the day before. Revoke either here and it stays revoked.
     */
    {
        group: 'Asset actions',
        name: 'READ_ASSIGNMENT_HISTORY',
        label: 'Read Assignment History',
        description: 'Can see who has held an asset and when — its chain of custody',
        icon: <HistoryOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#00695C',
        bg: '#E0F2F1',
    },
    {
        group: 'Asset actions',
        name: 'READ_REPAIR_HISTORY',
        label: 'Read Repair History',
        description: 'Can see an asset’s maintenance record — separate from performing repairs',
        icon: <BuildOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#4E342E',
        bg: '#EFEBE9',
    },
    {
        group: 'Asset actions',
        name: 'REASSIGN_ASSET',
        label: 'Reassign Asset',
        description: 'Can transfer an asset from one officer to another',
        icon: <AssignmentIndOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#6A1B9A',
        bg: '#F3E5F5',
    },
    {
        group: 'Asset actions',
        name: 'REPAIR_ASSET',
        label: 'Repair Asset',
        description: 'Can book an asset in for repair and close the repair off',
        icon: <BuildOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#0277BD',
        bg: '#E1F5FE',
    },
    {
        group: 'Asset actions',
        name: 'RECEIVE_ASSET_IN_STORE',
        label: 'Receive Asset into Store',
        description: 'Can hand an asset back into a store and mark it as replacement pool stock',
        icon: <WarehouseOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#00695C',
        bg: '#E0F2F1',
    },
    {
        group: 'Asset actions',
        name: 'DISPOSE_ASSET',
        label: 'Dispose Asset',
        description: 'Can write an asset off and move it to the Disposal store. Takes it off the register for good',
        icon: <DeleteSweepOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#C62828',
        bg: '#FFEBEE',
    },
    {
        group: 'Asset actions',
        name: 'IMPORT_ASSET',
        label: 'Import Assets',
        description: 'Can register assets in bulk from a spreadsheet, and download the import template',
        icon: <UploadFileOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#455A64',
        bg: '#ECEFF1',
    },
    {
        group: 'Asset actions',
        name: 'EXPORT_ASSET',
        label: 'Export Assets',
        description: 'Can extract the whole register to a file. Separate from Read because this is data leaving the building — and it is audited',
        icon: <DownloadOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#B26A00',
        bg: '#FFF3E0',
    },

    // ── Movements ────────────────────────────────────────────────────────────
    // The module that physically moves stock between buildings. Every one of these endpoints was
    // open to any signed-in user until 2026-08-27. Dispatch and receive stay apart from create
    // because raising a transfer and handing custody over are different duties.
    {
        group: 'Movements & consignments',
        name: 'READ_MOVEMENT',
        label: 'View Movements',
        description: 'Can open the movements and consignments pages and see stock in flight',
        icon: <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#0277BD',
        bg: '#E1F5FE',
    },
    {
        group: 'Movements & consignments',
        name: 'CREATE_MOVEMENT',
        label: 'Raise Movement',
        description: 'Can raise a transfer, repair transfer, temporary replacement or return, and assemble a consignment',
        icon: <AddCircleOutlineOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#00695C',
        bg: '#E0F2F1',
    },
    {
        group: 'Movements & consignments',
        name: 'DISPATCH_MOVEMENT',
        label: 'Dispatch Movement',
        description: 'Can send stock out of a building and mark it in transit — custody leaving the premises',
        icon: <FlightTakeoffOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#4338CA',
        bg: '#E8EAF6',
    },
    {
        group: 'Movements & consignments',
        name: 'RECEIVE_MOVEMENT',
        label: 'Receive Movement',
        description: 'Can receive stock at its destination, mark a consignment arrived, and complete an internal movement',
        icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#047857',
        bg: '#E8F5E9',
    },
    {
        group: 'Movements & consignments',
        name: 'CANCEL_MOVEMENT',
        label: 'Cancel Movement',
        description: 'Can cancel a movement or a consignment in flight',
        icon: <CancelOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#C62828',
        bg: '#FFEBEE',
    },
    {
        group: 'Movements & consignments',
        name: 'APPROVE_MOVEMENT',
        label: 'Approve Movement',
        description: 'Can approve or reject a movement — and authorise proceeding with no approval at all when no approver can be found. That bypass is audited as CRITICAL',
        icon: <GavelOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#6A1B9A',
        bg: '#F3E5F5',
    },

    // ── Stock take ───────────────────────────────────────────────────────────
    // Seeded from the first stock-take release but never shown here, so the only way to grant one
    // was directly against the database. Counting is a designated duty and the person who counts
    // must not be the person who signs off their own variances — keep Perform and Approve apart.
    {
        group: 'Stock take',
        name: 'READ_STOCK_TAKE',
        label: 'View Stock Takes',
        description: 'Can open stock take sheets and their variance reports',
        icon: <FactCheckOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#0277BD',
        bg: '#E1F5FE',
    },
    {
        group: 'Stock take',
        name: 'PERFORM_STOCK_TAKE',
        label: 'Perform Stock Take',
        description: 'Can record physical counts against a stock take sheet',
        icon: <PlaylistAddCheckOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#00695C',
        bg: '#E0F2F1',
    },
    {
        group: 'Stock take',
        name: 'APPROVE_STOCK_TAKE',
        label: 'Approve Stock Take',
        description: 'Can sign off counted variances. Do not give this to the same person who counts',
        icon: <VerifiedOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#2E7D32',
        bg: '#E8F5E9',
    },

    // ── Cross-branch visibility ──────────────────────────────────────────────
    {
        group: 'Cross-branch visibility',
        name: 'VIEW_ALL_BRANCHES',
        label: 'View All Branches',
        description: 'Lifts the "your duty station only" restriction across the app, and opens the national asset reports',
        icon: <PublicOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#2E7D32',
        bg: '#E8F5E9',
    },

    /*
     * The cross-branch multipliers.
     *
     * These WIDEN a permission the holder already has and grant nothing alone: someone with
     * "See assets at every branch" but without Read Asset still cannot open the assets page. Worth
     * saying in each description, because the names read like grants and an administrator reasonably
     * assumes ticking one hands over access.
     *
     * Listed here rather than left to fall into "Other permissions", where they were grantable but
     * unexplained — the leftover bucket is the wrong place for the eight most consequential boxes on
     * the page. Manage entries are red: they are the ones that let someone change records belonging
     * to a branch that is not theirs.
     *
     * This is also what a unit confers, so most estates will grant these to a unit's role in
     * Settings -> Units rather than to a person's title.
     */
    {
        group: 'Cross-branch visibility',
        name: 'VIEW_ALL_BRANCH_ASSETS',
        label: 'See assets at every branch',
        description: 'Widens the asset register beyond their own branch. Grants no access on its own — they still need Read Asset',
        icon: <DevicesOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#2E7D32',
        bg: '#E8F5E9',
    },
    {
        group: 'Cross-branch visibility',
        name: 'MANAGE_ALL_BRANCH_ASSETS',
        label: 'Edit assets at any branch',
        description: 'Lets their existing asset permissions act on another branch’s assets — editing, reassigning, disposing',
        icon: <DevicesOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#C62828',
        bg: '#FFEBEE',
    },
    {
        group: 'Cross-branch visibility',
        name: 'VIEW_ALL_BRANCH_REQUESTS',
        label: 'See requests from every branch',
        description: 'Every branch’s requests from the moment they are raised. Not needed to act on one routed to their unit',
        icon: <AssignmentIndOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#2E7D32',
        bg: '#E8F5E9',
    },
    {
        group: 'Cross-branch visibility',
        name: 'MANAGE_ALL_BRANCH_REQUESTS',
        label: 'Act on any branch’s requests',
        description: 'Also lets them act on a workflow step that was routed to somebody else — the approval override',
        icon: <AssignmentIndOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#C62828',
        bg: '#FFEBEE',
    },
    {
        group: 'Cross-branch visibility',
        name: 'VIEW_ALL_BRANCH_MOVEMENTS',
        label: 'See movements at every branch',
        description: 'Stock movements and consignments wherever they start or end',
        icon: <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#2E7D32',
        bg: '#E8F5E9',
    },
    {
        group: 'Cross-branch visibility',
        name: 'MANAGE_ALL_BRANCH_MOVEMENTS',
        label: 'Act on any branch’s movements',
        description: 'Dispatch, receive, complete or cancel a movement that touches no branch of theirs',
        icon: <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#C62828',
        bg: '#FFEBEE',
    },
    {
        group: 'Cross-branch visibility',
        name: 'VIEW_ALL_BRANCH_INVENTORY',
        label: 'See stock at every branch',
        description: 'Stock balances and store contents across the estate',
        icon: <WarehouseOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#2E7D32',
        bg: '#E8F5E9',
    },
    {
        group: 'Cross-branch visibility',
        name: 'MANAGE_ALL_BRANCH_INVENTORY',
        label: 'Change stock at any branch',
        description: 'Adjust stock and create or edit stores belonging to another branch',
        icon: <WarehouseOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#C62828',
        bg: '#FFEBEE',
    },

    // ── Dashboard: subject ───────────────────────────────────────────────────
    // Which widgets exist for the holder. Separate from READ_ASSET and friends,
    // which govern whether a page opens at all.
    {
        group: 'Dashboard — what they see',
        name: 'DASH_VIEW_ASSETS',
        label: 'Dashboard: Assets',
        description: 'Shows the asset headline figures, assets by category and asset condition',
        icon: <DevicesOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#00695C',
        bg: '#E0F2F1',
    },
    {
        group: 'Dashboard — what they see',
        name: 'DASH_VIEW_REQUESTS',
        label: 'Dashboard: Requests',
        description: 'Shows the work queue, their open requests and request fulfilment',
        icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#6A1B9A',
        bg: '#F3E5F5',
    },
    {
        group: 'Dashboard — what they see',
        name: 'DASH_VIEW_STOCK',
        label: 'Dashboard: Stock',
        description: 'Shows the stocking trend',
        icon: <Inventory2OutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#0277BD',
        bg: '#E1F5FE',
    },
    {
        group: 'Dashboard — what they see',
        name: 'DASH_VIEW_MOVEMENTS',
        label: 'Dashboard: Movements',
        description: 'Shows transfers and consignments currently in flight',
        icon: <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#0277BD',
        bg: '#E1F5FE',
    },

    // ── Dashboard: scope ─────────────────────────────────────────────────────
    // How far those widgets reach. A ladder — the widest granted wins, so giving
    // Branch to someone who already has Own records simply widens them.
    {
        group: 'Dashboard — how far they see',
        name: 'DASH_SCOPE_SELF',
        label: 'Scope: Own records only',
        description: 'Figures count only what this person holds and what they asked for',
        icon: <PersonOutlineOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#455A64',
        bg: '#ECEFF1',
    },
    {
        group: 'Dashboard — how far they see',
        name: 'DASH_SCOPE_BRANCH',
        label: 'Scope: Their branch',
        description: 'Figures cover everything at the duty station they belong to',
        icon: <AccountTreeOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#0277BD',
        bg: '#E1F5FE',
    },
    {
        group: 'Dashboard — how far they see',
        name: 'DASH_SCOPE_ALL',
        label: 'Scope: All branches',
        description: 'Figures cover every branch and Head Office, with a branch selector to focus one',
        icon: <PublicOutlinedIcon sx={{ fontSize: 17 }} />,
        color: '#2E7D32',
        bg: '#E8F5E9',
    },
];

/** Heading the leftover permissions are filed under. Rendered only when there are any. */
const OTHER_GROUP = 'Other permissions';

/** Section headings, in render order. Entries with no `group` fall under the first. */
const PERMISSION_GROUPS = [
    'Action permissions',
    'Asset actions',
    'Movements & consignments',
    'Stock take',
    'Cross-branch visibility',
    'Dashboard — what they see',
    'Dashboard — how far they see',
    OTHER_GROUP,
] as const;

/** `VIEW_ALL_BRANCHES` -> `View all branches`. Used for permissions this page has no wording for. */
const humanisePermissionName = (name: string): string => {
    const words = name.split('_').filter(Boolean);
    if (words.length === 0) return name;
    const [first, ...rest] = words;
    return [
        first.charAt(0).toUpperCase() + first.slice(1).toLowerCase(),
        ...rest.map(word => word.toLowerCase()),
    ].join(' ');
};

interface ActionPermissionsProps {
    role: IRole;
    allPermissions: IPermission[];
}

const ActionPermissions: React.FC<ActionPermissionsProps> = ({ role, allPermissions }) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const [localPerms, setLocalPerms] = useState<IPermission[]>([]);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        setLocalPerms((role.permissions as IPermission[]) ?? []);
    }, [role.permissions]);

    const isGranted = (permName: string) => localPerms.some(p => p.name === permName);

    const handleToggle = async (permName: string) => {
        const permission = allPermissions.find(p => p.name === permName);
        if (!permission) {
            toast.error(`Permission "${permName}" not found. Ensure all permissions are seeded in the backend.`, {
                position: 'bottom-right',
            });
            return;
        }

        const currentlyGranted = isGranted(permName);
        setSaving(permName);

        try {
            let response: IRoleAxiosResponse;

            if (!currentlyGranted) {
                response = await assignPermissionToRoleService(
                    role.id as number,
                    permission.id as number,
                ) as IRoleAxiosResponse;
                toast.success(
                    `"${permName.split('_').join(' ').toLowerCase()}" granted to ${response.data.name}`,
                    { position: 'bottom-right' },
                );
            } else {
                response = await removePermissionFromRoleService(
                    role.id as number,
                    permission.id as number,
                ) as IRoleAxiosResponse;
                toast.info(
                    `"${permName.split('_').join(' ').toLowerCase()}" revoked from ${response.data.name}`,
                    { position: 'bottom-right' },
                );
            }

            if (response?.status === 200) {
                dispatch(updateRole(response.data));
                setLocalPerms((response.data.permissions as IPermission[]) ?? []);
            }
        } catch (error: any) {
            const detail = error?.response?.data?.detail;
            const message = error?.response?.data?.message;
            toast.error(detail || message || 'Failed to update permission. Please try again.', {
                position: 'bottom-right',
            });
        } finally {
            setSaving(null);
        }
    };

    /*
     * Everything seeded that neither the module CRUD grid above nor the curated list covers.
     *
     * Built from the live /permissions response rather than a hardcoded list, so a permission added
     * to the backend seed shows up here on the next page load with no frontend release. Before this
     * the page rendered a fixed twelve rows: VIEW_ALL_BRANCHES and the three stock-take permissions
     * were seeded and enforced but had no control anywhere in Settings, and the only way to grant
     * one was an UPDATE against the database.
     */
    const extraPermissions: IPermissionMeta[] = useMemo(() => {
        const curated = new Set(ACTION_PERMISSIONS.map(ap => ap.name));
        return (allPermissions ?? [])
            .filter(p => p?.name
                && !curated.has(p.name)
                && !MODULE_CRUD_PERMISSION_NAMES.has(p.name))
            .map(p => ({
                group: OTHER_GROUP,
                name: p.name,
                label: humanisePermissionName(p.name),
                description: `Granted as ${p.name}`,
                icon: <KeyOutlinedIcon sx={{ fontSize: 17 }} />,
                color: '#455A64',
                bg: '#ECEFF1',
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [allPermissions]);

    /** Curated rows first, then whatever else the backend knows about. */
    const permissionCatalogue = useMemo(
        () => [...ACTION_PERMISSIONS, ...extraPermissions],
        [extraPermissions],
    );

    const grantedCount = permissionCatalogue.filter(ap => isGranted(ap.name)).length;

    return (
        <>
            <Divider />

            {/* Section header */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    bgcolor: 'rgba(8,121,108,0.07)',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BoltOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                        Action Permissions
                    </Typography>
                </Box>
                <Chip
                    size="small"
                    label={`${grantedCount} / ${permissionCatalogue.length} granted`}
                    sx={{
                        bgcolor: grantedCount > 0
                            ? alpha(theme.palette.primary.main, 0.1)
                            : alpha(theme.palette.divider, 0.4),
                        color: grantedCount > 0 ? theme.palette.primary.main : 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        height: 22,
                    }}
                />
            </Box>

            {/* Column labels */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 2,
                    px: 3,
                    py: 1.25,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                }}
            >
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                    Permission
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ pr: 0.5 }}>
                    Granted
                </Typography>
            </Box>

            {/* Permission rows, split into labelled groups */}
            <Box>
                {PERMISSION_GROUPS.flatMap((groupName, groupIndex) => {
                    // Entries carrying no `group` belong to the first section, so the original
                    // action permissions keep their place without every one needing a label.
                    const inGroup = permissionCatalogue.filter((ap) =>
                        (ap.group ?? PERMISSION_GROUPS[0]) === groupName);
                    if (inGroup.length === 0) return [];

                    const heading = (
                        <Box
                            key={`group-${groupName}`}
                            sx={{
                                px: 3,
                                py: 1,
                                mt: groupIndex === 0 ? 0 : 0.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                borderTop: groupIndex === 0
                                    ? 'none'
                                    : `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 700,
                                    color: theme.palette.primary.main,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    fontSize: '0.68rem',
                                }}
                            >
                                {groupName}
                            </Typography>
                        </Box>
                    );

                    return [heading, ...inGroup.map((ap, index) => {
                    const granted = isGranted(ap.name);
                    const isSaving = saving === ap.name;
                    const isLast = index === inGroup.length - 1;

                    return (
                        <Box
                            key={ap.name}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 3,
                                py: 1.5,
                                borderBottom: isLast ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                                bgcolor: granted ? alpha(ap.color, 0.018) : 'transparent',
                                transition: 'background-color 0.15s ease',
                                '&:hover': {
                                    bgcolor: granted
                                        ? alpha(ap.color, 0.04)
                                        : alpha(theme.palette.primary.main, 0.02),
                                },
                            }}
                        >
                            {/* Left: icon + label + description */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '9px',
                                        bgcolor: granted ? ap.bg : alpha('#000', 0.05),
                                        color: granted ? ap.color : 'text.disabled',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {ap.icon}
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={granted ? 600 : 500}
                                            color={granted ? 'text.primary' : 'text.secondary'}
                                        >
                                            {ap.label}
                                        </Typography>
                                        {granted && (
                                            <Chip
                                                size="small"
                                                label="Active"
                                                sx={{
                                                    height: 18,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    bgcolor: alpha(ap.color, 0.1),
                                                    color: ap.color,
                                                    border: `1px solid ${alpha(ap.color, 0.2)}`,
                                                    '& .MuiChip-label': { px: 0.75 },
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        sx={{ display: 'block', lineHeight: 1.4 }}
                                    >
                                        {ap.description}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Right: toggle switch */}
                            <Tooltip
                                title={
                                    isSaving
                                        ? 'Saving…'
                                        : granted
                                        ? `Revoke "${ap.label}" from this role`
                                        : `Grant "${ap.label}" to this role`
                                }
                                placement="left"
                            >
                                <span>
                                    <Switch
                                        checked={granted}
                                        disabled={isSaving}
                                        onChange={() => handleToggle(ap.name)}
                                        size="small"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: ap.color,
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                bgcolor: ap.color,
                                                opacity: 0.5,
                                            },
                                        }}
                                    />
                                </span>
                            </Tooltip>
                        </Box>
                    );
                    })];
                })}
            </Box>
        </>
    );
};

export default ActionPermissions;
