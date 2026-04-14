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
    Grid,
    IconButton,
    Stack,
    Typography,
    useTheme,
    alpha,
    Tooltip,
    Chip
} from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { IRoleDetails } from "../interface";
import RoleUtills from "./utills";
import RoleRow from "./RoleRow";

const RoleDetails = ({ role, deleteRole, updateRole }: IRoleDetails) => {
    const { modulesList } = RoleUtills();
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease',
                '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                    transform: 'translateY(-2px)'
                }
            }}
        >
            <Grid container>
                {/* Role Info Section */}
                <Grid item xs={12} md={3} sx={{
                    borderRight: { md: `1px solid ${alpha(theme.palette.divider, 0.1)}` },
                    borderBottom: { xs: `1px solid ${alpha(theme.palette.divider, 0.1)}`, md: 'none' },
                    background: 'linear-gradient(180deg, rgba(8,121,108,0.07) 0%, rgba(8,121,108,0.02) 100%)',
                    p: 3
                }}>
                    <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ShieldOutlinedIcon
                                sx={{
                                    fontSize: 40,
                                    color: theme.palette.primary.main
                                }}
                            />
                        </Box>

                        <Typography variant="h6" fontWeight={600} align="center">
                            {role.name}
                        </Typography>

                        <Chip
                            size="small"
                            icon={<SecurityOutlinedIcon />}
                            label={`${(role.permissions as any[])?.length || 0} permissions`}
                            sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 500,
                                borderRadius: 1.5
                            }}
                        />

                        <Stack direction="row" spacing={1.5} sx={{ width: '100%', mt: 2 }}>
                            <Tooltip title="Edit role">
                                <Button
                                    onClick={() => updateRole(role)}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    startIcon={<EditOutlinedIcon />}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: 1.5,
                                        borderColor: alpha(theme.palette.primary.main, 0.3)
                                    }}
                                >
                                    Edit
                                </Button>
                            </Tooltip>
                            <Tooltip title="Delete role">
                                <Button
                                    onClick={() => deleteRole(role)}
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    fullWidth
                                    startIcon={<DeleteOutlineOutlinedIcon />}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: 1.5,
                                        borderColor: alpha(theme.palette.error.main, 0.3)
                                    }}
                                >
                                    Delete
                                </Button>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Grid>

                {/* Permissions Section */}
                <Grid item xs={12} md={9}>
                    {/* Header */}
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bgcolor: 'rgba(8,121,108,0.07)',
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            color="primary"
                        >
                            Permissions
                        </Typography>
                        <Tooltip title="More options">
                            <IconButton size="small">
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Table header */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "6fr 1fr 1fr 1fr 1fr",
                            gap: 2,
                            px: 3,
                            py: 1.5,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`
                        }}
                    >
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                            Module
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">Create</Typography>
                        <Typography variant="body2" color="text.secondary" align="center">Read</Typography>
                        <Typography variant="body2" color="text.secondary" align="center">Update</Typography>
                        <Typography variant="body2" color="text.secondary" align="center">Delete</Typography>
                    </Box>

                    {/* Permission rows */}
                    <Box sx={{ maxHeight: '400px', overflow: 'auto', py: 1 }}>
                        {modulesList.map((module, index) => (
                            <RoleRow key={index} role={role} module={module} />
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Card>
    );
};

export default RoleDetails;