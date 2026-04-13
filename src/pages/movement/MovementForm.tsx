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
    Collapse, Grid, IconButton, Paper, Stack, TextField, Tooltip, Typography,
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
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
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

const PRIMARY = '#08796C';
const BLUE = '#4285F4';

const destinationTypeOptions: IOptions[] = [
    { value: 'Branch', label: 'Branch' },
    { value: 'Department', label: 'Department' },
    { value: 'External', label: 'External Vendor' },
];

// ─── FormSection ────────────────────────────────────────────────────────────

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
                <Box sx={{ mr: 1.5, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '6px', flexShrink: 0 }}>
                    {icon}
                </Box>
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', flexGrow: 1 }}>
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

// ─── UserInfoCard ────────────────────────────────────────────────────────────

const UserInfoCard = ({ user, label, accentColor = PRIMARY }: { user: IUser; label: string; accentColor?: string }) => {
    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    const titleName = user.title?.name;
    const location = (user as any).branch?.name ?? (user as any).department?.name ?? null;
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(accentColor, 0.2)}`,
                bgcolor: alpha(accentColor, 0.03),
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                height: '100%',
                minHeight: 76,
            }}
        >
            <Avatar
                sx={{
                    width: 46,
                    height: 46,
                    bgcolor: alpha(accentColor, 0.15),
                    color: accentColor,
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0,
                    border: `2px solid ${alpha(accentColor, 0.25)}`,
                }}
            >
                {initials}
            </Avatar>
            <Box flex={1} overflow="hidden">
                <Typography variant="caption" sx={{ color: accentColor, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="body2" fontWeight={700} noWrap>{fullName}</Typography>
                {titleName && (
                    <Stack direction="row" alignItems="center" spacing={0.4}>
                        <BadgeOutlinedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>{titleName}</Typography>
                    </Stack>
                )}
                {location && (
                    <Stack direction="row" alignItems="center" spacing={0.4}>
                        <ApartmentOutlinedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>{location}</Typography>
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

// ─── DestinationBadge ────────────────────────────────────────────────────────

const DestinationBadge = ({ label, type }: { label: string; type: string }) => (
    <Box
        sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(BLUE, 0.2)}`,
            bgcolor: alpha(BLUE, 0.03),
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
        }}
    >
        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(BLUE, 0.1), color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LocationOnOutlinedIcon fontSize="small" />
        </Box>
        <Box>
            <Typography variant="caption" sx={{ color: BLUE, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                {type}
            </Typography>
            <Typography variant="body2" fontWeight={700}>{label}</Typography>
        </Box>
        <CheckCircleOutlineIcon sx={{ ml: 'auto', color: alpha(BLUE, 0.5), fontSize: 18 }} />
    </Box>
);

// ─── DocumentDropZone ────────────────────────────────────────────────────────

const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄';
    if (file.type.startsWith('image/')) return '🖼️';
    return '📎';
};
const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentDropZone = ({
    files,
    onAdd,
    onRemove,
    fileInputRef,
}: {
    files: File[];
    onAdd: (f: FileList | null) => void;
    onRemove: (i: number) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}) => (
    <Box>
        <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
                border: `2px dashed ${alpha(PRIMARY, 0.25)}`,
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                bgcolor: alpha(PRIMARY, 0.02),
                '&:hover': { borderColor: alpha(PRIMARY, 0.55), bgcolor: alpha(PRIMARY, 0.05) },
            }}
        >
            <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: alpha(PRIMARY, 0.4), mb: 0.75 }} />
            <Typography variant="body2" fontWeight={600} color="text.primary">Click to attach documents</Typography>
            <Typography variant="caption" color="text.secondary">PDF, JPG or PNG &middot; max 5 MB per file</Typography>
        </Box>
        <input ref={fileInputRef} type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onAdd(e.target.files)} />
        {files.length > 0 && (
            <Stack spacing={1} mt={1.5}>
                {files.map((file, i) => (
                    <Box
                        key={i}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1.2, borderRadius: 1.5,
                            border: `1px solid ${alpha('#000', 0.07)}`, bgcolor: '#fff',
                        }}
                    >
                        <Typography variant="body2" sx={{ fontSize: '1.2rem', lineHeight: 1, flexShrink: 0 }}>{getFileIcon(file)}</Typography>
                        <Box flex={1} overflow="hidden">
                            <Typography variant="body2" fontWeight={600} noWrap>{file.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{formatFileSize(file.size)}</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => onRemove(i)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
            </Stack>
        )}
    </Box>
);

// ─── MovementForm ────────────────────────────────────────────────────────────

const MovementForm = ({
    register,
    control,
    formState,
    setValue,
    sendingRequest,
    buttonText,
    onFilesChange,
    initialAssets = [],
}: IMovementForm) => {
    const navigate = useNavigate();
    const { getCurrentUser } = RoutesUtills();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── officers ──────────────────────────────────────
    const [officerOptions, setOfficerOptions] = useState<IOptions[]>([]);
    const [officerMap, setOfficerMap] = useState<Map<any, IUser>>(new Map());
    const [selectedOfficer, setSelectedOfficer] = useState<IUser | null>(null);

    // ── approver ──────────────────────────────────────
    const [showChangeApprover, setShowChangeApprover] = useState(false);
    const [approverOptions, setApproverOptions] = useState<IOptions[]>([]);
    const [approverMap, setApproverMap] = useState<Map<any, IUser>>(new Map());
    const [selectedApprover, setSelectedApprover] = useState<IUser | null>(null);

    // ── destination ───────────────────────────────────
    const [destinationOptions, setDestinationOptions] = useState<IOptions[]>([]);
    const [selectedDestination, setSelectedDestination] = useState<IOptions | null>(null);

    // ── assets ────────────────────────────────────────
    const [assetSearchOptions, setAssetSearchOptions] = useState<IOptions[]>([]);
    const [assetMap, setAssetMap] = useState<Map<any, IAsset>>(new Map());
    const [selectedAssets, setSelectedAssets] = useState<IAsset[]>([]);
    const [assetInputValue, setAssetInputValue] = useState('');
    const [assetSearchLoading, setAssetSearchLoading] = useState(false);

    // ── files ─────────────────────────────────────────
    const [files, setFiles] = useState<File[]>([]);

    const destinationType = useWatch({ control, name: 'destinationType' });

    // Seed with logged-in user on mount
    useEffect(() => {
        const user: IUser = getCurrentUser();
        if (user?.id) {
            const opt: IOptions = { label: `${user.firstName} ${user.lastName}`, value: user.id as any };
            setOfficerOptions([opt]);
            setOfficerMap(new Map([[user.id, user]]));
            setValue('officerId', user.id);
            setSelectedOfficer(user);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload destinations when destination type changes
    useEffect(() => {
        if (destinationType) {
            fetchDestinations('', destinationType);
        }
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
            if (r?.status === 200) {
                setDestinationOptions((r.data?.content ?? []).map((item: any) => ({ label: item.name, value: item.id })));
            }
        } catch { /* silent */ }
    };

    const fetchAssets = async (query = '') => {
        setAssetSearchLoading(true);
        try {
            const r = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint: 'assets',
                params: query ? { engravedNumber: query } : {},
            }) as any;
            if (r?.status === 200) {
                const content: IAsset[] = r.data?.content ?? [];
                const map = new Map<any, IAsset>(content.map((a) => [a.id, a]));
                setAssetMap(map);
                setAssetSearchOptions(content.map((a) => ({
                    label: a.engravedNumber,
                    value: a.id as any,
                })));
            }
        } catch { /* silent */ }
        setAssetSearchLoading(false);
    };

    // Populate assets when editing an existing movement
    useEffect(() => {
        if (initialAssets.length > 0) {
            setSelectedAssets(initialAssets);
            setValue('assetIds', initialAssets.map((a) => a.id as string | number));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY, fontSize: '0.75rem', fontWeight: 800 }}>
                    {option.label[0]?.toUpperCase() ?? '?'}
                </Avatar>
                <Box>
                    <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{option.label}</Typography>
                    {user?.title && <Typography variant="caption" color="text.secondary">{user.title.name}</Typography>}
                    {(user as any)?.branch && <Typography variant="caption" color="text.secondary"> &middot; {(user as any).branch.name}</Typography>}
                </Box>
            </Box>
        );
    };

    const renderApproverOption = (props: any, option: IOptions) => {
        const user = approverMap.get(option.value);
        return (
            <Box component="li" {...props} sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(BLUE, 0.12), color: BLUE, fontSize: '0.75rem', fontWeight: 800 }}>
                    {option.label[0]?.toUpperCase() ?? '?'}
                </Avatar>
                <Box>
                    <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{option.label}</Typography>
                    {user?.title && <Typography variant="caption" color="text.secondary">{user.title.name}</Typography>}
                </Box>
            </Box>
        );
    };

    return (
        <Stack spacing={3}>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Section 1 – Requesting Officer & Approval Chain              */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Requesting Officer & Approval Chain"
                    subtitle="Select the officer initiating this movement. The approving authority is determined automatically by the reporting line."
                    icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                    <Grid container spacing={2.5}>

                        {/* Officer autocomplete */}
                        <Grid item xs={12} md={selectedOfficer ? 7 : 12}>
                            <UseFormAutocompleteComponent
                                register={register}
                                control={control}
                                formState={formState}
                                value="officerId"
                                label="Requesting Officer"
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

                        {/* Officer info card */}
                        {selectedOfficer && (
                            <Grid item xs={12} md={5}>
                                <UserInfoCard user={selectedOfficer} label="Requesting Officer" accentColor={PRIMARY} />
                            </Grid>
                        )}

                        {/* Approval chain */}
                        {selectedOfficer && (
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: showChangeApprover ? alpha(BLUE, 0.03) : alpha(PRIMARY, 0.03),
                                        border: `1px solid ${alpha(showChangeApprover ? BLUE : PRIMARY, 0.12)}`,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                                        <Box>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={0.25}>
                                                <VerifiedUserOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                                                <Typography variant="body2" fontWeight={700}>Approving Authority</Typography>
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary">
                                                Reports to:{' '}
                                                <Typography component="span" variant="caption" fontWeight={700} color="text.primary">
                                                    {selectedOfficer.title?.reportsTo?.name ?? 'Not configured'}
                                                </Typography>
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color={showChangeApprover ? 'error' : 'primary'}
                                            startIcon={showChangeApprover ? <CloseIcon sx={{ fontSize: 13 }} /> : <EditOutlinedIcon sx={{ fontSize: 13 }} />}
                                            sx={{ fontWeight: 600, fontSize: '0.72rem', height: 30, borderRadius: 1.5, textTransform: 'none' }}
                                            onClick={() => {
                                                setShowChangeApprover((p) => !p);
                                                if (showChangeApprover) { setSelectedApprover(null); setValue('approverId', null); }
                                            }}
                                        >
                                            {showChangeApprover ? 'Cancel' : 'Change Approver'}
                                        </Button>
                                    </Stack>

                                    <Collapse in={showChangeApprover}>
                                        <Box mt={2}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                                Search and select an alternative approver for this movement request.
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={selectedApprover ? 7 : 12}>
                                                    <UseFormAutocompleteComponent
                                                        register={register}
                                                        control={control}
                                                        formState={formState}
                                                        value="approverId"
                                                        label="Alternative Approver"
                                                        options={approverOptions}
                                                        required={false}
                                                        onInputChange={(_, v) => { if (v) fetchUsers(v, true); }}
                                                        onChange={(_, option) => {
                                                            setSelectedApprover(option ? approverMap.get((option as IOptions).value) ?? null : null);
                                                        }}
                                                        renderOption={renderApproverOption}
                                                    />
                                                </Grid>
                                                {selectedApprover && (
                                                    <Grid item xs={12} md={5}>
                                                        <UserInfoCard user={selectedApprover} label="Alternative Approver" accentColor={BLUE} />
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Box>
                                    </Collapse>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </FormSection>
            </Paper>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Section 2 – Assets to Move                                   */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha(selectedAssets.length === 0 && formState.errors.assetIds ? '#d32f2f' : '#000', selectedAssets.length === 0 && formState.errors.assetIds ? 0.4 : 0.07)}` }}>
                <FormSection
                    title="Assets to Move"
                    subtitle="Search and add all assets that will be included in this movement. You can add multiple assets."
                    icon={<InventoryOutlinedIcon sx={{ fontSize: 16 }} />}
                    badge={
                        selectedAssets.length > 0 ? (
                            <Chip
                                label={`${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''}`}
                                size="small"
                                sx={{ bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, fontWeight: 700, height: 20, fontSize: '0.68rem', mr: 1 }}
                            />
                        ) : undefined
                    }
                >
                    {/* Search autocomplete */}
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
                            if (selectedAssets.some((a) => a.id === asset.id)) {
                                toast.warning(`Asset ${asset.engravedNumber} is already in the list.`);
                                return;
                            }
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
                                placeholder="Type an engraved number…"
                                size="small"
                                error={!!formState.errors.assetIds}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {assetSearchLoading && <CircularProgress color="inherit" size={16} sx={{ mr: 1 }} />}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => {
                            const asset = assetMap.get((option as IOptions).value);
                            return (
                                <Box component="li" {...props} sx={{ px: 1.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 32, height: 32, borderRadius: 1, flexShrink: 0,
                                            bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <FingerprintIcon sx={{ fontSize: 16 }} />
                                    </Box>
                                    <Box flex={1} overflow="hidden">
                                        <Stack direction="row" alignItems="center" spacing={0.75}>
                                            <Typography variant="body2" fontWeight={700} noWrap>
                                                {(option as IOptions).label}
                                            </Typography>
                                            {asset?.assetType && (
                                                <Chip label={asset.assetType.name} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY }} />
                                            )}
                                        </Stack>
                                        {asset?.assetName && (
                                            <Typography variant="caption" color="text.secondary" noWrap>{asset.assetName}</Typography>
                                        )}
                                    </Box>
                                </Box>
                            );
                        }}
                        sx={{ mb: selectedAssets.length > 0 ? 2 : 0 }}
                    />

                    {/* Validation error */}
                    {formState.errors.assetIds && selectedAssets.length === 0 && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, mb: 1.5, ml: 0.25 }}>
                            {formState.errors.assetIds.message as string}
                        </Typography>
                    )}

                    {/* Selected assets list */}
                    {selectedAssets.length > 0 && (
                        <Stack spacing={1}>
                            {selectedAssets.map((asset, idx) => (
                                <Box
                                    key={asset.id ?? idx}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                        px: 2, py: 1.25, borderRadius: 1.5,
                                        border: `1px solid ${alpha(PRIMARY, 0.15)}`,
                                        bgcolor: alpha(PRIMARY, 0.02),
                                        transition: 'all 0.15s',
                                        '&:hover': { bgcolor: alpha(PRIMARY, 0.05), borderColor: alpha(PRIMARY, 0.3) },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
                                            bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <InventoryOutlinedIcon sx={{ fontSize: 17 }} />
                                    </Box>
                                    <Box flex={1} overflow="hidden">
                                        <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                                            <Chip
                                                icon={<FingerprintIcon sx={{ fontSize: '11px !important' }} />}
                                                label={asset.engravedNumber}
                                                size="small"
                                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, border: `1px solid ${alpha(PRIMARY, 0.2)}` }}
                                            />
                                            {asset.assetType && (
                                                <Chip label={asset.assetType.name} size="small" sx={{ height: 18, fontSize: '0.63rem', bgcolor: alpha('#000', 0.05), color: 'text.secondary' }} />
                                            )}
                                        </Stack>
                                        {asset.assetName && (
                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.2 }}>{asset.assetName}</Typography>
                                        )}
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            const updated = selectedAssets.filter((_, i) => i !== idx);
                                            setSelectedAssets(updated);
                                            setValue('assetIds', updated.map((a) => a.id as string | number));
                                        }}
                                        sx={{ color: 'text.disabled', flexShrink: 0, '&:hover': { color: 'error.main', bgcolor: alpha('#d32f2f', 0.06) } }}
                                    >
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </FormSection>
            </Paper>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Section 3 – Movement Destination                             */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Movement Destination"
                    subtitle="Choose the destination type, then select the specific destination from the list."
                    icon={<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} md={destinationType ? 6 : 12}>
                            <UseFormSelect
                                register={register}
                                control={control}
                                formState={formState}
                                value="destinationType"
                                label="Destination Type"
                                options={destinationTypeOptions}
                            />
                        </Grid>

                        {destinationType && (
                            <Grid item xs={12} md={6}>
                                <UseFormAutocompleteComponent
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value="destinationId"
                                    label={
                                        destinationType === 'Branch'
                                            ? 'Select Branch'
                                            : destinationType === 'Department'
                                                ? 'Select Department'
                                                : 'Select External Vendor'
                                    }
                                    options={destinationOptions}
                                    onInputChange={(_, v) => fetchDestinations(v, destinationType)}
                                    onChange={(_, option) => {
                                        if (option) {
                                            const opt = option as IOptions;
                                            setValue('destination', opt.label);
                                            setSelectedDestination(opt);
                                        } else {
                                            setValue('destination', '');
                                            setSelectedDestination(null);
                                        }
                                    }}
                                />
                            </Grid>
                        )}

                        {selectedDestination && (
                            <Grid item xs={12}>
                                <DestinationBadge label={selectedDestination.label} type={destinationType} />
                            </Grid>
                        )}
                    </Grid>
                </FormSection>
            </Paper>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Section 4 – Supporting Documents                             */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Supporting Documents"
                    subtitle="Attach any authorization letters, approvals, or supporting documentation. This section is optional."
                    icon={<AttachFileOutlinedIcon sx={{ fontSize: 16 }} />}
                    badge={
                        files.length > 0 ? (
                            <Chip
                                label={`${files.length} file${files.length > 1 ? 's' : ''}`}
                                size="small"
                                sx={{ bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, fontWeight: 700, height: 20, fontSize: '0.68rem', mr: 1 }}
                            />
                        ) : undefined
                    }
                >
                    <DocumentDropZone files={files} onAdd={handleAddFiles} onRemove={handleRemoveFile} fileInputRef={fileInputRef} />
                </FormSection>
            </Paper>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Section 5 – Movement Details                                 */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Movement Details"
                    subtitle="Describe the purpose of this movement and the expected return date if applicable."
                    icon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                            <UseFormInput
                                register={register}
                                control={control}
                                formState={formState}
                                value="reason"
                                label="Reason for Movement"
                                multiline
                                row={4}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <UseFormDatePicker
                                register={register}
                                control={control}
                                formState={formState}
                                value="expectedReturnDate"
                                label="Expected Return Date"
                                required={false}
                            />
                        </Grid>
                    </Grid>
                </FormSection>
            </Paper>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Actions                                                       */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <Paper
                elevation={0}
                sx={{
                    px: 3, py: 2.5, borderRadius: 2.5,
                    border: `1px solid ${alpha('#000', 0.07)}`,
                    display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2,
                }}
            >
                <Box sx={{ width: 130 }}>
                    <ButtonComponent
                        sendingRequest={false}
                        buttonText="Cancel"
                        buttonColor="inherit"
                        variant="outlined"
                        type="button"
                        handleClick={() => navigate(ROUTES.MOVEMENT)}
                    />
                </Box>
                <Box sx={{ width: 210 }}>
                    <ButtonComponent
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                        buttonColor="primary"
                        variant="contained"
                        type="submit"
                    />
                </Box>
            </Paper>
        </Stack>
    );
};

export default MovementForm;
