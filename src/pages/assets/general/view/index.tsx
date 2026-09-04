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
import usePermissions from '../../../../core/permissions/usePermissions';
import useAccessScope from '../../../../core/permissions/useAccessScope';
import { heroPrimarySx, heroSecondarySx } from '../../../../components/buttons/heroActionStyles';
import { PERMISSIONS } from '../../../../core/permissions/constants';

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

/**
 * Formats a monetary value (stored as a string) as "UGX 1,234,567".
 * Tolerates comma/space-formatted strings; returns null for empty or non-numeric
 * values so the caller can render a "Not specified" fallback instead of "UGX NaN".
 */
const formatUGX = (value?: string | number | null): string | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(String(value).replace(/[,\s]/g, ''));
    return Number.isFinite(n) ? `UGX ${n.toLocaleString()}` : null;
};

// ── Hero "at a glance" fact (light tile across the base of the hero) ─────────────
const HeroFact = ({ label, value, first }: { label: string; value?: string | null; first?: boolean }) => {
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
            <Typography noWrap sx={{
                fontSize: '0.9rem', mt: 0.35,
                fontWeight: empty ? 400 : 700,
                fontStyle: empty ? 'italic' : 'normal',
                color: empty ? neutral[400] : neutral[800],
            }}>
                {empty ? 'Not specified' : value}
            </Typography>
        </Box>
    );
};

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
    const { has } = usePermissions();
    const { canActOn } = useAccessScope();

    /*
     * Holding the permission is only half the question.
     *
     * The endpoint checks the permission *and* the record: at SELF scope UPDATE_ASSET does not make
     * a colleague's asset yours, and someone holding VIEW_ALL_BRANCH_ASSETS without the matching
     * MANAGE multiplier can open another branch's asset but not change it. Testing only `has(...)`
     * put an Edit button in front of both of them, and the click went to /restricted-access.
     *
     * `asset` is null until the fetch resolves, so these are computed from it rather than at the top
     * of the component.
     */
    const scopedRecord = {
        branchId: asset?.branch?.id ?? null,
        ownerId: asset?.assignedTo?.id ?? null,
    };
    const canUpdateAsset = !!asset && canActOn(PERMISSIONS.UPDATE_ASSET, 'ASSETS', scopedRecord);
    const canReassignAsset = !!asset && canActOn(PERMISSIONS.REASSIGN_ASSET, 'ASSETS', scopedRecord);

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

    /*
     * Tabs the viewer may actually open.
     *
     * Each history tab has its own permission now, carved out of READ_ASSET — which is what opens
     * this page. Someone with the page but not the trail would otherwise see a tab that always
     * failed, so the tab is not offered at all.
     *
     * Identified by `key` rather than by position: filtering the array shifts every index after the
     * one removed, and the panel below used to switch on the raw index. Keyed, hiding a tab cannot
     * quietly show the wrong panel.
     */
    const ALL_TABS = [
        { key: 'details', label: 'Details', icon: <ListAltOutlinedIcon fontSize="small" />, permission: null },
        { key: 'assignment', label: 'Assignment History', icon: <HistoryOutlinedIcon fontSize="small" />, permission: PERMISSIONS.READ_ASSIGNMENT_HISTORY },
        { key: 'repairs', label: 'Repair History', icon: <BuildOutlinedIcon fontSize="small" />, permission: PERMISSIONS.READ_REPAIR_HISTORY },
    ];
    const TABS = ALL_TABS.filter(t => !t.permission || has(t.permission));
    // Guards the case where the selected tab is one the viewer has just lost access to.
    const activeTab = TABS[tab] ?? TABS[0];

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

                {/* ── Hero header (light card idiom, matching the category pages) ── */}
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

                    <Box sx={{ position: 'relative', px: { xs: 2.5, md: 3.5 }, pt: 2.25 }}>
                        {/* breadcrumb */}
                        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.25 }}>
                            <IconButton size="small" onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}`)}
                                sx={{ color: brand[600], border: `1px solid ${alpha(brand[500], 0.25)}`, bgcolor: alpha(brand[50], 0.6), '&:hover': { bgcolor: alpha(brand[100], 0.7) } }}>
                                <ArrowBackIcon fontSize="small" />
                            </IconButton>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <HomeOutlinedIcon sx={{ fontSize: 14, color: neutral[400] }} />
                                <Typography variant="caption" sx={{ color: neutral[500] }}>{assetType?.name || 'Assets'}</Typography>
                                <Typography variant="caption" sx={{ color: neutral[300] }}>/</Typography>
                                <Typography variant="caption" sx={{ color: brand[700], fontWeight: 700 }}>Details</Typography>
                            </Stack>
                        </Stack>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 2.75 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                                <Box sx={{
                                    width: 56, height: 56, borderRadius: '16px', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    bgcolor: alpha(brand[500], 0.1), color: brand[600], border: `1px solid ${alpha(brand[500], 0.16)}`,
                                }}>
                                    <Inventory2OutlinedIcon sx={{ fontSize: 28 }} />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: { xs: '1.35rem', md: '1.6rem' }, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.4px', color: neutral[900] }}>
                                        {asset.assetName || assetType?.name || 'Asset'}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                        <Chip size="small" icon={<CategoryOutlinedIcon sx={{ fontSize: 14 }} />}
                                            label={asset.assetType?.name || assetType?.name || 'Asset'}
                                            sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(brand[500], 0.08), color: brand[700], border: `1px solid ${alpha(brand[500], 0.14)}`, '& .MuiChip-icon': { color: brand[600] } }} />
                                        <StatusChip code={asset.assetStatus?.status ?? undefined} />
                                        {asset.engravedNumber && (
                                            <Chip size="small" icon={<BadgeOutlinedIcon sx={{ fontSize: 13 }} />} label={`#${asset.engravedNumber}`}
                                                sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: neutral[100], color: neutral[600], '& .MuiChip-icon': { color: neutral[500] } }} />
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap alignItems="center" sx={{ flexShrink: 0 }}>
                                {canUpdateAsset && (
                                    <MuiButton
                                        variant="text"
                                        disableElevation
                                        startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
                                        onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}/update/${asset.id}`)}
                                        sx={heroSecondarySx}
                                    >
                                        {/* "Edit" alone gave a 60px button beside a 56px tile. Naming
                                            the object is both better proportioned and clearer about
                                            what is being edited. */}
                                        Edit Asset
                                    </MuiButton>
                                )}
                                {canReassignAsset && asset?.assetStatus?.status === 'inStore' && (
                                    <MuiButton
                                        variant="text"
                                        disableElevation
                                        startIcon={<AssignmentIndOutlinedIcon sx={{ fontSize: 18 }} />}
                                        onClick={() => { setCurrentState(crudStates.reassign); setOpen(true); }}
                                        sx={heroPrimarySx}
                                    >
                                        Assign to Officer
                                    </MuiButton>
                                )}
                            </Stack>
                        </Box>
                    </Box>

                    {/* At-a-glance strip — key facts as light tiles across the base of the hero */}
                    <Box sx={{ position: 'relative', display: 'flex', flexWrap: 'wrap', bgcolor: alpha(brand[500], 0.03), borderTop: `1px solid ${border.subtle}` }}>
                        <HeroFact first label="Assigned To" value={asset.assignedTo ? `${asset.assignedTo.lastName ?? ''} ${asset.assignedTo.firstName ?? ''}`.trim() : 'Unassigned'} />
                        <HeroFact label="Branch / Location" value={asset.branch?.name || null} />
                        <HeroFact label="Date Received" value={asset.dateReceipt ? moment(asset.dateReceipt).format('Do MMM YYYY') : null} />
                        <HeroFact label="Purchase Cost" value={formatUGX(asset.purchaseCost)} />
                    </Box>
                </Box>

                {/* ── Body ── */}
                {/* flex-start (not stretch) so each column sizes to its own content — a short
                    history table no longer forces a tall empty void in the opposite column. */}
                <Grid container spacing={2.5} alignItems="flex-start">
                    {/* Left: photo + physical identity (assignment/financials live in the hero strip) */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
                            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${alpha('#000', 0.06)}`, bgcolor: alpha(brand[500], 0.03), display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Inventory2OutlinedIcon sx={{ fontSize: 18, color: brand[600] }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: brand[700] }}>Photo</Typography>
                            </Box>
                            <Box sx={{ p: 2.5 }}>
                                <AssetImageUpload
                                    currentImage={asset.image || null}
                                    assetName={asset.assetName || ''}
                                    assetType={asset.assetType?.name || ''}
                                    onImageUpdate={handleImageUpdate}
                                    onImageRemove={handleImageRemove}
                                    readOnly={!canUpdateAsset}
                                />
                                <Divider sx={{ my: 1.5 }} />
                                <Field label="Make" value={asset.make || null} />
                                <Field label="Model" value={asset.model || null} />
                                <Field label="Serial Number" value={asset.serialNumber || null} copyable />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right: tabs */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
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
                                {TABS.map((t) => <Tab key={t.key} label={t.label} icon={t.icon} iconPosition="start" />)}
                            </Tabs>

                            {/* Details gets generous padding; the history tabs render a `flat`
                                table (no card chrome), so they sit flush at p:0 — the panel's own
                                border is the single frame. */}
                            <Box sx={{ p: activeTab?.key === 'details' ? { xs: 2, md: 3 } : 0 }}>
                                {activeTab?.key === 'details' && (
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
                                {activeTab?.key === 'assignment' && <AssignmentHistory id={id as string} />}
                                {activeTab?.key === 'repairs' && <RepairHistory id={id as string} />}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default GeneralAssetDetails;
