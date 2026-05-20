/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited without authorization.
Managing Director
*/

import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Stack,
    Switch,
    TextField,
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

const TEAL = '#05544B';
const GOLD = '#BC892C';
const BASE_URL = process.env.REACT_APP_BASE_URL;

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
    assetTypeId: number | null;
    assetTypeName?: string;
    branchId: number | null;
    branchName?: string;
    branchScope: string;
    active: boolean;
    priority: number;
    steps: ApprovalStepDTO[];
}

interface IAssetType { id: number; name: string; }
interface IBranch { id: number; branchName: string; }

// ── Blank templates ──────────────────────────────────────────────────────────

const blankStep = (order = 1): ApprovalStepDTO => ({
    stepOrder: order,
    stepName: '',
    stepType: 'REQUEST_APPROVAL',
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
    assetTypeId: null,
    branchId: null,
    branchScope: 'ALL',
    active: true,
    priority: 0,
    steps: [blankStep(1)],
});

// ── Enum display helpers ─────────────────────────────────────────────────────

const STEP_TYPE_LABELS: Record<string, string> = {
    REQUEST_APPROVAL: 'Request Approval',
    ISSUANCE: 'Issuance',
    ACKNOWLEDGE_RECEIPT: 'Acknowledge Receipt',
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

// ── Step Card ─────────────────────────────────────────────────────────────────

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
            p: 2.5,
            mb: 2,
            borderRadius: 2,
            borderColor: alpha(TEAL, 0.25),
            '&:hover': { borderColor: TEAL, boxShadow: `0 2px 10px ${alpha(TEAL, 0.08)}` },
            transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
    >
        {/* Step header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <DragIndicatorIcon sx={{ color: alpha(TEAL, 0.35), fontSize: '1.1rem' }} />
                <Box sx={{ bgcolor: TEAL, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>{index + 1}</Typography>
                </Box>
                <Typography variant="subtitle2" fontWeight={700} color={TEAL}>
                    {step.stepName || `Step ${index + 1}`}
                </Typography>
                {step.optional && (
                    <Chip label="Optional" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: alpha(GOLD, 0.12), color: GOLD }} />
                )}
            </Stack>
            {total > 1 && (
                <Tooltip title="Remove this step">
                    <IconButton size="small" onClick={() => onRemove(index)}
                        sx={{ color: '#C53030', '&:hover': { bgcolor: alpha('#C53030', 0.08) } }}>
                        <RemoveCircleOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Stack>

        <Stack spacing={2}>
            <TextField
                label="Step Name" size="small" fullWidth required
                value={step.stepName}
                onChange={(e) => onChange(index, 'stepName', e.target.value)}
                placeholder="e.g. Manager Approval"
            />
            <Stack direction="row" spacing={2}>
                <FormControl size="small" fullWidth>
                    <InputLabel>Step Type</InputLabel>
                    <Select value={step.stepType} label="Step Type"
                        onChange={(e: SelectChangeEvent) => onChange(index, 'stepType', e.target.value)}>
                        {Object.entries(STEP_TYPE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                    <InputLabel>Approver Type</InputLabel>
                    <Select value={step.approverType} label="Approver Type"
                        onChange={(e: SelectChangeEvent) => onChange(index, 'approverType', e.target.value)}>
                        {Object.entries(APPROVER_TYPE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>
            {step.approverType === 'GROUP_EMAIL' && (
                <TextField label="Group Email Address" size="small" fullWidth
                    value={step.groupEmail}
                    onChange={(e) => onChange(index, 'groupEmail', e.target.value)}
                    placeholder="e.g. managers@pridebank.co.ug" />
            )}
            {step.approverType === 'SPECIFIC_USER' && (
                <TextField label="Specific User ID" size="small" fullWidth type="number"
                    value={step.specificUserId}
                    onChange={(e) => onChange(index, 'specificUserId', e.target.value)} />
            )}
            <Stack direction="row" spacing={2}>
                <TextField label="CC / Notify Email" size="small" fullWidth
                    value={step.notifyGroupEmail}
                    onChange={(e) => onChange(index, 'notifyGroupEmail', e.target.value)}
                    placeholder="e.g. hod@pridebank.co.ug" />
                <TextField label="Escalation (hours)" size="small" type="number" sx={{ width: 180 }}
                    value={step.escalationHours}
                    onChange={(e) => onChange(index, 'escalationHours', parseInt(e.target.value) || 0)} />
            </Stack>
            <FormControlLabel
                control={
                    <Switch size="small" checked={step.optional}
                        onChange={(e) => onChange(index, 'optional', e.target.checked)}
                        sx={{ '& .MuiSwitch-thumb': { bgcolor: step.optional ? GOLD : undefined } }} />
                }
                label={<Typography variant="caption" color="text.secondary">Mark as optional step (can be skipped)</Typography>}
            />
        </Stack>
    </Paper>
);

// ── Workflow Form (full page) ──────────────────────────────────────────────────

const WorkflowForm: React.FC<{
    initial?: ApprovalWorkflowDTO;
    assetTypes: IAssetType[];
    branches: IBranch[];
    onSave: (dto: ApprovalWorkflowDTO) => Promise<void>;
    onCancel: () => void;
}> = ({ initial, assetTypes, branches, onSave, onCancel }) => {
    const [form, setForm] = useState<ApprovalWorkflowDTO>(initial ?? blankWorkflow());
    const [saving, setSaving] = useState(false);
    const isEdit = !!initial?.id;

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
            {/* Page Header */}
            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${alpha(TEAL, 0.15)}`, bgcolor: '#fff', flexShrink: 0 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <IconButton size="small" onClick={onCancel}
                            sx={{ color: TEAL, border: `1px solid ${alpha(TEAL, 0.3)}`, '&:hover': { bgcolor: alpha(TEAL, 0.06) } }}>
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                        <Box>
                            <Typography variant="h6" fontWeight={700} color={TEAL}>
                                {isEdit ? `Edit: ${initial.name}` : 'New Approval Workflow'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isEdit ? 'Update workflow configuration and approval steps' : 'Define workflow routing and approval steps'}
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
                            startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveOutlinedIcon />}
                            onClick={handleSave}
                            disabled={saving || !form.name.trim()}
                            sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#03413A' }, minWidth: 120 }}
                        >
                            {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* Two-column body */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">

                    {/* ── LEFT: Workflow Settings ── */}
                    <Box sx={{ width: { xs: '100%', lg: 380 }, flexShrink: 0 }}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: alpha(TEAL, 0.2) }}>
                            <Typography variant="subtitle1" fontWeight={700} color={TEAL} mb={2.5}>
                                Workflow Settings
                            </Typography>

                            <Stack spacing={2.5}>
                                <TextField
                                    label="Workflow Name" size="small" fullWidth required
                                    value={form.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    placeholder="e.g. Head Office IT Request" />

                                <TextField
                                    label="Description" size="small" fullWidth multiline rows={3}
                                    value={form.description}
                                    onChange={(e) => setField('description', e.target.value)}
                                    placeholder="Briefly describe when this workflow applies…" />

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1.5}>
                                        APPLICABILITY
                                    </Typography>
                                    <Stack spacing={2}>
                                        <FormControl size="small" fullWidth>
                                            <InputLabel>Asset Category (optional)</InputLabel>
                                            <Select value={form.assetTypeId ?? ''} label="Asset Category (optional)"
                                                onChange={(e) => setField('assetTypeId', e.target.value || null)}>
                                                <MenuItem value=""><em>Any category</em></MenuItem>
                                                {assetTypes.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                        <FormControl size="small" fullWidth>
                                            <InputLabel>Branch (optional)</InputLabel>
                                            <Select value={form.branchId ?? ''} label="Branch (optional)"
                                                onChange={(e) => setField('branchId', e.target.value || null)}>
                                                <MenuItem value=""><em>Any branch</em></MenuItem>
                                                {branches.map((b) => <MenuItem key={b.id} value={b.id}>{b.branchName}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                        <FormControl size="small" fullWidth>
                                            <InputLabel>Branch Scope</InputLabel>
                                            <Select value={form.branchScope} label="Branch Scope"
                                                onChange={(e: SelectChangeEvent) => setField('branchScope', e.target.value)}>
                                                {Object.entries(BRANCH_SCOPE_LABELS).map(([k, v]) =>
                                                    <MenuItem key={k} value={k}>{v}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1.5}>
                                        PRIORITY &amp; STATUS
                                    </Typography>
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Priority (lower = higher priority)"
                                            size="small" fullWidth type="number"
                                            value={form.priority}
                                            onChange={(e) => setField('priority', parseInt(e.target.value) || 0)}
                                            helperText="When multiple workflows match, the lowest priority number wins" />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={form.active}
                                                    onChange={(e) => setField('active', e.target.checked)}
                                                    sx={{ '& .MuiSwitch-thumb': { bgcolor: form.active ? TEAL : undefined } }} />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>Active</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {form.active
                                                            ? 'This workflow will be used for matching requests'
                                                            : 'Workflow is disabled and will be skipped'}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Stack>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>

                    {/* ── RIGHT: Approval Steps ── */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: alpha(TEAL, 0.2) }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={700} color={TEAL}>
                                        Approval Steps
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Steps execute in order — {form.steps.length} step{form.steps.length !== 1 ? 's' : ''} configured
                                    </Typography>
                                </Box>
                                <Button
                                    variant="outlined" size="small"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={addStep}
                                    sx={{ color: TEAL, borderColor: alpha(TEAL, 0.4), '&:hover': { borderColor: TEAL, bgcolor: alpha(TEAL, 0.04) } }}>
                                    Add Step
                                </Button>
                            </Stack>

                            {form.steps.map((step, idx) => (
                                <StepCard
                                    key={idx}
                                    step={step}
                                    index={idx}
                                    total={form.steps.length}
                                    onChange={handleStepChange}
                                    onRemove={removeStep}
                                />
                            ))}

                            {/* Flow summary */}
                            <Box sx={{ mt: 1, p: 2, bgcolor: alpha(TEAL, 0.04), borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.75}>
                                    FLOW SUMMARY
                                </Typography>
                                <Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.5}>
                                    {form.steps.map((s, i) => (
                                        <React.Fragment key={i}>
                                            <Chip
                                                label={s.stepName || `Step ${i + 1}`}
                                                size="small"
                                                sx={{ bgcolor: alpha(TEAL, 0.1), color: TEAL, fontSize: '0.7rem' }} />
                                            {i < form.steps.length - 1 && (
                                                <Typography variant="caption" color="text.secondary" mx={0.25}>→</Typography>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <Chip label="Done" size="small"
                                        sx={{ bgcolor: alpha('#2e7d32', 0.1), color: '#2e7d32', fontSize: '0.7rem' }} />
                                </Stack>
                            </Box>
                        </Paper>
                    </Box>
                </Stack>
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
    const [assetTypes, setAssetTypes] = useState<IAssetType[]>([]);
    const [branches, setBranches] = useState<IBranch[]>([]);

    const load = () => {
        setLoading(true);
        axios.get<ApprovalWorkflowDTO[]>(`${BASE_URL}/approval-workflows`)
            .then((r) => setWorkflows(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        axios.get(`${BASE_URL}/asset-types`).then((r) => setAssetTypes(r.data)).catch(() => {});
        axios.get(`${BASE_URL}/branches`).then((r) => setBranches(r.data)).catch(() => {});
    }, []);

    const openCreate = () => { setEditing(undefined); setView('form'); };
    const openEdit = (wf: ApprovalWorkflowDTO) => { setEditing(wf); setView('form'); };
    const closeForm = () => { setView('list'); setEditing(undefined); };

    const handleSave = async (dto: ApprovalWorkflowDTO) => {
        if (dto.id) {
            await axios.put(`${BASE_URL}/approval-workflows/${dto.id}`, dto);
        } else {
            await axios.post(`${BASE_URL}/approval-workflows`, dto);
        }
        load();
    };

    const handleToggle = async (id: number) => {
        await axios.put(`${BASE_URL}/approval-workflows/${id}/toggle-active`);
        load();
    };

    const handleDelete = async () => {
        if (!deleteTarget?.id) return;
        await axios.delete(`${BASE_URL}/approval-workflows/${deleteTarget.id}`);
        setDeleteTarget(null);
        load();
    };

    // ── Form view ──────────────────────────────────────────────────────────
    if (view === 'form') {
        return (
            <WorkflowForm
                initial={editing}
                assetTypes={assetTypes}
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
                        <Typography variant="h6" fontWeight={700} color={TEAL}>Approval Workflows</Typography>
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
                <Paper variant="outlined" sx={{ py: 8, textAlign: 'center', borderRadius: 3, borderColor: alpha(TEAL, 0.2) }}>
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
                                '&:hover': { borderColor: alpha(wf.active ? TEAL : '#999', 0.5), boxShadow: `0 2px 12px ${alpha(TEAL, 0.06)}` },
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}>
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                                <Box flex={1}>
                                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5} flexWrap="wrap">
                                        <Typography variant="subtitle1" fontWeight={700}>{wf.name}</Typography>
                                        <Chip label={wf.active ? 'Active' : 'Inactive'} size="small"
                                            sx={{ bgcolor: wf.active ? alpha(TEAL, 0.1) : alpha('#999', 0.1), color: wf.active ? TEAL : '#666', fontWeight: 700, fontSize: '0.68rem' }} />
                                        <Chip label={`Priority ${wf.priority}`} size="small" variant="outlined" sx={{ fontSize: '0.68rem' }} />
                                        <Chip label={BRANCH_SCOPE_LABELS[wf.branchScope] ?? wf.branchScope} size="small"
                                            sx={{ bgcolor: alpha(GOLD, 0.1), color: GOLD, fontSize: '0.68rem' }} />
                                    </Stack>

                                    {wf.description && (
                                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                            {wf.description}
                                        </Typography>
                                    )}

                                    <Stack direction="row" spacing={1} mt={0.75} flexWrap="wrap" gap={0.5}>
                                        {wf.assetTypeName && (
                                            <Chip label={`Category: ${wf.assetTypeName}`} size="small" variant="outlined" sx={{ fontSize: '0.68rem' }} />
                                        )}
                                        {wf.branchName && (
                                            <Chip label={`Branch: ${wf.branchName}`} size="small" variant="outlined" sx={{ fontSize: '0.68rem' }} />
                                        )}
                                        <Chip label={`${wf.steps?.length ?? 0} step${(wf.steps?.length ?? 0) !== 1 ? 's' : ''}`} size="small"
                                            sx={{ bgcolor: alpha(TEAL, 0.06), color: TEAL, fontSize: '0.68rem' }} />
                                        {(wf.steps?.length ?? 0) > 0 && (
                                            <Stack direction="row" alignItems="center" gap={0.4} flexWrap="wrap">
                                                {wf.steps.map((s, i) => (
                                                    <React.Fragment key={i}>
                                                        <Typography variant="caption" color="text.secondary"
                                                            sx={{ bgcolor: alpha('#000', 0.04), px: 0.8, py: 0.2, borderRadius: 1, fontSize: '0.65rem' }}>
                                                            {s.stepName || `Step ${i + 1}`}
                                                        </Typography>
                                                        {i < wf.steps.length - 1 && (
                                                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>→</Typography>
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
