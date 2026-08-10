/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined';
import { neutral, status as statusTokens } from '../../utils/tokens';
import ModalComponent from '../../components/modal';

/**
 * Offered when a movement needs approval but nobody can be found to give it.
 *
 * <p>The server refuses the first attempt rather than proceeding quietly, and this is the second,
 * deliberate step. Confirming does not waive the control — it records it: the movement is flagged,
 * and the approval trail gains a BYPASSED entry naming whoever confirmed and why. An unapproved
 * movement should never be indistinguishable from an approved one.
 *
 * <p>The reason is mandatory for the same purpose. An exception nobody can explain later is just an
 * unexplained gap in the trail.
 */
const NoApproverDialog = ({
    open,
    message,
    busy,
    handleClose,
    onConfirm,
}: {
    open: boolean;
    /** The server's own explanation, shown verbatim so the two never drift apart. */
    message?: string | null;
    busy?: boolean;
    handleClose: () => void;
    onConfirm: (reason: string) => void | Promise<void>;
}) => {
    const [reason, setReason] = useState('');

    return (
        <ModalComponent open={open} handleClose={handleClose} title="No approver found" width="42%">
            <Stack spacing={2.5}>
                <Alert
                    severity="warning"
                    icon={<GppMaybeOutlinedIcon fontSize="small" />}
                    sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}
                >
                    {message
                        ?? 'No approver could be resolved on your reporting line for this movement.'}
                </Alert>

                <Box>
                    <Typography variant="body2" sx={{ color: neutral[700], mb: 1 }}>
                        This usually means a reporting line is not set up — no branch on your record, or nobody
                        holding a supervisory role above you in it. <strong>The better fix is to have an
                        administrator correct that.</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: neutral[700] }}>
                        You can proceed without approval, but it will be recorded against this movement and
                        shown on its approval trail with your name.
                    </Typography>
                </Box>

                <TextField
                    fullWidth required multiline rows={2}
                    label="Reason for proceeding without approval"
                    placeholder="e.g. Urgent branch replacement; supervisor on leave and reporting line not yet configured"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                    <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onConfirm(reason.trim())}
                        disabled={busy || !reason.trim()}
                        variant="contained"
                        sx={{
                            textTransform: 'none', fontWeight: 600,
                            bgcolor: statusTokens.warning.strong,
                            '&:hover': { bgcolor: statusTokens.warning.strong },
                        }}
                    >
                        {busy ? 'Proceeding…' : 'Proceed without approval'}
                    </Button>
                </Stack>
            </Stack>
        </ModalComponent>
    );
};

export default NoApproverDialog;
