/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Alert,
    Box,
    Button,
    Card,
    Grid,
    Stack,
    TextField,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import axiosInstance from '../../core/apis/axiosInstance';
import { AppDispatch } from '../../store';
import { updateGeneralAssetInStore } from './general/slice';
import { IAssetAction } from './interface';

const PRIMARY = '#08796C';

// Backend status IDs (mirrors AssetUtills.determineStatusId)
const STATUS_REQUIRE_UPDATE = 9;
const STATUS_ISSUANCE_AVAILABLE = 8;

interface CompleteDetailsForm {
    engravedNumber: string;
    serialNumber: string;
    make: string;
    model: string;
    description: string;
}

/**
 * Focused completion form shown after a row's "Complete Details" action.
 * Lives inside the existing per-category assets list (IT / Office / Fleet /
 * General) — *not* on a separate route — so the user keeps the asset-type
 * context (filters, tabs, URL) while filling in the engraved number and
 * remaining required fields for a newly-stocked asset.
 *
 * On "Mark ready" we transition the asset from status 9 (requireUpdate) to
 * status 8 (issuanceAvailable). "Save draft" persists changes without
 * flipping status, so the user can come back later.
 */
const CompleteDetails = ({
    asset,
    module,
    handleClose,
}: IAssetAction) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    // The IAssetAction union doesn't expose every per-category field on its
    // common interface — read them defensively. Each category's underlying
    // entity does carry these.
    const a = asset as any;
    const [form, setForm] = useState<CompleteDetailsForm>({
        engravedNumber: a?.engravedNumber ?? '',
        serialNumber: a?.serialNumber ?? '',
        make: a?.make ?? '',
        model: a?.model ?? '',
        description: a?.description ?? '',
    });
    const [saving, setSaving] = useState(false);

    const set = (key: keyof CompleteDetailsForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((prev) => ({ ...prev, [key]: e.target.value }));

    // The asset list endpoint returns nested objects; the update endpoint
    // expects ID-only references. Unwrap defensively in case some lists
    // already flatten them.
    const refOf = (v: any): number | null => {
        if (v == null) return null;
        if (typeof v === 'object' && 'id' in v) return Number((v as any).id);
        if (typeof v === 'number' || typeof v === 'string') return Number(v);
        return null;
    };

    const handleSave = async (markReady: boolean) => {
        if (markReady && !form.engravedNumber.trim()) {
            toast.error('An engraved number is required before marking this asset ready for issuance.');
            return;
        }

        setSaving(true);
        try {
            const body = {
                // Completed fields
                engravedNumber: form.engravedNumber.trim() || null,
                serialNumber: form.serialNumber.trim() || null,
                make: form.make.trim() || null,
                model: form.model.trim() || null,
                description: form.description.trim() || null,
                // Re-send the existing references so nothing gets nulled out
                // by the update endpoint's DTO mapping.
                assetName: asset?.assetName ?? '',
                assetType: refOf((asset as any)?.assetType),
                category: refOf((asset as any)?.commodity),
                branch: refOf((asset as any)?.branch),
                supplier: refOf((asset as any)?.supplier),
                lpoNumber: (asset as any)?.stock?.lpoNumber ?? '',
                // Status transition (or stay)
                assetStatus: markReady ? STATUS_ISSUANCE_AVAILABLE : STATUS_REQUIRE_UPDATE,
            };

            const response = await axiosInstance.put(`assets/${asset?.id}`, body);
            const updated = response?.data ?? body;

            // All asset categories are unified under GeneralAssetStore now.
            dispatch(updateGeneralAssetInStore(updated));

            toast.success(markReady ? 'Asset marked ready for issuance.' : 'Progress saved.');
            handleClose();
        } catch (e) {
            // Error toast is handled by the axios interceptor.
            console.error('Failed to complete asset details', e);
        } finally {
            setSaving(false);
        }
    };

    const stillNeedsCompletion = (asset as any)?.assetStatus?.status === 'requireUpdate'
        || (asset as any)?.assetStatus?.id === STATUS_REQUIRE_UPDATE;

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(PRIMARY, 0.18)}`,
            }}
        >
            <Box sx={{ height: 3, bgcolor: PRIMARY }} />

            {/* Header */}
            <Box
                sx={{
                    bgcolor: alpha(PRIMARY, 0.05),
                    py: 1.75,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: `1px solid ${alpha(PRIMARY, 0.1)}`,
                }}
            >
                <Box
                    sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        bgcolor: alpha(PRIMARY, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <FingerprintIcon sx={{ color: PRIMARY }} fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
                        Complete asset details
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {asset?.assetName ?? 'Asset'}
                        {(asset as any)?.assetType?.name && ` · ${(asset as any).assetType.name}`}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ p: 3 }}>
                {!stillNeedsCompletion && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        This asset is not flagged as requiring completion. Edits made here
                        are still saved, but the status will only flip to "ready for issuance"
                        if you choose <strong>Mark ready</strong>.
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Field
                            label="Engraved Number *"
                            value={form.engravedNumber}
                            onChange={set('engravedNumber')}
                            helperText="Required before issuance"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Field
                            label="Serial Number"
                            value={form.serialNumber}
                            onChange={set('serialNumber')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Field label="Make" value={form.make} onChange={set('make')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Field label="Model" value={form.model} onChange={set('model')} />
                    </Grid>
                    <Grid item xs={12}>
                        <Field
                            label="Description / Notes"
                            value={form.description}
                            onChange={set('description')}
                            multiline
                            rows={3}
                        />
                    </Grid>
                </Grid>

                <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
                    <Button
                        onClick={handleClose}
                        disabled={saving}
                        sx={{ textTransform: 'none', borderRadius: '8px' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            borderColor: alpha(PRIMARY, 0.4),
                            color: PRIMARY,
                            '&:hover': { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) },
                        }}
                    >
                        Save draft
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        startIcon={<CheckCircleOutlineIcon />}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            bgcolor: PRIMARY,
                            '&:hover': { bgcolor: '#065E53' },
                            boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
                        }}
                    >
                        Mark ready
                    </Button>
                </Stack>
            </Box>
        </Card>
    );
};

const Field = ({
    label,
    value,
    onChange,
    multiline = false,
    rows = 1,
    helperText,
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    multiline?: boolean;
    rows?: number;
    helperText?: string;
}) => (
    <Box>
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: '#475569' }}>
            {label}
        </Typography>
        <TextField
            size="small"
            fullWidth
            value={value}
            onChange={onChange}
            multiline={multiline}
            rows={rows}
            helperText={helperText}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: PRIMARY },
                    '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
                },
            }}
        />
    </Box>
);

export default CompleteDetails;
