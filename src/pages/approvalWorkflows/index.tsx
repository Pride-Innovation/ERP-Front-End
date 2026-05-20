/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../core/apis/axiosInstance';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fade,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Stack,
    Switch,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { InputComponent } from '../../components/forms/Inputs';
import SelectComponent from '../../components/forms/Select';
import AutocompleteComponent from '../../components/forms/Autocomplete';
import { useDebounce } from '../../hooks/useDebounce';
import { IOptions } from '../../components/tables/interface';

const TEAL = '#05544B';
const GOLD = '#BC892C';

// ── Interfaces ──────────────────────────────────────────────────────────────

interface ApprovalStepDTO {
    id?: number;
    stepOrder: number;
    stepName: string;
    stepType: string;
    approverType: string;
    groupEmail: string;
    specificUserId: string;
    notifyGroupEmail: string;
    optional: boolean;
    escalationHours: number;
}

interface ApprovalWorkflowDTO {
    id?: number;
    name: string;
    description: string;
    assetTypeIds: number[];
    assetTypeNames?: string[];
    branchId: number | null;
    branchName?: string;
    branchScope: string;
    active: boolean;
    priority: number;
    steps: ApprovalStepDTO[];
}

interface IAssetType { id: number; name: string; }
interface IBranch { id: number; name: string; }

// ── Blank templates ──────────────────────────────────────────────────────────

const blankStep = (order = 1): ApprovalStepDTO => ({
    stepOrder: order,
    stepName: '',
    stepType: 'ACKNOWLEDGE_REQUEST',
    approverType: 'DIRECT_SUPERVISOR',
    groupEmail: '',
    specificUserId: '',
    notifyGroupEmail: '',
    optional: false,
    escalationHours: 48,
});

const blankWorkflow = (): ApprovalWorkflowDTO => ({
    name: '',
    description: '',
    assetTypeIds: [],
    branchId: null,
    branchScope: 'ALL',
    active: true,
    priority: 0,
    steps: [blankStep(1)],
});

// ── Enum display helpers ─────────────────────────────────────────────────────

const STEP_TYPE_LABELS: Record<string, string> = {
    ACKNOWLEDGE_REQUEST:  'Acknowledge Request',   // Supervisor/manager acknowledges the raised request
    REQUEST_APPROVAL:     'Approve Request',        // Formal authority approves or rejects
    ISSUE:                'Issue Asset',            // Store / admin physically issues the asset
    APPROVE_ISSUANCE:     'Approve Issuance',       // Sign-off confirming the asset was issued
    ACKNOWLEDGE_RECEIPT:  'Acknowledge Receipt',    // Requester confirms they received the item
};

const APPROVER_TYPE_LABELS: Record<string, string> = {
    DIRECT_SUPERVISOR: 'Direct Supervisor',
    DEPT_HEAD: 'Department Head',
    BOM: 'Branch Operations Manager',
    BRANCH_MANAGER: 'Branch Manager',
    ADMIN: 'Admin',
    GROUP_EMAIL: 'Group Email',
    SPECIFIC_USER: 'Specific User',
};

const BRANCH_SCOPE_LABELS: Record<string, string> = {
    ALL: 'All Branches',
    HEAD_OFFICE: 'Head Office Only',
    BRANCH: 'Branch Only',
};

// ── Step Card (horizontal layout) ────────────────────────────────────────────

const StepCard: React.FC<{
    step: ApprovalStepDTO;
    index: number;
    total: number;
    onChange: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
}> = ({ step, index, total, onChange, onRemove }) => (
    <Paper
        variant="outlined"
        sx={{
            p: 2,
            width: 280,
            minWidth: 280,
            flexShrink: 0,
            borderRadius: 2,
            borderColor: alpha(TEAL, 0.25),
            '&:hover': { borderColor: TEAL, boxShadow: `0 2px 10px ${alpha(TEAL, 0.08)}` },
            transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
    >
        {/* Step header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <DragIndicatorIcon sx={{ color: alpha(TEAL, 0.35), fontSize: '1rem' }} />
                <Box sx={{
                    bgcolor: TEAL, borderRadius: '50%', width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}>
                        {index + 1}
                    </Typography>
                </Box>
                <Typography variant="subtitle2" fontWeight={700} color={TEAL} noWrap sx={{ maxWidth: 130 }}>
                    {step.stepName || `Step ${index + 1}`}
                </Typography>
                {step.optional && (
                    <Chip label="Opt" size="small"
                        sx={{ fontSize: '0.6rem', height: 16, bgcolor: alpha(GOLD, 0.12), color: GOLD }} />
                )}
            </Stack>
            {total > 1 && (
                <Tooltip title="Remove step">
                    <IconButton size="small" onClick={() => onRemove(index)}
                        sx={{ color: '#C53030', p: 0.25, '&:hover': { bgcolor: alpha('#C53030', 0.08) } }}>
                        <RemoveCircleOutlineIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                </Tooltip>
            )}
        </Stack>

        <Stack spacing={2}>
            <InputComponent
                label="Step Name"
                required
                field={{
                    value: step.stepName,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(index, 'stepName', e.target.value),
                }}
                error={undefined}
                id={`step-name-${index}`}
            />
            <SelectComponent
                id={`step-type-${index}`}
                label="Step Type"
                required={false}
                field={{
                    value: step.stepType,
                    onChange: (e: any) => onChange(index, 'stepType', e.target.value),
                }}
                error={undefined}
                options={Object.entries(STEP_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
            <SelectComponent
                id={`approver-type-${index}`}
                label="Approver Type"
                required={false}
                field={{
                    value: step.approverType,
                    onChange: (e: any) => onChange(index, 'approverType', e.target.value),
                }}
                error={undefined}
                options={Object.entries(APPROVER_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
            {step.approverType === 'GROUP_EMAIL' && (
                <InputComponent
                    label="Group Email"
                    field={{
                        value: step.groupEmail,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                            onChange(index, 'groupEmail', e.target.value),
                    }}
                    error={undefined}
                    id={`group-email-${index}`}
                />
            )}
            {step.approverType === 'SPECIFIC_USER' && (
                <InputComponent
                    label="Specific User ID"
                    type="number"
                    field={{
                        value: step.specificUserId,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                            onChange(index, 'specificUserId', e.target.value),
                    }}
                    error={undefined}
                    id={`specific-user-${index}`}
                />
            )}
            <InputComponent
                label="CC / Notify Email"
                field={{
                    value: step.notifyGroupEmail,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(index, 'notifyGroupEmail', e.target.value),
                }}
                error={undefined}
                id={`notify-email-${index}`}
            />
            <InputComponent
                label="Escalation (hrs)"
                type="number"
                field={{
                    value: String(step.escalationHours),
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(index, 'escalationHours', parseInt(e.target.value) || 0),
                }}
                error={undefined}
                id={`escalation-${index}`}
            />
            <FormControlLabel
                control={
                    <Switch
                        size="small"
                        checked={step.optional}
                        onChange={(e) => onChange(index, 'optional', e.target.checked)}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="caption" color="text.secondary">
                        Optional step
                    </Typography>
                }
            />
        </Stack>
    </Paper>
);

// ── Workflow Form (full page) ──────────────────────────────────────────────────

const WorkflowForm: React.FC<{
    initial?: ApprovalWorkflowDTO;
    branches: IBranch[];
    onSave: (dto: ApprovalWorkflowDTO) => Promise<void>;
    onCancel: () => void;
}> = ({ initial, branches, onSave, onCancel }) => {
    const [form, setForm] = useState<ApprovalWorkflowDTO>(initial ?? blankWorkflow());
    const [saving, setSaving] = useState(false);
    const isEdit = !!initial?.id;

    // ── Asset category async autocomplete ──────────────────────────────────
    const [catOptions, setCatOptions] = useState<IOptions[]>([]);
    const [catSearch, setCatSearch] = useState('');
    const debouncedCatSearch = useDebounce(catSearch, 400);

    // Load first 10 categories on mount; also pre-populate selections for edit
    useEffect(() => {
        axiosInstance.get(`asset-types?pageNumber=0&pageSize=10`)
            .then((r) => {
                const items: IAssetType[] = r.data?.content ?? r.data ?? [];
                setCatOptions(items.map((a) => ({ value: a.id, label: a.name })));
            })
            .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Search backend when user types
    useEffect(() => {
        const q = debouncedCatSearch.trim();
        if (!q) return;
        axiosInstance.get(`asset-types?pageNumber=0&pageSize=10&name=${encodeURIComponent(q)}`)
            .then((r) => {
                const items: IAssetType[] = r.data?.content ?? r.data ?? [];
                setCatOptions(items.map((a) => ({ value: a.id, label: a.name })));
            })
            .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedCatSearch]);

    const setField = (field: string, value: any) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleStepChange = (idx: number, field: string, value: any) => {
        setForm((prev) => {
            const steps = [...prev.steps];
            steps[idx] = { ...steps[idx], [field]: value };
            return { ...prev, steps };
        });
    };

    const addStep = () => {
        setForm((prev) => ({
            ...prev,
            steps: [...prev.steps, blankStep(prev.steps.length + 1)],
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

            {/* ── Page Header ── */}
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
                                {isEdit ? `Edit: ${initial.name}` : 'New Approval Workflow'}
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

            {/* ── Body ── */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>

                {/* ── Workflow Settings (horizontal grid) ── */}
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
                        {/* Row 1: Name + Description */}
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

                        {/* Divider label */}
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}
                                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Applicability
                            </Typography>
                            <Divider sx={{ mt: 0.5 }} />
                        </Grid>

                        {/* Row 2: Asset Category, Branch, Branch Scope */}
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

                        {/* Divider label */}
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}
                                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Priority &amp; Status
                            </Typography>
                            <Divider sx={{ mt: 0.5 }} />
                        </Grid>

                        {/* Row 3: Priority + Active */}
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

                {/* ── Approval Steps (horizontal) ── */}
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

                    {/* Horizontal scrollable step row */}
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

// ── Main Page ─────────────────────────────────────────────────────────────────

type PageView = 'list' | 'form';

const ApprovalWorkflows: React.FC = () => {
    const [view, setView] = useState<PageView>('list');
    const [workflows, setWorkflows] = useState<ApprovalWorkflowDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<ApprovalWorkflowDTO | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<ApprovalWorkflowDTO | null>(null);
    const [branches, setBranches] = useState<IBranch[]>([]);

    const load = () => {
        setLoading(true);
        axiosInstance.get<ApprovalWorkflowDTO[]>(`approval-workflows`)
            .then((r) => setWorkflows(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        axiosInstance.get(`branches?pageNumber=0&pageSize=200`).then((r) => setBranches(r.data?.content ?? [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreate = () => { setEditing(undefined); setView('form'); };
    const openEdit = (wf: ApprovalWorkflowDTO) => { setEditing(wf); setView('form'); };
    const closeForm = () => { setView('list'); setEditing(undefined); };

    const handleSave = async (dto: ApprovalWorkflowDTO) => {
        if (dto.id) {
            await axiosInstance.put(`approval-workflows/${dto.id}`, dto);
        } else {
            await axiosInstance.post(`approval-workflows`, dto);
        }
        load();
    };

    const handleToggle = async (id: number) => {
        await axiosInstance.put(`approval-workflows/${id}/toggle-active`);
        load();
    };

    const handleDelete = async () => {
        if (!deleteTarget?.id) return;
        await axiosInstance.delete(`approval-workflows/${deleteTarget.id}`);
        setDeleteTarget(null);
        load();
    };

    // ── Form view ──────────────────────────────────────────────────────────
    if (view === 'form') {
        return (
            <WorkflowForm
                initial={editing}
                branches={branches}
                onSave={handleSave}
                onCancel={closeForm}
            />
        );
    }

    // ── List view ──────────────────────────────────────────────────────────
    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ bgcolor: alpha(TEAL, 0.1), borderRadius: 2, p: 1 }}>
                        <AccountTreeOutlinedIcon sx={{ color: TEAL, fontSize: '1.5rem' }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color={TEAL}>
                            Approval Workflows
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Configure approval routing for asset requests
                        </Typography>
                    </Box>
                </Stack>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
                    sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#03413A' }, borderRadius: 2 }}>
                    New Workflow
                </Button>
            </Stack>

            {/* List */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress sx={{ color: TEAL }} />
                </Box>
            ) : workflows.length === 0 ? (
                <Paper variant="outlined"
                    sx={{ py: 8, textAlign: 'center', borderRadius: 3, borderColor: alpha(TEAL, 0.2) }}>
                    <AccountTreeOutlinedIcon sx={{ color: '#ccc', fontSize: '3rem', mb: 1 }} />
                    <Typography color="text.secondary">No workflows configured yet.</Typography>
                    <Button variant="outlined" startIcon={<AddIcon />}
                        sx={{ mt: 2, color: TEAL, borderColor: TEAL }}
                        onClick={openCreate}>
                        Create your first workflow
                    </Button>
                </Paper>
            ) : (
                workflows.map((wf) => (
                    <Fade in key={wf.id}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5, mb: 2, borderRadius: 3,
                                borderColor: alpha(wf.active ? TEAL : '#999', 0.2),
                                opacity: wf.active ? 1 : 0.65,
                                '&:hover': {
                                    borderColor: alpha(wf.active ? TEAL : '#999', 0.5),
                                    boxShadow: `0 2px 12px ${alpha(TEAL, 0.06)}`,
                                },
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}>
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                                <Box flex={1}>
                                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5} flexWrap="wrap">
                                        <Typography variant="subtitle1" fontWeight={700}>{wf.name}</Typography>
                                        <Chip label={wf.active ? 'Active' : 'Inactive'} size="small"
                                            sx={{
                                                bgcolor: wf.active ? alpha(TEAL, 0.1) : alpha('#999', 0.1),
                                                color: wf.active ? TEAL : '#666',
                                                fontWeight: 700, fontSize: '0.68rem',
                                            }} />
                                        <Chip label={`Priority ${wf.priority}`} size="small" variant="outlined"
                                            sx={{ fontSize: '0.68rem' }} />
                                        <Chip label={BRANCH_SCOPE_LABELS[wf.branchScope] ?? wf.branchScope} size="small"
                                            sx={{ bgcolor: alpha(GOLD, 0.1), color: GOLD, fontSize: '0.68rem' }} />
                                    </Stack>

                                    {wf.description && (
                                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                            {wf.description}
                                        </Typography>
                                    )}

                                    <Stack direction="row" spacing={1} mt={0.75} flexWrap="wrap" gap={0.5}>
                                        {(wf.assetTypeNames ?? []).map((name) => (
                                            <Chip key={name} label={name} size="small" variant="outlined"
                                                sx={{ fontSize: '0.68rem' }} />
                                        ))}
                                        {wf.branchName && (
                                            <Chip label={`Branch: ${wf.branchName}`} size="small" variant="outlined"
                                                sx={{ fontSize: '0.68rem' }} />
                                        )}
                                        <Chip label={`${wf.steps?.length ?? 0} step${(wf.steps?.length ?? 0) !== 1 ? 's' : ''}`}
                                            size="small"
                                            sx={{ bgcolor: alpha(TEAL, 0.06), color: TEAL, fontSize: '0.68rem' }} />
                                        {(wf.steps?.length ?? 0) > 0 && (
                                            <Stack direction="row" alignItems="center" gap={0.4} flexWrap="wrap">
                                                {wf.steps.map((s, i) => (
                                                    <React.Fragment key={i}>
                                                        <Typography variant="caption" color="text.secondary"
                                                            sx={{
                                                                bgcolor: alpha('#000', 0.04),
                                                                px: 0.8, py: 0.2,
                                                                borderRadius: 1,
                                                                fontSize: '0.65rem',
                                                            }}>
                                                            {s.stepName || `Step ${i + 1}`}
                                                        </Typography>
                                                        {i < wf.steps.length - 1 && (
                                                            <Typography variant="caption" color="text.disabled"
                                                                sx={{ fontSize: '0.6rem' }}>→</Typography>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </Stack>
                                        )}
                                    </Stack>
                                </Box>

                                <Stack direction="row" spacing={0.5} flexShrink={0}>
                                    <Tooltip title={wf.active ? 'Deactivate' : 'Activate'}>
                                        <IconButton size="small" onClick={() => handleToggle(wf.id!)}
                                            sx={{ color: wf.active ? TEAL : '#999' }}>
                                            <PowerSettingsNewIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit workflow">
                                        <IconButton size="small" onClick={() => openEdit(wf)}
                                            sx={{ color: GOLD }}>
                                            <EditOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete workflow">
                                        <IconButton size="small" onClick={() => setDeleteTarget(wf)}
                                            sx={{ color: '#C53030' }}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Fade>
                ))
            )}

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Workflow</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>?
                        This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ApprovalWorkflows;
