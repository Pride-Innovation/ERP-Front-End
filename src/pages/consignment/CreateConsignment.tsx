/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    alpha, Alert, Autocomplete, Box, Button, Divider, Stack, TextField, Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { toast } from 'react-toastify';
import ButtonComponent from '../../components/forms/Button';
import { fieldSx } from '../../components/forms/Inputs';
import { autocompleteSx } from '../../components/forms/Autocomplete';
import { DropdownPopper, DropdownPaper, SectionLabel, modalCancelSx } from '../../components/forms/modalChrome';
import { fetchRowsService } from '../../core/apis/globalService';
import { brand, gold, neutral } from '../../utils/tokens';
import { IBranch } from '../settings/branch/interface';
import { createConsignmentService, fetchOpenConsignmentsService } from './service';
import { IConsignment } from './interface';

const PRIMARY = brand[500];
const GOLD = gold[500];

/** One end of the route, once it has been chosen. Mirrors the movement detail page's route panels. */
const RoutePanel = ({ kind, name, accent, icon }: {
    kind: string; name?: string | null; accent: string; icon: React.ReactNode;
}) => (
    <Box
        sx={{
            flex: 1, minWidth: 0, p: 1.5, borderRadius: 2,
            bgcolor: alpha(accent, name ? 0.04 : 0),
            border: `1px ${name ? 'solid' : 'dashed'} ${alpha(accent, name ? 0.2 : 0.25)}`,
            transition: 'background-color .15s ease, border-color .15s ease',
        }}
    >
        <Stack direction="row" spacing={0.75} alignItems="center" mb={0.4}>
            <Box sx={{ color: accent, display: 'flex', '& .MuiSvgIcon-root': { fontSize: 14 } }}>{icon}</Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: accent, letterSpacing: '0.06em', fontSize: '0.62rem' }}>
                {kind}
            </Typography>
        </Stack>
        <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: name ? neutral[900] : neutral[400], fontSize: '0.84rem' }}
            noWrap
        >
            {name ?? 'Not chosen yet'}
        </Typography>
    </Box>
);

/**
 * Opens a journey. Contents are added afterwards, so a van can be filled as stock is picked rather
 * than requiring every movement to be known up front.
 */
const CreateConsignment = ({
    handleClose,
    onCreated,
}: {
    handleClose: () => void;
    onCreated: (id: number) => void | Promise<void>;
}) => {
    const [branches, setBranches] = useState<IBranch[]>([]);
    const [source, setSource] = useState<IBranch | null>(null);
    const [destination, setDestination] = useState<IBranch | null>(null);
    const [remarks, setRemarks] = useState('');
    const [sending, setSending] = useState(false);

    /** Draft journeys already on this route — offered so a second van isn't opened by accident. */
    const [existing, setExisting] = useState<IConsignment[]>([]);

    useEffect(() => {
        (async () => {
            const r = (await fetchRowsService({ pageNumber: 0, pageSize: 200, endPoint: 'branches' })) as any;
            if (r?.status === 200) setBranches(r.data?.content ?? []);
        })();
    }, []);

    useEffect(() => {
        if (!source?.id || !destination?.id) { setExisting([]); return; }
        (async () => {
            const r = (await fetchOpenConsignmentsService(source.id!, destination.id!)) as any;
            setExisting(r?.status === 200 ? r.data ?? [] : []);
        })();
    }, [source, destination]);

    const submit = async () => {
        if (!source?.id || !destination?.id) {
            toast.warning('Pick where this consignment starts and where it is going.');
            return;
        }
        if (source.id === destination.id) {
            toast.warning('A consignment carries goods between locations — pick two different ones.');
            return;
        }
        setSending(true);
        try {
            const res = (await createConsignmentService({
                sourceLocationId: source.id,
                destLocationId: destination.id,
                remarks: remarks || null,
            })) as any;
            if (res?.status === 200 || res?.status === 201) {
                toast.success('Consignment opened — load the movements travelling on it.');
                await onCreated(res.data.id);
            } else {
                toast.error(res?.data?.message ?? 'Could not open this consignment.');
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <Stack spacing={2.5}>
            {/* Header band — the same tinted icon-chip introduction the repair flows open with. */}
            <Stack
                direction="row" spacing={1.5} alignItems="flex-start"
                sx={{
                    p: 1.75, borderRadius: 2.5,
                    bgcolor: alpha(PRIMARY, 0.04),
                    border: `1px solid ${alpha(PRIMARY, 0.14)}`,
                }}
            >
                <Box sx={{
                    width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY,
                }}
                >
                    <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.3 }}>
                        One courier run
                    </Typography>
                    <Typography variant="caption" sx={{ color: neutral[600], fontSize: '0.78rem' }}>
                        Open a consignment for a route, then load the approved movements travelling on it —
                        they can come from different stores and different requests.
                    </Typography>
                </Box>
            </Stack>

            <SectionLabel>Route</SectionLabel>

            {/* Plain CSS grid — MUI Grid's negative-margin spacing pulls fields out of line with the
                full-width inputs around it inside a Stack. */}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, alignItems: 'start' }}>
                <Autocomplete
                    options={branches}
                    value={source}
                    fullWidth
                    getOptionLabel={(b) => b.name}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    onChange={(_, v) => setSource(v)}
                    PopperComponent={DropdownPopper}
                    PaperComponent={DropdownPaper}
                    noOptionsText="No branches found"
                    renderInput={(params) => <TextField {...params} label="Leaving from" sx={autocompleteSx} />}
                />
                <Autocomplete
                    options={branches.filter((b) => b.id !== source?.id)}
                    value={destination}
                    fullWidth
                    getOptionLabel={(b) => b.name}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    onChange={(_, v) => setDestination(v)}
                    PopperComponent={DropdownPopper}
                    PaperComponent={DropdownPaper}
                    noOptionsText="No other branches available"
                    renderInput={(params) => <TextField {...params} label="Going to" sx={autocompleteSx} />}
                />
            </Box>

            {/* The route as it stands. Shown from the start so the two pickers read as one journey
                rather than two unrelated fields. */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1.5 }} alignItems={{ sm: 'center' }}>
                <RoutePanel kind="FROM" name={source?.name} accent={PRIMARY} icon={<PlaceOutlinedIcon />} />
                <Box sx={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0, alignSelf: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: neutral[100],
                }}
                >
                    <ArrowForwardIcon sx={{ fontSize: 14, color: neutral[400], transform: { xs: 'rotate(90deg)', sm: 'none' } }} />
                </Box>
                <RoutePanel kind="TO" name={destination?.name} accent={GOLD} icon={<FlagOutlinedIcon />} />
            </Stack>

            {existing.length > 0 && (
                <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                    There {existing.length === 1 ? 'is already a consignment' : `are already ${existing.length} consignments`} being
                    loaded for this route (<strong>{existing.map((c) => c.reference).filter(Boolean).join(', ')}</strong>).
                    Adding your movements to one of those keeps the run on a single courier.
                </Alert>
            )}

            <SectionLabel>Remarks — optional</SectionLabel>
            <TextField
                fullWidth multiline rows={3}
                // fieldSx pads the inner input for single-line height; a multiline root already
                // carries its own padding, so zero the textarea's to avoid doubling up.
                sx={{ ...fieldSx, '& .MuiInputBase-input': { padding: 0, fontSize: '0.875rem', lineHeight: 1.5 } }}
                placeholder="e.g. Weekly Kampala run"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
            />

            <Divider sx={{ borderColor: '#EEF2F7' }} />
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button variant="outlined" onClick={handleClose} sx={modalCancelSx}>
                    Cancel
                </Button>
                <ButtonComponent
                    sendingRequest={sending}
                    buttonText="Open Consignment"
                    buttonColor="primary"
                    variant="contained"
                    type="button"
                    handleClick={submit}
                />
            </Stack>
        </Stack>
    );
};

export default CreateConsignment;
