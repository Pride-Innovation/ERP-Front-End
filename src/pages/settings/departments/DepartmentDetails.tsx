/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Button,
    Card,
    Stack,
    Typography,
    useTheme,
    alpha,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { IDepartmentDetails } from './interface';

const DepartmentDetails = ({
    deleteDepartment,
    department,
    updateDepartment
}: IDepartmentDetails) => {
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                transition: 'all 0.25s ease-in-out',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                    transform: 'translateY(-4px)',
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                }
            }}
        >
            {/* Header with department name */}
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
                        <AccountTreeOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {department.name}
                        </Typography>
                        <Chip
                            size="small"
                            label="Department"
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

            {/* Content */}
            <Box sx={{ p: 2.5, flex: 1 }}>
                <Stack spacing={2}>
                    {/* Department Information */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                            Department Details
                        </Typography>
                        <Stack spacing={1.5}>
                            {/* Head of Department */}
                            {department.headOfDepartment && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <SupervisorAccountOutlinedIcon
                                        fontSize="small"
                                        sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                                    />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Head of Department
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {department.headOfDepartment.firstName} {department.headOfDepartment.lastName}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Branch Location */}
                            {department.branch && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <LocationOnOutlinedIcon
                                        fontSize="small"
                                        sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                                    />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Branch
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {department.branch.name || 'Head Office'}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Managers Group Email */}
                            {department.managersGroupEmail && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <GroupsOutlinedIcon
                                        fontSize="small"
                                        sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                                    />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Managers Group
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 500,
                                                wordBreak: 'break-word',
                                                color: theme.palette.primary.main
                                            }}
                                        >
                                            {department.managersGroupEmail}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </Box>

            {/* Actions */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    bgcolor: alpha('#08796C', 0.02)
                }}
            >
                <Button
                    onClick={() => updateDepartment(department)}
                    variant="contained"
                    fullWidth
                    size="small"
                    sx={{
                        textTransform: 'none',
                        bgcolor: '#08796C',
                        '&:hover': { bgcolor: '#065E53' },
                        boxShadow: '0 2px 8px rgba(8,121,108,0.25)',
                        fontWeight: 600,
                        borderRadius: '8px'
                    }}
                    startIcon={<EditOutlinedIcon />}
                >
                    Update
                </Button>
                <Button
                    onClick={() => deleteDepartment(department)}
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
                        borderRadius: '8px'
                    }}
                    startIcon={<DeleteOutlineOutlinedIcon />}
                >
                    Delete
                </Button>
            </Box>
        </Card>
    );
}

export default DepartmentDetails;