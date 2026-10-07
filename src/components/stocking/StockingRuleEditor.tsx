/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    FormControlLabel,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
    alpha,
} from '@mui/material';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { toast } from 'react-toastify';
import { describeStockingRule, isNowhere, IStockingRule, IStockingRuleRequest } from './stockingRule';
import { fetchBranchOptionsService, IBranchOption, refusalMessage } from './service';
import { autocompleteSx } from '../forms/Autocomplete';

const PRIMARY = '#08796C';

interface IStockingRuleEditor {
    /** The rule as stored. For a commodity, its own (meaningful only while `override` is on). */
    rule: IStockingRule;
    /** Present for a commodity: whether it currently overrides, and the category rule it would otherwise follow. */
    commodity?: { override: boolean; categoryName?: string; categoryRule?: IStockingRule };
    onSave: (request: IStockingRuleRequest) => Promise<unknown>;
    onSaved: (data: any) => void;
    handleClose: () => void;
}

/**
 * Where something may be stocked: Head Office, all branches, or named branches.
 *
 * Saved through its own endpoint, never with the category's other fields, so editing a description
 * cannot reset who may stock it. The save is a replacement: the rule afterwards is exactly what is
 * ticked here, so an empty selection really does mean nowhere - and is confirmed before it is sent.
 */
const StockingRuleEditor = ({ rule, commodity, onSave, onSaved, handleClose }: IStockingRuleEditor) => {
    const [branches, setBranches] = useState<IBranchOption[]>([]);
    const [branchesFailed, setBranchesFailed] = useState(false);
    const [override, setOverride] = useState<boolean>(commodity?.override ?? true);
    const [headOffice, setHeadOffice] = useState<boolean>(rule.stockAtHeadOffice !== false);
    const [allBranches, setAllBranches] = useState<boolean>(rule.stockAtAllBranches === true);
    const [branchIds, setBranchIds] = useState<number[]>(rule.stockingBranchIds ?? []);
    const [confirmNowhere, setConfirmNowhere] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBranchOptionsService()
            .then(setBranches)
            .catch(() => setBranchesFailed(true));
    }, []);

    const nameOf = useMemo(() => {
        const byId = new Map(branches.map((b) => [b.id, b.name]));
        return (id: number) => byId.get(id);
    }, [branches]);

    const draft: IStockingRule = { stockAtHeadOffice: headOffice, stockAtAllBranches: allBranches, stockingBranchIds: allBranches ? [] : branchIds };
    const ownRuleApplies = !commodity || override;
    const nowhere = ownRuleApplies && isNowhere(draft);

    const save = async () => {
        if (nowhere && !confirmNowhere) {
            setConfirmNowhere(true);
            return;
        }
        setSaving(true);
        try {
            const response: any = await onSave({
                override: commodity ? override : undefined,
                stockAtHeadOffice: headOffice,
                stockAtAllBranches: allBranches,
                branchIds: allBranches ? [] : branchIds,
            });
            if (response?.status === 200) {
                toast.success('Stocking rule saved', { position: 'bottom-right' });
                onSaved(response.data);
                handleClose();
            } else {
                toast.error('The stocking rule was not saved.', { position: 'bottom-right' });
            }
        } catch (error) {
            toast.error(refusalMessage(error, 'The stocking rule was not saved.'), { position: 'bottom-right' });
        } finally {
            setSaving(false);
        }
    };

    const selected = branches.filter((b) => branchIds.includes(b.id));

    return (
        <Box>
            {commodity && (
                <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, border: `1px solid ${alpha(PRIMARY, 0.15)}` }}>
                    <RadioGroup value={override ? 'own' : 'category'} onChange={(e) => { setOverride(e.target.value === 'own'); setConfirmNowhere(false); }}>
                        <FormControlLabel
                            value="category"
                            control={<Radio size="small" />}
                            label={
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        Same as its category{commodity.categoryName ? ` (${commodity.categoryName})` : ''}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {commodity.categoryRule
                                            ? describeStockingRule(commodity.categoryRule, nameOf)
                                            : 'No category - Head Office only'}
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            value="own"
                            control={<Radio size="small" />}
                            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Set for this commodity</Typography>}
                        />
                    </RadioGroup>
                </Paper>
            )}

            <Box sx={{ opacity: ownRuleApplies ? 1 : 0.45, pointerEvents: ownRuleApplies ? 'auto' : 'none' }}>
                <Stack spacing={1.5}>
                    <Paper elevation={0} sx={{ p: 1.5, px: 2, borderRadius: 2, border: `1px solid ${alpha(PRIMARY, 0.15)}` }}>
                        <FormControlLabel
                            control={<Checkbox checked={headOffice} onChange={(e) => { setHeadOffice(e.target.checked); setConfirmNowhere(false); }} />}
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <ApartmentOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Head Office</Typography>
                                </Stack>
                            }
                        />
                    </Paper>

                    <Paper elevation={0} sx={{ p: 1.5, px: 2, borderRadius: 2, border: `1px solid ${alpha(PRIMARY, 0.15)}` }}>
                        <FormControlLabel
                            control={<Checkbox checked={allBranches} onChange={(e) => { setAllBranches(e.target.checked); setConfirmNowhere(false); }} />}
                            label={
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <StorefrontOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>All branches</Typography>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">
                                        Every branch, including any opened later.
                                    </Typography>
                                </Box>
                            }
                        />

                        {!allBranches && (
                            <Box sx={{ mt: 1.5 }}>
                                <Autocomplete
                                    multiple
                                    options={branches}
                                    value={selected}
                                    loading={branches.length === 0 && !branchesFailed}
                                    getOptionLabel={(o) => o.name}
                                    isOptionEqualToValue={(a, b) => a.id === b.id}
                                    onChange={(_, value) => { setBranchIds(value.map((v) => v.id)); setConfirmNowhere(false); }}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip size="small" label={option.name} {...getTagProps({ index })} key={option.id} />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Specific branches"
                                            placeholder={selected.length ? '' : 'Choose branches…'}
                                            helperText={branchesFailed ? 'Branches could not be loaded.' : undefined}
                                            error={branchesFailed}
                                            sx={autocompleteSx}
                                        />
                                    )}
                                />
                            </Box>
                        )}
                    </Paper>
                </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                {ownRuleApplies
                    ? <>Summary: <strong>{describeStockingRule(draft, nameOf)}</strong>. Orders already raised are not affected — this applies to new orders and to lines added to an order.</>
                    : 'This commodity will follow its category, including any later change to it.'}
            </Typography>

            {confirmNowhere && (
                <Alert severity="warning" icon={<WarningAmberOutlinedIcon />} sx={{ mt: 2, borderRadius: 2 }}>
                    Nothing is ticked, so {commodity ? 'this commodity' : 'this category'} could not be stocked
                    anywhere — not even at Head Office. Press <strong>Save anyway</strong> to confirm.
                </Alert>
            )}

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ borderRadius: '8px', textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    onClick={save}
                    variant="contained"
                    disabled={saving}
                    color={confirmNowhere ? 'warning' : 'primary'}
                    sx={{
                        px: 3, borderRadius: '8px', textTransform: 'none',
                        ...(confirmNowhere ? {} : { bgcolor: PRIMARY, '&:hover': { bgcolor: '#065E53' } }),
                    }}
                >
                    {saving ? <CircularProgress size={20} color="inherit" /> : confirmNowhere ? 'Save anyway' : 'Save'}
                </Button>
            </Stack>
        </Box>
    );
};

export default StockingRuleEditor;
