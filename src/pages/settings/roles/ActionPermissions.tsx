/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { useEffect, useState } from 'react';
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
import { updateRole } from './slice';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import { AppDispatch } from '../../../store';

/*
 * Metadata for each grantable permission, in the order they are shown.
 *
 * `group` splits the list into labelled sections. Without it the dashboard permissions would sit
 * among the action ones as seven more identical rows, and the two answer quite different questions:
 * an action permission says what you may *do*, a dashboard permission says what you may *see and
 * how far*. They are configured by different people for different reasons.
 */
const ACTION_PERMISSIONS = [
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
] as const;

/** Section headings, in render order. Entries with no `group` fall under the first. */
const PERMISSION_GROUPS = [
    'Action permissions',
    'Dashboard — what they see',
    'Dashboard — how far they see',
] as const;

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

    const grantedCount = ACTION_PERMISSIONS.filter(ap => isGranted(ap.name)).length;

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
                    label={`${grantedCount} / ${ACTION_PERMISSIONS.length} granted`}
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
                    const inGroup = ACTION_PERMISSIONS.filter((ap) =>
                        ((ap as { group?: string }).group ?? PERMISSION_GROUPS[0]) === groupName);
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
