/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useState } from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Grid,
    Paper,
    Stack,
    TextField,
    Typography,
    alpha,
} from '@mui/material';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SelectComponent from '../../components/forms/Select';
import { useDebounce } from '../../hooks/useDebounce';
import { brand } from '../../utils/tokens';
import { IAssetType } from '../settings/assetTypes/interface';
import { IBranch } from '../settings/branch/interface';
import { IUser } from '../users/interface';
import { IResolvedApprovalWorkflow } from './interface';
import {
    resolveApprovalWorkflowService,
    searchAssetTypesForWorkflowService,
    searchUsersForWorkflowService,
} from './service';
import WorkflowPreview from './WorkflowPreview';

const TEAL = brand[800];

interface IWorkflowTesterProps {
    branches: IBranch[];
}

const WorkflowTester = ({ branches }: IWorkflowTesterProps) => {
    const [categoryOptions, setCategoryOptions] = useState<IAssetType[]>([]);
    const [categorySearch, setCategorySearch] = useState('');
    const debouncedCategorySearch = useDebounce(categorySearch, 400);
    const [selectedCategory, setSelectedCategory] = useState<IAssetType | null>(null);

    const [userOptions, setUserOptions] = useState<IUser[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const debouncedUserSearch = useDebounce(userSearch, 400);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

    const [branchId, setBranchId] = useState<number | ''>('');

    const [resolved, setResolved] = useState<IResolvedApprovalWorkflow | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasRun, setHasRun] = useState(false);

    useEffect(() => {
        searchAssetTypesForWorkflowService()
            .then((r) => setCategoryOptions(r.data?.content ?? r.data ?? []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const q = debouncedCategorySearch.trim();
        searchAssetTypesForWorkflowService(q || undefined)
            .then((r) => setCategoryOptions(r.data?.content ?? r.data ?? []))
            .catch(() => {});
    }, [debouncedCategorySearch]);

    useEffect(() => {
        searchUsersForWorkflowService()
            .then((r) => setUserOptions(r.data?.content ?? r.data ?? []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const q = debouncedUserSearch.trim();
        searchUsersForWorkflowService(q || undefined)
            .then((r) => setUserOptions(r.data?.content ?? r.data ?? []))
            .catch(() => {});
    }, [debouncedUserSearch]);

    const userLabel = useMemo(
        () => (u: IUser) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || (u.email ?? `User ${u.id}`),
        []
    );

    const handleRun = async () => {
        if (!selectedCategory?.id) return;
        setLoading(true);
        setError(null);
        setHasRun(true);
        try {
            const response = await resolveApprovalWorkflowService({
                categoryId: selectedCategory.id,
                branchId: branchId === '' ? null : branchId,
                requesterId: selectedUser?.id ?? null,
            });
            setResolved(response.data as IResolvedApprovalWorkflow);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Unable to resolve workflow.';
            setError(message);
            setResolved(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: alpha(TEAL, 0.2), mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Box sx={{ bgcolor: alpha(TEAL, 0.1), borderRadius: 1.5, p: 0.75 }}>
                    <ScienceOutlinedIcon sx={{ color: TEAL, fontSize: '1.1rem', display: 'block' }} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} color={TEAL}>
                        Test workflow resolution
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Pick a category, branch and requester to see which workflow fires and which steps run.
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                    <Autocomplete
                        size="small"
                        options={categoryOptions}
                        getOptionLabel={(opt) => opt.name}
                        value={selectedCategory}
                        onChange={(_, val) => setSelectedCategory(val)}
                        onInputChange={(_, val) => setCategorySearch(val)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => (
                            <TextField {...params} label="Asset Category" placeholder="Search…" />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SelectComponent
                        id="tester-branch"
                        label="Branch"
                        required={false}
                        field={{
                            value: String(branchId ?? ''),
                            onChange: (e: any) =>
                                setBranchId(e.target.value ? Number(e.target.value) : ''),
                        }}
                        error={undefined}
                        options={[
                            { value: '', label: 'Any branch' },
                            ...branches.map((b) => ({ value: String(b.id), label: b.name })),
                        ]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                        size="small"
                        options={userOptions}
                        getOptionLabel={userLabel}
                        value={selectedUser}
                        onChange={(_, val) => setSelectedUser(val)}
                        onInputChange={(_, val) => setUserSearch(val)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => (
                            <TextField {...params} label="Requester" placeholder="Search by name…" />
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={2}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={handleRun}
                        disabled={!selectedCategory?.id || loading}
                        sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#03413A' } }}
                    >
                        Resolve
                    </Button>
                </Grid>
            </Grid>

            {hasRun && (
                <Box sx={{ mt: 2.5 }}>
                    <WorkflowPreview
                        resolved={resolved}
                        loading={loading}
                        error={error}
                        caption={
                            selectedCategory && (selectedUser || branchId)
                                ? `Resolved for: ${selectedCategory.name}${
                                      branchId
                                          ? ` · ${branches.find((b) => b.id === branchId)?.name ?? 'branch'}`
                                          : ''
                                  }${selectedUser ? ` · ${userLabel(selectedUser)}` : ''}`
                                : undefined
                        }
                    />
                </Box>
            )}
        </Paper>
    );
};

export default WorkflowTester;
