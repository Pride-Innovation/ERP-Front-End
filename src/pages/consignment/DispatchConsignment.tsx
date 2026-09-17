/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    alpha, Autocomplete, Box, Button, Chip, Divider, IconButton, Stack, TextField, Typography,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import ButtonComponent from '../../components/forms/Button';
import { fieldSx } from '../../components/forms/Inputs';
import { autocompleteSx } from '../../components/forms/Autocomplete';
import { DropdownPopper, DropdownPaper, SectionLabel, modalCancelSx } from '../../components/forms/modalChrome';
import { brand, neutral, border, status as statusTokens } from '../../utils/tokens';
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
            {/* Header band — what this action commits you to, stated before any field is filled. */}
            <Stack
                direction="row" spacing={1.5} alignItems="flex-start"
                sx={{
                    p: 1.75, borderRadius: 2.5,
                    bgcolor: alpha(brand[500], 0.04),
                    border: `1px solid ${alpha(brand[500], 0.14)}`,
                }}
            >
                <Box sx={{
                    width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(brand[500], 0.1), color: brand[500],
                }}
                >
                    <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.3 }}>
                            Handing the load to a courier
                        </Typography>
                        <Chip
                            size="small"
                            label={`${consignment.movementCount} movement${consignment.movementCount === 1 ? '' : 's'}`}
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(brand[500], 0.1), color: brand[700] }}
                        />
                    </Stack>
                    <Typography variant="caption" sx={{ color: neutral[600], fontSize: '0.78rem' }}>
                        {consignment.sourceLocation?.name ?? '—'} → {consignment.destLocation?.name ?? '—'}.
                        Contents are frozen afterwards — nothing can be added or removed. Stock stays in the
                        source stores until you mark it in transit.
                    </Typography>
                </Box>
            </Stack>

            <SectionLabel>Courier &amp; vehicle</SectionLabel>

            <Autocomplete
                freeSolo
                options={couriers}
                value={courierValue}
                fullWidth
                getOptionLabel={(c) => (typeof c === 'string' ? c : c.name)}
                isOptionEqualToValue={(o, v) => typeof o !== 'string' && typeof v !== 'string' && o.id === v.id}
                onChange={(_, v) => setCourierValue(v)}
                onInputChange={(_, v, reason) => { if (reason === 'input') setCourierValue(v); }}
                PopperComponent={DropdownPopper}
                PaperComponent={DropdownPaper}
                noOptionsText="No vetted couriers — type a name to use an ad-hoc one"
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
                    <TextField {...params} required label="Courier" placeholder="Pick a vetted courier or type a name" sx={autocompleteSx} />
                )}
            />

            {/* Plain CSS grid — MUI Grid's negative-margin spacing pulls fields out of line with the
                full-width inputs around it inside a Stack. */}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, alignItems: 'start' }}>
                <TextField
                    required fullWidth sx={fieldSx} label="Vehicle plate number" placeholder="e.g. UAA 123A"
                    value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)}
                />
                <TextField
                    fullWidth sx={fieldSx} label="Tracking number"
                    value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                />
            </Box>

            <SectionLabel>Delivery window</SectionLabel>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, alignItems: 'start' }}>
                <TextField
                    fullWidth sx={fieldSx} type="date" label="Dispatch date" InputLabelProps={{ shrink: true }}
                    value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)}
                    helperText="Defaults to now if left blank"
                />
                <TextField
                    fullWidth sx={fieldSx} type="date" label="Expected delivery" InputLabelProps={{ shrink: true }}
                    value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />
            </Box>

            <SectionLabel>Signed dispatch note — required</SectionLabel>

            {/*
             * Dashed panel rather than loose buttons: this is a two-step errand (download, get it
             * signed, come back and attach), and the panel keeps both halves and the resulting files
             * together as one task instead of three unrelated controls in a row.
             */}
            <Box
                sx={{
                    p: 2, borderRadius: 2,
                    border: `1px dashed ${documents.length > 0 ? alpha(brand[500], 0.35) : '#D8DEE7'}`,
                    bgcolor: documents.length > 0 ? alpha(brand[500], 0.03) : '#FBFCFD',
                    transition: 'background-color .15s ease, border-color .15s ease',
                }}
            >
                <Typography variant="caption" sx={{ color: neutral[600], display: 'block', mb: 1.5, fontSize: '0.78rem' }}>
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
                </Stack>

                {documents.length > 0 && (
                    <Stack spacing={0.75} sx={{ mt: 1.75 }}>
                        {documents.map((path, i) => (
                            <Stack
                                key={`${path}-${i}`}
                                direction="row" spacing={1} alignItems="center"
                                sx={{ p: 1, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${border.subtle}` }}
                            >
                                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: statusTokens.success.strong, flexShrink: 0 }} />
                                <Typography variant="caption" sx={{ fontWeight: 600, flex: 1, color: neutral[800] }} noWrap>
                                    {path.split(/[\\/]/).pop() ?? `Document ${i + 1}`}
                                </Typography>
                                <IconButton
                                    size="small"
                                    aria-label="Remove document"
                                    onClick={() => setDocuments((prev) => prev.filter((_, idx) => idx !== i))}
                                    sx={{ color: neutral[400], '&:hover': { color: statusTokens.danger.main } }}
                                >
                                    <CloseIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Stack>
                        ))}
                    </Stack>
                )}
            </Box>

            <Divider sx={{ borderColor: '#EEF2F7' }} />
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button variant="outlined" onClick={handleClose} sx={modalCancelSx}>
                    Cancel
                </Button>
                <ButtonComponent
                    sendingRequest={sending}
                    buttonText="Dispatch Consignment"
                    buttonColor="primary"
                    variant="contained"
                    type="button"
                    handleClick={submit}
                />
            </Stack>
        </Stack>
    );
};

export default DispatchConsignment;
