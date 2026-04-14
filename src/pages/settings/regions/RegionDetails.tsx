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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IRegionDetails } from "./interface";

const RegionDetails = ({ region, deleteRegion, updateRegion }: IRegionDetails) => {
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
            {/* Header with region icon */}
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
                        <PublicOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {region.name}
                        </Typography>
                        <Chip
                            size="small"
                            label="Region"
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

            {/* Content - minimal for regions */}
            <Box sx={{ p: 2.5, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Region ID: {region.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Geographical region for branch organization and management
                </Typography>
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
                    onClick={() => updateRegion(region)}
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
                    onClick={() => deleteRegion(region)}
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
}

export default RegionDetails;