/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Avatar,
    Box,
    Chip,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import { useState } from 'react';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';

import { IDepartmentDetails } from './interface';
import { getCardColor } from '../cardColors';

const DepartmentDetails = ({
    department,
    deleteDepartment,
    updateDepartment,
    manageUnits,
    index = 0,
}: IDepartmentDetails) => {
    const color = getCardColor(index);
    const [copied, setCopied] = useState(false);

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const branchLabel = department.branch?.name || (department.branch ? 'Head Office' : null);
    const hodLabel = department.headOfDepartment
        ? `${department.headOfDepartment.firstName} ${department.headOfDepartment.lastName}`
        : null;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2.5,
                border: `1px solid ${alpha(color, 0.18)}`,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: `0 4px 20px ${alpha(color, 0.15)}`,
                    transform: 'translateY(-2px)',
                    borderColor: alpha(color, 0.35),
                },
            }}
        >
            <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                        sx={{
                            width: 48,
                            height: 48,
                            bgcolor: alpha(color, 0.1),
                            color,
                            borderRadius: '12px',
                            flexShrink: 0,
                            border: `1px solid ${alpha(color, 0.2)}`,
                        }}
                    >
                        <AccountTreeOutlinedIcon fontSize="small" />
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}
                                noWrap
                                title={department.name}
                            >
                                {department.name}
                            </Typography>
                            {department.shortCode && (
                                <Chip
                                    label={department.shortCode}
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        bgcolor: alpha(color, 0.1),
                                        color,
                                        border: `1px solid ${alpha(color, 0.3)}`,
                                        '& .MuiChip-label': { px: 1 },
                                    }}
                                />
                            )}
                        </Stack>
                        {branchLabel && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <LocationOnOutlinedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    {branchLabel}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </Stack>

                <Divider sx={{ my: 2, borderColor: alpha(color, 0.1) }} />

                {/* Detail rows */}
                <Stack spacing={1.25}>
                    <DetailRow
                        icon={<SupervisorAccountOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />}
                        label="Head"
                        value={hodLabel}
                        emptyLabel="Not assigned"
                    />
                    <DetailRow
                        icon={<GroupsOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />}
                        label="Group"
                        value={department.managersGroupEmail}
                        emptyLabel="No group email"
                        valueColor={department.managersGroupEmail ? color : undefined}
                        action={
                            department.managersGroupEmail ? (
                                <Tooltip title={copied ? 'Copied!' : 'Copy email'} arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleCopy(department.managersGroupEmail!)}
                                        sx={{
                                            p: 0.25,
                                            color: copied ? '#08796C' : '#CBD5E1',
                                            '&:hover': { color: '#08796C' },
                                        }}
                                    >
                                        {copied
                                            ? <DoneOutlinedIcon sx={{ fontSize: 14 }} />
                                            : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                                    </IconButton>
                                </Tooltip>
                            ) : undefined
                        }
                    />
                </Stack>

                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
                    <Tooltip title="Manage units" arrow>
                        <IconButton
                            size="small"
                            onClick={() => manageUnits(department)}
                            sx={{
                                color,
                                bgcolor: alpha(color, 0.06),
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha(color, 0.14) },
                            }}
                        >
                            <GroupWorkOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit department" arrow>
                        <IconButton
                            size="small"
                            onClick={() => updateDepartment(department)}
                            sx={{
                                color,
                                bgcolor: alpha(color, 0.06),
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha(color, 0.14) },
                            }}
                        >
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete department" arrow>
                        <IconButton
                            size="small"
                            onClick={() => deleteDepartment(department)}
                            sx={{
                                color: 'error.main',
                                bgcolor: alpha('#ef4444', 0.06),
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha('#ef4444', 0.14) },
                            }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>
        </Paper>
    );
};

const DetailRow = ({
    icon,
    label,
    value,
    emptyLabel,
    valueColor,
    action,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
    emptyLabel: string;
    valueColor?: string;
    action?: React.ReactNode;
}) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        {icon}
        <Typography
            variant="caption"
            sx={{ color: '#64748B', fontWeight: 600, minWidth: 44, flexShrink: 0 }}
        >
            {label}
        </Typography>
        <Typography
            variant="body2"
            sx={{
                flex: 1,
                minWidth: 0,
                color: value ? (valueColor ?? '#334155') : '#94A3B8',
                fontStyle: value ? 'normal' : 'italic',
                fontWeight: value ? 500 : 400,
                fontSize: '0.8rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
            title={value ?? undefined}
        >
            {value || emptyLabel}
        </Typography>
        {action}
    </Stack>
);

export default DepartmentDetails;
