/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Card,
    IconButton,
    Stack,
    Typography,
    useTheme,
    alpha,
    Tooltip,
    Chip,
} from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

import { IRoleDetails } from "../interface";
import RoleUtills from "./utills";
import RoleRow from "./RoleRow";
import ActionPermissions from "./ActionPermissions";
import { normalizeLabel } from "../../../utils/helpers";

const PRIMARY = '#08796C';

const RoleDetails = ({ role, deleteRole, updateRole, allPermissions }: IRoleDetails) => {
    const { modulesList } = RoleUtills();
    const theme = useTheme();
    const permissionCount = (role.permissions as any[])?.length ?? 0;

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    borderColor: alpha(PRIMARY, 0.25),
                    boxShadow: `0 6px 20px ${alpha('#000', 0.05)}`,
                },
            }}
        >
            {/* Header strip — identity + actions */}
            <Box
                sx={{
                    position: 'relative',
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: alpha(PRIMARY, 0.04),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
            >
                {/* Brand accent bar */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, bgcolor: PRIMARY }} />

                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        bgcolor: alpha(PRIMARY, 0.12),
                        color: PRIMARY,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: `1px solid ${alpha(PRIMARY, 0.18)}`,
                    }}
                >
                    <ShieldOutlinedIcon />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.25 }}
                            title={role.name}
                        >
                            {normalizeLabel(role.name)}
                        </Typography>
                        <Chip
                            size="small"
                            icon={<VerifiedUserOutlinedIcon sx={{ fontSize: '0.85rem !important' }} />}
                            label={`${permissionCount} ${permissionCount === 1 ? 'permission' : 'permissions'}`}
                            sx={{
                                height: 22,
                                bgcolor: alpha(PRIMARY, 0.1),
                                color: PRIMARY,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                border: `1px solid ${alpha(PRIMARY, 0.18)}`,
                                '& .MuiChip-icon': { color: PRIMARY, ml: 0.5 },
                            }}
                        />
                    </Stack>
                    {role.description && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.25,
                                fontSize: '0.82rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                            title={role.description}
                        >
                            {role.description}
                        </Typography>
                    )}
                </Box>

                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Tooltip title="Edit role" arrow>
                        <IconButton
                            size="small"
                            onClick={() => updateRole(role)}
                            sx={{
                                color: PRIMARY,
                                bgcolor: alpha(PRIMARY, 0.08),
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha(PRIMARY, 0.16) },
                            }}
                        >
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete role" arrow>
                        <IconButton
                            size="small"
                            onClick={() => deleteRole(role)}
                            sx={{
                                color: theme.palette.error.main,
                                bgcolor: alpha(theme.palette.error.main, 0.08),
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) },
                            }}
                        >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Permissions table */}
            <Box>
                {/* Column headers — must match RoleRow's grid template exactly so columns align. */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '6fr 1fr 1fr 1fr 1fr',
                        gap: 2,
                        px: 3,
                        py: 1.25,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.7rem' }}
                    >
                        Module
                    </Typography>
                    {['Create', 'Read', 'Update', 'Delete'].map((h) => (
                        <Typography
                            key={h}
                            variant="caption"
                            sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.7rem', textAlign: 'center' }}
                        >
                            {h}
                        </Typography>
                    ))}
                </Box>

                <Box sx={{ maxHeight: 520, overflow: 'auto' }}>
                    {modulesList.map((module, index) => (
                        <RoleRow key={index} role={role} module={module} allPermissions={allPermissions} />
                    ))}
                    <ActionPermissions role={role} allPermissions={allPermissions} />
                </Box>
            </Box>
        </Card>
    );
};

export default RoleDetails;
