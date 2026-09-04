/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { toast } from 'react-toastify';

import { IRole } from '../interface';
import { IUnit } from './interface';
import { setUnitRolesService } from './service';
import { fetchAllRolesService } from '../roles/service';
import { CROSS_BRANCH_PERMISSIONS, PERMISSION_CONSEQUENCES } from '../../../core/permissions/constants';
import { brand, neutral, border } from '../../../utils/tokens';

const PRIMARY = brand[500];
const DANGER = '#D32F2F';

interface IUnitRolesDialogProps {
    unit: IUnit;
    handleClose: () => void;
    onSaved: () => void;
}

/** Permission names a set of roles grants between them, de-duplicated. */
const permissionsOf = (roles: Array<IRole>): Array<string> => {
    const names = new Set<string>();
    roles.forEach((role) => role.permissions?.forEach((p) => { if (p?.name) names.add(p.name); }));
    return Array.from(names).sort();
};

const describe = (permission: string): string =>
    PERMISSION_CONSEQUENCES[permission] ?? permission;

/**
 * Picks the roles a unit confers, and shows what that means before it is saved.
 *
 * <p>Two steps on purpose. The picker is a list of role names, which is what an administrator is
 * thinking in; the confirmation is a list of consequences, which is what they are actually deciding.
 * A single screen would have to be one or the other, and a name like MANAGE_ALL_BRANCH_ASSETS on its
 * own does not tell anyone that they are about to let every member of this unit edit any branch's
 * asset.
 *
 * <p>The confirmation is worth the extra click because this grant is invisible from the accounts it
 * affects. Nothing changes on any user record, no notification is raised, and the people who gain the
 * access are not told — they simply find, next time they sign in, that they can see and do more. The
 * only place the decision is visible is here, before it is made, and in the audit trail afterwards.
 */
const UnitRolesDialog = ({ unit, handleClose, onSaved }: IUnitRolesDialogProps) => {
    const [allRoles, setAllRoles] = useState<Array<IRole>>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const originalIds = useMemo(
        () => new Set((unit.roles ?? []).map((r) => Number(r.id))),
        [unit.roles],
    );
    const [selectedIds, setSelectedIds] = useState<Set<number>>(originalIds);

    useEffect(() => {
        let active = true;
        const run = async () => {
            setLoading(true);
            try {
                const res: any = await fetchAllRolesService();
                if (active && res?.status === 200) {
                    setAllRoles(res.data?.content ?? res.data ?? []);
                }
            } catch {
                // surfaced by the axios interceptor
            } finally {
                if (active) setLoading(false);
            }
        };
        run();
        return () => { active = false; };
    }, []);

    const toggle = (roleId: number) => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(roleId)) next.delete(roleId); else next.add(roleId);
            return next;
        });
    };

    const granted = useMemo(
        () => allRoles.filter((r) => !originalIds.has(Number(r.id)) && selectedIds.has(Number(r.id))),
        [allRoles, originalIds, selectedIds],
    );
    const revoked = useMemo(
        () => allRoles.filter((r) => originalIds.has(Number(r.id)) && !selectedIds.has(Number(r.id))),
        [allRoles, originalIds, selectedIds],
    );
    const nothingChanged = granted.length === 0 && revoked.length === 0;

    const gainedPermissions = useMemo(() => {
        // What is gained is what the added roles grant and the remaining ones do not — otherwise a
        // role that merely overlaps an existing one would be reported as new access.
        const kept = new Set(permissionsOf(
            allRoles.filter((r) => selectedIds.has(Number(r.id)) && originalIds.has(Number(r.id))),
        ));
        return permissionsOf(granted).filter((p) => !kept.has(p));
    }, [allRoles, granted, originalIds, selectedIds]);

    const lostPermissions = useMemo(() => {
        const stillHeld = new Set(permissionsOf(
            allRoles.filter((r) => selectedIds.has(Number(r.id))),
        ));
        return permissionsOf(revoked).filter((p) => !stillHeld.has(p));
    }, [allRoles, revoked, selectedIds]);

    const crossBranchGains = gainedPermissions.filter((p) => CROSS_BRANCH_PERMISSIONS.includes(p));

    const save = async () => {
        setSaving(true);
        const res: any = await setUnitRolesService(unit.id as number, Array.from(selectedIds));
        setSaving(false);
        if (res?.status === 200) {
            toast.success(`Roles updated for ${unit.name}.`);
            onSaved();
            handleClose();
        }
        // errors surfaced by the axios interceptor
    };

    if (loading) {
        return (
            <Stack alignItems="center" sx={{ py: 4 }}>
                <CircularProgress size={24} sx={{ color: PRIMARY }} />
            </Stack>
        );
    }

    // ── Step two: the consequences ──────────────────────────────────────────
    if (confirming) {
        return (
            <Box>
                <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: alpha(crossBranchGains.length ? DANGER : PRIMARY, 0.1), color: crossBranchGains.length ? DANGER : PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <WarningAmberRoundedIcon />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: neutral[900] }}>
                            Confirm what {unit.name} will grant
                        </Typography>
                        <Typography variant="body2" sx={{ color: neutral[500], mt: 0.5 }}>
                            Everyone already in this unit is affected immediately, and anyone added later
                            inherits the same. Nothing changes on their own user records, so this screen
                            and the audit trail are the only places the change is visible.
                        </Typography>
                    </Box>
                </Stack>

                {crossBranchGains.length > 0 && (
                    <Alert
                        severity="warning"
                        icon={<PublicOutlinedIcon fontSize="small" />}
                        sx={{ mb: 2, borderRadius: 1.5, alignItems: 'flex-start' }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            This reaches past the unit&rsquo;s own branch
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            Branch isolation is what everyone assumes is in force. These lift it:
                        </Typography>
                        <Stack component="ul" sx={{ m: 0, pl: 2.5 }} spacing={0.25}>
                            {crossBranchGains.map((p) => (
                                <Typography key={p} component="li" variant="caption">{describe(p)}</Typography>
                            ))}
                        </Stack>
                    </Alert>
                )}

                <Stack spacing={2}>
                    {granted.length > 0 && (
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${alpha(PRIMARY, 0.25)}`, bgcolor: alpha(PRIMARY, 0.03) }}>
                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                                <AddCircleOutlineIcon sx={{ fontSize: 16, color: PRIMARY }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Granting {granted.length === 1 ? 'this role' : `these ${granted.length} roles`}
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: gainedPermissions.length ? 1.5 : 0 }}>
                                {granted.map((r) => (
                                    <Chip key={r.id} size="small" label={r.name} sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }} />
                                ))}
                            </Stack>
                            {gainedPermissions.length > 0 ? (
                                <>
                                    <Typography variant="caption" sx={{ color: neutral[600], fontWeight: 600 }}>
                                        Members will be able to:
                                    </Typography>
                                    <Stack component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5 }} spacing={0.25}>
                                        {gainedPermissions.map((p) => (
                                            <Typography key={p} component="li" variant="caption" sx={{ color: neutral[700] }}>
                                                {describe(p)}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </>
                            ) : (
                                <Typography variant="caption" sx={{ color: neutral[500], fontStyle: 'italic' }}>
                                    These roles carry no permissions the unit does not already confer.
                                </Typography>
                            )}
                        </Paper>
                    )}

                    {revoked.length > 0 && (
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${alpha(DANGER, 0.25)}`, bgcolor: alpha(DANGER, 0.03) }}>
                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                                <RemoveCircleOutlineIcon sx={{ fontSize: 16, color: DANGER }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: DANGER, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Revoking {revoked.length === 1 ? 'this role' : `these ${revoked.length} roles`}
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: lostPermissions.length ? 1.5 : 0 }}>
                                {revoked.map((r) => (
                                    <Chip key={r.id} size="small" label={r.name} sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }} />
                                ))}
                            </Stack>
                            {lostPermissions.length > 0 ? (
                                <>
                                    <Typography variant="caption" sx={{ color: neutral[600], fontWeight: 600 }}>
                                        Members will no longer be able to (unless their own title or
                                        additional roles grant it):
                                    </Typography>
                                    <Stack component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5 }} spacing={0.25}>
                                        {lostPermissions.map((p) => (
                                            <Typography key={p} component="li" variant="caption" sx={{ color: neutral[700] }}>
                                                {describe(p)}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </>
                            ) : (
                                <Typography variant="caption" sx={{ color: neutral[500], fontStyle: 'italic' }}>
                                    Nothing is lost — the remaining roles still confer everything these did.
                                </Typography>
                            )}
                        </Paper>
                    )}
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack direction="row" spacing={1.5} justifyContent="space-between">
                    <Button
                        onClick={() => setConfirming(false)}
                        disabled={saving}
                        startIcon={<ArrowBackIcon fontSize="small" />}
                        sx={{ textTransform: 'none', color: neutral[600] }}
                    >
                        Back
                    </Button>
                    <Stack direction="row" spacing={1.5}>
                        <Button onClick={handleClose} disabled={saving} sx={{ textTransform: 'none', borderRadius: '8px', color: neutral[600] }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={save}
                            disabled={saving}
                            variant="contained"
                            sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, bgcolor: crossBranchGains.length ? DANGER : PRIMARY, '&:hover': { bgcolor: crossBranchGains.length ? '#B71C1C' : '#065E53' } }}
                        >
                            {saving ? 'Saving…' : 'Apply to this unit'}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        );
    }

    // ── Step one: the picker ────────────────────────────────────────────────
    return (
        <Box>
            <Typography variant="body2" sx={{ color: neutral[500], mb: 2 }}>
                Members of <strong>{unit.name}</strong> inherit every permission behind the roles
                selected here, on top of whatever their own title and additional roles already grant.
                Clearing all of them leaves the unit as a group mailbox with a department.
            </Typography>

            <Stack spacing={0.75} sx={{ maxHeight: 340, overflowY: 'auto', pr: 0.5 }}>
                {allRoles.map((role) => {
                    const roleId = Number(role.id);
                    const checked = selectedIds.has(roleId);
                    const crossBranch = (role.permissions ?? [])
                        .some((p) => p?.name && CROSS_BRANCH_PERMISSIONS.includes(p.name));

                    return (
                        <Paper
                            key={roleId}
                            elevation={0}
                            onClick={() => toggle(roleId)}
                            sx={{
                                p: 1.25, borderRadius: 1.5, cursor: 'pointer', display: 'flex',
                                alignItems: 'center', gap: 1,
                                border: `1px solid ${checked ? alpha(PRIMARY, 0.4) : border.subtle}`,
                                bgcolor: checked ? alpha(PRIMARY, 0.04) : '#fff',
                                '&:hover': { borderColor: alpha(PRIMARY, 0.35) },
                            }}
                        >
                            <Checkbox checked={checked} size="small" sx={{ p: 0.5, color: neutral[400], '&.Mui-checked': { color: PRIMARY } }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: neutral[900] }} noWrap>
                                        {role.name}
                                    </Typography>
                                    {crossBranch && (
                                        <Chip
                                            size="small"
                                            icon={<PublicOutlinedIcon sx={{ fontSize: 12 }} />}
                                            label="Cross-branch"
                                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha(DANGER, 0.08), color: DANGER, '& .MuiChip-icon': { color: DANGER, ml: 0.5 } }}
                                        />
                                    )}
                                </Stack>
                                <Typography variant="caption" sx={{ color: neutral[500] }} noWrap>
                                    {role.description || `${role.permissions?.length ?? 0} permission(s)`}
                                </Typography>
                            </Box>
                        </Paper>
                    );
                })}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" alignItems="center">
                {nothingChanged && (
                    <Typography variant="caption" sx={{ color: neutral[400], mr: 'auto', fontStyle: 'italic' }}>
                        No changes yet
                    </Typography>
                )}
                <Button onClick={handleClose} sx={{ textTransform: 'none', borderRadius: '8px', color: neutral[600] }}>
                    Cancel
                </Button>
                <Button
                    onClick={() => setConfirming(true)}
                    disabled={nothingChanged}
                    variant="contained"
                    sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, bgcolor: PRIMARY, '&:hover': { bgcolor: '#065E53' } }}
                >
                    Review changes
                </Button>
            </Stack>
        </Box>
    );
};

export default UnitRolesDialog;
