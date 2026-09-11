/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useState } from 'react';
import { alpha, Box, Chip, Collapse, Paper, Skeleton, Stack, Typography } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RoutesUtills from '../../../../core/routes/utills';
import { PageSection } from '../../../../components/layout';
import { IApprovalWorkflow } from '../../../approvalWorkflows/interface';
import { fetchApprovalWorkflowsService } from '../../../approvalWorkflows/service';

const PRIMARY = '#08796C';

/**
 * Read-only guide shown on the create-request form (replaces the old "Asset Category"
 * picker, which duplicated what the request items already say). Lists the approval
 * routes that apply to the requester's location — each with the item categories it
 * covers and its approval chain — so users know not to mix items from different
 * routes in a single request. Purely informational: nothing here feeds the payload.
 */
const WorkflowRoutesPanel = () => {
    const { getCurrentUser } = RoutesUtills();
    const [workflows, setWorkflows] = useState<IApprovalWorkflow[]>([]);
    const [loading, setLoading] = useState(true);
    // Route cards start collapsed (workflows can grow numerous); the category chips stay
    // visible — the approval chain is behind the expand.
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const toggleExpanded = (id: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = (await fetchApprovalWorkflowsService()) as any;
                if (!cancelled && response?.status === 200) {
                    setWorkflows(response.data ?? []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Show only the routes that can apply to this requester's location.
    const applicable = useMemo(() => {
        const user = getCurrentUser() as any;
        /*
         * The duty station first, the title's branch only as a fallback.
         *
         * A title is an organisation-wide job description — "Branch Manager" is the same title at
         * every branch — so it commonly carries no branch, and where it carries one it need not be
         * where the person actually works. `user.branch` is the duty station and is what the backend
         * and `useAccessScope` both read. Reading them in the other order picks the wrong routes for
         * anyone whose title happens to name a branch; the store page had the same inversion and it
         * sent people to a page they had no access to.
         */
        const branch = user?.branch ?? user?.title?.branch;
        const isHeadOffice = Boolean(branch?.headOffice ?? branch?.isHeadOffice);
        const scope = isHeadOffice ? 'HEAD_OFFICE' : 'BRANCH';
        return workflows
            .filter((wf) => wf.active && (wf.branchScope === scope || wf.branchScope === 'ALL'))
            .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflows]);

    if (!loading && applicable.length === 0) return null;

    return (
        <PageSection
            title="Approval Routes & Eligible Items"
            subtitle="Each route covers specific item categories. Keep every item in a request within one route — items from different routes follow different approval processes."
            icon={<AccountTreeOutlinedIcon />}
        >
            {loading ? (
                <Stack spacing={1.5}>
                    {[0, 1].map((i) => <Skeleton key={i} variant="rounded" height={110} />)}
                </Stack>
            ) : (
                <Stack spacing={1.5}>
                    {applicable.map((wf) => {
                        const steps = [...(wf.steps ?? [])].sort((a, b) => a.stepOrder - b.stepOrder);
                        const open = expandedIds.has(wf.id as number);
                        return (
                            <Paper
                                key={wf.id}
                                elevation={0}
                                sx={{ borderRadius: 2, border: '1px solid #E8EDF3', bgcolor: '#fff', overflow: 'hidden' }}
                            >
                                {/* Clickable header — name, description, category chips always visible */}
                                <Box
                                    onClick={() => toggleExpanded(wf.id as number)}
                                    role="button"
                                    aria-expanded={open}
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transition: 'background-color 0.15s ease',
                                        '&:hover': { bgcolor: '#FAFBFC' },
                                    }}
                                >
                                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}>
                                                {wf.name?.trim()}
                                            </Typography>
                                            {wf.description && (
                                                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.25 }}>
                                                    {wf.description.trim()}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                                            <Typography variant="caption" sx={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>
                                                {steps.length} step{steps.length === 1 ? '' : 's'}
                                            </Typography>
                                            <ExpandMoreIcon
                                                sx={{
                                                    fontSize: 18, color: '#94A3B8',
                                                    transform: open ? 'rotate(180deg)' : 'none',
                                                    transition: 'transform 0.2s ease',
                                                }}
                                            />
                                        </Stack>
                                    </Stack>

                                    {/* Categories requestable under this route */}
                                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
                                        {(wf.assetTypeNames ?? []).map((name) => (
                                            <Chip
                                                key={name}
                                                label={name}
                                                size="small"
                                                sx={{
                                                    height: 22, fontSize: '0.7rem', fontWeight: 600,
                                                    bgcolor: alpha(PRIMARY, 0.07), color: PRIMARY,
                                                    '& .MuiChip-label': { px: 1 },
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>

                                {/* Approval chain — expanded on demand */}
                                <Collapse in={open} timeout="auto" unmountOnExit>
                                    <Box sx={{ px: 2, pb: 2, pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block', mb: 0.75,
                                                fontWeight: 800, fontSize: '0.62rem',
                                                textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8',
                                            }}
                                        >
                                            Approval process
                                        </Typography>
                                        <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.75 }}>
                                            {steps.map((step, idx) => (
                                                <Stack key={step.id ?? idx} direction="row" alignItems="center">
                                                    <Stack direction="row" alignItems="center" spacing={0.6}>
                                                        <Box
                                                            sx={{
                                                                width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
                                                                bgcolor: '#F1F5F9', border: '1px solid #E2E8F0',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '0.6rem', fontWeight: 700, color: '#64748B',
                                                                fontVariantNumeric: 'tabular-nums',
                                                            }}
                                                        >
                                                            {idx + 1}
                                                        </Box>
                                                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                            {step.stepName?.trim()}
                                                        </Typography>
                                                    </Stack>
                                                    {idx < steps.length - 1 && (
                                                        <ChevronRightIcon sx={{ fontSize: 14, color: '#CBD5E1', mx: 0.4, flexShrink: 0 }} />
                                                    )}
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Collapse>
                            </Paper>
                        );
                    })}

                    {/* One-line reminder of the rule this panel exists to teach */}
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <InfoOutlinedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            Need items from two different routes? Submit them as two separate requests.
                        </Typography>
                    </Stack>
                </Stack>
            )}
        </PageSection>
    );
};

export default WorkflowRoutesPanel;
