/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha, Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { toast } from 'react-toastify';

const BLUE = '#2563EB';

/**
 * The tracking number a dispatch travels under - shown, never typed.
 *
 * <p>The system issues it as the dispatch form opens (so it can be printed on the note the courier
 * signs), and it is unique across every movement and consignment. A text box here was how two
 * journeys came to share a number, or a journey to have none.
 */
const TrackingNumberField = ({ value, loading, failed }: {
    value?: string | null; loading?: boolean; failed?: boolean;
}) => {
    const copy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success('Tracking number copied');
        } catch {
            toast.info(value);
        }
    };

    return (
        <Box sx={{ p: 1.5, borderRadius: '10px', border: `1px solid ${alpha(BLUE, 0.2)}`, bgcolor: alpha(BLUE, 0.03) }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    bgcolor: alpha(BLUE, 0.09), color: BLUE, border: `1px solid ${alpha(BLUE, 0.18)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                >
                    <QrCode2OutlinedIcon sx={{ fontSize: 19 }} />
                </Box>
                <Box flex={1} minWidth={0}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block' }}>
                        Tracking number · assigned to this dispatch
                    </Typography>
                    {loading ? (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                            <CircularProgress size={13} />
                            <Typography variant="caption" sx={{ color: '#64748B' }}>Issuing…</Typography>
                        </Stack>
                    ) : value ? (
                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: '#1E293B', letterSpacing: '0.04em' }}>
                            {value}
                        </Typography>
                    ) : (
                        <Typography variant="caption" sx={{ color: failed ? '#B91C1C' : '#64748B' }}>
                            {failed
                                ? 'Could not issue a tracking number yet. One will be issued when you dispatch.'
                                : 'Issued when the movement is dispatched.'}
                        </Typography>
                    )}
                </Box>
                {value && (
                    <Tooltip title="Copy">
                        <IconButton size="small" onClick={copy} sx={{ color: BLUE }}>
                            <ContentCopyOutlinedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
        </Box>
    );
};

export default TrackingNumberField;
