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
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import { ICommodityDetails } from './interface';
import { getCardColor } from '../cardColors';

const CommodityCard = ({
    commodity,
    updateCommodity,
    deleteCommodity,
    index = 0,
}: ICommodityDetails) => {
    const color = getCardColor(index);
    const suppliers = commodity.suppliers ?? [];

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
                        <CategoryOutlinedIcon fontSize="small" />
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3, mb: 0.5 }}
                            noWrap
                            title={commodity.name}
                        >
                            {commodity.name}
                        </Typography>
                        {commodity.assetType?.name && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {commodity.assetType.name}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                <Divider sx={{ my: 2, borderColor: alpha(color, 0.1) }} />

                {/* Detail rows */}
                <Stack spacing={1.25}>
                    <DetailRow
                        icon={<LayersOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />}
                        label="Unit"
                        value={commodity.groupName}
                        emptyLabel="Not specified"
                    />
                    <DetailRow
                        icon={<DescriptionOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />}
                        label="Type"
                        value={commodity.assetType?.name}
                        emptyLabel="Not specified"
                    />
                </Stack>

                {/* Suppliers */}
                <Divider sx={{ my: 2, borderColor: alpha(color, 0.1) }} />
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 0 }}>
                    <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8', mt: 0.5 }} />
                    {suppliers.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, flex: 1 }}>
                            {suppliers.map((s) => (
                                <Chip
                                    key={s.id}
                                    label={s.name}
                                    size="small"
                                    sx={{
                                        height: 22,
                                        fontSize: '0.68rem',
                                        fontWeight: 500,
                                        bgcolor: alpha(color, 0.08),
                                        color,
                                        border: `1px solid ${alpha(color, 0.2)}`,
                                        '& .MuiChip-label': { px: 0.75 },
                                    }}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Typography
                            variant="body2"
                            sx={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.8rem', flex: 1 }}
                        >
                            No suppliers linked
                        </Typography>
                    )}
                </Stack>

                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
                    <Tooltip title="Edit commodity" arrow>
                        <IconButton
                            size="small"
                            onClick={() => updateCommodity(commodity)}
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
                    <Tooltip title="Delete commodity" arrow>
                        <IconButton
                            size="small"
                            onClick={() => deleteCommodity(commodity)}
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

const DetailRow = ({
    icon,
    label,
    value,
    emptyLabel,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
    emptyLabel: string;
}) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        {icon}
        <Typography
            variant="caption"
            sx={{ color: '#64748B', fontWeight: 600, minWidth: 44, flexShrink: 0 }}
        >
            {label}
        </Typography>
        <Typography
            variant="body2"
            sx={{
                flex: 1,
                minWidth: 0,
                color: value ? '#334155' : '#94A3B8',
                fontStyle: value ? 'normal' : 'italic',
                fontWeight: value ? 500 : 400,
                fontSize: '0.8rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
            title={value ?? undefined}
        >
            {value || emptyLabel}
        </Typography>
    </Stack>
);

export default CommodityCard;
