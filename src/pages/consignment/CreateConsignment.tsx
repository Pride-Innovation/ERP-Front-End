/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { Alert, Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { fetchRowsService } from '../../core/apis/globalService';
import { IBranch } from '../settings/branch/interface';
import { createConsignmentService, fetchOpenConsignmentsService } from './service';
import { IConsignment } from './interface';

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
            <Typography variant="body2" sx={{ color: '#64748B' }}>
                A consignment is one courier run. Open it for a route, then load the approved movements
                travelling on it — they can come from different stores and different requests.
            </Typography>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <Autocomplete
                    options={branches}
                    value={source}
                    getOptionLabel={(b) => b.name}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    onChange={(_, v) => setSource(v)}
                    renderInput={(params) => <TextField {...params} label="Leaving from" />}
                />
                <Autocomplete
                    options={branches.filter((b) => b.id !== source?.id)}
                    value={destination}
                    getOptionLabel={(b) => b.name}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    onChange={(_, v) => setDestination(v)}
                    renderInput={(params) => <TextField {...params} label="Going to" />}
                />
            </Box>

            {existing.length > 0 && (
                <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                    There {existing.length === 1 ? 'is already a consignment' : `are already ${existing.length} consignments`} being
                    loaded for this route ({existing.map((c) => c.reference).filter(Boolean).join(', ')}).
                    Adding your movements to one of those keeps the run on a single courier.
                </Alert>
            )}

            <TextField
                fullWidth multiline rows={2} label="Remarks (optional)"
                placeholder="e.g. Weekly Kampala run"
                value={remarks} onChange={(e) => setRemarks(e.target.value)}
            />

            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Cancel
                </Button>
                <Button onClick={submit} disabled={sending} variant="contained" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    {sending ? 'Opening…' : 'Open consignment'}
                </Button>
            </Stack>
        </Stack>
    );
};

export default CreateConsignment;
