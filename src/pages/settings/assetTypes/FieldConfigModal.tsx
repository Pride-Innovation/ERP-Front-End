/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Typography,
    Stack,
    alpha,
    Button as MuiButton,
    ToggleButtonGroup,
    ToggleButton,
    CircularProgress,
    Divider,
    Chip,
    Paper,
} from '@mui/material';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '../../../store';
import { IAssetFieldConfig, IAssetType, FieldConfigState } from './interface';
import { updateAssetTypeFieldConfigService } from './service';
import { updateAssetTypeFieldConfig } from './slice';

// ─── Field catalogue ──────────────────────────────────────────────────────────

interface FieldEntry {
    key: keyof IAssetFieldConfig;
    label: string;
}

interface FieldGroup {
    title: string;
    fields: FieldEntry[];
}

const FIELD_GROUPS: FieldGroup[] = [
    {
        title: 'Identification',
        fields: [
            { key: 'assetName', label: 'Asset Name' },
            { key: 'engravedNumber', label: 'Engraved Number' },
            { key: 'hostname', label: 'Hostname' },
            { key: 'make', label: 'Make / Brand' },
            { key: 'model', label: 'Model' },
            { key: 'serialNumber', label: 'Serial Number' },
        ],
    },
    {
        title: 'Classification',
        fields: [
            { key: 'category', label: 'Category' },
            { key: 'unitOfMeasure', label: 'Unit of Measure' },
        ],
    },
    {
        title: 'Financial',
        fields: [
            { key: 'purchaseCost', label: 'Purchase Cost' },
            { key: 'costOfTheAsset', label: 'Cost of Asset' },
            { key: 'netValueB', label: 'Net Book Value' },
            { key: 'detailNetBookValue', label: 'Detail Net Book Value' },
            { key: 'assetDepreciationRate', label: 'Depreciation Rate' },
        ],
    },
    {
        title: 'Dates & References',
        fields: [
            { key: 'dateReceipt', label: 'Date of Receipt' },
            { key: 'lpoNumber', label: 'LPO Number' },
        ],
    },
    {
        title: 'Assignment',
        fields: [
            { key: 'assignedTo', label: 'Assigned To' },
            { key: 'branch', label: 'Branch / Location' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'commodity', label: 'Sub-category' },
        ],
    },
    {
        title: 'Technical (IT / Network)',
        fields: [
            { key: 'ram', label: 'RAM' },
            { key: 'cpuSpeed', label: 'CPU Speed' },
            { key: 'hardDiskSize', label: 'Hard Disk Size' },
            { key: 'macAddress', label: 'MAC Address' },
            { key: 'ipAddress', label: 'IP Address' },
            { key: 'interfaceType', label: 'Interface Type' },
        ],
    },
    {
        title: 'Other',
        fields: [
            { key: 'description', label: 'Description' },
            { key: 'image', label: 'Image' },
            { key: 'lastRepairedBy', label: 'Last Repaired By' },
        ],
    },
];

const STATE_OPTIONS: { value: FieldConfigState; label: string; color: string; icon: React.ReactNode }[] = [
    { value: 'required', label: 'Required', color: '#D32F2F', icon: <StarOutlineIcon sx={{ fontSize: 14 }} /> },
    { value: 'optional', label: 'Optional', color: '#08796C', icon: <RadioButtonUncheckedIcon sx={{ fontSize: 14 }} /> },
    { value: 'hidden', label: 'Hidden', color: '#607D8B', icon: <VisibilityOffOutlinedIcon sx={{ fontSize: 14 }} /> },
];

const PRIMARY_COLOR = '#08796C';
const DEFAULT_STATE: FieldConfigState = 'optional';

// ─── Props ───────────────────────────────────────────────────────────────────

interface FieldConfigModalProps {
    assetType: IAssetType;
    handleClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const FieldConfigModal = ({ assetType, handleClose }: FieldConfigModalProps) => {
    const dispatch = useDispatch<AppDispatch>();

    const buildInitialConfig = (): IAssetFieldConfig => {
        const initial: IAssetFieldConfig = {};
        FIELD_GROUPS.forEach(group => {
            group.fields.forEach(({ key }) => {
                initial[key] = assetType.fieldConfig?.[key] ?? DEFAULT_STATE;
            });
        });
        return initial;
    };

    const [config, setConfig] = useState<IAssetFieldConfig>(buildInitialConfig);
    const [saving, setSaving] = useState(false);

    const handleChange = (key: keyof IAssetFieldConfig, value: FieldConfigState | null) => {
        if (!value) return; // MUI ToggleButtonGroup passes null when deselecting
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await updateAssetTypeFieldConfigService(assetType.id as string | number, config) as any;
            if (response.status === 200 || response.status === 204) {
                dispatch(updateAssetTypeFieldConfig({ id: assetType.id, fieldConfig: config }));
                toast.success(`Field configuration saved for "${assetType.name}"`, { position: 'bottom-right' });
                handleClose();
            } else {
                toast.error('Failed to save field configuration.', { position: 'bottom-right' });
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.response?.data?.detail;
            toast.error(message || 'Failed to save field configuration.', { position: 'bottom-right' });
        } finally {
            setSaving(false);
        }
    };

    const countByState = (state: FieldConfigState) =>
        FIELD_GROUPS.flatMap(g => g.fields).filter(f => (config[f.key] ?? DEFAULT_STATE) === state).length;

    return (
        <Box>
            {/* Summary chips */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                {STATE_OPTIONS.map(opt => (
                    <Chip
                        key={opt.value}
                        size="small"
                        icon={opt.icon as any}
                        label={`${countByState(opt.value)} ${opt.label}`}
                        sx={{
                            bgcolor: alpha(opt.color, 0.09),
                            color: opt.color,
                            fontWeight: 600,
                            border: `1px solid ${alpha(opt.color, 0.25)}`,
                            '& .MuiChip-icon': { color: opt.color },
                        }}
                    />
                ))}
            </Stack>

            {/* Legend */}
            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    mb: 3,
                    bgcolor: alpha(PRIMARY_COLOR, 0.04),
                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.12)}`,
                    borderRadius: 1.5,
                }}
            >
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                    {STATE_OPTIONS.map(opt => (
                        <Stack key={opt.value} direction="row" alignItems="center" spacing={0.75}>
                            <Box sx={{ color: opt.color, display: 'flex' }}>{opt.icon}</Box>
                            <Typography variant="caption" sx={{ color: opt.color, fontWeight: 600 }}>
                                {opt.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {opt.value === 'required' && '— must be filled before saving'}
                                {opt.value === 'optional' && '— shown but not mandatory'}
                                {opt.value === 'hidden' && '— not shown in asset forms'}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </Paper>

            {/* Field groups */}
            <Box sx={{ maxHeight: '55vh', overflowY: 'auto', pr: 0.5 }}>
                {FIELD_GROUPS.map((group, gi) => (
                    <Box key={group.title} sx={{ mb: 3 }}>
                        {/* Group header */}
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <Typography
                                variant="overline"
                                sx={{
                                    color: PRIMARY_COLOR,
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    fontSize: '0.68rem',
                                }}
                            >
                                {group.title}
                            </Typography>
                            <Divider sx={{ flex: 1, borderColor: alpha(PRIMARY_COLOR, 0.15) }} />
                        </Stack>

                        {/* Field rows */}
                        <Stack spacing={0.75}>
                            {group.fields.map(({ key, label }) => {
                                const current: FieldConfigState = config[key] ?? DEFAULT_STATE;
                                return (
                                    <Stack
                                        key={key}
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        sx={{
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: 1.5,
                                            border: `1px solid ${alpha('#000', 0.06)}`,
                                            bgcolor: current === 'hidden' ? alpha('#607D8B', 0.04) : '#fff',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 500,
                                                color: current === 'hidden' ? 'text.disabled' : 'text.primary',
                                                textDecoration: current === 'hidden' ? 'line-through' : 'none',
                                                minWidth: 160,
                                            }}
                                        >
                                            {label}
                                        </Typography>

                                        <ToggleButtonGroup
                                            value={current}
                                            exclusive
                                            size="small"
                                            onChange={(_, val) => handleChange(key, val)}
                                            sx={{ height: 28 }}
                                        >
                                            {STATE_OPTIONS.map(opt => (
                                                <ToggleButton
                                                    key={opt.value}
                                                    value={opt.value}
                                                    sx={{
                                                        px: 1.25,
                                                        fontSize: '0.72rem',
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        gap: 0.5,
                                                        border: `1px solid ${alpha(opt.color, 0.3)} !important`,
                                                        color: alpha(opt.color, 0.55),
                                                        '&.Mui-selected': {
                                                            bgcolor: alpha(opt.color, 0.12),
                                                            color: opt.color,
                                                            border: `1px solid ${opt.color} !important`,
                                                        },
                                                        '&:hover': {
                                                            bgcolor: alpha(opt.color, 0.07),
                                                        },
                                                    }}
                                                >
                                                    {opt.icon}
                                                    {opt.label}
                                                </ToggleButton>
                                            ))}
                                        </ToggleButtonGroup>
                                    </Stack>
                                );
                            })}
                        </Stack>

                        {gi < FIELD_GROUPS.length - 1 && <Box sx={{ mt: 1 }} />}
                    </Box>
                ))}
            </Box>

            {/* Actions */}
            <Divider sx={{ mt: 1, mb: 2 }} />
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <MuiButton variant="outlined" color="inherit" onClick={handleClose} disabled={saving}>
                    Cancel
                </MuiButton>
                <MuiButton
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                    sx={{ bgcolor: PRIMARY_COLOR, '&:hover': { bgcolor: '#065E53' } }}
                >
                    {saving ? 'Saving…' : 'Save Configuration'}
                </MuiButton>
            </Stack>
        </Box>
    );
};

export default FieldConfigModal;
