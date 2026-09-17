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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';

import { IRegionDetails } from './interface';
import { getCardColor } from '../cardColors';

const RegionDetails = ({ region, deleteRegion, updateRegion, index = 0 }: IRegionDetails) => {
    const color = getCardColor(index);

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
                        <PublicOutlinedIcon fontSize="small" />
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}
                                noWrap
                                title={region.name}
                            >
                                {region.name}
                            </Typography>
                            <Chip
                                label="Region"
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
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            Geographical region for branch organisation
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 2, borderColor: alpha(color, 0.1) }} />

                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Region ID: {region.id}
                </Typography>

                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
                    <Tooltip title="Edit region" arrow>
                        <IconButton
                            size="small"
                            onClick={() => updateRegion(region)}
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
                    <Tooltip title="Delete region" arrow>
                        <IconButton
                            size="small"
                            onClick={() => deleteRegion(region)}
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

export default RegionDetails;
