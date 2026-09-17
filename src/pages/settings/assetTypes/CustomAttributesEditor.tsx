/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    FormControlLabel,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { brand } from '../../../utils/tokens';
import { CustomAttributeDataType, ICustomAttribute } from './interface';

const PRIMARY_COLOR = brand[500];

const DATA_TYPE_LABELS: Record<CustomAttributeDataType, string> = {
    TEXT:    'Text',
    NUMBER:  'Number',
    DATE:    'Date',
    BOOLEAN: 'Yes / No',
    SELECT:  'Select (options)',
};

interface ICustomAttributesEditorProps {
    attributes: ICustomAttribute[];
    onChange: (next: ICustomAttribute[]) => void;
}

const blankAttribute = (order: number): ICustomAttribute => ({
    key: '',
    label: '',
    dataType: 'TEXT',
    options: [],
    required: false,
    order,
    helperText: '',
});

const slugifyKey = (label: string) =>
    label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

const CustomAttributesEditor = ({ attributes, onChange }: ICustomAttributesEditorProps) => {
    const [optionInputs, setOptionInputs] = useState<Record<number, string>>({});

    const updateAttribute = (index: number, patch: Partial<ICustomAttribute>) => {
        const next = attributes.map((attr, i) => (i === index ? { ...attr, ...patch } : attr));
        onChange(next);
    };

    const removeAttribute = (index: number) => {
        const next = attributes
            .filter((_, i) => i !== index)
            .map((attr, i) => ({ ...attr, order: i + 1 }));
        onChange(next);
    };

    const addAttribute = () => {
        onChange([...attributes, blankAttribute(attributes.length + 1)]);
    };

    const moveAttribute = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= attributes.length) return;
        const next = [...attributes];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next.map((attr, i) => ({ ...attr, order: i + 1 })));
    };

    const addOption = (index: number) => {
        const raw = (optionInputs[index] ?? '').trim();
        if (!raw) return;
        const current = attributes[index].options ?? [];
        if (current.includes(raw)) {
            setOptionInputs(prev => ({ ...prev, [index]: '' }));
            return;
        }
        updateAttribute(index, { options: [...current, raw] });
        setOptionInputs(prev => ({ ...prev, [index]: '' }));
    };

    const removeOption = (index: number, option: string) => {
        const current = attributes[index].options ?? [];
        updateAttribute(index, { options: current.filter(o => o !== option) });
    };

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: PRIMARY_COLOR }}>
                        Custom Attributes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Add fields unique to this category. They appear on asset and request forms for this category only.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addAttribute}
                    sx={{
                        color: PRIMARY_COLOR,
                        borderColor: alpha(PRIMARY_COLOR, 0.4),
                        '&:hover': { borderColor: PRIMARY_COLOR, bgcolor: alpha(PRIMARY_COLOR, 0.04) },
                    }}
                >
                    Add Attribute
                </Button>
            </Stack>

            {attributes.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        py: 5,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: `1px dashed ${alpha(PRIMARY_COLOR, 0.25)}`,
                        bgcolor: alpha(PRIMARY_COLOR, 0.02),
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        No custom attributes yet — click <strong>Add Attribute</strong> to create one.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2} sx={{ maxHeight: '55vh', overflowY: 'auto', pr: 0.5 }}>
                    {attributes.map((attr, idx) => (
                        <Paper
                            key={idx}
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                borderColor: alpha(PRIMARY_COLOR, 0.18),
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box
                                        sx={{
                                            bgcolor: PRIMARY_COLOR,
                                            color: '#fff',
                                            borderRadius: '50%',
                                            width: 22,
                                            height: 22,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {idx + 1}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        {attr.label || `Attribute ${idx + 1}`}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5}>
                                    <Tooltip title="Move up">
                                        <span>
                                            <IconButton
                                                size="small"
                                                disabled={idx === 0}
                                                onClick={() => moveAttribute(idx, -1)}
                                            >
                                                <ArrowUpwardIcon sx={{ fontSize: '1rem' }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="Move down">
                                        <span>
                                            <IconButton
                                                size="small"
                                                disabled={idx === attributes.length - 1}
                                                onClick={() => moveAttribute(idx, 1)}
                                            >
                                                <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="Remove attribute">
                                        <IconButton
                                            size="small"
                                            onClick={() => removeAttribute(idx)}
                                            sx={{ color: '#C53030' }}
                                        >
                                            <DeleteOutlineIcon sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Stack>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        label="Label"
                                        value={attr.label}
                                        onChange={(e) => {
                                            const label = e.target.value;
                                            const patch: Partial<ICustomAttribute> = { label };
                                            // Auto-populate key on label change if user hasn't customized it
                                            if (!attr.key || attr.key === slugifyKey(attr.label)) {
                                                patch.key = slugifyKey(label);
                                            }
                                            updateAttribute(idx, patch);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        label="Key (used in API payload)"
                                        value={attr.key}
                                        onChange={(e) => updateAttribute(idx, { key: slugifyKey(e.target.value) })}
                                        helperText="Lowercase, no spaces — e.g. warranty_months"
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Select
                                        size="small"
                                        fullWidth
                                        value={attr.dataType}
                                        onChange={(e) =>
                                            updateAttribute(idx, {
                                                dataType: e.target.value as CustomAttributeDataType,
                                                options:
                                                    e.target.value === 'SELECT'
                                                        ? attr.options ?? []
                                                        : [],
                                            })
                                        }
                                    >
                                        {Object.entries(DATA_TYPE_LABELS).map(([k, v]) => (
                                            <MenuItem key={k} value={k}>
                                                {v}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        label="Helper text"
                                        value={attr.helperText ?? ''}
                                        onChange={(e) => updateAttribute(idx, { helperText: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={attr.required}
                                                onChange={(e) => updateAttribute(idx, { required: e.target.checked })}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Typography variant="caption" color="text.secondary">
                                                Required on submission
                                            </Typography>
                                        }
                                    />
                                </Grid>

                                {attr.dataType === 'SELECT' && (
                                    <Grid item xs={12}>
                                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                label="Add option"
                                                value={optionInputs[idx] ?? ''}
                                                onChange={(e) =>
                                                    setOptionInputs(prev => ({ ...prev, [idx]: e.target.value }))
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addOption(idx);
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => addOption(idx)}
                                                sx={{
                                                    color: PRIMARY_COLOR,
                                                    borderColor: alpha(PRIMARY_COLOR, 0.4),
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </Stack>
                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.5}>
                                            {(attr.options ?? []).map((opt) => (
                                                <Chip
                                                    key={opt}
                                                    label={opt}
                                                    size="small"
                                                    onDelete={() => removeOption(idx, opt)}
                                                    sx={{
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                                        color: PRIMARY_COLOR,
                                                    }}
                                                />
                                            ))}
                                            {(attr.options ?? []).length === 0 && (
                                                <Typography variant="caption" color="text.secondary">
                                                    No options yet — add one above.
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default CustomAttributesEditor;
