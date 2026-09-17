/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { toast } from 'react-toastify';

import { IOfficeEquipment } from '../interface';
import { restoreAssetService } from './service';
import { neutral, brand } from '../../../utils/tokens';

interface IRestoreAssetProps {
    asset: IOfficeEquipment | null;
    handleClose: () => void;
    onRestored: () => void;
}

/**
 * Puts a soft-deleted asset back into the register.
 *
 * <p>Deliberately lighter than the delete dialog: this is the reversal, it takes nothing away, and
 * the record returns exactly as it was. The only thing worth saying is that it becomes visible to
 * everyone again — the person restoring it should know they are undoing someone's removal, not
 * quietly retrieving something for themselves.
 */
const RestoreAsset = ({ asset, handleClose, onRestored }: IRestoreAssetProps) => {
    const [sending, setSending] = useState(false);

    const confirm = async () => {
        if (!asset?.id) return;
        setSending(true);
        const res = await restoreAssetService(asset.id);
        setSending(false);

        if ((res as { status?: number })?.status === 200) {
            toast.success(`“${asset.assetName || 'Asset'}” is back in the register.`);
            onRestored();
            handleClose();
        }
        // errors surfaced by the axios interceptor
    };

    return (
        <Box>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2.5 }}>
                <Box sx={{
                    width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
                    bgcolor: alpha(brand[500], 0.1), color: brand[600],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <RestoreOutlinedIcon />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: neutral[900] }}>
                        Restore “{asset?.assetName || 'this asset'}”?
                    </Typography>
                    <Typography variant="body2" sx={{ color: neutral[500], mt: 0.5 }}>
                        It returns to the register exactly as it was — visible again in every asset
                        list, report and export, with its history intact.
                    </Typography>
                </Box>
            </Stack>

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
                    sx={{
                        textTransform: 'none', borderRadius: '8px', fontWeight: 700, px: 2.5,
                        bgcolor: brand[600], '&:hover': { bgcolor: brand[700] },
                    }}
                >
                    {sending ? 'Restoring…' : 'Restore to register'}
                </Button>
            </Stack>
        </Box>
    );
};

export default RestoreAsset;
