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
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ICommodityDetails } from './interface';

const CommodityCard = ({ commodity, updateCommodity, deleteCommodity }: ICommodityDetails) => {
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
            {/* Header with commodity name */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
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
                            bgcolor: alpha(theme.palette.primary.main, 0.12)
                        }}
                    >
                        <CategoryOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {commodity.name}
                        </Typography>
                        <Chip
                            size="small"
                            label="Commodity"
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
                    {/* Unit of Measure */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <LayersOutlinedIcon
                            fontSize="small"
                            sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                        />
                        <Stack>
                            <Typography variant="caption" color="text.secondary">Unit of Measure</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {commodity.groupName || 'Not specified'}
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Asset Type */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <DescriptionOutlinedIcon
                            fontSize="small"
                            sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                        />
                        <Stack>
                            <Typography variant="caption" color="text.secondary">Asset Type</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {commodity.assetType?.name || 'Not specified'}
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Description */}
                    {commodity.assetType?.description && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <DescriptionOutlinedIcon
                                fontSize="small"
                                sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                            />
                            <Stack>
                                <Typography variant="caption" color="text.secondary">Description</Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {commodity.assetType.description}
                                </Typography>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Box>

            {/* Actions */}
            <Box
                sx={{
                    mt: 'auto',
                    p: 2,
                    pt: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1
                }}
            >
                <Button
                    onClick={() => updateCommodity(commodity)}
                    variant="outlined"
                    fullWidth
                    size="small"
                    sx={{
                        textTransform: 'none',
                        color: theme.palette.primary.main,
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        '&:hover': {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.04)
                        },
                        fontWeight: 500,
                        borderRadius: 1.5
                    }}
                    startIcon={<EditOutlinedIcon />}
                >
                    Update
                </Button>
                <Button
                    onClick={() => deleteCommodity(commodity)}
                    variant="outlined"
                    fullWidth
                    size="small"
                    color="error"
                    sx={{
                        textTransform: 'none',
                        borderColor: alpha(theme.palette.error.main, 0.3),
                        '&:hover': {
                            borderColor: theme.palette.error.main,
                            bgcolor: alpha(theme.palette.error.main, 0.04)
                        },
                        fontWeight: 500,
                        borderRadius: 1.5
                    }}
                    startIcon={<DeleteOutlineOutlinedIcon />}
                >
                    Delete
                </Button>
            </Box>
        </Card>
    );
};

export default CommodityCard;