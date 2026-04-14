import {
    Box,
    Button,
    Card,
    Stack,
    Typography,
    Divider,
    useTheme,
    alpha,
    Tooltip,
    Chip,
    IconButton
} from '@mui/material';
import { useState } from 'react';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CameraOutdoorOutlinedIcon from '@mui/icons-material/CameraOutdoorOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
// import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';

import { IBranchDetails } from './interface';

const ViewBranch = ({ branch, deleteBranch, updateBranch }: IBranchDetails) => {
    const theme = useTheme();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (value: string, field: string) => {
        navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
    };

    // Management team definitions
    const managementTeam = [
        { label: 'Branch Manager', person: branch.branchManager },
        { label: 'Operations Manager', person: branch.branchOperationsManager },
        { label: 'Credit Administrator', person: branch.creditAdministrator },
        { label: 'Relationship Manager', person: branch.relationshipManager }
    ];

    // Check if there are any management team members
    const hasAnyManagement = managementTeam.some(item => item.person?.firstName);

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                transition: 'all 0.25s ease-in-out',
                height: '100%',
                '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                    transform: 'translateY(-4px)',
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                }
            }}
        >
            {/* Header with branch name */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    background: 'linear-gradient(135deg, rgba(8,121,108,0.1) 0%, rgba(8,121,108,0.03) 100%)',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(8,121,108,0.18)'
                        }}
                    >
                        <AccountBalanceOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {branch.name}
                        </Typography>
                        <Chip
                            size="small"
                            label="Branch Office"
                            sx={{
                                mt: 0.5,
                                fontSize: '0.7rem',
                                height: 20,
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                color: theme.palette.secondary.main,
                                fontWeight: 500
                            }}
                        />
                    </Box>
                </Stack>

                <Tooltip title="More options">
                    <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Contact Information */}
            <Box sx={{ p: 2.5 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75
                    }}
                >
                    <CameraOutdoorOutlinedIcon fontSize="small" />
                    Contact Information
                </Typography>

                <Stack
                    spacing={2}
                    sx={{
                        mb: 2.5,
                        '& .MuiBox-root': {
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5
                        }
                    }}
                >
                    <Box>
                        <EmailOutlinedIcon
                            fontSize="small"
                            sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                        />
                        <Stack sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">Email</Typography>
                            <Typography variant="body2">{branch.email || 'Not specified'}</Typography>
                        </Stack>
                        {branch.email && (
                            <Tooltip title={copiedField === 'email' ? 'Copied!' : 'Copy email'}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleCopy(branch.email!, 'email')}
                                    sx={{
                                        color: copiedField === 'email'
                                            ? '#08796C'
                                            : alpha(theme.palette.text.secondary, 0.5),
                                        '&:hover': { color: '#08796C' },
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    {copiedField === 'email'
                                        ? <DoneOutlinedIcon sx={{ fontSize: 16 }} />
                                        : <ContentCopyIcon sx={{ fontSize: 16 }} />
                                    }
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    <Box>
                        <PhoneAndroidOutlinedIcon
                            fontSize="small"
                            sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                        />
                        <Stack sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">Phone</Typography>
                            <Typography variant="body2">{branch.telephone || 'Not specified'}</Typography>
                        </Stack>
                        {branch.telephone && (
                            <Tooltip title={copiedField === 'phone' ? 'Copied!' : 'Copy phone'}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleCopy(branch.telephone!, 'phone')}
                                    sx={{
                                        color: copiedField === 'phone'
                                            ? '#08796C'
                                            : alpha(theme.palette.text.secondary, 0.5),
                                        '&:hover': { color: '#08796C' },
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    {copiedField === 'phone'
                                        ? <DoneOutlinedIcon sx={{ fontSize: 16 }} />
                                        : <ContentCopyIcon sx={{ fontSize: 16 }} />
                                    }
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    <Box>
                        <LocationOnOutlinedIcon
                            fontSize="small"
                            sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                        />
                        <Stack>
                            <Typography variant="caption" color="text.secondary">Location</Typography>
                            <Typography variant="body2">
                                {branch.district?.name && branch.region?.name
                                    ? `${branch.district.name}, ${branch.region.name}`
                                    : 'Not specified'}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                <Divider sx={{ my: 2, opacity: 0.7 }} />

                {/* Management Team */}
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75
                    }}
                >
                    <SupervisorAccountOutlinedIcon fontSize="small" />
                    Management Team
                </Typography>

                {/* If no management team members, show a message */}
                {!hasAnyManagement ? (
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.background.default, 0.6),
                            border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
                            textAlign: 'center'
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic' }}
                        >
                            No management team members assigned
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.5}>
                        {managementTeam.map(({ label, person }, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 500 }}
                                >
                                    {label}:
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        color: person?.firstName
                                            ? theme.palette.text.primary
                                            : alpha(theme.palette.text.secondary, 0.7),
                                        fontStyle: person?.firstName ? 'normal' : 'italic'
                                    }}
                                >
                                    {person?.firstName
                                        ? `${person.firstName} ${person.lastName}`
                                        : 'Not specified'
                                    }
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>

            {/* Actions */}
            <Box
                sx={{
                    p: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1,
                    bgcolor: alpha('#08796C', 0.02),
                }}
            >
                <Button
                    onClick={() => updateBranch(branch)}
                    variant="contained"
                    fullWidth
                    size="small"
                    sx={{
                        textTransform: 'none',
                        bgcolor: '#08796C',
                        '&:hover': { bgcolor: '#065E53' },
                        fontWeight: 600,
                        borderRadius: '8px',
                        boxShadow: '0 2px 6px rgba(8,121,108,0.3)',
                    }}
                    startIcon={<EditOutlinedIcon />}
                >
                    Edit
                </Button>
                <Button
                    onClick={() => deleteBranch(branch)}
                    variant="outlined"
                    fullWidth
                    size="small"
                    color="error"
                    sx={{
                        textTransform: 'none',
                        borderColor: alpha(theme.palette.error.main, 0.4),
                        '&:hover': {
                            borderColor: theme.palette.error.main,
                            bgcolor: alpha(theme.palette.error.main, 0.04)
                        },
                        fontWeight: 600,
                        borderRadius: '8px',
                    }}
                    startIcon={<DeleteOutlineOutlinedIcon />}
                >
                    Delete
                </Button>
            </Box>
        </Card>
    );
};

export default ViewBranch;