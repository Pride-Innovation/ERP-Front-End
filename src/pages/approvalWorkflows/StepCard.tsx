/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import {
    Autocomplete,
    Box,
    Chip,
    FormControlLabel,
    IconButton,
    Paper,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { InputComponent } from '../../components/forms/Inputs';
import SelectComponent from '../../components/forms/Select';
import { brand, gold } from '../../utils/tokens';
import { IRole } from '../settings/interface';
import { IUnit } from '../settings/units/interface';
import {
    APPROVER_SUBJECT_LABELS,
    APPROVER_TYPE_LABELS,
    COMPLETION_NOTIFY_SOURCES,
    IApprovalStep,
    NOTIFY_GROUP_SOURCE_LABELS,
    NotifyGroupSource,
    STEP_TYPE_LABELS,
    SUBJECT_AWARE_APPROVER_TYPES,
} from './interface';

const TEAL = brand[800];
const GOLD = gold[500];

interface IStepCardProps {
    step: IApprovalStep;
    index: number;
    total: number;
    roles: IRole[];
    units: IUnit[];
    onChange: (index: number, field: keyof IApprovalStep, value: any) => void;
    onRemove: (index: number) => void;
}

const StepCard: React.FC<IStepCardProps> = ({ step, index, total, roles, units, onChange, onRemove }) => (
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
            {SUBJECT_AWARE_APPROVER_TYPES.includes(step.approverType) && (
                <Box>
                    <SelectComponent
                        id={`approver-subject-${index}`}
                        label="Resolve against"
                        required={false}
                        field={{
                            value: step.approverSubject ?? 'REQUESTER',
                            onChange: (e: any) => onChange(index, 'approverSubject', e.target.value),
                        }}
                        error={undefined}
                        options={Object.entries(APPROVER_SUBJECT_LABELS).map(([k, v]) => ({ value: k, label: v }))}
                    />
                    {step.approverSubject === 'ISSUER' && (
                        <Typography sx={{ mt: 0.5, fontSize: '0.68rem', color: 'text.secondary' }}>
                            Climbs the issuer’s reporting line (e.g. the issuer’s manager). Use on an issuance-approval step.
                        </Typography>
                    )}
                </Box>
            )}
            {step.approverType === 'GROUP_EMAIL' && (
                <Box>
                    <SelectComponent
                        id={`group-unit-${index}`}
                        label="Unit"
                        required={false}
                        field={{
                            value: String(step.unitId ?? ''),
                            onChange: (e: any) =>
                                onChange(index, 'unitId', e.target.value ? Number(e.target.value) : null),
                        }}
                        error={undefined}
                        options={[
                            { value: '', label: 'Select unit…' },
                            ...units.map((u) => ({ value: String(u.id), label: u.name })),
                        ]}
                    />
                    <Typography sx={{ mt: 0.5, fontSize: '0.68rem', color: 'text.secondary' }}>
                        {(() => {
                            const u = units.find((x) => x.id === step.unitId);
                            if (u) {
                                return u.groupEmail
                                    ? `Routes to ${u.groupEmail}`
                                    : '⚠ This unit has no group email — set one on the Units page.';
                            }
                            return step.groupEmail
                                ? `Legacy email: ${step.groupEmail} — pick a unit to replace it.`
                                : 'The unit’s group email is attached automatically.';
                        })()}
                    </Typography>
                </Box>
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
            <SelectComponent
                id={`notify-source-${index}`}
                label="CC / Notify whom"
                required={false}
                field={{
                    value: step.notifyGroupSource,
                    onChange: (e: any) => onChange(index, 'notifyGroupSource', e.target.value),
                }}
                error={undefined}
                options={Object.entries(NOTIFY_GROUP_SOURCE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
            {step.notifyGroupSource === 'STATIC' && (
                <InputComponent
                    label="CC Email Address"
                    field={{
                        value: step.notifyGroupEmail,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                            onChange(index, 'notifyGroupEmail', e.target.value),
                    }}
                    error={undefined}
                    id={`notify-email-${index}`}
                />
            )}
            <Autocomplete
                multiple
                size="small"
                options={COMPLETION_NOTIFY_SOURCES}
                getOptionLabel={(opt) => NOTIFY_GROUP_SOURCE_LABELS[opt]}
                value={(step.notifyOnCompletion ?? []).filter((s): s is NotifyGroupSource =>
                    COMPLETION_NOTIFY_SOURCES.includes(s)
                )}
                onChange={(_, value) => onChange(index, 'notifyOnCompletion', value)}
                isOptionEqualToValue={(opt, val) => opt === val}
                renderTags={(value, getTagProps) =>
                    value.map((src, i) => (
                        <Chip
                            {...getTagProps({ index: i })}
                            key={src}
                            label={NOTIFY_GROUP_SOURCE_LABELS[src]}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Notify on completion"
                        placeholder={(step.notifyOnCompletion ?? []).length === 0 ? 'No completion emails' : ''}
                    />
                )}
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
            <Autocomplete
                multiple
                size="small"
                options={roles}
                getOptionLabel={(role) => role.name}
                value={roles.filter(r => (step.skipIfRequesterRoleIds ?? []).includes(r.id as number))}
                onChange={(_, value) =>
                    onChange(
                        index,
                        'skipIfRequesterRoleIds',
                        value.map(r => r.id as number),
                    )
                }
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderTags={(value, getTagProps) =>
                    value.map((role, i) => (
                        <Chip
                            {...getTagProps({ index: i })}
                            key={role.id}
                            label={role.name}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Skip if requester role"
                        placeholder={
                            (step.skipIfRequesterRoleIds ?? []).length === 0 ? 'No skip' : ''
                        }
                    />
                )}
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

export default StepCard;
