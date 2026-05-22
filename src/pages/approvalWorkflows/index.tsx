/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fade,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { RootState } from '../../store';
import { brand, gold } from '../../utils/tokens';
import { PageHero, EmptyState, StatusChip } from '../../components/layout';
import WorkflowForm from './WorkflowForm';
import ApprovalWorkflowUtills from './utills';
import { BRANCH_SCOPE_LABELS, IApprovalWorkflow } from './interface';
import { RequirePermission } from '../../core/permissions';
import { PERMISSIONS } from '../../core/permissions/constants';

const TEAL = brand[800];
const GOLD = gold[500];

type PageView = 'list' | 'form';

const ApprovalWorkflows: React.FC = () => {
    const [view, setView] = useState<PageView>('list');
    const [editing, setEditing] = useState<IApprovalWorkflow | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<IApprovalWorkflow | null>(null);

    const {
        loading,
        branches,
        roles,
        fetchAllApprovalWorkflows,
        fetchBranchesForWorkflow,
        fetchRolesForWorkflow,
        saveWorkflow,
        toggleWorkflow,
        deleteWorkflow,
    } = ApprovalWorkflowUtills();

    const workflows = useSelector(
        (state: RootState) => state.ApprovalWorkflowStore.workflows
    );

    useEffect(() => {
        fetchAllApprovalWorkflows();
        fetchBranchesForWorkflow();
        fetchRolesForWorkflow();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreate = () => { setEditing(undefined); setView('form'); };
    const openEdit = (wf: IApprovalWorkflow) => { setEditing(wf); setView('form'); };
    const closeForm = () => { setView('list'); setEditing(undefined); };

    const handleSave = async (dto: IApprovalWorkflow) => {
        await saveWorkflow(dto);
        await fetchAllApprovalWorkflows();
    };

    const handleToggle = async (workflow: IApprovalWorkflow) => {
        await toggleWorkflow(workflow);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteWorkflow(deleteTarget);
        setDeleteTarget(null);
    };

    if (view === 'form') {
        return (
            <WorkflowForm
                initial={editing}
                branches={branches}
                roles={roles}
                onSave={handleSave}
                onCancel={closeForm}
            />
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <PageHero
                title="Approval Workflows"
                subtitle="Configure request approval chains"
                icon={<AccountTreeOutlinedIcon />}
                stat={{
                    value: (workflows?.length ?? 0).toLocaleString(),
                    label: 'workflows',
                }}
                actions={
                    <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                            New Workflow
                        </Button>
                    </RequirePermission>
                }
            />
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress sx={{ color: TEAL }} />
                </Box>
            ) : workflows.length === 0 ? (
                <EmptyState
                    icon={<AccountTreeOutlinedIcon />}
                    title="No workflows configured yet"
                    description="Define a workflow to route asset requests through your approval chain."
                    action={
                        <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}>
                                Create your first workflow
                            </Button>
                        </RequirePermission>
                    }
                />
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
                                        <StatusChip
                                            label={wf.active ? 'Active' : 'Inactive'}
                                            tone={wf.active ? 'success' : 'neutral'}
                                        />
                                        <Chip label={`Priority ${wf.priority}`} size="small" variant="outlined"
                                            sx={{ fontSize: '0.68rem' }} />
                                        <StatusChip
                                            label={BRANCH_SCOPE_LABELS[wf.branchScope] ?? wf.branchScope}
                                            tone="gold"
                                        />
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
                                        {(wf.requesterRoleNames ?? []).map((name) => (
                                            <Chip
                                                key={`role-${name}`}
                                                label={`Role: ${name}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.68rem', borderStyle: 'dashed' }}
                                            />
                                        ))}
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
                                        <IconButton size="small" onClick={() => handleToggle(wf)}
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
