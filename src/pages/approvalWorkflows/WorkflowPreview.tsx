/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { brand, gold, neutral } from '../../utils/tokens';
import {
    APPROVER_TYPE_LABELS,
    IResolvedApprovalStep,
    IResolvedApprovalWorkflow,
} from './interface';

const TEAL = brand[800];
const GOLD = gold[500];
const MUTED = neutral[400];

interface IWorkflowPreviewProps {
    resolved: IResolvedApprovalWorkflow | null;
    loading?: boolean;
    error?: string | null;
    /** Small caption rendered above the chain (e.g. "Preview for: Computer · Head Office · Jane Doe"). */
    caption?: string;
}

const StepBlock = ({ step, index }: { step: IResolvedApprovalStep; index: number }) => {
    const isSkipped = step.skipped;
    const borderColor = isSkipped ? alpha(MUTED, 0.4) : alpha(TEAL, 0.3);
    const headerColor = isSkipped ? MUTED : TEAL;

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                width: 230,
                minWidth: 230,
                flexShrink: 0,
                borderRadius: 2,
                borderColor,
                bgcolor: isSkipped ? alpha(MUTED, 0.04) : '#fff',
                opacity: isSkipped ? 0.7 : 1,
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                        sx={{
                            bgcolor: headerColor,
                            color: '#fff',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                        }}
                    >
                        {index + 1}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: headerColor }} noWrap>
                        {step.stepName || `Step ${index + 1}`}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                    {step.optional && (
                        <Chip
                            label="Opt"
                            size="small"
                            sx={{ fontSize: '0.55rem', height: 16, bgcolor: alpha(GOLD, 0.12), color: GOLD }}
                        />
                    )}
                    {isSkipped && (
                        <Tooltip title={step.skipReason ?? 'Skipped'} arrow placement="top">
                            <BlockOutlinedIcon sx={{ fontSize: 14, color: MUTED }} />
                        </Tooltip>
                    )}
                    {!isSkipped && (
                        <CheckCircleOutlineIcon sx={{ fontSize: 14, color: TEAL }} />
                    )}
                </Stack>
            </Stack>

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', fontSize: '0.65rem', mb: 0.5 }}
            >
                {APPROVER_TYPE_LABELS[step.approverType] ?? step.approverType}
            </Typography>

            {step.approverName && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.25 }}>
                    <PersonOutlineIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>
                        {step.approverName}
                    </Typography>
                </Stack>
            )}
            {step.approverEmail && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontSize: '0.65rem', wordBreak: 'break-all' }}
                >
                    {step.approverEmail}
                </Typography>
            )}
            {step.fallbackEmail && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <GroupsOutlinedIcon sx={{ fontSize: 13, color: GOLD }} />
                    <Typography
                        variant="caption"
                        sx={{ color: GOLD, fontSize: '0.65rem' }}
                        noWrap
                    >
                        Fallback: {step.fallbackEmail}
                    </Typography>
                </Stack>
            )}
        </Paper>
    );
};

const WorkflowPreview: React.FC<IWorkflowPreviewProps> = ({
    resolved,
    loading,
    error,
    caption,
}) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={22} sx={{ color: TEAL }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" variant="outlined" sx={{ mb: 1 }}>
                {error}
            </Alert>
        );
    }

    if (!resolved || resolved.workflowId == null) {
        return (
            <Alert severity="warning" variant="outlined">
                {resolved?.noMatchReason ?? 'No workflow matches this combination yet.'}
            </Alert>
        );
    }

    const activeSteps = resolved.resolvedSteps.filter((s) => !s.skipped).length;
    const skippedSteps = resolved.resolvedSteps.length - activeSteps;

    return (
        <Box>
            {caption && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 1 }}
                >
                    {caption}
                </Typography>
            )}

            <Stack direction="row" alignItems="center" spacing={1} mb={1.5} flexWrap="wrap" useFlexGap>
                <Chip
                    label={resolved.workflowName ?? 'Workflow'}
                    size="small"
                    sx={{ bgcolor: alpha(TEAL, 0.1), color: TEAL, fontWeight: 700 }}
                />
                <Chip
                    label={`${activeSteps} active step${activeSteps !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.65rem' }}
                />
                {skippedSteps > 0 && (
                    <Chip
                        label={`${skippedSteps} skipped`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', color: MUTED, borderColor: alpha(MUTED, 0.4) }}
                    />
                )}
                {resolved.fulfilmentGroupEmail && (
                    <Chip
                        icon={<GroupsOutlinedIcon sx={{ fontSize: 14 }} />}
                        label={`Fulfilment: ${resolved.fulfilmentGroupEmail}`}
                        size="small"
                        sx={{
                            bgcolor: alpha(GOLD, 0.1),
                            color: GOLD,
                            fontSize: '0.65rem',
                            '& .MuiChip-icon': { color: GOLD },
                        }}
                    />
                )}
            </Stack>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    overflowX: 'auto',
                    pb: 1,
                    '&::-webkit-scrollbar': { height: 6 },
                    '&::-webkit-scrollbar-track': { borderRadius: 3, bgcolor: alpha(TEAL, 0.04) },
                    '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: alpha(TEAL, 0.2) },
                }}
            >
                {resolved.resolvedSteps.map((step, idx) => (
                    <React.Fragment key={idx}>
                        <StepBlock step={step} index={idx} />
                        {idx < resolved.resolvedSteps.length - 1 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    pt: 1.5,
                                    px: 0.5,
                                    flexShrink: 0,
                                }}
                            >
                                <ArrowForwardIcon
                                    sx={{
                                        color: alpha(TEAL, 0.4),
                                        fontSize: '1.1rem',
                                    }}
                                />
                            </Box>
                        )}
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );
};

export default WorkflowPreview;
