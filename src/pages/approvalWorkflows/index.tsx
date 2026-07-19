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
    Divider,
    Fade,
    IconButton,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import LowPriorityOutlinedIcon from '@mui/icons-material/LowPriorityOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { RootState } from '../../store';
import { brand, gold, neutral, border, surface, elevation, radii, status } from '../../utils/tokens';
import { PageHero, EmptyState } from '../../components/layout';
import WorkflowForm from './WorkflowForm';
import ApprovalWorkflowUtills from './utills';
import { BRANCH_SCOPE_LABELS, IApprovalWorkflow, IApprovalStep, APPROVER_TYPE_LABELS } from './interface';
import { RequirePermission } from '../../core/permissions';
import { PERMISSIONS } from '../../core/permissions/constants';

const P = brand[600];     // teal
const GOLD = gold[500];

type PageView = 'list' | 'form';
type StatusFilter = 'all' | 'active' | 'inactive';

/** Tab label with a small count pill — used by the hero's filter tabs. */
const TabLabel = ({ text, count }: { text: string; count: number }) => (
    <Stack direction="row" spacing={0.75} alignItems="center">
        <span>{text}</span>
        <Box
            component="span"
            sx={{
                px: 0.75,
                borderRadius: '10px',
                fontSize: '0.68rem',
                fontWeight: 700,
                lineHeight: 1.6,
                bgcolor: neutral[100],
                color: neutral[600],
                fontVariantNumeric: 'tabular-nums',
            }}
        >
            {count}
        </Box>
    </Stack>
);

/* ── small helpers ──────────────────────────────────────── */

const ActiveBadge = ({ active }: { active: boolean }) => (
    <Box sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: `${radii.pill}px`,
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        bgcolor: active ? status.success.soft : neutral[100],
        color: active ? status.success.strong : neutral[500],
        border: `1px solid ${active ? alpha(status.success.main, 0.25) : border.default}`,
    }}>
        <Box sx={{
            width: 5, height: 5, borderRadius: '50%',
            bgcolor: active ? status.success.main : neutral[400],
        }} />
        {active ? 'Active' : 'Inactive'}
    </Box>
);

const MetaItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
        <Box sx={{ color: neutral[400], display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Typography sx={{ fontSize: '0.75rem', color: neutral[500], fontWeight: 500 }}>{label}</Typography>
    </Box>
);

const StepFlow = ({ steps }: { steps: IApprovalStep[] }) => {
    if (!steps?.length) return (
        <Typography sx={{ fontSize: '0.72rem', color: neutral[400], fontStyle: 'italic' }}>No steps configured</Typography>
    );
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            {steps.map((s, i) => (
                <React.Fragment key={i}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.25,
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.4,
                            borderRadius: '6px',
                            bgcolor: alpha(P, 0.07),
                            border: `1px solid ${alpha(P, 0.15)}`,
                        }}>
                            <Box sx={{
                                width: 16, height: 16,
                                borderRadius: '50%',
                                bgcolor: P,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Typography sx={{ fontSize: '0.55rem', color: '#fff', fontWeight: 700, lineHeight: 1 }}>
                                    {i + 1}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: neutral[800], whiteSpace: 'nowrap' }}>
                                {s.stepName || `Step ${i + 1}`}
                            </Typography>
                            {s.optional && (
                                <Chip label="opt" size="small" sx={{
                                    height: 14, fontSize: '0.55rem', fontWeight: 700,
                                    bgcolor: alpha(GOLD, 0.12), color: GOLD,
                                }} />
                            )}
                        </Box>
                        <Typography sx={{ fontSize: '0.62rem', color: neutral[400], fontWeight: 500 }}>
                            {APPROVER_TYPE_LABELS[s.approverType] ?? s.approverType}
                        </Typography>
                    </Box>
                    {i < steps.length - 1 && (
                        <ArrowRightAltIcon sx={{ fontSize: 16, color: alpha(P, 0.3), mx: 0.25, mb: 1.5 }} />
                    )}
                </React.Fragment>
            ))}
        </Box>
    );
};

/* ── workflow card ──────────────────────────────────────── */

interface WorkflowCardProps {
    wf: IApprovalWorkflow;
    onEdit: () => void;
    onToggle: () => void;
    onDelete: () => void;
}

const WorkflowCard = ({ wf, onEdit, onToggle, onDelete }: WorkflowCardProps) => (
    <Fade in>
        <Box sx={{
            display: 'flex',
            borderRadius: `${radii.lg}px`,
            border: `1px solid ${border.subtle}`,
            bgcolor: surface.card,
            boxShadow: elevation.card,
            overflow: 'hidden',
            mb: 2,
            opacity: wf.active ? 1 : 0.72,
            transition: 'box-shadow 0.2s, border-color 0.2s',
            '&:hover': {
                borderColor: alpha(brand[500], 0.35),
                boxShadow: `0 4px 16px ${alpha(brand[500], 0.1)}`,
            },
        }}>
            <Box sx={{ flex: 1, p: 0 }}>
                {/* ── header row ── */}
                <Box sx={{
                    px: { xs: 2, md: 3 },
                    py: 1.75,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2,
                }}>
                    {/* left: icon + name + badges */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
                        <Box sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '9px',
                            bgcolor: alpha(brand[500], 0.08),
                            border: `1px solid ${alpha(brand[500], 0.18)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <AccountTreeOutlinedIcon sx={{ fontSize: 20, color: P }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: neutral[900], lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                                    {wf.name}
                                </Typography>
                                <ActiveBadge active={wf.active} />
                                <Chip
                                    label={`Priority ${wf.priority}`}
                                    size="small"
                                    icon={<LowPriorityOutlinedIcon sx={{ fontSize: '12px !important', ml: '6px !important' }} />}
                                    sx={{
                                        height: 20, fontSize: '0.68rem', fontWeight: 600,
                                        bgcolor: alpha(GOLD, 0.08),
                                        color: GOLD,
                                        border: `1px solid ${alpha(GOLD, 0.2)}`,
                                        '& .MuiChip-icon': { color: GOLD },
                                    }}
                                />
                            </Box>
                            {wf.description && (
                                <Typography sx={{ fontSize: '0.78rem', color: neutral[500], lineHeight: 1.4 }}>
                                    {wf.description}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* right: actions */}
                    <Stack direction="row" spacing={0.5} flexShrink={0} alignItems="center">
                        <Tooltip title={wf.active ? 'Deactivate' : 'Activate'}>
                            <IconButton size="small" onClick={onToggle} sx={{
                                width: 30, height: 30,
                                border: `1px solid ${alpha(wf.active ? P : neutral[500], 0.2)}`,
                                bgcolor: alpha(wf.active ? P : neutral[500], 0.06),
                                color: wf.active ? P : neutral[500],
                                '&:hover': { bgcolor: alpha(wf.active ? P : neutral[500], 0.12) },
                            }}>
                                <PowerSettingsNewIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit workflow">
                            <IconButton size="small" onClick={onEdit} sx={{
                                width: 30, height: 30,
                                border: `1px solid ${alpha(GOLD, 0.25)}`,
                                bgcolor: alpha(GOLD, 0.07),
                                color: GOLD,
                                '&:hover': { bgcolor: alpha(GOLD, 0.14) },
                            }}>
                                <EditOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete workflow">
                            <IconButton size="small" onClick={onDelete} sx={{
                                width: 30, height: 30,
                                border: `1px solid ${status.danger.soft}`,
                                bgcolor: alpha(status.danger.main, 0.04),
                                color: status.danger.main,
                                '&:hover': { bgcolor: status.danger.soft },
                            }}>
                                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                <Divider sx={{ borderColor: border.subtle }} />

                {/* ── meta row ── */}
                <Box sx={{ px: { xs: 2, md: 3 }, py: 1.25, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, bgcolor: surface.muted }}>
                    <MetaItem
                        icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 13 }} />}
                        label={BRANCH_SCOPE_LABELS[wf.branchScope] ?? wf.branchScope}
                    />
                    {wf.branchName && (
                        <MetaItem
                            icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 13 }} />}
                            label={`Branch: ${wf.branchName}`}
                        />
                    )}
                    {(wf.requesterRoleNames ?? []).length > 0 && (
                        <MetaItem
                            icon={<PeopleOutlineIcon sx={{ fontSize: 13 }} />}
                            label={`Roles: ${(wf.requesterRoleNames ?? []).join(', ')}`}
                        />
                    )}
                    <MetaItem
                        icon={<AccountTreeOutlinedIcon sx={{ fontSize: 13 }} />}
                        label={`${wf.steps?.length ?? 0} approval step${(wf.steps?.length ?? 0) !== 1 ? 's' : ''}`}
                    />
                </Box>

                {/* ── categories ── */}
                {(wf.assetTypeNames ?? []).length > 0 && (
                    <>
                        <Divider sx={{ borderColor: border.subtle }} />
                        <Box sx={{ px: { xs: 2, md: 3 }, py: 1.25, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 0.5 }}>
                                <CategoryOutlinedIcon sx={{ fontSize: 13, color: neutral[400] }} />
                                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Categories
                                </Typography>
                            </Box>
                            {(wf.assetTypeNames ?? []).map((name) => (
                                <Chip key={name} label={name} size="small" sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    bgcolor: alpha(P, 0.07),
                                    color: P,
                                    border: `1px solid ${alpha(P, 0.15)}`,
                                }} />
                            ))}
                        </Box>
                    </>
                )}

                {/* ── steps flow ── */}
                {(wf.steps?.length ?? 0) > 0 && (
                    <>
                        <Divider sx={{ borderColor: border.subtle }} />
                        <Box sx={{ px: { xs: 2, md: 3 }, py: 1.5 }}>
                            <Typography sx={{
                                fontSize: '0.68rem', fontWeight: 700, color: neutral[400],
                                textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1,
                            }}>
                                Approval Flow
                            </Typography>
                            <StepFlow steps={wf.steps} />
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    </Fade>
);

/* ── main page ──────────────────────────────────────────── */

const ApprovalWorkflows: React.FC = () => {
    const [view, setView] = useState<PageView>('list');
    const [editing, setEditing] = useState<IApprovalWorkflow | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<IApprovalWorkflow | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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

    const workflows = useSelector((state: RootState) => state.ApprovalWorkflowStore.workflows);

    const activeCount = workflows.filter(wf => wf.active).length;
    const inactiveCount = workflows.length - activeCount;
    const filteredWorkflows =
        statusFilter === 'all' ? workflows : workflows.filter(wf => wf.active === (statusFilter === 'active'));

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
        <Box sx={{ pb: 4 }}>
            <PageHero
                title="Approval Workflows"
                subtitle="Configure request approval chains"
                icon={<AccountTreeOutlinedIcon />}
                stat={{
                    value: (workflows?.length ?? 0).toLocaleString(),
                    label: 'workflows',
                    helper: workflows.length > 0 ? `${activeCount} active` : undefined,
                }}
                actions={
                    <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={openCreate}
                            sx={{
                                height: 40,
                                px: 2.5,
                                bgcolor: brand[500],
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: '8px',
                                boxShadow: `0 2px 8px ${alpha(brand[500], 0.3)}`,
                                '&:hover': { bgcolor: brand[700], boxShadow: `0 4px 14px ${alpha(brand[500], 0.4)}` },
                            }}
                        >
                            New Workflow
                        </Button>
                    </RequirePermission>
                }
                tabs={
                    <Tabs
                        value={statusFilter}
                        onChange={(_, v: StatusFilter) => setStatusFilter(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{
                            minHeight: 44,
                            '& .MuiTab-root': {
                                fontSize: '0.82rem',
                                minHeight: 44,
                                textTransform: 'none',
                                px: 1.75,
                                py: 0,
                                gap: 0.75,
                            },
                        }}
                    >
                        <Tab
                            value="all"
                            icon={<ViewListOutlinedIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label={<TabLabel text="All" count={workflows.length} />}
                        />
                        <Tab
                            value="active"
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label={<TabLabel text="Active" count={activeCount} />}
                        />
                        <Tab
                            value="inactive"
                            icon={<PauseCircleOutlineIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label={<TabLabel text="Inactive" count={inactiveCount} />}
                        />
                    </Tabs>
                }
            />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: P }} size={32} />
                </Box>
            ) : workflows.length === 0 ? (
                <EmptyState
                    icon={<AccountTreeOutlinedIcon />}
                    title="No workflows configured yet"
                    description="Define a workflow to route asset requests through your approval chain."
                    action={
                        <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}
                                sx={{ textTransform: 'none', borderRadius: '8px', borderColor: alpha(P, 0.4), color: P }}>
                                Create your first workflow
                            </Button>
                        </RequirePermission>
                    }
                />
            ) : filteredWorkflows.length === 0 ? (
                <EmptyState
                    icon={statusFilter === 'active' ? <CheckCircleOutlineIcon /> : <PauseCircleOutlineIcon />}
                    title={`No ${statusFilter} workflows`}
                    description={
                        statusFilter === 'active'
                            ? 'None of your workflows are currently active. Activate one from the Inactive tab.'
                            : 'All of your workflows are currently active.'
                    }
                />
            ) : (
                <Box sx={{ mt: 0.5 }}>
                    {filteredWorkflows.map((wf) => (
                        <WorkflowCard
                            key={wf.id}
                            wf={wf}
                            onEdit={() => openEdit(wf)}
                            onToggle={() => toggleWorkflow(wf)}
                            onDelete={() => setDeleteTarget(wf)}
                        />
                    ))}
                </Box>
            )}

            {/* Delete confirmation dialog */}
            <Dialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    elevation: 0,
                    sx: { borderRadius: `${radii.lg}px`, border: `1px solid ${border.subtle}` },
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '9px',
                            bgcolor: alpha(status.danger.main, 0.06), border: `1px solid ${status.danger.soft}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <DeleteOutlineIcon sx={{ fontSize: 18, color: status.danger.main }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: neutral[900] }}>
                            Delete Workflow
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.875rem', color: neutral[600] }}>
                        Are you sure you want to delete{' '}
                        <Box component="span" sx={{ fontWeight: 700, color: neutral[900] }}>
                            "{deleteTarget?.name}"
                        </Box>
                        ? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={() => setDeleteTarget(null)}
                        sx={{
                            textTransform: 'none', fontWeight: 500, color: neutral[500],
                            borderRadius: '8px', border: `1px solid ${border.default}`,
                            '&:hover': { bgcolor: neutral[50] },
                        }}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={async () => { if (deleteTarget) { await deleteWorkflow(deleteTarget); setDeleteTarget(null); } }}
                        sx={{
                            textTransform: 'none', fontWeight: 600,
                            borderRadius: '8px', bgcolor: status.danger.main,
                            '&:hover': { bgcolor: status.danger.strong },
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ApprovalWorkflows;
