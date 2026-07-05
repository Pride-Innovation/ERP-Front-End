/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useState } from 'react';
import {
    alpha, Autocomplete, Box, Button, Chip, CircularProgress, Divider, FormControlLabel, Grid, IconButton,
    MenuItem, Paper, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import { toast } from 'react-toastify';
import { fieldSx } from '../../components/forms/Inputs';
import { autocompleteSx } from '../../components/forms/Autocomplete';
import { PageSection } from '../../components/layout';
import { brand, neutral, border, status } from '../../utils/tokens';
import { fetchRowsService } from '../../core/apis/globalService';
import { IMovementForm, IStoreView } from './interface';
import { IAsset } from '../assets/interface';
import { IUser } from '../users/interface';
import { creatableMovementTypes, storeTypeLabels } from './constants';
import {
    fetchStoresService, fetchStoreAssetsService, fetchStoreBalancesService,
} from './service';

const P = brand[500];
const BLUE = status.info.main;

interface IBalanceView {
    commodityId: number;
    commodityName: string;
    quantity: number;
    assetTypeName?: string;
}

/** Dropdown paper styling shared with the app's SelectComponent. */
const menuPaperSx = {
    mt: 0.5,
    borderRadius: '8px',
    boxShadow: `0 4px 20px ${alpha('#000', 0.1)}`,
    '& .MuiMenuItem-root': {
        fontSize: '0.875rem',
        py: 1,
        '&:hover': { backgroundColor: alpha(P, 0.06) },
        '&.Mui-selected': {
            backgroundColor: alpha(P, 0.1),
            color: P,
            '&:hover': { backgroundColor: alpha(P, 0.14) },
        },
    },
};

/** Soft-teal toggle group tuned to sit alongside the medium inputs. */
const toggleGroupSx = {
    '& .MuiToggleButton-root': {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.82rem',
        color: neutral[500],
        borderColor: border.default,
        '&.Mui-selected': {
            bgcolor: alpha(P, 0.1),
            color: P,
            fontWeight: 700,
            '&:hover': { bgcolor: alpha(P, 0.16) },
        },
    },
};

const storeLabel = (s: IStoreView) => `${s.name} · ${storeTypeLabels[s.storeType] ?? s.storeType}`;

const MovementForm = ({ setValue, watch, formState, items, setItems, sendingRequest, buttonText }: IMovementForm) => {
    const [stores, setStores] = useState<IStoreView[]>([]);
    const [loadingStores, setLoadingStores] = useState(false);

    const [sourceStore, setSourceStore] = useState<IStoreView | null>(null);
    const [destStore, setDestStore] = useState<IStoreView | null>(null);
    const [recipientUser, setRecipientUser] = useState<IUser | null>(null);

    const [userOptions, setUserOptions] = useState<IUser[]>([]);
    const [userLoading, setUserLoading] = useState(false);

    const [sourceAssets, setSourceAssets] = useState<IAsset[]>([]);
    const [sourceBalances, setSourceBalances] = useState<IBalanceView[]>([]);

    // Item-add controls
    const [lineKind, setLineKind] = useState<'ASSET' | 'COMMODITY'>('ASSET');
    const [pickedAsset, setPickedAsset] = useState<IAsset | null>(null);
    const [pickedCommodity, setPickedCommodity] = useState<IBalanceView | null>(null);
    const [lineQty, setLineQty] = useState<number>(1);

    const destinationKind: 'STORE' | 'USER' = watch('destinationKind') ?? 'STORE';

    // Load stores once
    useEffect(() => {
        (async () => {
            setLoadingStores(true);
            const r = (await fetchStoresService()) as any;
            if (r?.status === 200) setStores(r.data ?? []);
            setLoadingStores(false);
        })();
    }, []);

    // When source store changes, load its assets + balances and reset items
    useEffect(() => {
        if (!sourceStore) { setSourceAssets([]); setSourceBalances([]); return; }
        (async () => {
            const [aRes, bRes] = await Promise.all([
                fetchStoreAssetsService(sourceStore.id) as any,
                fetchStoreBalancesService({ storeId: sourceStore.id }) as any,
            ]);
            setSourceAssets(aRes?.status === 200 ? aRes.data ?? [] : []);
            setSourceBalances(bRes?.status === 200 ? bRes.data ?? [] : []);
        })();
        setItems([]);
        setPickedAsset(null);
        setPickedCommodity(null);
    }, [sourceStore, setItems]);

    const fetchUsers = async (query = '') => {
        setUserLoading(true);
        try {
            const r = (await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint: 'users', params: query ? { name: query } : {} })) as any;
            if (r?.status === 200) setUserOptions(r.data?.content ?? []);
        } finally {
            setUserLoading(false);
        }
    };

    // Derived movement category for UX (backend is authoritative)
    const destLocationId = destinationKind === 'STORE' ? destStore?.locationId : recipientUser?.branch?.id;
    const isInterLocation = useMemo(
        () => !!sourceStore && destLocationId != null && Number(sourceStore.locationId) !== Number(destLocationId),
        [sourceStore, destLocationId]
    );

    const addLine = () => {
        if (lineKind === 'ASSET') {
            if (!pickedAsset) { toast.warning('Select an asset to add.'); return; }
            if (items.some((i) => i.assetId === pickedAsset.id)) { toast.warning('Asset already added.'); return; }
            setItems([...items, { assetId: pickedAsset.id, quantity: 1, label: pickedAsset.engravedNumber, subLabel: pickedAsset.assetName }]);
            setPickedAsset(null);
        } else {
            if (!pickedCommodity) { toast.warning('Select a commodity to add.'); return; }
            if (lineQty < 1) { toast.warning('Quantity must be at least 1.'); return; }
            if (lineQty > pickedCommodity.quantity) { toast.warning(`Only ${pickedCommodity.quantity} in stock.`); return; }
            if (items.some((i) => i.commodityId === pickedCommodity.commodityId)) { toast.warning('Commodity already added.'); return; }
            setItems([...items, { commodityId: pickedCommodity.commodityId, quantity: lineQty, label: pickedCommodity.commodityName, subLabel: `Qty ${lineQty}` }]);
            setPickedCommodity(null);
            setLineQty(1);
        }
    };

    const removeLine = (idx: number) => setItems(items.filter((_, i) => i !== idx));

    const scopeChip = sourceStore && destLocationId != null ? (
        <Chip
            label={isInterLocation ? 'Inter-Location' : 'Intra-Location'}
            size="small"
            sx={{ height: 22, fontSize: '0.66rem', fontWeight: 700, bgcolor: alpha(isInterLocation ? BLUE : P, 0.1), color: isInterLocation ? BLUE : P }}
        />
    ) : undefined;

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                borderRadius: 2.5,
                overflow: 'hidden',
                border: `1px solid ${border.subtle}`,
                bgcolor: '#fff',
            }}
        >
            {/* ── Header ── */}
            <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 2.5, borderBottom: `1px solid ${border.subtle}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: alpha(P, 0.1), color: brand[600], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SwapHorizOutlinedIcon />
                </Box>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.25 }}>
                        Movement Details
                    </Typography>
                    <Typography variant="body2" sx={{ color: neutral[500] }}>
                        Choose what is moving, where it is coming from, and where it is going
                    </Typography>
                </Box>
                {scopeChip}
            </Box>

            {/* ── Body ── */}
            <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 3 }}>

                {/* Section 1: Movement type */}
                <PageSection title="Movement Type" subtitle="What kind of transfer is this?" icon={<SwapHorizOutlinedIcon fontSize="small" />}>
                    <TextField
                        select fullWidth label="Movement Type"
                        value={watch('movementType') ?? ''}
                        onChange={(e) => setValue('movementType', e.target.value, { shouldValidate: true })}
                        error={!!formState.errors.movementType}
                        helperText={formState.errors.movementType?.message as string}
                        sx={fieldSx}
                        SelectProps={{
                            MenuProps: { PaperProps: { elevation: 3, sx: menuPaperSx } },
                            renderValue: (v) => creatableMovementTypes.find((t) => t.value === v)?.label ?? String(v),
                        }}
                    >
                        {creatableMovementTypes.map((t) => (
                            <MenuItem key={t.value} value={t.value}>
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>{t.label}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">{t.description}</Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>
                </PageSection>

                {/* Section 2: Source & destination */}
                <PageSection
                    title="Source & Destination"
                    subtitle="Pick the source store, then where the items are going."
                    icon={<StorefrontOutlinedIcon fontSize="small" />}
                    actions={scopeChip}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={stores}
                                loading={loadingStores}
                                value={sourceStore}
                                getOptionLabel={storeLabel}
                                isOptionEqualToValue={(o, v) => o.id === v.id}
                                onChange={(_, v) => { setSourceStore(v); setValue('sourceStoreId', v?.id ?? '', { shouldValidate: true }); }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Source Store" sx={autocompleteSx}
                                        error={!!formState.errors.sourceStoreId}
                                        helperText={formState.errors.sourceStoreId?.message as string}
                                        InputProps={{ ...params.InputProps, endAdornment: <>{loadingStores && <CircularProgress size={15} sx={{ mr: 3 }} />}{params.InputProps.endAdornment}</> }}
                                    />
                                )}
                            />
                            {sourceStore && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, ml: 0.5 }}>
                                    {sourceStore.locationName}{sourceStore.departmentName ? ` · ${sourceStore.departmentName}` : ''}
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <ToggleButtonGroup
                                exclusive size="small" fullWidth
                                value={destinationKind}
                                onChange={(_, v) => {
                                    if (!v) return;
                                    setValue('destinationKind', v);
                                    setDestStore(null); setRecipientUser(null);
                                    setValue('destStoreId', null); setValue('recipientUserId', null);
                                }}
                                sx={{ mb: 1.5, ...toggleGroupSx }}
                            >
                                <ToggleButton value="STORE">To Store</ToggleButton>
                                <ToggleButton value="USER">To User</ToggleButton>
                            </ToggleButtonGroup>

                            {destinationKind === 'STORE' ? (
                                <Autocomplete
                                    options={stores.filter((s) => s.id !== sourceStore?.id)}
                                    value={destStore}
                                    getOptionLabel={storeLabel}
                                    isOptionEqualToValue={(o, v) => o.id === v.id}
                                    onChange={(_, v) => { setDestStore(v); setValue('destStoreId', v?.id ?? null, { shouldValidate: true }); }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Destination Store" sx={autocompleteSx}
                                            error={!!formState.errors.destStoreId}
                                            helperText={formState.errors.destStoreId?.message as string} />
                                    )}
                                />
                            ) : (
                                <Autocomplete
                                    options={userOptions}
                                    loading={userLoading}
                                    value={recipientUser}
                                    getOptionLabel={(u) => `${u.firstName} ${u.lastName}`}
                                    isOptionEqualToValue={(o, v) => o.id === v.id}
                                    filterOptions={(x) => x}
                                    onInputChange={(_, v, reason) => { if (reason === 'input' && v) fetchUsers(v); }}
                                    onChange={(_, v) => { setRecipientUser(v); setValue('recipientUserId', v?.id ?? null, { shouldValidate: true }); }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Recipient User" sx={autocompleteSx}
                                            error={!!formState.errors.recipientUserId}
                                            helperText={formState.errors.recipientUserId?.message as string}
                                            InputProps={{ ...params.InputProps, endAdornment: <>{userLoading && <CircularProgress size={15} sx={{ mr: 3 }} />}{params.InputProps.endAdornment}</> }}
                                        />
                                    )}
                                />
                            )}
                            {destinationKind === 'USER' && recipientUser?.branch && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, ml: 0.5 }}>
                                    {recipientUser.branch.name}{recipientUser.department ? ` · ${recipientUser.department.name}` : ''}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </PageSection>

                {/* Section 3: Items */}
                <PageSection
                    title="Items to Move"
                    subtitle="Add serialized assets or consumables held by the source store."
                    icon={<InventoryOutlinedIcon fontSize="small" />}
                    actions={items.length > 0 ? <Chip label={`${items.length} item${items.length > 1 ? 's' : ''}`} size="small" sx={{ height: 22, fontWeight: 700, bgcolor: alpha(P, 0.08), color: P }} /> : undefined}
                >
                    {!sourceStore ? (
                        <Box sx={{ py: 5, textAlign: 'center', borderRadius: 2, border: `1px dashed ${neutral[200]}` }}>
                            <StorefrontOutlinedIcon sx={{ fontSize: 28, color: neutral[300], mb: 0.5 }} />
                            <Typography variant="body2" sx={{ color: neutral[500] }}>
                                Select a source store first to see what it holds.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <ToggleButtonGroup exclusive size="small" value={lineKind} onChange={(_, v) => v && setLineKind(v)} sx={{ mb: 2, ...toggleGroupSx }}>
                                <ToggleButton value="ASSET"><FingerprintIcon sx={{ fontSize: 15, mr: 0.5 }} /> Asset</ToggleButton>
                                <ToggleButton value="COMMODITY"><CategoryOutlinedIcon sx={{ fontSize: 15, mr: 0.5 }} /> Consumable</ToggleButton>
                            </ToggleButtonGroup>

                            <Grid container spacing={1.5} alignItems="flex-start">
                                {lineKind === 'ASSET' ? (
                                    <Grid item xs={12} sm={9}>
                                        <Autocomplete
                                            options={sourceAssets.filter((a) => !items.some((i) => i.assetId === a.id))}
                                            value={pickedAsset}
                                            getOptionLabel={(a) => `${a.engravedNumber} — ${a.assetName}`}
                                            isOptionEqualToValue={(o, v) => o.id === v.id}
                                            onChange={(_, v) => setPickedAsset(v)}
                                            renderInput={(params) => <TextField {...params} label="Select Asset (by engraved no.)" sx={autocompleteSx} />}
                                        />
                                    </Grid>
                                ) : (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <Autocomplete
                                                options={sourceBalances.filter((b) => !items.some((i) => i.commodityId === b.commodityId))}
                                                value={pickedCommodity}
                                                getOptionLabel={(b) => `${b.commodityName} (${b.quantity} in stock)`}
                                                isOptionEqualToValue={(o, v) => o.commodityId === v.commodityId}
                                                onChange={(_, v) => setPickedCommodity(v)}
                                                renderInput={(params) => <TextField {...params} label="Select Consumable" sx={autocompleteSx} />}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <TextField type="number" fullWidth label="Quantity" value={lineQty} sx={fieldSx}
                                                inputProps={{ min: 1, max: pickedCommodity?.quantity ?? undefined }}
                                                onChange={(e) => setLineQty(Math.max(1, Number(e.target.value)))} />
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={12} sm={3}>
                                    <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={addLine}
                                        sx={{
                                            height: 48, borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                                            borderColor: alpha(P, 0.5), color: P,
                                            '&:hover': { borderColor: P, bgcolor: alpha(P, 0.05) },
                                        }}>
                                        Add Item
                                    </Button>
                                </Grid>
                            </Grid>

                            {items.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Stack spacing={1}>
                                        {items.map((it, idx) => (
                                            <Stack key={idx} direction="row" alignItems="center" spacing={1.5}
                                                sx={{
                                                    p: 1.25, borderRadius: 1.5, border: `1px solid ${border.subtle}`, bgcolor: '#FAFBFC',
                                                    transition: 'border-color 0.15s ease',
                                                    '&:hover': { borderColor: alpha(P, 0.35) },
                                                }}>
                                                <Box sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: alpha(it.assetId ? P : '#BC892C', 0.1), color: it.assetId ? P : '#BC892C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {it.assetId ? <FingerprintIcon sx={{ fontSize: 15 }} /> : <CategoryOutlinedIcon sx={{ fontSize: 15 }} />}
                                                </Box>
                                                <Box flex={1} minWidth={0}>
                                                    <Typography variant="caption" fontWeight={700} noWrap display="block">{it.label}</Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap>{it.subLabel}</Typography>
                                                </Box>
                                                <Tooltip title="Remove">
                                                    <IconButton size="small" onClick={() => removeLine(idx)} sx={{ color: status.danger.main }}>
                                                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </>
                            )}
                        </>
                    )}
                </PageSection>

                {/* Section 4: Logistics (inter-location only) */}
                {isInterLocation && (
                    <PageSection
                        title="Logistics"
                        subtitle="Courier details for this inter-location movement (can also be added at dispatch)."
                        icon={<LocalShippingOutlinedIcon fontSize="small" />}
                    >
                        <Box sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${alpha(BLUE, 0.18)}`, bgcolor: alpha(BLUE, 0.02) }}>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Courier Service" sx={fieldSx} value={watch('courierService') ?? ''} onChange={(e) => setValue('courierService', e.target.value)} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Tracking Number" sx={fieldSx} value={watch('trackingNumber') ?? ''} onChange={(e) => setValue('trackingNumber', e.target.value)} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth type="date" label="Dispatch Date" sx={fieldSx} InputLabelProps={{ shrink: true }} value={watch('dispatchDate') ?? ''} onChange={(e) => setValue('dispatchDate', e.target.value)} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth type="date" label="Expected Delivery" sx={fieldSx} InputLabelProps={{ shrink: true }} value={watch('expectedDeliveryDate') ?? ''} onChange={(e) => setValue('expectedDeliveryDate', e.target.value)} />
                                </Grid>
                            </Grid>
                        </Box>
                    </PageSection>
                )}

                {/* Section 5: Approval + remarks */}
                <PageSection
                    title="Approval & Remarks"
                    subtitle="Optionally route this movement for approval and add any notes."
                    icon={<NotesOutlinedIcon fontSize="small" />}
                    mb={0}
                >
                    <Box sx={{ mb: 2.5, p: 1.75, borderRadius: 2, bgcolor: alpha(P, 0.04), border: `1px solid ${alpha(P, 0.12)}` }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!!watch('requiresApproval')}
                                    onChange={(e) => setValue('requiresApproval', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <HowToRegOutlinedIcon sx={{ fontSize: 18, color: P }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Requires approval</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Route through your reporting ladder before dispatch (e.g. a BOM fulfilling a request from the branch store → Branch Manager approves).
                                        </Typography>
                                    </Box>
                                </Stack>
                            }
                            sx={{ alignItems: 'flex-start', m: 0 }}
                        />
                    </Box>
                    <TextField fullWidth multiline rows={3} label="Remarks (optional)" sx={fieldSx} value={watch('remarks') ?? ''} onChange={(e) => setValue('remarks', e.target.value)} />
                </PageSection>
            </Box>

            {/* ── Footer ── */}
            <Box
                sx={{
                    px: { xs: 2, md: 3.5 },
                    py: 2,
                    borderTop: `1px solid ${border.subtle}`,
                    bgcolor: '#FAFBFC',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                }}
            >
                <Typography variant="caption" sx={{ color: neutral[400], display: { xs: 'none', sm: 'block' } }}>
                    {items.length > 0
                        ? <>{items.length} item{items.length > 1 ? 's' : ''} ready to move{isInterLocation && <> · <Box component="span" sx={{ color: BLUE, fontWeight: 600 }}>Inter-Location</Box></>}</>
                        : 'Add at least one item to create this movement'}
                </Typography>
                <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon fontSize="small" />}
                    disabled={sendingRequest}
                    sx={{
                        height: 40, minWidth: 180, borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                        bgcolor: P, boxShadow: `0 2px 8px ${alpha(P, 0.3)}`,
                        '&:hover': { bgcolor: brand[700], boxShadow: `0 4px 14px ${alpha(P, 0.4)}` },
                        '&.Mui-disabled': { bgcolor: alpha(P, 0.45), color: '#fff' },
                    }}
                >
                    {sendingRequest ? 'Saving…' : buttonText}
                </Button>
            </Box>
        </Paper>
    );
};

export default MovementForm;
