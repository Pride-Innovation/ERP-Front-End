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
    Chip,
    Stack,
    Typography,
    useTheme,
    alpha,
    IconButton,
    Tooltip
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
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

                    {/* Suppliers */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <LocalShippingOutlinedIcon
                            fontSize="small"
                            sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                        />
                        <Stack sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">Suppliers</Typography>
                            {commodity.suppliers && commodity.suppliers.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                    {commodity.suppliers.map((supplier) => (
                                        <Chip
                                            key={supplier.id}
                                            label={supplier.name}
                                            size="small"
                                            sx={{
                                                fontSize: '0.7rem',
                                                height: 20,
                                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                color: theme.palette.primary.main,
                                                fontWeight: 500,
                                            }}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: alpha(theme.palette.text.secondary, 0.7) }}>
                                    No suppliers linked
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                </Stack>
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
                    onClick={() => updateCommodity(commodity)}
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
                    onClick={() => deleteCommodity(commodity)}
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

export default CommodityCard;