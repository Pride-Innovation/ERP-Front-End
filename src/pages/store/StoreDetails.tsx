/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Chip,
    Divider,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useContext, useEffect } from 'react';
import { StoreContext } from '../../context/store';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ButtonComponent from '../../components/forms/Button';
import StoreUtills from './utillls';

const PRIMARY = '#08796C';
const SECONDARY = '#BC892C';

interface DetailRowProps {
    icon: React.ReactNode;
    label: string;
    value?: string | number | null;
    accent?: string;
}

const DetailRow = ({ icon, label, value, accent = PRIMARY }: DetailRowProps) => (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
            sx={{
                mt: 0.15,
                width: 28,
                height: 28,
                borderRadius: 1.25,
                bgcolor: alpha(accent, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}
        >
            <Box sx={{ fontSize: 15, color: accent, display: 'flex' }}>{icon}</Box>
        </Box>
        <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block' }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, color: value ? 'text.primary' : 'text.disabled' }}>
                {value ?? '—'}
            </Typography>
        </Box>
    </Stack>
);

const SectionHeader = ({ title, accent = PRIMARY }: { title: string; accent?: string }) => (
    <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
        <Box sx={{ height: 14, width: 3, borderRadius: 2, bgcolor: accent }} />
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: accent, fontSize: '0.72rem' }}>
            {title}
        </Typography>
    </Stack>
);

const StoreDetails = () => {
    const theme = useTheme();
    const { curentStoreData } = useContext(StoreContext);
    const { handleClose, fetchLastIssuedCommodity } = StoreUtills();

    useEffect(() => {
        if (curentStoreData.commodity.id) {
            fetchLastIssuedCommodity(curentStoreData.commodity.id);
        }
    }, [curentStoreData]);

    const qty = curentStoreData.quantity;
    const stockStatus = qty < 5 ? 'Low Stock' : qty < 10 ? 'Moderate' : 'In Stock';
    const stockColor = qty < 5 ? '#dc2626' : qty < 10 ? '#d97706' : '#16a34a';
    const stockBg = qty < 5 ? alpha('#dc2626', 0.08) : qty < 10 ? alpha('#d97706', 0.08) : alpha('#16a34a', 0.08);

    return (
        <Stack spacing={0} sx={{ width: '100%' }}>

            {/* Commodity section */}
            <Box sx={{ p: 3, pb: 2.5 }}>
                <SectionHeader title="Commodity Details" accent={PRIMARY} />
                <Stack spacing={1.75}>
                    <DetailRow
                        icon={<CategoryOutlinedIcon fontSize="inherit" />}
                        label="Commodity"
                        value={curentStoreData.commodity.name}
                    />
                    <DetailRow
                        icon={<LayersOutlinedIcon fontSize="inherit" />}
                        label="Unit of Measure"
                        value={curentStoreData.commodity.groupName}
                    />
                    <DetailRow
                        icon={<DescriptionOutlinedIcon fontSize="inherit" />}
                        label="Asset Type"
                        value={curentStoreData?.commodity?.assetType?.name}
                    />
                    <Stack direction="row" spacing={1.25} alignItems="flex-start">
                        <Box
                            sx={{
                                mt: 0.15,
                                width: 28,
                                height: 28,
                                borderRadius: 1.25,
                                bgcolor: alpha(PRIMARY, 0.08),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Inventory2OutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block' }}>
                                Quantity
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1} mt={0.25}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {qty}
                                </Typography>
                                <Chip
                                    label={stockStatus}
                                    size="small"
                                    sx={{
                                        height: 18,
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        bgcolor: stockBg,
                                        color: stockColor,
                                        border: `1px solid ${alpha(stockColor, 0.22)}`,
                                        '& .MuiChip-label': { px: 1 },
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </Stack>
            </Box>

            <Divider sx={{ borderColor: alpha('#000', 0.06) }} />

            {/* Branch section */}
            <Box sx={{ p: 3, pb: 2.5 }}>
                <SectionHeader title="Branch Info" accent={SECONDARY} />
                <Stack spacing={1.75}>
                    <DetailRow
                        icon={<LocationCityOutlinedIcon fontSize="inherit" />}
                        label="Branch"
                        value={curentStoreData.branch.name}
                        accent={SECONDARY}
                    />
                    <DetailRow
                        icon={<PhoneIphoneOutlinedIcon fontSize="inherit" />}
                        label="Telephone"
                        value={curentStoreData.branch.telephone}
                        accent={SECONDARY}
                    />
                    <DetailRow
                        icon={<EmailOutlinedIcon fontSize="inherit" />}
                        label="Email"
                        value={curentStoreData.branch.email}
                        accent={SECONDARY}
                    />
                </Stack>
            </Box>

            <Divider sx={{ borderColor: alpha('#000', 0.06) }} />

            {/* Last issued section */}
            <Box sx={{ p: 3, pb: 2.5 }}>
                <SectionHeader title="Last Issued Details" accent={PRIMARY} />
                <Stack spacing={1.75}>
                    <DetailRow
                        icon={<EventNoteOutlinedIcon fontSize="inherit" />}
                        label="Date Issued"
                        value="N/A"
                    />
                    <DetailRow
                        icon={<PersonOutlineOutlinedIcon fontSize="inherit" />}
                        label="Issued To"
                        value="Sunday Odong – Gulu Branch"
                    />
                </Stack>
            </Box>

            {/* Footer action */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    bgcolor: alpha('#000', 0.015),
                    borderTop: `1px solid ${alpha('#000', 0.06)}`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <ButtonComponent
                    handleClick={handleClose}
                    buttonColor="primary"
                    type="button"
                    variant="contained"
                    sendingRequest={false}
                    buttonText="Close"
                />
            </Box>
        </Stack>
    );
};

export default StoreDetails;