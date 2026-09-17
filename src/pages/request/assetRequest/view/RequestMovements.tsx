/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha, Box, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { findMovementsByRequestService } from '../../../movement/service';
import { IMovement } from '../../../movement/interface';
import { getStatusConfig, movementTypeLabel } from '../../../movement/constants';
import { ROUTES } from '../../../../core/routes/routes';

const PRIMARY = '#08796C';

const destLabel = (m: IMovement) =>
    m.destStore?.name ?? (m.recipientUser ? `${m.recipientUser.firstName} ${m.recipientUser.lastName}` : '—');

const RequestMovements = ({ requestId }: { requestId?: number | string }) => {
    const navigate = useNavigate();
    const [movements, setMovements] = useState<IMovement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (requestId == null) { setLoading(false); return; }
        (async () => {
            setLoading(true);
            const r = (await findMovementsByRequestService(requestId)) as any;
            if (r?.status === 200) setMovements(r.data ?? []);
            setLoading(false);
        })();
    }, [requestId]);

    if (loading) {
        return <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress size={28} sx={{ color: PRIMARY }} /></Box>;
    }

    if (movements.length === 0) {
        return (
            <Box sx={{ py: 8, textAlign: 'center' }}>
                <SwapHorizOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No movements linked to this request yet.</Typography>
                <Typography variant="caption" color="text.disabled">A movement is created automatically when fulfilment crosses locations.</Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: PRIMARY }}>
                Linked Movements ({movements.length})
            </Typography>
            {movements.map((m) => {
                const cfg = getStatusConfig(m.status);
                return (
                    <Paper key={m.id} elevation={0}
                        onClick={() => navigate(`${ROUTES.READ_MOVEMENT}/${m.id}`)}
                        sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha('#000', 0.08)}`, cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.02) } }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                            <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0}>
                                <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <SwapHorizOutlinedIcon sx={{ fontSize: 17 }} />
                                </Box>
                                <Box minWidth={0}>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, fontFamily: 'monospace' }}>#{m.id}</Typography>
                                        <Chip label={movementTypeLabel(m.movementType)} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: alpha(PRIMARY, 0.06), color: PRIMARY }} />
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.5} mt={0.25}>
                                        <Typography variant="caption" color="text.secondary" noWrap>{m.sourceStore?.name ?? '—'}</Typography>
                                        <ArrowForwardIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{destLabel(m)}</Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                                <Chip label={cfg.label} size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: cfg.bg, color: cfg.color }} />
                                <LaunchOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                            </Stack>
                        </Stack>
                    </Paper>
                );
            })}
        </Stack>
    );
};

export default RequestMovements;
