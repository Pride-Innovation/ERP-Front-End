/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography, alpha } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { toast } from 'react-toastify';

import { IOfficeEquipment } from '../interface';
import { deleteAssetService } from './service';
import { neutral } from '../../../utils/tokens';

const DANGER = '#D32F2F';

interface IDeleteAssetProps {
    asset: IOfficeEquipment | null;
    handleClose: () => void;
    onDeleted: () => void;
}

/**
 * Confirms removing an asset record from the register.
 *
 * <p>The copy does one job above all: separating this from <b>Dispose</b>. They sit next to each
 * other in the row menu and both take an asset out of circulation, but they mean different things —
 * disposal is an asset reaching the end of its life and is part of its history; this is a record
 * that should not have existed. Choosing the wrong one leaves the register wrong in a way that is
 * hard to spot later.
 *
 * <p>It also says plainly that the record is kept, because "delete" reads as permanent and someone
 * will hesitate over an action that is in fact reversible.
 */
const DeleteAsset = ({ asset, handleClose, onDeleted }: IDeleteAssetProps) => {
    const [reason, setReason] = useState('');
    const [sending, setSending] = useState(false);

    const confirm = async () => {
        if (!asset?.id) return;
        setSending(true);
        const res = await deleteAssetService(asset.id, reason.trim() || undefined);
        setSending(false);

        if ((res as { status?: number })?.status === 200) {
            toast.success(`“${asset.assetName || 'Asset'}” removed from the register.`);
            onDeleted();
            handleClose();
        }
        // errors surfaced by the axios interceptor
    };

    return (
        <Box>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                <Box sx={{
                    width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
                    bgcolor: alpha(DANGER, 0.1), color: DANGER,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <WarningAmberRoundedIcon />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: neutral[900] }}>
                        Remove “{asset?.assetName || 'this asset'}” from the register?
                    </Typography>
                    <Typography variant="body2" sx={{ color: neutral[500], mt: 0.5 }}>
                        It will disappear from every asset list, report and export. The record itself
                        is kept, so its assignment and repair history stay intact and it can be
                        restored later.
                    </Typography>
                </Box>
            </Stack>

            {/* Same radius and message size as the Dispose dialog's alert — the two sit in the
                same row menu and reading as siblings is the point. */}
            <Alert severity="info" sx={{ borderRadius: 2, mb: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
                    This is not the same as disposing of it
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                    Use <strong>Dispose</strong> when an asset has reached the end of its life — that
                    writes it off through a movement and keeps it in the register as disposed. Use
                    <strong> Delete</strong> when the record should not have existed: a duplicate, or
                    a row imported by mistake.
                </Typography>
            </Alert>

            {/*
              * Styled by the app's theme, not by this file.
              *
              * The previous version set `size="small"` and its own border radius, which fought the
              * theme and left this field looking unlike every other input in the asset modals. The
              * Dispose dialog passes no `sx` at all and looks right for exactly that reason — the
              * shape of a text input is a theme decision, not a per-dialog one.
              */}
            <Box sx={{ mb: 2.5 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Reason (optional)"
                    placeholder="e.g. duplicate of engraved no. 4471"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    helperText="Recorded on the audit trail beside your name."
                />
            </Box>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button
                    onClick={handleClose}
                    disabled={sending}
                    sx={{ textTransform: 'none', borderRadius: '8px', color: neutral[600] }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={confirm}
                    disabled={sending}
                    variant="contained"
                    color="error"
                    sx={{
                        textTransform: 'none', borderRadius: '8px', fontWeight: 700, px: 2.5,
                        '&:hover': { bgcolor: '#B71C1C' },
                    }}
                >
                    {sending ? 'Removing…' : 'Remove from register'}
                </Button>
            </Stack>
        </Box>
    );
};

export default DeleteAsset;
