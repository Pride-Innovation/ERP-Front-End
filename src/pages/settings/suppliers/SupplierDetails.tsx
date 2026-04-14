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
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ISupplierDetails } from './interface';

const SupplierDetails = ({
    supplier,
    deleteSupplier,
    updateSupplier
}: ISupplierDetails) => {
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
            {/* Header with supplier name */}
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
                        <LocalShippingOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {supplier.name}
                        </Typography>
                        <Chip
                            size="small"
                            label="Supplier"
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
                    {/* Contact Information */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                            Contact Information
                        </Typography>
                        <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <EmailOutlinedIcon
                                    fontSize="small"
                                    sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                                    {supplier.email}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <PhoneAndroidOutlinedIcon
                                    fontSize="small"
                                    sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {supplier.telephone}
                                </Typography>
                            </Box>

                            {supplier.address && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <LocationOnOutlinedIcon
                                        fontSize="small"
                                        sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                                    />
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
                                        {supplier.address}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>

                    {/* Commodity Information */}
                    {supplier.commodity && (
                        <>
                            <Divider sx={{ opacity: 0.5 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                                    Commodity Supplied
                                </Typography>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                        <Inventory2OutlinedIcon
                                            fontSize="small"
                                            sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {supplier.commodity.name}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                        <CategoryOutlinedIcon
                                            fontSize="small"
                                            sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {supplier.commodity.groupName}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </>
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
                    onClick={() => updateSupplier(supplier)}
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
                    onClick={() => deleteSupplier(supplier)}
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

export default SupplierDetails;