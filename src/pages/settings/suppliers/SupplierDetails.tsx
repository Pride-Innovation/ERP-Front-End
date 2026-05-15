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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import { useState } from 'react';
import { ISupplierDetails } from './interface';
import { ICommodity } from '../commodity/interface';

const SupplierDetails = ({
    supplier,
    deleteSupplier,
    updateSupplier
}: ISupplierDetails) => {
    const theme = useTheme();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (value: string, field: string) => {
        navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
    };

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
                                {supplier.email ? (
                                    <>
                                        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word', flex: 1 }}>
                                            {supplier.email}
                                        </Typography>
                                        <Tooltip title={copiedField === 'email' ? 'Copied!' : 'Copy email'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCopy(supplier.email!, 'email')}
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
                                                    : <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                                                }
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: alpha(theme.palette.text.secondary, 0.6), flex: 1 }}>
                                        Not Provided
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <PhoneAndroidOutlinedIcon
                                    fontSize="small"
                                    sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                                />
                                {supplier.telephone ? (
                                    <>
                                        <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                                            {supplier.telephone}
                                        </Typography>
                                        <Tooltip title={copiedField === 'phone' ? 'Copied!' : 'Copy phone'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCopy(supplier.telephone!, 'phone')}
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
                                                    : <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                                                }
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: alpha(theme.palette.text.secondary, 0.6), flex: 1 }}>
                                        Not Provided
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <LocationOnOutlinedIcon
                                    fontSize="small"
                                    sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                                />
                                {supplier.address ? (
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
                                ) : (
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: alpha(theme.palette.text.secondary, 0.6) }}>
                                        Not Provided
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                    </Box>

                    {/* Commodities Information */}
                    <>
                        <Divider sx={{ opacity: 0.5 }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                                Commodities Supplied
                            </Typography>
                            {supplier.commodities && supplier.commodities.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                    {supplier.commodities.map((c, index) => {
                                        const commodity = typeof c === 'object' ? c as ICommodity : null;
                                        if (!commodity) return null;
                                        return (
                                            <Chip
                                                key={commodity.id ?? index}
                                                icon={<Inventory2OutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                                label={commodity.name}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(8,121,108,0.08)',
                                                    color: '#08796C',
                                                    fontWeight: 500,
                                                    fontSize: '0.72rem',
                                                    '& .MuiChip-icon': { color: '#08796C' }
                                                }}
                                            />
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: alpha(theme.palette.text.secondary, 0.6) }}>
                                    No commodities assigned
                                </Typography>
                            )}
                        </Box>
                    </>
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
                    onClick={() => updateSupplier(supplier)}
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
                    onClick={() => deleteSupplier(supplier)}
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

export default SupplierDetails;