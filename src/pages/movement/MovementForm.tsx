/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useState } from 'react';
import {
    alpha, Autocomplete, Box, Button, Chip, CircularProgress, Divider, Grid, IconButton,
    MenuItem, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import ButtonComponent from '../../components/forms/Button';
import { fetchRowsService } from '../../core/apis/globalService';
import { IMovementForm, IStoreView } from './interface';
import { IAsset } from '../assets/interface';
import { IUser } from '../users/interface';
import { creatableMovementTypes, storeTypeLabels } from './constants';
import {
    fetchStoresService, fetchStoreAssetsService, fetchStoreBalancesService,
} from './service';

const PRIMARY = '#08796C';
const BLUE = '#2563EB';

interface IBalanceView {
    commodityId: number;
    commodityName: string;
    quantity: number;
    assetTypeName?: string;
}

const FormSection = ({ title, subtitle, icon, children, badge }: { title: string; subtitle?: string; icon: JSX.Element; children: React.ReactNode; badge?: React.ReactNode }) => (
    <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{title}</Typography>
                    {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
                </Box>
            </Stack>
            {badge}
        </Stack>
        {children}
    </Box>
);

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

    return (
        <Stack spacing={3} sx={{ maxWidth: 960, mx: 'auto', width: '100%' }}>

            {/* ── Section 1: Movement type ─────────────────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection title="Movement Type" subtitle="What kind of transfer is this?" icon={<SwapHorizOutlinedIcon sx={{ fontSize: 16 }} />}>
                    <TextField
                        select fullWidth size="small" label="Movement Type"
                        value={watch('movementType') ?? ''}
                        onChange={(e) => setValue('movementType', e.target.value, { shouldValidate: true })}
                        error={!!formState.errors.movementType}
                        helperText={formState.errors.movementType?.message as string}
                    >
                        {creatableMovementTypes.map((t) => (
                            <MenuItem key={t.value} value={t.value}>
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>{t.label}</Typography>
                                    <Typography variant="caption" color="text.secondary">{t.description}</Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>
                </FormSection>
            </Paper>

            {/* ── Section 2: Source & destination ──────────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Source & Destination"
                    subtitle="Pick the source store, then where the items are going."
                    icon={<StorefrontOutlinedIcon sx={{ fontSize: 16 }} />}
                    badge={sourceStore && destLocationId != null ? (
                        <Chip
                            label={isInterLocation ? 'Inter-Location' : 'Intra-Location'}
                            size="small"
                            sx={{ height: 22, fontSize: '0.66rem', fontWeight: 700, bgcolor: alpha(isInterLocation ? BLUE : PRIMARY, 0.1), color: isInterLocation ? BLUE : PRIMARY }}
                        />
                    ) : undefined}
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
                                    <TextField {...params} label="Source Store" size="small"
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
                                sx={{ mb: 1.5, '& .MuiToggleButton-root.Mui-selected': { bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, fontWeight: 700 } }}
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
                                        <TextField {...params} label="Destination Store" size="small"
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
                                        <TextField {...params} label="Recipient User" size="small"
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
                </FormSection>
            </Paper>

            {/* ── Section 3: Items ─────────────────────────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <FormSection
                    title="Items to Move"
                    subtitle="Add serialized assets or consumables held by the source store."
                    icon={<InventoryOutlinedIcon sx={{ fontSize: 16 }} />}
                    badge={items.length > 0 ? <Chip label={`${items.length} item${items.length > 1 ? 's' : ''}`} size="small" sx={{ height: 22, fontWeight: 700, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY }} /> : undefined}
                >
                    {!sourceStore ? (
                        <Typography variant="body2" color="text.disabled">Select a source store first.</Typography>
                    ) : (
                        <>
                            <ToggleButtonGroup exclusive size="small" value={lineKind} onChange={(_, v) => v && setLineKind(v)} sx={{ mb: 2 }}>
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
                                            renderInput={(params) => <TextField {...params} label="Select Asset (by engraved no.)" size="small" />}
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
                                                renderInput={(params) => <TextField {...params} label="Select Consumable" size="small" />}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <TextField type="number" size="small" fullWidth label="Quantity" value={lineQty}
                                                inputProps={{ min: 1, max: pickedCommodity?.quantity ?? undefined }}
                                                onChange={(e) => setLineQty(Math.max(1, Number(e.target.value)))} />
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={12} sm={3}>
                                    <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={addLine}
                                        sx={{ minHeight: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: alpha(PRIMARY, 0.5), color: PRIMARY }}>
                                        Add
                                    </Button>
                                </Grid>
                            </Grid>

                            {items.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Stack spacing={1}>
                                        {items.map((it, idx) => (
                                            <Stack key={idx} direction="row" alignItems="center" spacing={1.5}
                                                sx={{ p: 1.25, borderRadius: 1.5, border: `1px solid ${alpha('#000', 0.07)}`, bgcolor: '#FAFBFC' }}>
                                                <Box sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: alpha(it.assetId ? PRIMARY : '#BC892C', 0.1), color: it.assetId ? PRIMARY : '#BC892C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {it.assetId ? <FingerprintIcon sx={{ fontSize: 15 }} /> : <CategoryOutlinedIcon sx={{ fontSize: 15 }} />}
                                                </Box>
                                                <Box flex={1} minWidth={0}>
                                                    <Typography variant="caption" fontWeight={700} noWrap display="block">{it.label}</Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap>{it.subLabel}</Typography>
                                                </Box>
                                                <Tooltip title="Remove">
                                                    <IconButton size="small" onClick={() => removeLine(idx)} sx={{ color: '#DC2626' }}>
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
                </FormSection>
            </Paper>

            {/* ── Section 4: Logistics (inter-location only) ───────────────── */}
            {isInterLocation && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha(BLUE, 0.18)}`, bgcolor: alpha(BLUE, 0.015) }}>
                    <FormSection title="Logistics" subtitle="Courier details for this inter-location movement (can also be added at dispatch)." icon={<LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth size="small" label="Courier Service" value={watch('courierService') ?? ''} onChange={(e) => setValue('courierService', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth size="small" label="Tracking Number" value={watch('trackingNumber') ?? ''} onChange={(e) => setValue('trackingNumber', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth size="small" type="date" label="Dispatch Date" InputLabelProps={{ shrink: true }} value={watch('dispatchDate') ?? ''} onChange={(e) => setValue('dispatchDate', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth size="small" type="date" label="Expected Delivery" InputLabelProps={{ shrink: true }} value={watch('expectedDeliveryDate') ?? ''} onChange={(e) => setValue('expectedDeliveryDate', e.target.value)} />
                            </Grid>
                        </Grid>
                    </FormSection>
                </Paper>
            )}

            {/* ── Section 5: Remarks + submit ──────────────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.07)}` }}>
                <TextField fullWidth size="small" multiline rows={2} label="Remarks (optional)" value={watch('remarks') ?? ''} onChange={(e) => setValue('remarks', e.target.value)} sx={{ mb: 2.5 }} />
                <Stack direction="row" justifyContent="flex-end">
                    <ButtonComponent sendingRequest={sendingRequest} buttonText={buttonText} buttonColor="primary" variant="contained" type="submit" />
                </Stack>
            </Paper>
        </Stack>
    );
};

export default MovementForm;
