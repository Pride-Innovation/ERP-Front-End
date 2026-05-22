/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Stack,
    Switch,
    Typography,
    alpha,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { InputComponent } from '../../components/forms/Inputs';
import SelectComponent from '../../components/forms/Select';
import AutocompleteComponent from '../../components/forms/Autocomplete';
import { useDebounce } from '../../hooks/useDebounce';
import { IOptions } from '../../components/tables/interface';
import { brand } from '../../utils/tokens';
import { IAssetType } from '../settings/assetTypes/interface';
import { IBranch } from '../settings/branch/interface';
import { IRole } from '../settings/interface';
import StepCard from './StepCard';
import WorkflowTester from './WorkflowTester';
import {
    BRANCH_SCOPE_LABELS,
    IApprovalStep,
    IApprovalWorkflow,
} from './interface';
import { searchAssetTypesForWorkflowService } from './service';
import { blankApprovalStep, blankApprovalWorkflow } from './utills';

const TEAL = brand[800];

interface IWorkflowFormProps {
    initial?: IApprovalWorkflow;
    branches: IBranch[];
    roles: IRole[];
    onSave: (dto: IApprovalWorkflow) => Promise<any>;
    onCancel: () => void;
}

const WorkflowForm: React.FC<IWorkflowFormProps> = ({ initial, branches, roles, onSave, onCancel }) => {
    const [form, setForm] = useState<IApprovalWorkflow>(initial ?? blankApprovalWorkflow());
    const [saving, setSaving] = useState(false);
    const isEdit = !!initial?.id;

    const [catOptions, setCatOptions] = useState<IOptions[]>([]);
    const [catSearch, setCatSearch] = useState('');
    const debouncedCatSearch = useDebounce(catSearch, 400);

    useEffect(() => {
        searchAssetTypesForWorkflowService()
            .then((r) => {
                const items: IAssetType[] = r.data?.content ?? r.data ?? [];
                setCatOptions(items.map((a) => ({ value: a.id as number, label: a.name })));
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const q = debouncedCatSearch.trim();
        if (!q) return;
        searchAssetTypesForWorkflowService(q)
            .then((r) => {
                const items: IAssetType[] = r.data?.content ?? r.data ?? [];
                setCatOptions(items.map((a) => ({ value: a.id as number, label: a.name })));
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedCatSearch]);

    const setField = (field: keyof IApprovalWorkflow, value: any) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleStepChange = (idx: number, field: keyof IApprovalStep, value: any) => {
        setForm((prev) => {
            const steps = [...prev.steps];
            steps[idx] = { ...steps[idx], [field]: value };
            return { ...prev, steps };
        });
    };

    const addStep = () => {
        setForm((prev) => ({
            ...prev,
            steps: [...prev.steps, blankApprovalStep(prev.steps.length + 1)],
        }));
    };

    const removeStep = (idx: number) => {
        setForm((prev) => {
            const steps = prev.steps
                .filter((_, i) => i !== idx)
                .map((s, i) => ({ ...s, stepOrder: i + 1 }));
            return { ...prev, steps };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(form);
            onCancel();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            <Box sx={{
                px: 3, py: 2,
                borderBottom: `1px solid ${alpha(TEAL, 0.15)}`,
                bgcolor: '#fff',
                flexShrink: 0,
            }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <IconButton size="small" onClick={onCancel}
                            sx={{
                                color: TEAL,
                                border: `1px solid ${alpha(TEAL, 0.3)}`,
                                '&:hover': { bgcolor: alpha(TEAL, 0.06) },
                            }}>
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                        <Box>
                            <Typography variant="h6" fontWeight={700} color={TEAL}>
                                {isEdit ? `Edit: ${initial!.name}` : 'New Approval Workflow'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isEdit
                                    ? 'Update workflow configuration and approval steps'
                                    : 'Define workflow routing and approval steps'}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" onClick={onCancel}
                            sx={{ color: 'text.secondary', borderColor: alpha('#000', 0.2) }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={saving
                                ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                                : <SaveOutlinedIcon />}
                            onClick={handleSave}
                            disabled={saving || !form.name.trim()}
                            sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#03413A' }, minWidth: 120 }}
                        >
                            {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>

                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: alpha(TEAL, 0.2), mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
                        <Box sx={{ bgcolor: alpha(TEAL, 0.1), borderRadius: 1.5, p: 0.75 }}>
                            <AccountTreeOutlinedIcon sx={{ color: TEAL, fontSize: '1.1rem', display: 'block' }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} color={TEAL}>
                            Workflow Settings
                        </Typography>
                    </Stack>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <InputComponent
                                label="Workflow Name"
                                required
                                field={{
                                    value: form.name,
                                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                                        setField('name', e.target.value),
                                }}
                                error={undefined}
                                id="workflow-name"
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <InputComponent
                                label="Description"
                                field={{
                                    value: form.description,
                                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                                        setField('description', e.target.value),
                                }}
                                error={undefined}
                                id="workflow-description"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}
                                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Applicability
                            </Typography>
                            <Divider sx={{ mt: 0.5 }} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <AutocompleteComponent
                                label="Asset Categories"
                                multiple
                                options={catOptions}
                                field={{
                                    value: form.assetTypeIds,
                                    onChange: (newIds: number[]) =>
                                        setField('assetTypeIds', newIds ?? []),
                                }}
                                error={undefined}
                                onInputChange={(_event: any, val: string) => setCatSearch(val)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <SelectComponent
                                id="branch"
                                label="Branch"
                                required={false}
                                field={{
                                    value: String(form.branchId ?? ''),
                                    onChange: (e: any) =>
                                        setField('branchId', e.target.value ? Number(e.target.value) : null),
                                }}
                                error={undefined}
                                options={[
                                    { value: '', label: 'Any branch' },
                                    ...branches.map((b) => ({ value: String(b.id), label: b.name })),
                                ]}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <SelectComponent
                                id="branch-scope"
                                label="Branch Scope"
                                required={false}
                                field={{
                                    value: form.branchScope,
                                    onChange: (e: any) => setField('branchScope', e.target.value),
                                }}
                                error={undefined}
                                options={Object.entries(BRANCH_SCOPE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <AutocompleteComponent
                                label="Applies to requester roles (empty = all roles)"
                                multiple
                                options={roles.map((r) => ({ value: r.id as number, label: r.name }))}
                                field={{
                                    value: form.requesterRoleIds ?? [],
                                    onChange: (newIds: number[]) =>
                                        setField('requesterRoleIds', newIds ?? []),
                                }}
                                error={undefined}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}
                                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Priority &amp; Status
                            </Typography>
                            <Divider sx={{ mt: 0.5 }} />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <InputComponent
                                label="Priority"
                                type="number"
                                field={{
                                    value: String(form.priority),
                                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                                        setField('priority', parseInt(e.target.value) || 0),
                                }}
                                error={undefined}
                                id="priority"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={form.active}
                                        onChange={(e) => setField('active', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>Active</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {form.active
                                                ? 'Workflow will be used for matching requests'
                                                : 'Workflow is disabled and will be skipped'}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {isEdit && <WorkflowTester branches={branches} />}

                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: alpha(TEAL, 0.2) }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} color={TEAL}>
                                Approval Steps
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Steps execute left-to-right — {form.steps.length} step{form.steps.length !== 1 ? 's' : ''} configured
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined" size="small"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={addStep}
                            sx={{
                                color: TEAL,
                                borderColor: alpha(TEAL, 0.4),
                                '&:hover': { borderColor: TEAL, bgcolor: alpha(TEAL, 0.04) },
                            }}>
                            Add Step
                        </Button>
                    </Stack>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            overflowX: 'auto',
                            pb: 1.5,
                            gap: 0,
                            '&::-webkit-scrollbar': { height: 6 },
                            '&::-webkit-scrollbar-track': { borderRadius: 3, bgcolor: alpha(TEAL, 0.04) },
                            '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: alpha(TEAL, 0.2) },
                        }}
                    >
                        {form.steps.map((step, idx) => (
                            <React.Fragment key={idx}>
                                <StepCard
                                    step={step}
                                    index={idx}
                                    total={form.steps.length}
                                    roles={roles}
                                    onChange={handleStepChange}
                                    onRemove={removeStep}
                                />
                                {idx < form.steps.length - 1 && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        pt: 2,
                                        px: 0.75,
                                        flexShrink: 0,
                                    }}>
                                        <ArrowForwardIcon sx={{ color: alpha(TEAL, 0.4), fontSize: '1.3rem' }} />
                                    </Box>
                                )}
                            </React.Fragment>
                        ))}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default WorkflowForm;
