/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useNavigate, useParams } from "react-router";
import { heroSecondarySx } from '../../../components/buttons/heroActionStyles';
import { useContext, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button as MuiButton,
    Chip,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    alpha,
} from "@mui/material";
import moment from "moment";
import { toast } from "react-toastify";

import { InventoryContext } from "../../../context/inventory";
import ViewInventoryutills from "./utills";
import OtherDetails from "./OtherDetails";
import DeliveryStatusPanel from "./DeliveryStatusPanel";
import InventoryPRN from "./InventoryGRN";
import Loading from "../../../components/loading";
import { IGRNReport, IStockCommodities } from "../interface";
import { camelCaseToWords } from "../../../utils/helpers";
import { generateGrnPdf } from "./generateGrnPdf";
import { brand, neutral, border, surface, status as statusTokens } from "../../../utils/tokens";
import { StatTile } from "../../../components/layout";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

const BRAND = brand[500];

// ── Status chip ───────────────────────────────────────────────────────────────
const statusTone = (code?: string) => {
    switch ((code ?? '').toLowerCase()) {
        case 'stockcompleted':
        case 'active':
            return statusTokens.success;
        case 'stockpending':
            return statusTokens.warning;
        case 'stockclosedshort':
            return statusTokens.info;
        case 'cancelled':
        case 'disposed':
            return statusTokens.danger;
        default:
            return statusTokens.info;
    }
};

const StatusChip = ({ code }: { code?: string }) => {
    if (!code) return null;
    const tone = statusTone(code);
    return (
        <Chip
            size="small"
            label={camelCaseToWords(code)}
            sx={{
                height: 24,
                fontWeight: 700,
                fontSize: '0.72rem',
                bgcolor: tone.soft,
                color: tone.strong,
                border: `1px solid ${alpha(tone.main, 0.3)}`,
            }}
        />
    );
};

// ── Hero "at a glance" fact (light tile across the base of the hero) ────────────
const HeroFact = ({
    label, value, first, onCopy,
}: { label: string; value?: string | null; first?: boolean; onCopy?: () => void }) => {
    const empty = value === null || value === undefined || value === '';
    return (
        <Box
            sx={{
                flex: '1 1 150px',
                minWidth: 140,
                px: { xs: 2, md: 2.75 },
                py: 1.5,
                borderLeft: { xs: 'none', sm: first ? 'none' : `1px solid ${border.subtle}` },
            }}
        >
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: neutral[500] }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.35 }}>
                <Typography noWrap sx={{
                    fontSize: '0.9rem',
                    fontWeight: empty ? 400 : 700,
                    fontStyle: empty ? 'italic' : 'normal',
                    color: empty ? neutral[400] : neutral[800],
                }}>
                    {empty ? 'Not specified' : value}
                </Typography>
                {onCopy && !empty && (
                    <Tooltip title="Copy">
                        <IconButton size="small" onClick={onCopy} sx={{ p: 0.2, color: alpha(brand[500], 0.7) }}>
                            <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
};

// ── Supplier info row ─────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.1, borderBottom: `1px solid ${alpha('#000', 0.05)}`, '&:last-of-type': { borderBottom: 'none' } }}>
        <Box sx={{ color: BRAND, mt: 0.2, flexShrink: 0, '& svg': { fontSize: 17 } }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: neutral[500], display: 'block', lineHeight: 1.2 }}>{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, color: value ? neutral[800] : neutral[400], fontStyle: value ? 'normal' : 'italic', wordBreak: 'break-word' }}>
                {value || 'Not specified'}
            </Typography>
        </Box>
    </Box>
);

const TABS = [
    { label: 'Delivery Status', icon: <LocalShippingOutlinedIcon fontSize="small" /> },
    { label: 'Stock Commodities', icon: <Inventory2OutlinedIcon fontSize="small" /> },
    { label: 'Goods Received Notes', icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
];

const InventoryDetails = () => {
    const { currentInventory } = useContext(InventoryContext);
    const { id } = useParams<{ id: string }>();
    const { fetchInventoryByID } = ViewInventoryutills();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        setLoading(true);
        fetchInventoryByID(id as string).finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const totals = useMemo(() => {
        const c = (currentInventory?.commodities ?? []) as IStockCommodities[];
        const ordered = c.reduce((s, x) => s + (x.orderedQuantity || 0), 0);
        const delivered = c.reduce((s, x) => s + (x.deliveredQuantity || 0), 0);
        return { ordered, delivered, outstanding: Math.max(ordered - delivered, 0), lines: c.length };
    }, [currentInventory]);

    const copyLpo = () => {
        navigator.clipboard.writeText(currentInventory?.lpoNumber || '');
        toast.success('LPO Number copied');
    };

    if (loading) {
        return (
            <Box sx={{ bgcolor: surface.page, minHeight: '100vh', p: 3 }}>
                <Loading items="Inventory" />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: surface.page, minHeight: '100vh', px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 } }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

                {/* ── Hero header (light card idiom, matching the asset/request pages) ── */}
                <Box
                    sx={{
                        position: 'relative',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        mb: 2.5,
                        bgcolor: '#fff',
                        boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
                    }}
                >
                    {/* Faint brand accents for a touch of depth on the white card */}
                    <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 92% -10%, ${alpha(brand[500], 0.07)} 0%, transparent 42%)`, pointerEvents: 'none' }} />
                    <Inventory2OutlinedIcon sx={{ position: 'absolute', right: -18, top: -20, fontSize: 180, color: alpha(brand[500], 0.05), transform: 'rotate(-12deg)', pointerEvents: 'none' }} />

                    <Box sx={{ position: 'relative', px: { xs: 2.5, md: 3.5 }, pt: 2.25, pb: 2.5 }}>
                        {/* Back + breadcrumb */}
                        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.25 }}>
                            <IconButton
                                size="small"
                                onClick={() => navigate(-1)}
                                sx={{ color: brand[600], border: `1px solid ${alpha(brand[500], 0.25)}`, bgcolor: alpha(brand[50], 0.6), '&:hover': { bgcolor: alpha(brand[100], 0.7), borderColor: brand[500] } }}
                            >
                                <ArrowBackIcon fontSize="small" />
                            </IconButton>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <HomeOutlinedIcon sx={{ fontSize: 14, color: neutral[400] }} />
                                <Typography variant="caption" sx={{ color: neutral[500] }}>Inventory</Typography>
                                <Typography variant="caption" sx={{ color: neutral[300] }}>/</Typography>
                                <Typography variant="caption" sx={{ color: brand[700], fontWeight: 700 }}>Details</Typography>
                            </Stack>
                        </Stack>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                            {/* Identity */}
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                                <Box sx={{
                                    width: 56, height: 56, borderRadius: '16px', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    bgcolor: alpha(brand[500], 0.1), color: brand[600], border: `1px solid ${alpha(brand[500], 0.16)}`,
                                }}>
                                    <Inventory2OutlinedIcon sx={{ fontSize: 28 }} />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: { xs: '1.35rem', md: '1.6rem' }, fontWeight: 800, color: neutral[900], lineHeight: 1.15, letterSpacing: '-0.4px' }}>
                                        {currentInventory?.name || 'Inventory'}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                        <Chip
                                            size="small"
                                            icon={<BusinessOutlinedIcon sx={{ fontSize: 14 }} />}
                                            label={currentInventory?.supplier?.name || 'Unknown Supplier'}
                                            sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(brand[500], 0.08), color: brand[700], border: `1px solid ${alpha(brand[500], 0.14)}`, '& .MuiChip-icon': { color: brand[600] } }}
                                        />
                                        <StatusChip code={currentInventory?.status?.status ?? undefined} />
                                    </Stack>
                                </Box>
                            </Stack>

                            {/* Actions */}
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {/*
                                  * Shares the hero-action treatment with the asset detail page.
                                  *
                                  * It was the same `size="small"` outlined button that made "Edit
                                  * Asset" disappear over there — a hairline border on white, beside a
                                  * heavy title and a row of brand chips. Same card idiom, same fix,
                                  * and now the same source so the two cannot drift apart.
                                  */}
                                <MuiButton
                                    variant="text"
                                    disableElevation
                                    startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => { void generateGrnPdf(currentInventory); }}
                                    disabled={!currentInventory?.id}
                                    sx={heroSecondarySx}
                                >
                                    Generate GRN
                                </MuiButton>
                            </Stack>
                        </Box>
                    </Box>

                    {/* At-a-glance strip — document references as light tiles across the base */}
                    <Box sx={{ position: 'relative', display: 'flex', flexWrap: 'wrap', bgcolor: alpha(brand[500], 0.03), borderTop: `1px solid ${border.subtle}` }}>
                        <HeroFact first label="LPO Number" value={currentInventory?.lpoNumber || null} onCopy={currentInventory?.lpoNumber ? copyLpo : undefined} />
                        <HeroFact label="GRN Number" value={currentInventory?.grnNumber || null} />
                        <HeroFact label="Delivery Date" value={(currentInventory?.deliveryDate || currentInventory?.createDate) ? moment(currentInventory?.deliveryDate || currentInventory?.createDate).format('DD MMM YYYY') : null} />
                    </Box>
                </Box>

                {/* ── Stat strip ── */}
                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid item xs={6} md={3}>
                        <StatTile label="Ordered" value={totals.ordered.toLocaleString()} helper="units ordered" accent="info" icon={<ShoppingCartOutlinedIcon />} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <StatTile label="Delivered" value={totals.delivered.toLocaleString()} helper="units received" accent="brand" icon={<LocalShippingOutlinedIcon />} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <StatTile
                            label="Outstanding"
                            value={totals.outstanding.toLocaleString()}
                            helper={totals.outstanding > 0 ? 'still due' : 'fully delivered'}
                            accent={totals.outstanding > 0 ? 'danger' : 'neutral'}
                            icon={<PendingActionsOutlinedIcon />}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <StatTile label="Commodities" value={totals.lines.toLocaleString()} helper="line items" accent="gold" icon={<Inventory2OutlinedIcon />} />
                    </Grid>
                </Grid>

                {/* ── Body ── */}
                <Grid container spacing={2.5} alignItems="flex-start">
                    {/* Supplier card */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden', boxShadow: 'hsla(220, 30%, 5%, 0.04) 0px 4px 12px 0px' }}>
                            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${alpha('#000', 0.06)}`, bgcolor: alpha(brand[500], 0.03), display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BusinessOutlinedIcon sx={{ fontSize: 18, color: brand[600] }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: brand[700] }}>Supplier</Typography>
                            </Box>
                            <Box sx={{ px: 2.5, py: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: neutral[900], mt: 1, mb: 0.5, fontSize: '1.05rem' }}>
                                    {currentInventory?.supplier?.name || 'No supplier'}
                                </Typography>
                                <InfoRow icon={<LocalPhoneOutlinedIcon />} label="Contact Number" value={currentInventory?.supplier?.telephone as string} />
                                <InfoRow icon={<EmailOutlinedIcon />} label="Email Address" value={currentInventory?.supplier?.email} />
                                <InfoRow icon={<LocationOnOutlinedIcon />} label="Address" value={currentInventory?.supplier?.address} />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Tabbed content */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden', boxShadow: 'hsla(220, 30%, 5%, 0.04) 0px 4px 12px 0px' }}>
                            <Tabs
                                value={tab}
                                onChange={(_, v) => setTab(v)}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    px: 1.5,
                                    minHeight: 50,
                                    borderBottom: `1px solid ${alpha('#000', 0.07)}`,
                                    bgcolor: alpha(brand[500], 0.025),
                                    '& .MuiTab-root': { minHeight: 50, textTransform: 'none', fontSize: '0.83rem', fontWeight: 500, color: neutral[500], gap: 0.75, px: 2 },
                                    '& .Mui-selected': { color: brand[700], fontWeight: 700 },
                                    '& .MuiTabs-indicator': { bgcolor: brand[500], height: 3, borderRadius: '3px 3px 0 0' },
                                }}
                            >
                                {TABS.map((t, i) => <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />)}
                            </Tabs>

                            <Box>
                                {tab === 0 && (
                                    <DeliveryStatusPanel
                                        inventory={currentInventory}
                                        onDeliveryReceived={() => fetchInventoryByID(id as string)}
                                    />
                                )}
                                {tab === 1 && <OtherDetails inventory={currentInventory} />}
                                {tab === 2 && (
                                    <InventoryPRN
                                        grnList={currentInventory?.grnReports as Array<IGRNReport>}
                                        onUploaded={() => fetchInventoryByID(id as string)}
                                    />
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default InventoryDetails;
