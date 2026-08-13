/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    alpha, Alert, Autocomplete, Box, Button, Checkbox, Chip, CircularProgress, Divider,
    FormControlLabel, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import ButtonComponent from '../../components/forms/Button';
import { fieldSx } from '../../components/forms/Inputs';
import { autocompleteSx } from '../../components/forms/Autocomplete';
import { DropdownPopper, DropdownPaper, SectionLabel } from '../../components/forms/modalChrome';
import { fetchRowsService } from '../../core/apis/globalService';
import { IAsset } from '../assets/interface';
import { IUser } from '../users/interface';
import { IConsultant, IConsultantsAxiosResponse } from '../settings/consultants/interface';
import { fetchConsultantsService } from '../settings/consultants/service';
import { RepairDestination } from '../settings/assetTypes/interface';
import {
    repairTransferService, tempReplacementService,
    returnAfterRepairService, disposeAssetService, uploadStandaloneMovementDocumentService,
    fetchDisposalCandidatesService, fetchTemporaryPoolAssetsService,
    previewRepairTransferService, previewReturnAfterRepairService, previewTempReplacementService,
    previewDisposalService,
} from './service';
import { IDisposalCandidate, IMovementFlowPreview } from './interface';
import { noApproverError } from './constants';
import NoApproverDialog from './NoApproverDialog';

const PRIMARY = '#08796C';

type Flow = 'repair-transfer' | 'temp-replacement' | 'return-after-repair' | 'disposal';

const FLOWS: { key: Flow; label: string; description: string; icon: JSX.Element; color: string }[] = [
    { key: 'repair-transfer', label: 'Repair Transfer', description: 'Send a faulty asset for repair — routed by its category to IT, Admin or an external consultant.', icon: <BuildOutlinedIcon />, color: '#2563EB' },
    { key: 'temp-replacement', label: 'Temporary Replacement', description: 'Issue a stand-in asset from the IT store to keep the affected user working.', icon: <SwapHorizOutlinedIcon />, color: '#A16207' },
    { key: 'return-after-repair', label: 'Return After Repair', description: 'Send a repaired asset back to its location and optionally reclaim the temporary one.', icon: <RestartAltOutlinedIcon />, color: '#047857' },
    { key: 'disposal', label: 'Disposal', description: 'Move an irreparable or written-off asset to the Disposal store.', icon: <DeleteSweepOutlinedIcon />, color: '#B91C1C' },
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
    const [poolAssets, setPoolAssets] = useState<IAsset[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // selections / fields
    const [asset, setAsset] = useState<IAsset | null>(null);
    const [tempAsset, setTempAsset] = useState<IAsset | null>(null);
    const [recipient, setRecipient] = useState<IUser | null>(null);
    const [remarks, setRemarks] = useState('');

    // repair routing (repair-transfer only)
    const [repairDestination, setRepairDestination] = useState<RepairDestination>('IT');
    const [consultants, setConsultants] = useState<IConsultant[]>([]);
    const [consultant, setConsultant] = useState<IConsultant | null>(null);
    const [dispatchDocs, setDispatchDocs] = useState<File[]>([]);

    /** The server's "no approver" explanation, while the confirm-and-proceed dialog is open. */
    const [noApprover, setNoApprover] = useState<string | null>(null);

    /**
     * The server's answer for the flow as currently configured: resolved source and destination,
     * whether a courier is involved, and (for a return) who the asset goes back to. Display-only.
     */
    const [preview, setPreview] = useState<IMovementFlowPreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    /** Unticked when the recipient is keeping the loaner for now. */
    const [returnLoaner, setReturnLoaner] = useState(true);

    // disposal
    const [disposalCandidates, setDisposalCandidates] = useState<IDisposalCandidate[]>([]);
    const [disposalCandidate, setDisposalCandidate] = useState<IDisposalCandidate | null>(null);
    const [earlyDisposalReason, setEarlyDisposalReason] = useState('');
    /** Written off before its category's useful life is up, so the server will demand a reason. */
    const needsEarlyDisposalReason = !!disposalCandidate && !disposalCandidate.pastUsefulLife;

    const categoryNotRepairable = flow === 'repair-transfer' && asset?.assetType?.repairable === false;

    const needsPoolAssets = flow === 'temp-replacement';

    useEffect(() => {
        if (needsPoolAssets && poolAssets.length === 0) {
            // Filtered server-side. This used to fetch every IT and Admin asset and narrow them in
            // the browser, so the pool silently went incomplete once the listing passed one page.
            (async () => {
                const r = (await fetchTemporaryPoolAssetsService()) as any;
                if (r?.status === 200) setPoolAssets(r.data ?? []);
            })();
        }
        if (flow === 'disposal' && disposalCandidates.length === 0) {
            (async () => {
                const r = (await fetchDisposalCandidatesService()) as any;
                if (r?.status === 200) setDisposalCandidates(r.data ?? []);
            })();
        }
    }, [flow]); // eslint-disable-line react-hooks/exhaustive-deps

    // The chosen asset's category dictates the default repair routing (overridable below).
    useEffect(() => {
        if (flow !== 'repair-transfer') return;
        setRepairDestination(asset?.assetType?.repairDestination ?? 'IT');
    }, [asset, flow]);

    /*
     * Ask the server what this flow would do as currently configured.
     *
     * It answers two questions the form used to guess at. Whether a courier is involved: the old
     * rule keyed off the asset's holder, but a repair transfer clears the assignment the moment the
     * branch admin takes custody, so the field being read is empty by design — the real question is
     * whether the source and destination stores sit in different locations, which only the server
     * can resolve. And, for a return, who the asset goes back to: same reason, the holder lives on
     * the repair-transfer movement, not on the asset.
     */
    useEffect(() => {
        if (!flow) { setPreview(null); return; }
        const assetId = flow === 'temp-replacement' ? tempAsset?.id
            : flow === 'disposal' ? disposalCandidate?.id
                : asset?.id;
        const recipientId = recipient?.id;
        if (assetId == null) { setPreview(null); return; }
        if (flow === 'temp-replacement' && recipientId == null) { setPreview(null); return; }

        let cancelled = false;
        setPreviewLoading(true);
        (async () => {
            try {
                const r = (
                    flow === 'repair-transfer'
                        ? await previewRepairTransferService(assetId, categoryNotRepairable ? null : repairDestination)
                        : flow === 'return-after-repair'
                            ? await previewReturnAfterRepairService(assetId)
                            : flow === 'disposal'
                                ? await previewDisposalService(assetId)
                                : await previewTempReplacementService(assetId, recipientId as number)
                ) as any;
                if (cancelled) return;
                setPreview(r?.status === 200 ? r.data : null);
            } finally {
                if (!cancelled) setPreviewLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [flow, asset, tempAsset, recipient, disposalCandidate, repairDestination, categoryNotRepairable]);

    // External routing needs the active consultants directory for the picker.
    useEffect(() => {
        if (repairDestination !== 'EXTERNAL' || consultants.length > 0) return;
        (async () => {
            const r = (await fetchConsultantsService(true)) as IConsultantsAxiosResponse;
            if (r?.status === 200) setConsultants(r.data ?? []);
        })();
    }, [repairDestination]); // eslint-disable-line react-hooks/exhaustive-deps

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
        setAsset(null); setTempAsset(null); setRecipient(null); setRemarks('');
        setRepairDestination('IT'); setConsultant(null); setDispatchDocs([]);
        setDisposalCandidate(null); setEarlyDisposalReason('');
        setPreview(null); setReturnLoaner(true);
    };

    const back = () => { setFlow(null); reset(); };

    /*
     * Courier, tracking number and delivery dates are deliberately not collected here.
     *
     * They belong to the dispatch, not to the creation of the movement, and both dispatch paths
     * overwrite whatever was captured at this point — MovementService#dispatchMovement for a solo
     * dispatch, ConsignmentService#dispatch when it travels with others. They also cannot form a
     * valid dispatch on their own: that needs a plate number and a signed dispatch note, neither of
     * which this form has. Collecting them here only produced a movement that displayed a courier
     * and a dispatch date while it was still sitting in its approval ladder, undispatched.
     */

    /** Uploads the selected dispatch documents and returns their stored paths (EXTERNAL repairs). */
    const uploadDispatchDocs = async (): Promise<string[] | null> => {
        const paths: string[] = [];
        for (const file of dispatchDocs) {
            const r = (await uploadStandaloneMovementDocumentService(file)) as any;
            if ((r?.status === 200 || r?.status === 201) && r.data?.path) {
                paths.push(r.data.path);
            } else {
                toast.error(`Failed to upload "${file.name}".`);
                return null;
            }
        }
        return paths;
    };

    /**
     * @param bypassReason set only on the second attempt, after the server has reported that no
     *                     approver exists and the user has confirmed they want to continue anyway
     */
    const submit = async (bypassReason?: string) => {
        if (!flow) return;
        const bypass = bypassReason
            ? { proceedWithoutApproval: true, bypassReason }
            : {};
        setSending(true);
        try {
            let response: any;
            if (flow === 'repair-transfer') {
                if (!asset) { toast.warning('Select the faulty asset.'); setSending(false); return; }

                let deliveryDocuments: string[] | undefined;
                let consultantId: number | undefined;
                if (!categoryNotRepairable && repairDestination === 'EXTERNAL') {
                    if (!consultant) { toast.warning('Select the external consultant.'); setSending(false); return; }
                    if (dispatchDocs.length === 0) { toast.warning('Attach at least one signed dispatch document.'); setSending(false); return; }
                    const paths = await uploadDispatchDocs();
                    if (!paths) { setSending(false); return; }
                    deliveryDocuments = paths;
                    consultantId = consultant.id;
                }

                response = await repairTransferService({
                    assetId: asset.id,
                    repairDestination: categoryNotRepairable ? null : repairDestination,
                    consultantId: consultantId ?? null,
                    deliveryDocuments: deliveryDocuments ?? null,
                    remarks: remarks || null,
                    ...bypass,
                });
            } else if (flow === 'temp-replacement') {
                if (!tempAsset || !recipient) { toast.warning('Select the temporary asset and recipient.'); setSending(false); return; }
                response = await tempReplacementService({
                    tempAssetId: tempAsset.id, recipientUserId: recipient.id, remarks: remarks || null, ...bypass,
                });
            } else if (flow === 'return-after-repair') {
                if (!asset) { toast.warning('Select the repaired asset.'); setSending(false); return; }
                if (preview?.blockedReason) { toast.warning(preview.blockedReason); setSending(false); return; }
                // Destination, recipient and loaner are all derived server-side from the asset's
                // repair transfer, so none of them are sent. Only the decision to hold the loaner
                // back is the user's to make.
                response = await returnAfterRepairService({
                    assetId: asset.id,
                    returnLoaner,
                    remarks: remarks || null,
                    ...bypass,
                });
            } else {
                if (!disposalCandidate) { toast.warning('Select the asset to dispose.'); setSending(false); return; }
                if (needsEarlyDisposalReason && !earlyDisposalReason.trim()) {
                    toast.warning('This asset is still within its useful life — give a reason for disposing of it early.');
                    setSending(false); return;
                }
                response = await disposeAssetService({
                    assetId: disposalCandidate.id,
                    remarks: remarks || null,
                    earlyDisposalReason: needsEarlyDisposalReason ? earlyDisposalReason.trim() : null,
                    ...bypass,
                });
            }

            if (response?.status === 200 || response?.status === 201) {
                toast.success(bypassReason
                    ? 'Movement created without approval — the exception has been recorded.'
                    : 'Movement created successfully');
                setNoApprover(null);
                onDone?.();
                handleClose();
                return;
            }

            // Not a failure yet: the server is telling us approval is impossible and asking whether
            // to proceed. Offer that as a deliberate second step rather than a dead end.
            const noApprover = noApproverError(response);
            if (noApprover) {
                setNoApprover(noApprover);
                return;
            }
            toast.error(response?.response?.data?.detail ?? response?.data?.message ?? 'Failed to create movement');
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setSending(false);
        }
    };

    const meta = FLOWS.find((f) => f.key === flow);
    /*
     * Whether to say anything about the journey. A branch disposal travels to the Head Office
     * disposal store, so it is included — it used to be excluded, leaving the one flow that most
     * often crosses locations as the only one that never mentioned it.
     *
     * A non-repairable divert is still excluded: the preview describes the repair routing that is
     * about to be abandoned, so its source and destination would name the wrong journey.
     */
    const showLogistics = !categoryNotRepairable;

    const assetPicker = (label: string, options: IAsset[], value: IAsset | null, onChange: (a: IAsset | null) => void, searchable = false) => (
        <Autocomplete
            options={options}
            value={value}
            fullWidth
            loading={searchable && assetSearchLoading}
            getOptionLabel={(a) => `${a.engravedNumber} — ${a.assetName}`}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            filterOptions={searchable ? (x) => x : undefined}
            onInputChange={searchable ? (_, v, reason) => { if (reason === 'input') searchAssets(v); } : undefined}
            onChange={(_, v) => onChange(v)}
            PopperComponent={DropdownPopper}
            PaperComponent={DropdownPaper}
            noOptionsText={searchable ? (assetSearchLoading ? 'Searching…' : 'Type an engraved number to search') : 'No assets available'}
            renderInput={(params) => (
                <TextField {...params} label={label} sx={autocompleteSx}
                    InputProps={{ ...params.InputProps, endAdornment: <>{searchable && assetSearchLoading && <CircularProgress size={15} sx={{ mr: 3, color: PRIMARY }} />}{params.InputProps.endAdornment}</> }} />
            )}
        />
    );

    const userPicker = (label: string) => (
        <Autocomplete
            options={users} loading={usersLoading} value={recipient}
            fullWidth
            getOptionLabel={(u) => `${u.firstName} ${u.lastName}`}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            filterOptions={(x) => x}
            onInputChange={(_, v, reason) => { if (reason === 'input') searchUsers(v); }}
            onChange={(_, v) => setRecipient(v)}
            PopperComponent={DropdownPopper}
            PaperComponent={DropdownPaper}
            noOptionsText={usersLoading ? 'Searching…' : 'Type a name to search'}
            renderInput={(params) => (
                <TextField {...params} label={label} sx={autocompleteSx}
                    InputProps={{ ...params.InputProps, endAdornment: <>{usersLoading && <CircularProgress size={15} sx={{ mr: 3, color: PRIMARY }} />}{params.InputProps.endAdornment}</> }} />
            )}
        />
    );

    // ── Step 1: flow picker ───────────────────────────────────────────────────
    if (!flow) {
        return (
            <Box>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                    Choose the asset-lifecycle movement you want to initiate.
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                    {FLOWS.map((f) => (
                            <Paper
                                key={f.key}
                                onClick={() => setFlow(f.key)}
                                elevation={0}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlow(f.key); } }}
                                sx={{
                                    p: 2,
                                    height: '100%',
                                    borderRadius: 2.5,
                                    border: '1px solid #E8EDF3',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                                    '&:hover': {
                                        borderColor: alpha(f.color, 0.45),
                                        boxShadow: `0 8px 22px -10px ${alpha(f.color, 0.35)}`,
                                        transform: 'translateY(-1px)',
                                        '& .flow-arrow': { opacity: 1, transform: 'translateX(0)' },
                                    },
                                    '&:focus-visible': { outline: `2px solid ${f.color}`, outlineOffset: 2 },
                                }}
                            >
                                <Stack direction="row" spacing={1.25} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                                            bgcolor: alpha(f.color, 0.09), color: f.color,
                                            border: `1px solid ${alpha(f.color, 0.18)}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            '& svg': { fontSize: 20 },
                                        }}
                                    >
                                        {f.icon}
                                    </Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', flex: 1 }}>
                                        {f.label}
                                    </Typography>
                                    <ArrowForwardIosOutlinedIcon
                                        className="flow-arrow"
                                        sx={{
                                            fontSize: 13, color: f.color, opacity: 0, transform: 'translateX(-4px)',
                                            transition: 'opacity 0.15s ease, transform 0.15s ease',
                                        }}
                                    />
                                </Stack>
                                <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.5 }}>
                                    {f.description}
                                </Typography>
                            </Paper>
                    ))}
                </Box>
            </Box>
        );
    }

    // ── Step 2: flow form ─────────────────────────────────────────────────────
    return (
        <Stack spacing={2.25}>
            {/* Flow identity bar */}
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(meta!.color, 0.05),
                    border: `1px solid ${alpha(meta!.color, 0.16)}`,
                }}
            >
                <Box
                    sx={{
                        width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                        bgcolor: alpha(meta!.color, 0.12), color: meta!.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        '& svg': { fontSize: 19 },
                    }}
                >
                    {meta!.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.25 }}>
                        {meta!.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>
                        {meta!.description}
                    </Typography>
                </Box>
                <Button
                    size="small"
                    onClick={back}
                    startIcon={<ArrowBackIosNewOutlinedIcon sx={{ fontSize: '11px !important' }} />}
                    sx={{
                        textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', flexShrink: 0,
                        color: meta!.color, bgcolor: '#fff',
                        border: `1px solid ${alpha(meta!.color, 0.3)}`,
                        borderRadius: '8px', px: 1.25,
                        '&:hover': { bgcolor: alpha(meta!.color, 0.06) },
                    }}
                >
                    Change
                </Button>
            </Stack>

            {/* ── Repair Transfer ── */}
            {flow === 'repair-transfer' && (
                <>
                    <SectionLabel>Faulty asset</SectionLabel>
                    {assetPicker('Search by engraved number', assetSearch, asset, setAsset, true)}

                    {asset && (
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #EEF2F7', flexWrap: 'wrap', gap: 0.75 }}
                        >
                            <CategoryOutlinedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                                {asset.assetType?.name ?? 'Uncategorised'}
                            </Typography>
                            {!categoryNotRepairable && (
                                /*
                                 * Only claim a default when the category actually carries one. This used to
                                 * render `?? 'IT'`, so an unconfigured category read as a deliberate
                                 * "Default routing: IT" — and contradicted the field's own helper text below.
                                 */
                                <Chip
                                    size="small"
                                    label={asset.assetType?.repairDestination
                                        ? `Default routing: ${asset.assetType.repairDestination}`
                                        : 'No default routing set'}
                                    sx={{
                                        height: 20, fontSize: '0.66rem', fontWeight: 700,
                                        ...(asset.assetType?.repairDestination
                                            ? { bgcolor: alpha(meta!.color, 0.08), color: meta!.color }
                                            : { bgcolor: '#F1F5F9', color: '#64748B' }),
                                    }}
                                />
                            )}
                        </Stack>
                    )}

                    {categoryNotRepairable ? (
                        <Alert severity="warning" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                            The <strong>{asset?.assetType?.name}</strong> category is marked non-repairable —
                            this transfer will be diverted straight to the <strong>Disposal store</strong>.
                        </Alert>
                    ) : asset && (
                        <>
                            <SectionLabel>Repair routing</SectionLabel>
                            <TextField
                                select fullWidth
                                sx={{ ...fieldSx, '& .MuiSelect-select': { paddingRight: '32px' } }}
                                label="Repair Destination"
                                value={repairDestination}
                                onChange={(e) => { setRepairDestination(e.target.value as RepairDestination); setConsultant(null); }}
                                helperText={asset.assetType?.repairDestination
                                    ? `Category default: ${asset.assetType.repairDestination}`
                                    : 'No category default configured — IT store assumed'}
                                SelectProps={{
                                    MenuProps: {
                                        PaperProps: {
                                            elevation: 4,
                                            sx: {
                                                mt: 0.5, borderRadius: '8px',
                                                boxShadow: `0 4px 24px ${alpha('#000', 0.12)}`,
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '0.875rem', minHeight: 40, px: 2,
                                                    '&:hover': { backgroundColor: alpha(PRIMARY, 0.06) },
                                                    '&.Mui-selected': {
                                                        backgroundColor: alpha(PRIMARY, 0.1),
                                                        color: PRIMARY, fontWeight: 500,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="IT">IT Store — in-house IT workshop</MenuItem>
                                <MenuItem value="ADMIN">Admin Store — facilities / administration team</MenuItem>
                                <MenuItem value="EXTERNAL">External Consultant — outside repair vendor</MenuItem>
                            </TextField>

                            {repairDestination === 'EXTERNAL' && (
                                <>
                                    <Autocomplete
                                        options={consultants}
                                        value={consultant}
                                        fullWidth
                                        getOptionLabel={(c) => c.specialization ? `${c.name} — ${c.specialization}` : c.name}
                                        isOptionEqualToValue={(o, v) => o.id === v.id}
                                        onChange={(_, v) => setConsultant(v)}
                                        PopperComponent={DropdownPopper}
                                        PaperComponent={DropdownPaper}
                                        noOptionsText="No active consultants — register one under Settings → Repair Consultants"
                                        renderInput={(params) => <TextField {...params} label="External Consultant *" sx={autocompleteSx} />}
                                    />

                                    {/* Dispatch documents — dashed drop-style upload block */}
                                    <Box
                                        component="label"
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.5,
                                            px: 2, py: 1.5, borderRadius: 2, cursor: 'pointer',
                                            border: `1.5px dashed ${alpha(meta!.color, 0.35)}`,
                                            bgcolor: alpha(meta!.color, 0.02),
                                            transition: 'border-color 0.15s ease, background-color 0.15s ease',
                                            '&:hover': { borderColor: meta!.color, bgcolor: alpha(meta!.color, 0.05) },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                                                bgcolor: alpha(meta!.color, 0.1), color: meta!.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <UploadFileOutlinedIcon sx={{ fontSize: 18 }} />
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.82rem' }}>
                                                Attach signed dispatch document(s) <Box component="span" sx={{ color: '#DC2626' }}>*</Box>
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                                PDF, PNG or JPG — click to browse
                                            </Typography>
                                        </Box>
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files ?? []);
                                                if (files.length) setDispatchDocs((prev) => [...prev, ...files]);
                                                e.target.value = '';
                                            }}
                                        />
                                    </Box>
                                    {dispatchDocs.length > 0 && (
                                        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                                            {dispatchDocs.map((f, i) => (
                                                <Chip
                                                    key={`${f.name}-${i}`}
                                                    label={f.name}
                                                    size="small"
                                                    deleteIcon={<CloseIcon />}
                                                    onDelete={() => setDispatchDocs((prev) => prev.filter((_, j) => j !== i))}
                                                    sx={{
                                                        maxWidth: 220, fontWeight: 600, fontSize: '0.72rem',
                                                        bgcolor: alpha(meta!.color, 0.07), color: meta!.color,
                                                        '& .MuiChip-deleteIcon': { color: alpha(meta!.color, 0.55), '&:hover': { color: meta!.color } },
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    )}
                                    <Typography variant="caption" sx={{ color: '#94A3B8', lineHeight: 1.5 }}>
                                        External repairs require the consultant and at least one signed dispatch document;
                                        custody is coordinated by the Head Office Admin store.
                                    </Typography>
                                </>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ── Disposal ── */}
            {flow === 'disposal' && (
                <>
                    <SectionLabel>Asset</SectionLabel>
                    {/*
                     * Own picker rather than the shared assetPicker: these rows carry the server's
                     * age judgement, which is what decides whether a reason is demanded below. The
                     * list is IT + Admin stores only, matching what the write endpoint will accept.
                     */}
                    <Autocomplete
                        options={disposalCandidates}
                        value={disposalCandidate}
                        fullWidth
                        getOptionLabel={(a) => `${a.engravedNumber ?? '—'} — ${a.name ?? 'Unnamed asset'}`}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        onChange={(_, v) => { setDisposalCandidate(v); setEarlyDisposalReason(''); }}
                        PopperComponent={DropdownPopper}
                        PaperComponent={DropdownPaper}
                        noOptionsText="No assets in the IT or Admin stores"
                        renderOption={(props, a) => (
                            <li {...props} key={a.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }} noWrap>
                                            {a.engravedNumber ?? '—'} — {a.name ?? 'Unnamed asset'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748B' }} noWrap>
                                            {[a.assetTypeName, a.storeName, a.locationName].filter(Boolean).join(' · ')}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        size="small"
                                        label={a.pastUsefulLife ? 'Ready for disposal' : 'In service'}
                                        sx={{
                                            flexShrink: 0,
                                            fontSize: '0.68rem',
                                            fontWeight: 700,
                                            bgcolor: a.pastUsefulLife ? alpha('#B91C1C', 0.08) : alpha('#B45309', 0.1),
                                            color: a.pastUsefulLife ? '#B91C1C' : '#B45309',
                                        }}
                                    />
                                </Box>
                            </li>
                        )}
                        renderInput={(params) => <TextField {...params} label="Asset to Dispose (IT / Admin store)" sx={autocompleteSx} />}
                    />

                    {needsEarlyDisposalReason && (
                        <>
                            <Alert severity="warning" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                                This asset has served <strong>{disposalCandidate?.monthsInService} of {disposalCandidate?.usefulLifeMonths ?? '—'} months</strong> of
                                its useful life. It can still be written off — damage and theft do not wait for the
                                schedule — but the reason is recorded on the movement.
                            </Alert>
                            <TextField
                                fullWidth
                                required
                                multiline
                                rows={2}
                                label="Reason for early disposal"
                                placeholder="e.g. Screen and board damaged beyond economical repair"
                                value={earlyDisposalReason}
                                onChange={(e) => setEarlyDisposalReason(e.target.value)}
                                sx={autocompleteSx}
                            />
                        </>
                    )}

                    <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                        The asset moves to the <strong>Disposal store</strong> and its status becomes
                        pending disposal once the movement completes.
                    </Alert>
                </>
            )}

            {/* ── Temporary Replacement ── */}
            {flow === 'temp-replacement' && (
                <>
                    <SectionLabel>Replacement</SectionLabel>
                    {assetPicker('Temporary Asset (pool stock)', poolAssets, tempAsset, setTempAsset)}
                    {userPicker('Recipient User')}
                </>
            )}

            {/* ── Return After Repair ── */}
            {flow === 'return-after-repair' && (
                <>
                    <SectionLabel>Repaired asset</SectionLabel>
                    {assetPicker('Repaired Asset (search by engraved number)', assetSearch, asset, setAsset, true)}

                    {/*
                     * Destination and Assigned To are stated, not chosen. Both come from the holder
                     * recorded on the asset's repair transfer — the asset's own `assignedTo` was
                     * cleared when the branch admin took custody, so it cannot answer this. Making
                     * them editable only ever offered a way to send somebody's laptop to the wrong
                     * branch.
                     */}
                    <SectionLabel>Destination</SectionLabel>
                    {previewLoading && <Typography variant="caption" sx={{ color: '#64748B' }}>Resolving where this asset belongs…</Typography>}

                    {!previewLoading && preview?.blockedReason && (
                        <Alert severity="error" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                            {preview.blockedReason}
                        </Alert>
                    )}

                    {!previewLoading && preview && !preview.blockedReason && (
                        <>
                            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, alignItems: 'start' }}>
                                <TextField
                                    fullWidth sx={fieldSx} label="Destination"
                                    value={preview.destinationLocationName ?? '—'}
                                    InputProps={{ readOnly: true }}
                                    helperText="From this asset's repair transfer"
                                />
                                <TextField
                                    fullWidth sx={fieldSx} label="Assigned To"
                                    value={preview.recipientUserName ?? 'Unassigned — returns to branch stock'}
                                    InputProps={{ readOnly: true }}
                                    helperText="The holder who sent it for repair"
                                />
                            </Box>

                            {preview.returningToBranchUnassigned && (
                                <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                                    The previous holder is no longer active, so this asset returns to
                                    <strong> {preview.destinationLocationName ?? 'its origin branch'}</strong> unassigned and
                                    flagged as pool stock, available to lend out.
                                </Alert>
                            )}

                            {preview.loanerAssetId && (
                                <>
                                    <SectionLabel>Temporary asset</SectionLabel>
                                    <FormControlLabel
                                        control={<Checkbox checked={returnLoaner} onChange={(e) => setReturnLoaner(e.target.checked)} />}
                                        label={
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    Return loaner {preview.loanerAssetLabel}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                                    Issued to {preview.recipientUserName ?? 'this user'} while the asset was under
                                                    repair. Untick if they are keeping it for now.
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ alignItems: 'flex-start', m: 0 }}
                                    />
                                </>
                            )}
                        </>
                    )}
                </>
            )}

            {/*
             * ── Journey ──
             *
             * Tells the operator whether this movement travels, using the server's own derivation,
             * without collecting anything. A branch-to-Head-Office transfer needs a courier, but the
             * courier is chosen at dispatch; one that stays inside Head Office never travels at all.
             */}
            {/* A blocked preview has no journey to describe — its source and destination are the
                little that could be resolved before the rule stopped it, so neither note applies. */}
            {showLogistics && preview && !preview.blockedReason && !preview.interLocation && (
                <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                    {preview.sourceLocationName
                        ? <>Both ends of this movement are within <strong>{preview.sourceLocationName}</strong>, so no courier, tracking number or delivery dates are needed.</>
                        : <>This movement stays within one location, so no courier or delivery details are needed.</>}
                </Alert>
            )}

            {showLogistics && preview?.interLocation && !preview.blockedReason && (
                <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                    <strong>{preview.sourceLocationName} → {preview.destinationLocationName}</strong> — this movement
                    leaves its location, so it has to be dispatched. The courier, plate number, tracking number and
                    signed dispatch note are captured at that point, either on this movement on its own or once for
                    the whole van if it travels on a consignment.
                </Alert>
            )}

            {/* ── Remarks ── */}
            <SectionLabel>Remarks — optional</SectionLabel>
            <TextField
                fullWidth multiline rows={3}
                // fieldSx pads the inner input for single-line height; a multiline root already
                // carries its own padding, so zero the textarea's to avoid doubling up.
                sx={{ ...fieldSx, '& .MuiInputBase-input': { padding: 0, fontSize: '0.875rem', lineHeight: 1.5 } }}
                placeholder="Any additional context for this movement…"
                value={remarks} onChange={(e) => setRemarks(e.target.value)}
            />

            {/* ── Footer actions ── */}
            <Divider sx={{ borderColor: '#EEF2F7' }} />
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button
                    variant="outlined"
                    onClick={handleClose}
                    sx={{
                        borderRadius: '8px', fontWeight: 600, textTransform: 'none',
                        color: '#64748B', borderColor: '#E2E8F0',
                        '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                    }}
                >
                    Cancel
                </Button>
                <ButtonComponent sendingRequest={sending} buttonText="Create Movement" buttonColor="primary" variant="contained" type="button" handleClick={() => submit()} />
            </Stack>

            <NoApproverDialog
                open={!!noApprover}
                message={noApprover}
                busy={sending}
                handleClose={() => setNoApprover(null)}
                onConfirm={(reason) => submit(reason)}
            />
        </Stack>
    );
};

export default RepairFlowsModal;
