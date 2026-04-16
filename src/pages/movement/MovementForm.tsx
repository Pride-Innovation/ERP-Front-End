/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import {
    alpha, Autocomplete, Avatar, Box, Button, Chip, CircularProgress,
    Collapse, Divider, Grid, IconButton, Paper, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { UseFormInput, UseFormSelect, UseFormDatePicker, UseFormAutocompleteComponent } from '../../components/forms';
import ButtonComponent from '../../components/forms/Button';
import { IMovementForm } from './interface';
import { ROUTES } from '../../core/routes/routes';
import { fetchRowsService } from '../../core/apis/globalService';
import RoutesUtills from '../../core/routes/utills';
import { IUser } from '../users/interface';
import { IAsset } from '../assets/interface';
import { IOptions } from '../../components/tables/interface';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import PriceCheckOutlinedIcon from '@mui/icons-material/PriceCheckOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

const PRIMARY = '#08796C';
const BLUE = '#4285F4';
const AMBER = '#F59E0B';
const NA = 'Not Available';

// ─── Mock seed data (replace with real user from getCurrentUser on mount) ────
const MOCK_OFFICER: IUser = {
    id: 'mock-1',
    firstName: 'Samuel',
    lastName: 'Odong',
    staffNumber: 'PBL-2024-0182',
    gender: 'Male',
    email: 'samuel.odong@pridebank.co.ug',
    title: { id: 1, name: 'Branch Operations Manager', reportsTo: { id: 2, name: 'Regional Operations Director' }, role: { id: 1, name: 'Operations', permissions: [] } },
    branch: { id: 1, name: 'Kampala Main Branch', code: 'KMB' } as any,
    department: null,
};

const MOCK_ASSETS: IAsset[] = [
    {
        id: 'mock-a1',
        engravedNumber: 'PBL-LAP-2023-0042',
        assetName: 'Dell Latitude 5540 Laptop',
        hostname: 'PBL-KMB-WS042',
        make: 'Dell',
        model: 'Latitude 5540',
        category: 'IT Equipment',
        assetType: { id: 1, name: 'Laptop', category: 'IT Equipment' } as any,
        assetStatus: { id: 1, name: 'Active', color: '#16A34A' } as any,
        branch: { id: 1, name: 'Kampala Main Branch' } as any,
        assignedTo: { id: 1, firstName: 'Jane', lastName: 'Nakato', staffNumber: 'PBL-2022-0099' } as any,
        purchaseCost: '3,200,000',
        dateReceipt: '2023-03-15',
        lpoNumber: 'LPO-2023-00144',
        detailNetBookValue: '2,560,000',
        netValueB: '2,560,000',
        unitOfMeasure: 'Unit',
        costOfTheAsset: '3,200,000',
    },
    {
        id: 'mock-a2',
        engravedNumber: 'PBL-SCN-2022-0017',
        assetName: 'HP ScanJet Pro 3000s4',
        hostname: 'PBL-KMB-SCN017',
        make: 'HP',
        model: 'ScanJet Pro 3000s4',
        category: 'Office Equipment',
        assetType: { id: 3, name: 'Scanner', category: 'Office Equipment' } as any,
        assetStatus: { id: 1, name: 'Active', color: '#16A34A' } as any,
        branch: { id: 1, name: 'Kampala Main Branch' } as any,
        assignedTo: { id: 2, firstName: 'Peter', lastName: 'Okello', staffNumber: 'PBL-2021-0034' } as any,
        purchaseCost: '850,000',
        dateReceipt: '2022-07-22',
        lpoNumber: 'LPO-2022-00289',
        detailNetBookValue: '595,000',
        netValueB: '595,000',
        unitOfMeasure: 'Unit',
        costOfTheAsset: '850,000',
    },
];

const destinationTypeOptions: IOptions[] = [
    { value: 'Branch', label: 'Branch' },
    { value: 'Department', label: 'Department' },
    { value: 'External', label: 'External Vendor' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value?: string | null; color?: string }) => (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
        <Box sx={{ color: color ?? 'text.disabled', flexShrink: 0, display: 'flex' }}>{icon}</Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0, fontSize: '0.7rem' }}>{label}:</Typography>
        <Typography variant="caption" sx={{ fontWeight: 600, color: value ? 'text.primary' : 'text.disabled', fontSize: '0.7rem', fontStyle: value ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value || NA}
        </Typography>
    </Stack>
);

const StatusChip = ({ status, color }: { status: string; color?: string }) => (
    <Chip
        label={status}
        size="small"
        sx={{
            height: 18, fontSize: '0.62rem', fontWeight: 700,
            bgcolor: alpha(color ?? '#16A34A', 0.1),
            color: color ?? '#16A34A',
            border: `1px solid ${alpha(color ?? '#16A34A', 0.25)}`,
            borderRadius: '5px',
        }}
    />
);

// ─── FormSection ──────────────────────────────────────────────────────────────

interface SectionProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    helpText?: string;
    badge?: React.ReactNode;
}

const FormSection = ({ title, subtitle, icon, children, helpText, badge }: SectionProps) => (
    <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: subtitle ? 0.5 : 2.5, pb: 1.5, borderBottom: `1.5px solid ${alpha(PRIMARY, 0.08)}` }}>
            {icon && (
                <Box sx={{ mr: 1.5, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '8px', flexShrink: 0 }}>
                    {icon}
                </Box>
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', flexGrow: 1, fontSize: '0.9rem' }}>
                {title}
            </Typography>
            {badge}
            {helpText && (
                <Tooltip title={helpText} arrow placement="top">
                    <IconButton size="small"><HelpOutlineIcon fontSize="small" color="action" /></IconButton>
                </Tooltip>
            )}
        </Box>
        {subtitle && <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', fontSize: '0.82rem' }}>{subtitle}</Typography>}
        {children}
    </Box>
);

// ─── UserProfileCard ──────────────────────────────────────────────────────────

const UserProfileCard = ({ user, role, accentColor = PRIMARY }: { user: IUser; role: string; accentColor?: string }) => {
    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    const titleName = user.title?.name ?? null;
    const roleName = (user.title as any)?.role?.name ?? null;
    const branchName = user.branch?.name ?? null;
    const deptName = user.department?.name ?? null;
    const reportsTo = user.title?.reportsTo?.name ?? null;

    return (
        <Box sx={{ borderRadius: 2, border: `1px solid ${alpha(accentColor, 0.18)}`, bgcolor: alpha(accentColor, 0.025), overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.25, bgcolor: alpha(accentColor, 0.07), borderBottom: `1px solid ${alpha(accentColor, 0.12)}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(accentColor, 0.18), color: accentColor, fontWeight: 800, fontSize: '0.95rem', border: `2px solid ${alpha(accentColor, 0.3)}`, flexShrink: 0 }}>
                    {initials}
                </Avatar>
                <Box flex={1} overflow="hidden">
                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.6, lineHeight: 1 }}>{role}</Typography>
                    <Typography variant="body2" fontWeight={700} noWrap sx={{ lineHeight: 1.3 }}>{fullName}</Typography>
                    {titleName && <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }} noWrap>{titleName}</Typography>}
                </Box>
                <CheckCircleOutlineIcon sx={{ fontSize: 18, color: alpha(accentColor, 0.5), flexShrink: 0 }} />
            </Box>
            <Box sx={{ px: 2, py: 1.25 }}>
                <Grid container spacing={0.5}>
                    <Grid item xs={12} sm={6}><InfoRow icon={<NumbersOutlinedIcon sx={{ fontSize: 11 }} />} label="Staff No." value={user.staffNumber} color={accentColor} /></Grid>
                    <Grid item xs={12} sm={6}><InfoRow icon={<AccountTreeOutlinedIcon sx={{ fontSize: 11 }} />} label="Role" value={roleName} color={accentColor} /></Grid>
                    <Grid item xs={12} sm={6}><InfoRow icon={<ApartmentOutlinedIcon sx={{ fontSize: 11 }} />} label="Branch" value={branchName} color={accentColor} /></Grid>
                    <Grid item xs={12} sm={6}><InfoRow icon={<StorefrontOutlinedIcon sx={{ fontSize: 11 }} />} label="Dept." value={deptName} color={accentColor} /></Grid>
                    <Grid item xs={12} sm={6}><InfoRow icon={<EmailOutlinedIcon sx={{ fontSize: 11 }} />} label="Email" value={user.email} color={accentColor} /></Grid>
                    <Grid item xs={12} sm={6}><InfoRow icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 11 }} />} label="Reports To" value={reportsTo} color={accentColor} /></Grid>
                </Grid>
            </Box>
        </Box>
    );
};

// ─── AssetCard ────────────────────────────────────────────────────────────────

const AssetCard = ({ asset, onRemove }: { asset: IAsset; onRemove: () => void }) => {
    const assignedToName = asset.assignedTo
        ? `${(asset.assignedTo as IUser).firstName} ${(asset.assignedTo as IUser).lastName}`
        : null;
    const statusColor = (asset.assetStatus as any)?.color ?? '#16A34A';

    return (
        <Box sx={{ borderRadius: 2, border: `1px solid ${alpha(PRIMARY, 0.15)}`, bgcolor: '#FAFCFC', overflow: 'hidden', transition: 'all 0.15s', '&:hover': { borderColor: alpha(PRIMARY, 0.35), bgcolor: alpha(PRIMARY, 0.015) } }}>
            <Box sx={{ px: 2, py: 1.25, bgcolor: alpha(PRIMARY, 0.05), borderBottom: `1px solid ${alpha(PRIMARY, 0.1)}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: 1.5, flexShrink: 0, bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InventoryOutlinedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box flex={1} overflow="hidden">
                    <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                        <Chip icon={<FingerprintIcon sx={{ fontSize: '10px !important' }} />} label={asset.engravedNumber} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, border: `1px solid ${alpha(PRIMARY, 0.2)}` }} />
                        {asset.assetType && <Chip label={asset.assetType.name} size="small" sx={{ height: 18, fontSize: '0.62rem', bgcolor: alpha('#6366F1', 0.08), color: '#6366F1', border: `1px solid ${alpha('#6366F1', 0.2)}` }} />}
                        {asset.assetStatus?.name && <StatusChip status={asset.assetStatus.name} color={statusColor} />}
                    </Stack>
                    <Typography variant="body2" fontWeight={700} noWrap sx={{ mt: 0.2, fontSize: '0.82rem' }}>{asset.assetName || NA}</Typography>
                </Box>
                <IconButton size="small" onClick={onRemove} sx={{ flexShrink: 0, color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: alpha('#d32f2f', 0.06) } }}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>
            <Box sx={{ px: 2, py: 1.25 }}>
                <Grid container spacing={0.5} rowSpacing={0.75}>
                    <Grid item xs={12} sm={6} md={4}><InfoRow icon={<BuildOutlinedIcon sx={{ fontSize: 11 }} />} label="Make / Model" value={[asset.make, asset.model].filter(Boolean).join(' / ')} color={PRIMARY} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><InfoRow icon={<CategoryOutlinedIcon sx={{ fontSize: 11 }} />} label="Category" value={asset.category ?? asset.assetType?.name} color={PRIMARY} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><InfoRow icon={<ApartmentOutlinedIcon sx={{ fontSize: 11 }} />} label="Current Location" value={asset.branch?.name} color={PRIMARY} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><InfoRow icon={<AssignmentIndOutlinedIcon sx={{ fontSize: 11 }} />} label="Assigned To" value={assignedToName} color={AMBER} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><InfoRow icon={<PriceCheckOutlinedIcon sx={{ fontSize: 11 }} />} label="Purchase Cost" value={asset.purchaseCost ? `UGX ${asset.purchaseCost}` : null} color={AMBER} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><InfoRow icon={<NumbersOutlinedIcon sx={{ fontSize: 11 }} />} label="LPO Number" value={asset.lpoNumber} color={PRIMARY} /></Grid>
                </Grid>
            </Box>
        </Box>
    );
};

// ─── DestinationConfirmCard ───────────────────────────────────────────────────

const DestinationConfirmCard = ({ label, type }: { label: string; type: string }) => {
    const typeColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        Branch: { bg: alpha(PRIMARY, 0.07), text: PRIMARY, icon: <ApartmentOutlinedIcon sx={{ fontSize: 16 }} /> },
        Department: { bg: alpha(BLUE, 0.07), text: BLUE, icon: <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} /> },
        External: { bg: alpha(AMBER, 0.07), text: AMBER, icon: <StorefrontOutlinedIcon sx={{ fontSize: 16 }} /> },
    };
    const config = typeColors[type] ?? typeColors['Branch'];
    return (
        <Box sx={{ p: 1.75, borderRadius: 2, border: `1px solid ${alpha(config.text, 0.18)}`, bgcolor: config.bg, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: alpha(config.text, 0.12), color: config.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {config.icon}
            </Box>
            <Box flex={1}>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: config.text, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1 }}>{type} Destination</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ mt: 0.15 }}>{label}</Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={0.5}>
                <CheckCircleOutlineIcon sx={{ color: config.text, fontSize: 17, opacity: 0.7 }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: config.text }}>Confirmed</Typography>
            </Stack>
        </Box>
    );
};

// ─── DocumentDropZone ─────────────────────────────────────────────────────────

const getFileIcon = (file: File): React.ReactNode => {
    if (file.type === 'application/pdf') return <PictureAsPdfOutlinedIcon sx={{ fontSize: 20, color: '#DC2626' }} />;
    if (file.type.startsWith('image/')) return <ImageOutlinedIcon sx={{ fontSize: 20, color: BLUE }} />;
    return <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: '#64748B' }} />;
};
const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentDropZone = ({
    files, onAdd, onRemove, fileInputRef,
}: {
    files: File[]; onAdd: (f: FileList | null) => void; onRemove: (i: number) => void; fileInputRef: React.RefObject<HTMLInputElement>;
}) => (
    <Box>
        <Box
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onAdd(e.dataTransfer.files); }}
            sx={{ border: `2px dashed ${alpha(PRIMARY, 0.3)}`, borderRadius: 2, p: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', bgcolor: alpha(PRIMARY, 0.02), '&:hover': { borderColor: alpha(PRIMARY, 0.6), bgcolor: alpha(PRIMARY, 0.05) } }}
        >
            <Stack alignItems="center" spacing={0.5}>
                <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.09), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                    <CloudUploadOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="body2" fontWeight={700} color="text.primary">Click to upload or drag & drop</Typography>
                <Typography variant="caption" color="text.secondary">PDF, JPG or PNG &middot; Max 5 MB per file &middot; Multiple files supported</Typography>
                <Button size="small" variant="outlined" startIcon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />} sx={{ mt: 0.75, height: 30, px: 2, borderRadius: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderColor: alpha(PRIMARY, 0.4), color: PRIMARY, '&:hover': { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) }, pointerEvents: 'none' }}>
                    Browse Files
                </Button>
            </Stack>
        </Box>
        <input ref={fileInputRef} type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onAdd(e.target.files)} />
        {files.length > 0 && (
            <Box mt={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                        Attached Documents ({files.length})
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                        Total: {formatFileSize(files.reduce((s, f) => s + f.size, 0))}
                    </Typography>
                </Stack>
                <Stack spacing={0.75}>
                    {files.map((file, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.75, py: 1.1, borderRadius: 1.5, border: `1px solid ${alpha('#000', 0.07)}`, bgcolor: '#fff', transition: 'all 0.15s', '&:hover': { borderColor: alpha(PRIMARY, 0.25), bgcolor: alpha(PRIMARY, 0.02) } }}>
                            <Box sx={{ flexShrink: 0 }}>{getFileIcon(file)}</Box>
                            <Box flex={1} overflow="hidden">
                                <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.82rem' }}>{file.name}</Typography>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="caption" color="text.secondary">{formatFileSize(file.size)}</Typography>
                                    <Typography variant="caption" sx={{ color: alpha('#000', 0.2) }}>•</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 700 }}>{file.name.split('.').pop()}</Typography>
                                </Stack>
                            </Box>
                            <Chip label={`Doc ${i + 1}`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.07), color: PRIMARY, border: `1px solid ${alpha(PRIMARY, 0.15)}` }} />
                            <IconButton size="small" onClick={() => onRemove(i)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: alpha('#d32f2f', 0.06) } }}>
                                <CloseIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>
            </Box>
        )}
    </Box>
);

// ─── MovementForm ─────────────────────────────────────────────────────────────

const MovementForm = ({
    register, control, formState, setValue, sendingRequest, buttonText, onFilesChange, initialAssets = [],
}: IMovementForm) => {
    const navigate = useNavigate();
    const { getCurrentUser } = RoutesUtills();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [officerOptions, setOfficerOptions] = useState<IOptions[]>([]);
    const [officerMap, setOfficerMap] = useState<Map<any, IUser>>(new Map());
    const [selectedOfficer, setSelectedOfficer] = useState<IUser | null>(null);

    const [showChangeApprover, setShowChangeApprover] = useState(false);
    const [approverOptions, setApproverOptions] = useState<IOptions[]>([]);
    const [approverMap, setApproverMap] = useState<Map<any, IUser>>(new Map());
    const [selectedApprover, setSelectedApprover] = useState<IUser | null>(null);

    const [destinationOptions, setDestinationOptions] = useState<IOptions[]>([]);
    const [selectedDestination, setSelectedDestination] = useState<IOptions | null>(null);

    const [assetSearchOptions, setAssetSearchOptions] = useState<IOptions[]>([]);
    const [assetMap, setAssetMap] = useState<Map<any, IAsset>>(new Map());
    const [selectedAssets, setSelectedAssets] = useState<IAsset[]>([]);
    const [assetInputValue, setAssetInputValue] = useState('');
    const [assetSearchLoading, setAssetSearchLoading] = useState(false);

    const [files, setFiles] = useState<File[]>([]);

    const destinationType = useWatch({ control, name: 'destinationType' });

    // Seed with logged-in user (or mock) on mount
    useEffect(() => {
        const user: IUser = getCurrentUser();
        const seedUser = (user?.id) ? user : MOCK_OFFICER;
        const opt: IOptions = { label: `${seedUser.firstName} ${seedUser.lastName}`, value: seedUser.id as any };
        setOfficerOptions([opt]);
        setOfficerMap(new Map([[seedUser.id, seedUser]]));
        setValue('officerId', seedUser.id);
        setSelectedOfficer(seedUser);

        if (initialAssets.length === 0) {
            setSelectedAssets(MOCK_ASSETS);
            setValue('assetIds', MOCK_ASSETS.map((a) => a.id as string | number));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (initialAssets.length > 0) {
            setSelectedAssets(initialAssets);
            setValue('assetIds', initialAssets.map((a) => a.id as string | number));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (destinationType) fetchDestinations('', destinationType);
        setValue('destinationId', null);
        setValue('destination', '');
        setSelectedDestination(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinationType]);

    const fetchUsers = async (query = '', forApprover = false) => {
        try {
            const r = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint: 'users', params: query ? { name: query } : {} }) as any;
            if (r?.status === 200) {
                const content: IUser[] = r.data?.content ?? [];
                const map = new Map<any, IUser>(content.map((u) => [u.id, u]));
                const opts: IOptions[] = content.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id as any }));
                if (forApprover) { setApproverMap(map); setApproverOptions(opts); }
                else { setOfficerMap(map); setOfficerOptions(opts); }
            }
        } catch { /* silent */ }
    };

    const fetchDestinations = async (query = '', type: string) => {
        if (!type) return;
        const endpointMap: Record<string, string> = { Branch: 'branches', Department: 'departments', External: 'vendors' };
        const ep = endpointMap[type];
        if (!ep) return;
        try {
            const r = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint: ep, params: query ? { name: query } : {} }) as any;
            if (r?.status === 200) setDestinationOptions((r.data?.content ?? []).map((item: any) => ({ label: item.name, value: item.id })));
        } catch { /* silent */ }
    };

    const fetchAssets = async (query = '') => {
        setAssetSearchLoading(true);
        try {
            const r = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint: 'assets', params: query ? { engravedNumber: query } : {} }) as any;
            if (r?.status === 200) {
                const content: IAsset[] = r.data?.content ?? [];
                setAssetMap(new Map(content.map((a) => [a.id, a])));
                setAssetSearchOptions(content.map((a) => ({ label: a.engravedNumber, value: a.id as any })));
            }
        } catch { /* silent */ }
        setAssetSearchLoading(false);
    };

    const handleAddFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024;
        const incoming: File[] = [];
        Array.from(fileList).forEach((f) => {
            if (!validTypes.includes(f.type)) { toast.warning(`${f.name}: Unsupported format — use PDF, JPG or PNG.`); return; }
            if (f.size > maxSize) { toast.warning(`${f.name}: Exceeds 5 MB limit.`); return; }
            incoming.push(f);
        });
        setFiles((prev) => { const updated = [...prev, ...incoming]; onFilesChange?.(updated); return updated; });
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => { const updated = prev.filter((_, i) => i !== index); onFilesChange?.(updated); return updated; });
    };

    const renderOfficerOption = (props: any, option: IOptions) => {
        const user = officerMap.get(option.value);
        return (
            <Box component="li" {...props} sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY, fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>{option.label[0]?.toUpperCase() ?? '?'}</Avatar>
                <Box>
                    <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{option.label}</Typography>
                    <Stack direction="row" spacing={0.75}>
                        {user?.title && <Typography variant="caption" color="text.secondary">{user.title.name}</Typography>}
                        {user?.branch && <Typography variant="caption" color="text.disabled">&middot; {user.branch.name}</Typography>}
                    </Stack>
                </Box>
            </Box>
        );
    };

    const renderApproverOption = (props: any, option: IOptions) => {
        const user = approverMap.get(option.value);
        return (
            <Box component="li" {...props} sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(BLUE, 0.12), color: BLUE, fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>{option.label[0]?.toUpperCase() ?? '?'}</Avatar>
                <Box>
                    <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{option.label}</Typography>
                    {user?.title && <Typography variant="caption" color="text.secondary">{user.title.name}</Typography>}
                </Box>
            </Box>
        );
    };

    const renderAssetOption = (props: any, option: IOptions) => {
        const asset = assetMap.get((option as IOptions).value);
        return (
            <Box component="li" {...props} sx={{ px: 1.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1, flexShrink: 0, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FingerprintIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box flex={1} overflow="hidden">
                    <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                        <Typography variant="body2" fontWeight={700} noWrap>{(option as IOptions).label}</Typography>
                        {asset?.assetType && <Chip label={asset.assetType.name} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY }} />}
                        {asset?.assetStatus?.name && <StatusChip status={asset.assetStatus.name} color={(asset.assetStatus as any).color} />}
                    </Stack>
                    {asset?.assetName && <Typography variant="caption" color="text.secondary" noWrap>{asset.assetName}</Typography>}
                    {asset?.branch && <Typography variant="caption" color="text.disabled" noWrap> &middot; {asset.branch.name}</Typography>}
                </Box>
            </Box>
        );
    };

    return (
        <Stack spacing={3} sx={{ maxWidth: 960, mx: 'auto', width: '100%' }}>

            {/* ── Section 1: Requesting Officer ──────────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Requesting Officer"
                    subtitle="The officer initiating this asset movement request."
                    icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                    <Grid container spacing={2.5} alignItems="flex-start">
                        <Grid item xs={12} sm={selectedOfficer ? 5 : 8}>
                            <UseFormAutocompleteComponent
                                register={register} control={control} formState={formState}
                                value="officerId" label="Search Officer"
                                options={officerOptions}
                                onInputChange={(_, v) => { if (v) fetchUsers(v); }}
                                onChange={(_, option) => {
                                    const user = option ? officerMap.get((option as IOptions).value) ?? null : null;
                                    setSelectedOfficer(user);
                                    setShowChangeApprover(false);
                                    setSelectedApprover(null);
                                    setValue('approverId', null);
                                }}
                                renderOption={renderOfficerOption}
                            />
                        </Grid>
                        {selectedOfficer && (
                            <Grid item xs={12} sm={7}>
                                <UserProfileCard user={selectedOfficer} role="Requesting Officer" accentColor={PRIMARY} />
                            </Grid>
                        )}
                    </Grid>
                </FormSection>
            </Paper>

            {/* ── Section 2: Approving Authority ─────────────────────────── */}
            {selectedOfficer && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha(showChangeApprover ? BLUE : PRIMARY, 0.12)}`, bgcolor: alpha(showChangeApprover ? BLUE : PRIMARY, 0.015), transition: 'all 0.2s' }}>
                    <FormSection
                        title="Approving Authority"
                        subtitle="The designated approver based on the officer's reporting line."
                        icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />}
                        badge={
                            <Button
                                size="small"
                                variant={showChangeApprover ? 'contained' : 'outlined'}
                                color={showChangeApprover ? 'error' : 'primary'}
                                startIcon={showChangeApprover ? <CloseIcon sx={{ fontSize: 13 }} /> : <EditOutlinedIcon sx={{ fontSize: 13 }} />}
                                sx={{ fontWeight: 600, fontSize: '0.72rem', height: 28, borderRadius: 1.5, textTransform: 'none', mr: 1 }}
                                onClick={() => {
                                    setShowChangeApprover((p) => !p);
                                    if (showChangeApprover) { setSelectedApprover(null); setValue('approverId', null); }
                                }}
                            >
                                {showChangeApprover ? 'Cancel' : 'Change Approver'}
                            </Button>
                        }
                    >
                        {!showChangeApprover && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.04), border: `1px dashed ${alpha(PRIMARY, 0.2)}` }}>
                                <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ color: PRIMARY, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: 0.5 }}>Default Approver (Reporting Line)</Typography>
                                    <Typography variant="body2" fontWeight={700}>{selectedOfficer.title?.reportsTo?.name ?? NA}</Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5} mt={0.2} flexWrap="wrap">
                                        <BadgeOutlinedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">Title: {selectedOfficer.title?.name ?? NA}</Typography>
                                        <Typography variant="caption" color="text.disabled"> &middot; </Typography>
                                        <AccountTreeOutlinedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">Role: {(selectedOfficer.title as any)?.role?.name ?? NA}</Typography>
                                    </Stack>
                                </Box>
                                <Chip label="Auto-assigned" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, border: `1px solid ${alpha(PRIMARY, 0.2)}` }} />
                            </Box>
                        )}

                        <Collapse in={showChangeApprover}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                    Search and select an alternative approver. This overrides the default reporting line for this request.
                                </Typography>
                                <Grid container spacing={2.5} alignItems="flex-start">
                                    <Grid item xs={12} sm={selectedApprover ? 5 : 8}>
                                        <UseFormAutocompleteComponent
                                            register={register} control={control} formState={formState}
                                            value="approverId" label="Search Alternative Approver"
                                            options={approverOptions} required={false}
                                            onInputChange={(_, v) => { if (v) fetchUsers(v, true); }}
                                            onChange={(_, option) => {
                                                setSelectedApprover(option ? approverMap.get((option as IOptions).value) ?? null : null);
                                            }}
                                            renderOption={renderApproverOption}
                                        />
                                    </Grid>
                                    {selectedApprover && (
                                        <Grid item xs={12} sm={7}>
                                            <UserProfileCard user={selectedApprover} role="Alternative Approver" accentColor={BLUE} />
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Collapse>
                    </FormSection>
                </Paper>
            )}

            {/* ── Section 3: Assets to Move ───────────────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha(selectedAssets.length === 0 && formState.errors.assetIds ? '#d32f2f' : '#000', selectedAssets.length === 0 && formState.errors.assetIds ? 0.4 : 0.07)}` }}>
                <FormSection
                    title="Assets to Move"
                    subtitle="Search and add assets by engraved number. Full asset details are shown for verification."
                    icon={<InventoryOutlinedIcon sx={{ fontSize: 16 }} />}
                    badge={
                        selectedAssets.length > 0 ? (
                            <Chip label={`${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''} selected`} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, border: `1px solid ${alpha(PRIMARY, 0.2)}`, mr: 1 }} />
                        ) : undefined
                    }
                >
                    <Box sx={{ maxWidth: 520 }}>
                        <Autocomplete
                            options={assetSearchOptions}
                            getOptionLabel={(o) => (o as IOptions).label ?? ''}
                            value={null}
                            inputValue={assetInputValue}
                            loading={assetSearchLoading}
                            filterOptions={(x) => x}
                            isOptionEqualToValue={(o, v) => (o as IOptions).value === (v as IOptions).value}
                            onInputChange={(_, v, reason) => {
                                setAssetInputValue(v);
                                if (reason === 'input') fetchAssets(v);
                            }}
                            onChange={(_, selected) => {
                                if (!selected) return;
                                const opt = selected as IOptions;
                                const asset = assetMap.get(opt.value);
                                if (!asset) return;
                                if (selectedAssets.some((a) => a.id === asset.id)) { toast.warning(`Asset ${asset.engravedNumber} is already in the list.`); return; }
                                const updated = [...selectedAssets, asset];
                                setSelectedAssets(updated);
                                setValue('assetIds', updated.map((a) => a.id as string | number));
                                setAssetInputValue('');
                                setAssetSearchOptions([]);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search by Engraved Number"
                                    placeholder="e.g. PBL-LAP-2023-0042"
                                    size="small"
                                    error={!!formState.errors.assetIds}
                                    helperText={formState.errors.assetIds && selectedAssets.length === 0 ? (formState.errors.assetIds.message as string) : undefined}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>{assetSearchLoading && <CircularProgress color="inherit" size={16} sx={{ mr: 1 }} />}{params.InputProps.endAdornment}</>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={renderAssetOption}
                        />
                    </Box>

                    {selectedAssets.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <LocalShippingOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        {selectedAssets.length} Asset{selectedAssets.length > 1 ? 's' : ''} Queued for Movement
                                    </Typography>
                                </Stack>
                            </Divider>
                            <Stack spacing={1.5}>
                                {selectedAssets.map((asset, idx) => (
                                    <AssetCard
                                        key={asset.id ?? idx}
                                        asset={asset}
                                        onRemove={() => {
                                            const updated = selectedAssets.filter((_, i) => i !== idx);
                                            setSelectedAssets(updated);
                                            setValue('assetIds', updated.map((a) => a.id as string | number));
                                        }}
                                    />
                                ))}
                            </Stack>
                        </>
                    )}
                </FormSection>
            </Paper>

            {/* ── Section 4: Movement Destination ────────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Movement Destination"
                    subtitle="Specify where the assets are going and who will receive them."
                    icon={<LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={5}>
                            <UseFormSelect
                                register={register} control={control} formState={formState}
                                value="destinationType" label="Destination Type"
                                options={destinationTypeOptions}
                            />
                        </Grid>

                        {destinationType && (
                            <Grid item xs={12} sm={7}>
                                <UseFormAutocompleteComponent
                                    register={register} control={control} formState={formState}
                                    value="destinationId"
                                    label={destinationType === 'Branch' ? 'Select Branch' : destinationType === 'Department' ? 'Select Department' : 'Select External Vendor'}
                                    options={destinationOptions}
                                    onInputChange={(_, v) => fetchDestinations(v, destinationType)}
                                    onChange={(_, option) => {
                                        if (option) { const opt = option as IOptions; setValue('destination', opt.label); setSelectedDestination(opt); }
                                        else { setValue('destination', ''); setSelectedDestination(null); }
                                    }}
                                />
                            </Grid>
                        )}

                        {selectedDestination && (
                            <Grid item xs={12}>
                                <DestinationConfirmCard label={selectedDestination.label} type={destinationType} />
                            </Grid>
                        )}

                        {selectedDestination && selectedOfficer && (
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1.5, border: `1px solid ${alpha('#000', 0.06)}`, bgcolor: '#F8FAFC', flexWrap: 'wrap' }}>
                                    <Box sx={{ flex: 1, minWidth: 120 }}>
                                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>From</Typography>
                                        <Typography variant="body2" fontWeight={700} noWrap>{selectedOfficer.branch?.name ?? selectedOfficer.department?.name ?? NA}</Typography>
                                    </Box>
                                    <ArrowForwardOutlinedIcon sx={{ color: 'text.disabled', fontSize: 18, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1, minWidth: 120 }}>
                                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: 0.5 }}>To</Typography>
                                        <Typography variant="body2" fontWeight={700} noWrap>{selectedDestination.label}</Typography>
                                    </Box>
                                    {selectedAssets.length > 0 && (
                                        <>
                                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                                            <Box sx={{ flexShrink: 0 }}>
                                                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>Assets</Typography>
                                                <Typography variant="body2" fontWeight={700}>{selectedAssets.length} item{selectedAssets.length > 1 ? 's' : ''}</Typography>
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            </Grid>
                        )}

                        <Grid item xs={12} sm={6}>
                            <UseFormInput
                                register={register} control={control} formState={formState}
                                value={"receivingParty" as any} label="Receiving Party / Officer Name" required={false}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <UseFormInput
                                register={register} control={control} formState={formState}
                                value={"receivingPartyContact" as any} label="Receiving Party Contact" required={false}
                            />
                        </Grid>
                    </Grid>
                </FormSection>
            </Paper>

            {/* ── Section 5: Movement Details ─────────────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Movement Details"
                    subtitle="Describe the purpose and provide the expected return date if this is a temporary movement."
                    icon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                            <UseFormInput
                                register={register} control={control} formState={formState}
                                value="reason" label="Reason for Movement" multiline row={4}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <UseFormDatePicker
                                register={register} control={control} formState={formState}
                                value="expectedReturnDate" label="Expected Return Date (if temporary)" required={false}
                            />
                        </Grid>
                    </Grid>
                </FormSection>
            </Paper>

            {/* ── Section 6: Supporting Documents ─────────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Supporting Documents"
                    subtitle="Attach authorization letters, purchase orders, or any supporting documentation. Optional but recommended."
                    icon={<AttachFileOutlinedIcon sx={{ fontSize: 16 }} />}
                    badge={
                        files.length > 0 ? (
                            <Chip label={`${files.length} file${files.length > 1 ? 's' : ''}`} size="small" sx={{ bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, fontWeight: 700, height: 20, fontSize: '0.68rem', mr: 1, border: `1px solid ${alpha(PRIMARY, 0.2)}` }} />
                        ) : undefined
                    }
                >
                    <Box sx={{ maxWidth: 640 }}>
                        <DocumentDropZone files={files} onAdd={handleAddFiles} onRemove={handleRemoveFile} fileInputRef={fileInputRef} />
                    </Box>
                </FormSection>
            </Paper>

            {/* ── Actions ─────────────────────────────────────────────────── */}
            <Paper elevation={0} sx={{ px: 3, py: 2.5, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}`, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 130 }}>
                    <ButtonComponent sendingRequest={false} buttonText="Cancel" buttonColor="inherit" variant="outlined" type="button" handleClick={() => navigate(ROUTES.MOVEMENT)} />
                </Box>
                <Box sx={{ width: 220 }}>
                    <ButtonComponent sendingRequest={sendingRequest} buttonText={buttonText} buttonColor="primary" variant="contained" type="submit" />
                </Box>
            </Paper>
        </Stack>
    );
};

export default MovementForm;
