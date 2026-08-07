/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
import { Alert, Box, Stack, TextField, Typography } from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IDispose } from "./interface";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { toast } from "react-toastify";
import { disposeGeneralAssetFromStore } from "./general/slice";
import { disposeAssetService } from "../movement/service";
import ActionModalShell, { ActionPoints, AssetIdentityCard } from "./ActionModalShell";

/**
 * Retires an asset by raising a DISPOSAL_TRANSFER movement to the Head Office Disposal store.
 *
 * <p>This used to POST `assets/{id}`, which only set a `disposed` flag and a date: no movement, no
 * store change, no status. So the bank had two "Dispose" buttons doing materially different things,
 * and the flag-only one was the more discoverable of the two — an asset could read as disposed while
 * still physically sitting in a branch store, with nothing recording its journey to Head Office.
 * Both now go through the same endpoint and the same eligibility rules.
 */
const Dispose = ({
    handleClose,
    sendingRequest,
    buttonText,
    asset,
}: IDispose) => {
    const dispatch = useDispatch<AppDispatch>();
    const [saving, setSaving] = useState(false);
    const [reason, setReason] = useState('');

    // The server owns this judgement; `disposalStatus` is its answer, computed from the category's
    // useful life against the asset's receipt date. Anything other than a definite "ready" is
    // treated as early, so a missing or unparseable date asks for a reason rather than skipping one.
    const pastUsefulLife = (asset?.disposalStatus ?? '').toLowerCase().includes('ready');

    const handleDisposal = async () => {
        if (!pastUsefulLife && !reason.trim()) {
            toast.warning('This asset is still within its useful life — give a reason for disposing of it early.');
            return;
        }
        setSaving(true);
        try {
            const response = await disposeAssetService({
                assetId: asset?.id,
                earlyDisposalReason: pastUsefulLife ? null : reason.trim(),
            }) as any;

            if (response?.status === 200 || response?.status === 201) {
                toast.success('Disposal movement created — the asset moves to the Disposal store on completion.');
                dispatch(disposeGeneralAssetFromStore(asset?.id));
                handleClose();
            } else {
                // Surfaced rather than swallowed: the common rejections are actionable by the user
                // ("receive it into a store first"), and the old catch-and-log left them staring at
                // a modal that had silently done nothing.
                toast.error(response?.data?.message ?? 'Could not dispose this asset.');
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <ActionModalShell
            tone="error"
            icon={<DeleteForeverIcon />}
            title="Confirm Asset Disposal"
            subtitle="Raises a disposal movement to the Head Office Disposal store"
            onCancel={handleClose}
            onConfirm={handleDisposal}
            confirmText={buttonText}
            confirmIcon={<DeleteOutlineIcon />}
            busy={sendingRequest || saving}
            busyText="Disposing..."
        >
            <Stack spacing={3}>
                <Box>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                        Are you sure you want to dispose of this asset? This action:
                    </Typography>
                    <ActionPoints
                        tone="error"
                        points={[
                            <>Raises a <strong>disposal movement</strong> to the Head Office Disposal store</>,
                            'Sets the asset to pending disposal, and retires it once the movement completes',
                            <>Keeps the record in the <strong>audit trail</strong> for historical reporting</>,
                            'Requires the asset to be held in an IT or Admin store, not by a user',
                        ]}
                    />
                </Box>

                {!pastUsefulLife && (
                    <Box>
                        <Alert severity="warning" sx={{ borderRadius: 2, mb: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
                            This asset has not reached the end of its useful life. It can still be written off —
                            damage and theft do not wait for the schedule — but the reason is recorded on the movement.
                        </Alert>
                        <TextField
                            fullWidth
                            required
                            multiline
                            rows={2}
                            label="Reason for early disposal"
                            placeholder="e.g. Screen and board damaged beyond economical repair"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </Box>
                )}

                <AssetIdentityCard asset={asset} />
            </Stack>
        </ActionModalShell>
    );
}

export default Dispose;
