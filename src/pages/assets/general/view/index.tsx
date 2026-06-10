/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Typography,
    Grid,
    Box,
    Stack,
    alpha,
    Paper,
    IconButton,
    Tooltip,
    Tab,
    Tabs,
    Button as MuiButton,
    Chip,
    Divider,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import moment from 'moment';

import AssignmentHistory from '../../trails/AssignmentHistory';
import RepairHistory from '../../trails/RepairHistory';
import AssetImageUpload from './AssetImageUpload';
import Loading from '../../../../components/loading';
import ModalComponent from '../../../../components/modal';
import Reassign from '../../Reassign';
import { IOfficeEquipment, IOfficeEquipmentAxiosResponse, IAssetAxiosResponse } from '../../interface';
import {
    getOfficeEquipmentByIDService,
    removeOfficeEquipmentImageService,
    updateOfficeEquipmentImageService
} from '../service';
import { camelCaseToWords } from '../../../../utils/helpers';
import { ROUTES } from '../../../../core/routes/routes';
import { crudStates } from '../../../../utils/constants';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { brand, neutral, border, surface, status as statusTokens } from '../../../../utils/tokens';
import { toast } from 'react-toastify';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';

const statusTone = (code?: string) => {
    switch ((code ?? '').toLowerCase()) {
        case 'assetassigned':
        case 'issued':
        case 'receiptacknowledged':
            return statusTokens.success;
        case 'requireupdate':
        case 'inmaintenance':
            return statusTokens.warning;
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
            sx={{ height: 24, fontWeight: 700, fontSize: '0.72rem', bgcolor: tone.soft, color: tone.strong, border: `1px solid ${alpha(tone.main, 0.3)}` }}
        />
    );
};

// ── Key/value field ───────────────────────────────────────────────────────────
const Field = ({
    label, value, copyable, money,
}: { label: string; value?: string | number | null; copyable?: boolean; money?: boolean }) => {
    const empty = value === null || value === undefined || value === '';
    const display = money && value != null && Number.isFinite(Number(value))
        ? Number(value).toLocaleString()
        : value;
    return (
        <Box sx={{ py: 1.15, borderBottom: `1px solid ${alpha('#000', 0.05)}` }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </Typography>
            {empty ? (
                <Typography variant="body2" sx={{ color: neutral[400], fontStyle: 'italic', mt: 0.25 }}>Not specified</Typography>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                    {money && (
                        <Box component="span" sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#946C22', bgcolor: alpha('#BC892C', 0.1), px: 0.6, py: 0.15, borderRadius: 0.75 }}>UGX</Box>
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 600, color: neutral[800], wordBreak: 'break-word' }}>
                        {display}
                    </Typography>
                    {copyable && (
                        <Tooltip title="Copy">
                            <IconButton size="small" onClick={() => { navigator.clipboard.writeText(String(value)); toast.success('Copied'); }} sx={{ p: 0.25, color: alpha(brand[500], 0.7) }}>
                                <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )}
        </Box>
    );
};

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <Box sx={{ mb: 3, '&:last-of-type': { mb: 0 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Box sx={{ color: brand[600], display: 'flex', '& svg': { fontSize: 18 } }}>{icon}</Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900] }}>{title}</Typography>
        </Stack>
        <Grid container columnSpacing={3}>{children}</Grid>
    </Box>
);

const GeneralAssetDetails = () => {
    const [asset, setAsset] = useState<IOfficeEquipment>({} as IOfficeEquipment);
    const { typeId, id } = useParams<{ typeId: string; id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [currentState, setCurrentState] = useState<string>('');
    const [tab, setTab] = useState(0);
    const navigate = useNavigate();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const assetType = assetTypes.find(t => String(t.id) === typeId);

    const fetchAsset = async () => {
        setLoading(true);
        try {
            const response = await getOfficeEquipmentByIDService(id as string) as IOfficeEquipmentAxiosResponse;
            if (response.status === 200) setAsset(response.data);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchAsset(); /* eslint-disable-next-line */ }, []);

    const handleImageUpdate = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await updateOfficeEquipmentImageService(id as string, formData) as IAssetAxiosResponse;
            if (response.status === 201 && response.data?.image) {
                const filename = response.data.image.split(/[/\\]/).pop();
                setAsset({ ...asset, image: `/statics/${filename}` });
                toast.success('Image updated successfully');
            } else {
                toast.error('Failed to update image');
            }
        } catch {
            toast.error('Failed to update image');
        }
    };

    const handleImageRemove = async () => {
        try {
            const response = await removeOfficeEquipmentImageService(id as string) as IAssetAxiosResponse;
            if (response.status === 201) {
                setAsset({ ...asset, image: null });
                toast.success('Image removed');
            } else {
                toast.error('Failed to remove image');
            }
        } catch {
            toast.error('Failed to remove image');
        }
    };

    const hasTechnical = !!(asset.ram || asset.cpuSpeed || asset.hardDiskSize || asset.macAddress || asset.ipAddress || asset.interfaceType);

    const TABS = [
        { label: 'Details', icon: <ListAltOutlinedIcon fontSize="small" /> },
        { label: 'Assignment History', icon: <HistoryOutlinedIcon fontSize="small" /> },
        { label: 'Repair History', icon: <BuildOutlinedIcon fontSize="small" /> },
    ];

    if (loading) {
        return (
            <Box sx={{ bgcolor: surface.page, minHeight: '100vh', p: 3 }}>
                <Loading items={assetType?.name || 'Asset'} />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: surface.page, minHeight: '100vh', px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 } }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

                {currentState === crudStates.reassign && (
                    <ModalComponent width={"40%"} title={`Reassign ${assetType?.name || 'Asset'}`} open={open} handleClose={() => setOpen(false)}>
                        <Reassign
                            handleClickAction={() => setOpen(false)}
                            sendingRequest={loading}
                            handleClose={() => setOpen(false)}
                            buttonText='Confirm'
                            asset={asset}
                            module={assetType?.name || ''}
                        />
                    </ModalComponent>
                )}

                {/* ── Hero header ── */}
                <Box
                    sx={{
                        position: 'relative',
                        borderRadius: 2,
                        border: `1px solid ${border.subtle}`,
                        background: `linear-gradient(135deg, ${alpha(brand[50], 0.7)} 0%, #FFFFFF 60%)`,
                        overflow: 'hidden',
                        mb: 2.5,
                    }}
                >
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${brand[500]} 0%, ${brand[700]} 100%)` }} />
                    <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 2.5 }}>
                        {/* breadcrumb */}
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <IconButton size="small" onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}`)}
                                sx={{ color: brand[600], border: `1px solid ${alpha(brand[500], 0.25)}`, bgcolor: alpha(brand[50], 0.6), '&:hover': { bgcolor: alpha(brand[100], 0.7) } }}>
                                <ArrowBackIcon fontSize="small" />
                            </IconButton>
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: neutral[400] }}>
                                <HomeOutlinedIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" sx={{ color: neutral[500] }}>{assetType?.name || 'Assets'}</Typography>
                                <Typography variant="caption" sx={{ color: neutral[300] }}>/</Typography>
                                <Typography variant="caption" sx={{ color: brand[700], fontWeight: 600 }}>Details</Typography>
                            </Stack>
                        </Stack>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minWidth: 0 }}>
                                <Box sx={{ width: 46, height: 46, borderRadius: 1.5, bgcolor: alpha(brand[500], 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>
                                    <Inventory2OutlinedIcon sx={{ fontSize: 24, color: brand[600] }} />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                                        {asset.assetName || assetType?.name || 'Asset'}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                                        <Chip size="small" icon={<CategoryOutlinedIcon sx={{ fontSize: 14 }} />}
                                            label={asset.assetType?.name || assetType?.name || 'Asset'}
                                            sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(brand[500], 0.08), color: brand[700], '& .MuiChip-icon': { color: brand[600] } }} />
                                        <StatusChip code={asset.assetStatus?.status ?? undefined} />
                                        {asset.engravedNumber && (
                                            <Chip size="small" label={`#${asset.engravedNumber}`}
                                                sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: neutral[100], color: neutral[600] }} />
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <MuiButton variant="outlined" size="small" startIcon={<EditOutlinedIcon fontSize="small" />}
                                    onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}/update/${asset.id}`)}
                                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', borderColor: alpha(brand[500], 0.4), color: brand[600], '&:hover': { borderColor: brand[500], bgcolor: alpha(brand[500], 0.05) } }}>
                                    Edit
                                </MuiButton>
                                {asset?.assetStatus?.status === 'inStore' && (
                                    <MuiButton variant="contained" size="small" startIcon={<AssignmentIndOutlinedIcon fontSize="small" />}
                                        onClick={() => { setCurrentState(crudStates.reassign); setOpen(true); }}
                                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>
                                        Assign
                                    </MuiButton>
                                )}
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                {/* ── Body ── */}
                <Grid container spacing={2.5} alignItems="stretch">
                    {/* Left: image + quick facts */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden', height: '100%' }}>
                            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${alpha('#000', 0.06)}`, bgcolor: alpha(brand[500], 0.03), display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Inventory2OutlinedIcon sx={{ fontSize: 18, color: brand[600] }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: brand[700] }}>Asset</Typography>
                            </Box>
                            <Box sx={{ p: 2.5 }}>
                                <AssetImageUpload
                                    currentImage={asset.image || null}
                                    assetName={asset.assetName || ''}
                                    assetType={asset.assetType?.name || ''}
                                    onImageUpdate={handleImageUpdate}
                                    onImageRemove={handleImageRemove}
                                />
                                <Divider sx={{ my: 1.5 }} />
                                <Field label="Status" value={asset.assetStatus?.status ? camelCaseToWords(asset.assetStatus.status) : null} />
                                <Field label="Branch / Location" value={asset.branch?.name || null} />
                                <Field label="Assigned To" value={asset.assignedTo ? `${asset.assignedTo.lastName ?? ''} ${asset.assignedTo.firstName ?? ''}`.trim() : null} />
                                <Field label="Date Received" value={asset.dateReceipt ? moment(asset.dateReceipt).format('Do MMMM YYYY') : null} />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right: tabs */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden', height: '100%' }}>
                            <Tabs
                                value={tab}
                                onChange={(_, v) => setTab(v)}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    px: 1.5, minHeight: 50, borderBottom: `1px solid ${alpha('#000', 0.07)}`, bgcolor: alpha(brand[500], 0.025),
                                    '& .MuiTab-root': { minHeight: 50, textTransform: 'none', fontSize: '0.83rem', fontWeight: 500, color: neutral[500], gap: 0.75, px: 2 },
                                    '& .Mui-selected': { color: brand[700], fontWeight: 700 },
                                    '& .MuiTabs-indicator': { bgcolor: brand[500], height: 3, borderRadius: '3px 3px 0 0' },
                                }}
                            >
                                {TABS.map((t, i) => <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />)}
                            </Tabs>

                            <Box sx={{ p: { xs: 2, md: 3 } }}>
                                {tab === 0 && (
                                    <>
                                        <Section title="Identity" icon={<BadgeOutlinedIcon />}>
                                            <Grid item xs={12} sm={6}><Field label="Asset Name" value={asset.assetName || null} /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Engraved Number" value={asset.engravedNumber || null} copyable /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Make" value={asset.make || null} /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Model" value={asset.model || null} /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Serial Number" value={asset.serialNumber || null} copyable /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Unit of Measure" value={asset.unitOfMeasure || null} /></Grid>
                                        </Section>

                                        <Section title="Classification & Assignment" icon={<CategoryOutlinedIcon />}>
                                            <Grid item xs={12} sm={6}><Field label="Asset Type" value={asset.assetType?.name || null} /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Status" value={asset.assetStatus?.status ? camelCaseToWords(asset.assetStatus.status) : null} /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Branch / Location" value={asset.branch?.name || null} /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Assigned To" value={asset.assignedTo ? `${asset.assignedTo.lastName ?? ''} ${asset.assignedTo.firstName ?? ''}`.trim() : null} /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Commodity" value={asset.commodity?.name || null} /></Grid>
                                        </Section>

                                        <Section title="Financials & References" icon={<PaidOutlinedIcon />}>
                                            <Grid item xs={12} sm={6}><Field label="Purchase Cost" value={asset.purchaseCost ?? null} money /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Cost of the Asset" value={asset.costOfTheAsset ?? null} money /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Net Book Value" value={asset.netValueB ?? null} money /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Detail Net Book Value" value={asset.detailNetBookValue ?? null} money /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Depreciation Rate" value={asset.assetDepreciationRate ?? null} /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="LPO Number" value={asset.stock?.lpoNumber || null} copyable /></Grid>
                                            <Grid item xs={12} sm={6}><Field label="Date Received" value={asset.dateReceipt ? moment(asset.dateReceipt).format('Do MMMM YYYY') : null} /></Grid>
                                        </Section>

                                        {hasTechnical && (
                                            <Section title="Technical Details" icon={<MemoryOutlinedIcon />}>
                                                <Grid item xs={12} sm={6}><Field label="Hostname" value={asset.hostname || null} /></Grid>
                                                <Grid item xs={12} sm={6}><Field label="RAM" value={asset.ram || null} /></Grid>
                                                <Grid item xs={12} sm={6}><Field label="CPU Speed" value={asset.cpuSpeed || null} /></Grid>
                                                <Grid item xs={12} sm={6}><Field label="Hard Disk Size" value={asset.hardDiskSize || null} /></Grid>
                                                <Grid item xs={12} sm={6}><Field label="MAC Address" value={asset.macAddress || null} copyable /></Grid>
                                                <Grid item xs={12} sm={6}><Field label="IP Address" value={asset.ipAddress || null} copyable /></Grid>
                                                <Grid item xs={12} sm={6}><Field label="Interface Type" value={asset.interfaceType || null} /></Grid>
                                            </Section>
                                        )}

                                        {asset.description && (
                                            <Section title="Description" icon={<NotesOutlinedIcon />}>
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" sx={{ color: neutral[700], lineHeight: 1.7, whiteSpace: 'pre-line', pt: 0.5 }}>
                                                        {asset.description}
                                                    </Typography>
                                                </Grid>
                                            </Section>
                                        )}
                                    </>
                                )}
                                {tab === 1 && <AssignmentHistory id={id as string} />}
                                {tab === 2 && <RepairHistory id={id as string} />}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default GeneralAssetDetails;
