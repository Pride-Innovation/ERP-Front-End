/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    alpha, Alert, Autocomplete, Box, Button, Chip, Stack, TextField, Typography,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { toast } from 'react-toastify';
import { brand, neutral } from '../../utils/tokens';
import { fetchCouriersService } from '../settings/couriers/service';
import { ICourier } from '../settings/couriers/interface';
import { uploadStandaloneMovementDocumentService } from '../movement/service';
import { dispatchConsignmentService } from './service';
import { IConsignment } from './interface';
import { generateConsignmentNote } from './generateConsignmentNote';

/**
 * Hands a whole consignment to a courier in one action.
 *
 * <p>Deliberately the same shape as the per-movement dispatch — vetted-or-ad-hoc courier, plate,
 * tracking, and a signed note that must be attached before anything leaves. The difference is scope:
 * one note now covers the entire van rather than one per request, which is the paperwork saving the
 * consignment exists to make.
 */
const DispatchConsignment = ({
    consignment,
    handleClose,
    onDispatched,
}: {
    consignment: IConsignment;
    handleClose: () => void;
    onDispatched: () => void | Promise<void>;
}) => {
    const [couriers, setCouriers] = useState<ICourier[]>([]);
    const [courierValue, setCourierValue] = useState<ICourier | string | null>(null);
    const [plateNumber, setPlateNumber] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [dispatchDate, setDispatchDate] = useState('');
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [documents, setDocuments] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        (async () => {
            const res = (await fetchCouriersService(true)) as any;
            if (res?.status === 200) setCouriers(res.data ?? []);
        })();
    }, []);

    /*
     * Uploaded before the consignment moves, so the stored path can be sent with the dispatch call.
     * Reuses the movement document endpoint — it stores a file and returns its path, with nothing
     * movement-specific about it.
     */
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = (await uploadStandaloneMovementDocumentService(file)) as any;
            if ((res?.status === 200 || res?.status === 201) && res.data?.path) {
                setDocuments((prev) => [...prev, res.data.path]);
                toast.success('Document attached');
            } else {
                toast.error(res?.data?.message ?? `Could not upload "${file.name}".`);
            }
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDownloadNote = () => {
        generateConsignmentNote(consignment, {
            courierName: typeof courierValue === 'object' ? courierValue?.name : courierValue,
            plateNumber,
            trackingNumber,
            dispatchDate: dispatchDate ? new Date(dispatchDate).toISOString() : null,
            expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : null,
        });
    };

    const submit = async () => {
        if (!courierValue) {
            toast.error('Pick a vetted courier or type the name of the courier used.');
            return;
        }
        if (!plateNumber.trim()) {
            toast.error('Provide the vehicle plate number.');
            return;
        }
        if (documents.length === 0) {
            toast.error('Attach at least one signed dispatch note before dispatching.');
            return;
        }
        setSending(true);
        try {
            const res = (await dispatchConsignmentService(consignment.id, {
                courierId: typeof courierValue === 'object' ? courierValue.id ?? null : null,
                courierName: typeof courierValue === 'string' ? courierValue : null,
                plateNumber: plateNumber.trim(),
                trackingNumber: trackingNumber || null,
                dispatchDate: dispatchDate ? new Date(dispatchDate).toISOString() : null,
                expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : null,
                deliveryDocuments: documents,
            })) as any;

            if (res?.status === 200) {
                toast.success(`Dispatched — ${consignment.movementCount} movement(s) are on their way.`);
                await onDispatched();
            } else {
                toast.error(res?.data?.message ?? 'Could not dispatch this consignment.');
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <Stack spacing={2.5}>
            <Alert
                severity="info"
                icon={<LocalShippingOutlinedIcon fontSize="small" />}
                sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}
            >
                Dispatching hands <strong>all {consignment.movementCount} movement(s)</strong> on this
                consignment to one courier. Contents are frozen afterwards — nothing can be added or
                removed. Stock does not leave the source stores until you mark it in transit.
            </Alert>

            <Autocomplete
                freeSolo
                options={couriers}
                value={courierValue}
                getOptionLabel={(c) => (typeof c === 'string' ? c : c.name)}
                isOptionEqualToValue={(o, v) => typeof o !== 'string' && typeof v !== 'string' && o.id === v.id}
                onChange={(_, v) => setCourierValue(v)}
                onInputChange={(_, v, reason) => { if (reason === 'input') setCourierValue(v); }}
                renderOption={(props, c) => (
                    <li {...props} key={typeof c === 'string' ? c : c.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                            <Typography variant="body2">{typeof c === 'string' ? c : c.name}</Typography>
                            {typeof c !== 'string' && c.vetted && (
                                <Chip size="small" label="Vetted"
                                    sx={{ fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(brand[500], 0.1), color: brand[700] }} />
                            )}
                        </Box>
                    </li>
                )}
                renderInput={(params) => (
                    <TextField {...params} required label="Courier" placeholder="Pick a vetted courier or type a name" />
                )}
            />

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <TextField
                    required fullWidth label="Vehicle plate number" placeholder="e.g. UAA 123A"
                    value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)}
                />
                <TextField
                    fullWidth label="Tracking number"
                    value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                />
                <TextField
                    fullWidth type="date" label="Dispatch date" InputLabelProps={{ shrink: true }}
                    value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)}
                    helperText="Defaults to now if left blank"
                />
                <TextField
                    fullWidth type="date" label="Expected delivery" InputLabelProps={{ shrink: true }}
                    value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />
            </Box>

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900], mb: 0.5 }}>
                    Signed dispatch note <Box component="span" sx={{ color: '#DC2626' }}>*</Box>
                </Typography>
                <Typography variant="caption" sx={{ color: neutral[500], display: 'block', mb: 1.25 }}>
                    Download the note, have it signed by the releasing officer and the courier, then attach
                    the scan. One note lists every item on the van, grouped by movement.
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    {/*
                     * Printed from the values currently in this form, not from what is stored — the
                     * note has to be signed before dispatch, at which point the consignment itself
                     * has no courier, plate or dates recorded yet.
                     */}
                    <Button
                        variant="outlined" onClick={handleDownloadNote}
                        startIcon={<DownloadOutlinedIcon />}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Download note
                    </Button>
                    <Button
                        component="label" variant="outlined" disabled={uploading}
                        startIcon={<UploadFileOutlinedIcon />}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        {uploading ? 'Uploading…' : 'Attach signed note'}
                        <input type="file" hidden onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png" />
                    </Button>
                    {documents.map((path, i) => (
                        <Chip
                            key={`${path}-${i}`}
                            size="small"
                            icon={<CheckCircleOutlineIcon />}
                            label={path.split(/[\\/]/).pop() ?? `Document ${i + 1}`}
                            onDelete={() => setDocuments((prev) => prev.filter((_, idx) => idx !== i))}
                            sx={{ fontWeight: 600 }}
                        />
                    ))}
                </Stack>
            </Box>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Cancel
                </Button>
                <Button
                    onClick={submit} disabled={sending} variant="contained"
                    startIcon={<LocalShippingOutlinedIcon />}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    {sending ? 'Dispatching…' : 'Dispatch consignment'}
                </Button>
            </Stack>
        </Stack>
    );
};

export default DispatchConsignment;
