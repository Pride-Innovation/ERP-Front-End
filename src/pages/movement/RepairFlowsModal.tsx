/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    alpha, Autocomplete, Box, Button, CircularProgress, Divider, Grid,
    Paper, Stack, TextField, Typography,
} from '@mui/material';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import { toast } from 'react-toastify';
import ButtonComponent from '../../components/forms/Button';
import { fetchRowsService } from '../../core/apis/globalService';
import { IAsset } from '../assets/interface';
import { IUser } from '../users/interface';
import { IBranch } from '../settings/branch/interface';
import { fetchAssetsByStoreTypeService, repairTransferService, tempReplacementService, returnAfterRepairService, disposeAssetService } from './service';

const PRIMARY = '#08796C';

type Flow = 'repair-transfer' | 'temp-replacement' | 'return-after-repair' | 'disposal';

const FLOWS: { key: Flow; label: string; description: string; icon: JSX.Element; color: string }[] = [
    { key: 'repair-transfer', label: 'Repair Transfer', description: 'Send a faulty asset to the Head Office IT store (§14)', icon: <BuildOutlinedIcon />, color: '#2563EB' },
    { key: 'temp-replacement', label: 'Temporary Replacement', description: 'Issue a temporary asset from the IT store (§15)', icon: <SwapHorizOutlinedIcon />, color: '#A16207' },
    { key: 'return-after-repair', label: 'Return After Repair', description: 'Return a repaired asset to its location (§16)', icon: <RestartAltOutlinedIcon />, color: '#047857' },
    { key: 'disposal', label: 'Disposal', description: 'Move an irreparable asset to the Disposal store (§17)', icon: <DeleteSweepOutlinedIcon />, color: '#B91C1C' },
];

interface Props {
    handleClose: () => void;
    onDone?: () => void;
}

const RepairFlowsModal = ({ handleClose, onDone }: Props) => {
    const [flow, setFlow] = useState<Flow | null>(null);
    const [sending, setSending] = useState(false);

    // option sources
    const [assetSearch, setAssetSearch] = useState<IAsset[]>([]);
    const [assetSearchLoading, setAssetSearchLoading] = useState(false);
    const [itAssets, setItAssets] = useState<IAsset[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [branches, setBranches] = useState<IBranch[]>([]);

    // selections / fields
    const [asset, setAsset] = useState<IAsset | null>(null);
    const [tempAsset, setTempAsset] = useState<IAsset | null>(null);
    const [recipient, setRecipient] = useState<IUser | null>(null);
    const [destLocation, setDestLocation] = useState<IBranch | null>(null);
    const [courierService, setCourierService] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [dispatchDate, setDispatchDate] = useState('');
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [remarks, setRemarks] = useState('');

    const needsItAssets = flow === 'temp-replacement' || flow === 'return-after-repair' || flow === 'disposal';
    const needsBranches = flow === 'return-after-repair';

    useEffect(() => {
        if (needsItAssets && itAssets.length === 0) {
            (async () => {
                const r = (await fetchAssetsByStoreTypeService('IT')) as any;
                if (r?.status === 200) setItAssets(r.data ?? []);
            })();
        }
        if (needsBranches && branches.length === 0) {
            (async () => {
                const r = (await fetchRowsService({ pageNumber: 0, pageSize: 200, endPoint: 'branches' })) as any;
                if (r?.status === 200) setBranches(r.data?.content ?? []);
            })();
        }
    }, [flow]); // eslint-disable-line react-hooks/exhaustive-deps

    const searchAssets = async (q: string) => {
        if (!q) return;
        setAssetSearchLoading(true);
        try {
            const r = (await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint: 'assets', params: { engravedNumber: q } })) as any;
            if (r?.status === 200) setAssetSearch(r.data?.content ?? []);
        } finally {
            setAssetSearchLoading(false);
        }
    };

    const searchUsers = async (q: string) => {
        if (!q) return;
        setUsersLoading(true);
        try {
            const r = (await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint: 'users', params: { name: q } })) as any;
            if (r?.status === 200) setUsers(r.data?.content ?? []);
        } finally {
            setUsersLoading(false);
        }
    };

    const reset = () => {
        setAsset(null); setTempAsset(null); setRecipient(null); setDestLocation(null);
        setCourierService(''); setTrackingNumber(''); setDispatchDate(''); setExpectedDeliveryDate(''); setRemarks('');
    };

    const back = () => { setFlow(null); reset(); };

    const logistics = () => ({
        courierService: courierService || null,
        trackingNumber: trackingNumber || null,
        dispatchDate: dispatchDate ? new Date(dispatchDate).toISOString() : null,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : null,
    });

    const submit = async () => {
        if (!flow) return;
        setSending(true);
        try {
            let response: any;
            if (flow === 'repair-transfer') {
                if (!asset) { toast.warning('Select the faulty asset.'); setSending(false); return; }
                response = await repairTransferService({ assetId: asset.id, ...logistics(), remarks: remarks || null });
            } else if (flow === 'temp-replacement') {
                if (!tempAsset || !recipient) { toast.warning('Select the temporary asset and recipient.'); setSending(false); return; }
                response = await tempReplacementService({ tempAssetId: tempAsset.id, recipientUserId: recipient.id, ...logistics(), remarks: remarks || null });
            } else if (flow === 'return-after-repair') {
                if (!asset || !destLocation) { toast.warning('Select the asset and destination location.'); setSending(false); return; }
                response = await returnAfterRepairService({
                    assetId: asset.id, destLocationId: destLocation.id,
                    recipientUserId: recipient?.id ?? null, tempAssetId: tempAsset?.id ?? null,
                    ...logistics(), remarks: remarks || null,
                });
            } else {
                if (!asset) { toast.warning('Select the asset to dispose.'); setSending(false); return; }
                response = await disposeAssetService({ assetId: asset.id, remarks: remarks || null });
            }

            if (response?.status === 200 || response?.status === 201) {
                toast.success('Movement created successfully');
                onDone?.();
                handleClose();
            } else {
                toast.error(response?.data?.message ?? 'Failed to create movement');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setSending(false);
        }
    };

    const meta = FLOWS.find((f) => f.key === flow);
    const showLogistics = flow !== 'disposal';

    const assetPicker = (label: string, options: IAsset[], value: IAsset | null, onChange: (a: IAsset | null) => void, searchable = false) => (
        <Autocomplete
            options={options}
            value={value}
            loading={searchable && assetSearchLoading}
            getOptionLabel={(a) => `${a.engravedNumber} — ${a.assetName}`}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            filterOptions={searchable ? (x) => x : undefined}
            onInputChange={searchable ? (_, v, reason) => { if (reason === 'input') searchAssets(v); } : undefined}
            onChange={(_, v) => onChange(v)}
            renderInput={(params) => (
                <TextField {...params} label={label} size="small"
                    InputProps={{ ...params.InputProps, endAdornment: <>{searchable && assetSearchLoading && <CircularProgress size={15} sx={{ mr: 3 }} />}{params.InputProps.endAdornment}</> }} />
            )}
        />
    );

    return (
        <Box>
            {/* Header */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2.5, borderBottom: `1px solid ${alpha(PRIMARY, 0.12)}`, bgcolor: alpha(meta?.color ?? PRIMARY, 0.04) }}>
                {flow && (
                    <Button size="small" onClick={back} startIcon={<ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />} sx={{ textTransform: 'none', minWidth: 0, color: 'text.secondary' }}>Back</Button>
                )}
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: alpha(meta?.color ?? PRIMARY, 0.12), color: meta?.color ?? PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {meta?.icon ?? <BuildOutlinedIcon />}
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{meta?.label ?? 'Repair & Disposal'}</Typography>
                    <Typography variant="caption" color="text.secondary">{meta?.description ?? 'Choose an asset-lifecycle movement to initiate.'}</Typography>
                </Box>
            </Stack>

            <Box sx={{ p: 2.5 }}>
                {!flow ? (
                    <Grid container spacing={1.5}>
                        {FLOWS.map((f) => (
                            <Grid item xs={12} sm={6} key={f.key}>
                                <Paper onClick={() => setFlow(f.key)} elevation={0}
                                    sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha('#000', 0.08)}`, cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: f.color, bgcolor: alpha(f.color, 0.03) } }}>
                                    <Stack direction="row" spacing={1.25} alignItems="center" mb={0.5}>
                                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(f.color, 0.1), color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</Box>
                                        <Typography variant="subtitle2" fontWeight={700}>{f.label}</Typography>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">{f.description}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Stack spacing={2}>
                        {/* Asset / temp asset / recipient / location pickers per flow */}
                        {flow === 'repair-transfer' && assetPicker('Faulty Asset (search by engraved no.)', assetSearch, asset, setAsset, true)}
                        {flow === 'disposal' && assetPicker('Asset to Dispose (in IT store)', itAssets, asset, setAsset)}

                        {flow === 'temp-replacement' && (
                            <>
                                {assetPicker('Temporary Asset (IT store)', itAssets, tempAsset, setTempAsset)}
                                <Autocomplete
                                    options={users} loading={usersLoading} value={recipient}
                                    getOptionLabel={(u) => `${u.firstName} ${u.lastName}`}
                                    isOptionEqualToValue={(o, v) => o.id === v.id}
                                    filterOptions={(x) => x}
                                    onInputChange={(_, v, reason) => { if (reason === 'input') searchUsers(v); }}
                                    onChange={(_, v) => setRecipient(v)}
                                    renderInput={(params) => <TextField {...params} label="Recipient User" size="small" InputProps={{ ...params.InputProps, endAdornment: <>{usersLoading && <CircularProgress size={15} sx={{ mr: 3 }} />}{params.InputProps.endAdornment}</> }} />}
                                />
                            </>
                        )}

                        {flow === 'return-after-repair' && (
                            <>
                                {assetPicker('Repaired Asset (IT store)', itAssets, asset, setAsset)}
                                <Autocomplete
                                    options={branches} value={destLocation}
                                    getOptionLabel={(b) => b.name}
                                    isOptionEqualToValue={(o, v) => o.id === v.id}
                                    onChange={(_, v) => setDestLocation(v)}
                                    renderInput={(params) => <TextField {...params} label="Destination Location" size="small" />}
                                />
                                <Autocomplete
                                    options={users} loading={usersLoading} value={recipient}
                                    getOptionLabel={(u) => `${u.firstName} ${u.lastName}`}
                                    isOptionEqualToValue={(o, v) => o.id === v.id}
                                    filterOptions={(x) => x}
                                    onInputChange={(_, v, reason) => { if (reason === 'input') searchUsers(v); }}
                                    onChange={(_, v) => setRecipient(v)}
                                    renderInput={(params) => <TextField {...params} label="Reassign To (optional)" size="small" InputProps={{ ...params.InputProps, endAdornment: <>{usersLoading && <CircularProgress size={15} sx={{ mr: 3 }} />}{params.InputProps.endAdornment}</> }} />}
                                />
                                {assetPicker('Return Temporary Asset (optional)', itAssets, tempAsset, setTempAsset)}
                            </>
                        )}

                        {showLogistics && (
                            <>
                                <Divider><Typography variant="caption" color="text.disabled">LOGISTICS (optional)</Typography></Divider>
                                <Grid container spacing={1.5}>
                                    <Grid item xs={6}><TextField fullWidth size="small" label="Courier" value={courierService} onChange={(e) => setCourierService(e.target.value)} /></Grid>
                                    <Grid item xs={6}><TextField fullWidth size="small" label="Tracking #" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} /></Grid>
                                    <Grid item xs={6}><TextField fullWidth size="small" type="date" label="Dispatch Date" InputLabelProps={{ shrink: true }} value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} /></Grid>
                                    <Grid item xs={6}><TextField fullWidth size="small" type="date" label="Expected Delivery" InputLabelProps={{ shrink: true }} value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} /></Grid>
                                </Grid>
                            </>
                        )}

                        <TextField fullWidth size="small" multiline rows={2} label="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />

                        <Divider />
                        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                            <Button variant="outlined" onClick={handleClose} sx={{ borderRadius: 2, fontWeight: 600 }}>Close</Button>
                            <ButtonComponent sendingRequest={sending} buttonText="Create Movement" buttonColor="primary" variant="contained" type="button" handleClick={submit} />
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default RepairFlowsModal;
