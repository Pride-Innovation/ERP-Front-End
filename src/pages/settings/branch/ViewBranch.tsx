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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';

import { IBranchDetails } from './interface';
import { getCardColor } from '../cardColors';

const ViewBranch = ({ branch, deleteBranch, updateBranch, index = 0 }: IBranchDetails) => {
    const color = getCardColor(index);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (value: string, field: string) => {
        navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
    };

    const managementTeam = [
        { label: 'Branch Manager', person: branch.branchManager },
        { label: 'Operations', person: branch.branchOperationsManager },
        { label: 'Credit Admin', person: branch.creditAdministrator },
        { label: 'Relationship', person: branch.relationshipManager },
    ];
    const filledTeam = managementTeam.filter((m) => m.person?.firstName);

    const location =
        branch.district?.name && branch.region?.name
            ? `${branch.district.name}, ${branch.region.name}`
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
                {/* Header — icon + name + tag */}
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
                        <AccountBalanceOutlinedIcon fontSize="small" />
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}
                                noWrap
                                title={branch.name}
                            >
                                {branch.name}
                            </Typography>
                            {branch.isHeadOffice && (
                                <Chip
                                    label="HQ"
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
                        {location && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <LocationOnOutlinedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                                <Typography variant="caption" color="text.secondary" noWrap title={location}>
                                    {location}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </Stack>

                <Divider sx={{ my: 2, borderColor: alpha(color, 0.1) }} />

                {/* Contact rows — compact, with inline copy */}
                <Stack spacing={1.25}>
                    <ContactRow
                        icon={<EmailOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />}
                        value={branch.email}
                        emptyLabel="No email"
                        copyState={copiedField === 'email'}
                        onCopy={branch.email ? () => handleCopy(branch.email, 'email') : undefined}
                    />
                    <ContactRow
                        icon={<PhoneAndroidOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />}
                        value={branch.telephone}
                        emptyLabel="No phone"
                        copyState={copiedField === 'phone'}
                        onCopy={branch.telephone ? () => handleCopy(branch.telephone!, 'phone') : undefined}
                    />
                </Stack>

                {/* Management chips — only render section if we have any */}
                {filledTeam.length > 0 && (
                    <>
                        <Divider sx={{ my: 2, borderColor: alpha(color, 0.1) }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {filledTeam.map(({ label, person }) => (
                                <Tooltip
                                    key={label}
                                    title={`${label}: ${person!.firstName} ${person!.lastName}`}
                                    arrow
                                >
                                    <Chip
                                        size="small"
                                        label={`${label}: ${person!.firstName} ${person!.lastName}`}
                                        sx={{
                                            height: 22,
                                            maxWidth: '100%',
                                            fontSize: '0.68rem',
                                            fontWeight: 500,
                                            bgcolor: alpha(color, 0.08),
                                            color,
                                            border: `1px solid ${alpha(color, 0.2)}`,
                                            '& .MuiChip-label': {
                                                px: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            },
                                        }}
                                    />
                                </Tooltip>
                            ))}
                        </Box>
                    </>
                )}

                {/* Actions — small icon buttons, right-aligned */}
                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
                    <Tooltip title="Edit branch" arrow>
                        <IconButton
                            size="small"
                            onClick={() => updateBranch(branch)}
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
                    <Tooltip title="Delete branch" arrow>
                        <IconButton
                            size="small"
                            onClick={() => deleteBranch(branch)}
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

/** Single compact contact row — icon, value (or empty label), optional copy. */
const ContactRow = ({
    icon,
    value,
    emptyLabel,
    copyState,
    onCopy,
}: {
    icon: React.ReactNode;
    value?: string | null;
    emptyLabel: string;
    copyState: boolean;
    onCopy?: () => void;
}) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        {icon}
        <Typography
            variant="body2"
            sx={{
                flex: 1,
                minWidth: 0,
                color: value ? '#334155' : '#94A3B8',
                fontStyle: value ? 'normal' : 'italic',
                fontSize: '0.8rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
            title={value ?? undefined}
        >
            {value || emptyLabel}
        </Typography>
        {onCopy && (
            <Tooltip title={copyState ? 'Copied!' : 'Copy'} arrow>
                <IconButton
                    size="small"
                    onClick={onCopy}
                    sx={{
                        p: 0.25,
                        color: copyState ? '#08796C' : '#CBD5E1',
                        '&:hover': { color: '#08796C' },
                    }}
                >
                    {copyState ? <DoneOutlinedIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                </IconButton>
            </Tooltip>
        )}
    </Stack>
);

export default ViewBranch;
