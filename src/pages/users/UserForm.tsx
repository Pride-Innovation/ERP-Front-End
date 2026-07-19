/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Collapse,
    Grid,
    Stack,
    Typography,
    alpha,
    Button as MuiButton,
    Paper,
    CircularProgress,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { UseFormInput, UseFormSelect } from '../../components/forms';
import AsyncAutocomplete, { IAsyncAutocompleteOption } from '../../components/forms/AsyncAutocomplete';
import { PageSection } from '../../components/layout';
import { brand, neutral, border, status } from '../../utils/tokens';
import { IUserForm } from './interface';
import {
    fetchBranchesPage,
    fetchDepartmentsPage,
    fetchTitlesPage,
    fetchUnitsPage,
} from './service/referenceData';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

const P = brand[500];

interface IUserFormProps extends IUserForm {
    /** Pre-selected options for hydrating the async fields on Update. */
    initialTitle?: IAsyncAutocompleteOption | null;
    initialBranch?: IAsyncAutocompleteOption | null;
    initialDepartment?: IAsyncAutocompleteOption | null;
    initialUnit?: IAsyncAutocompleteOption | null;
    /** Notifies parent when the selected branch changes (used to drive department visibility & schema context). */
    onBranchChange?: (option: IAsyncAutocompleteOption | null) => void;
    /** Notifies parent when the selected department changes (used to clear a stale unit selection). */
    onDepartmentChange?: (option: IAsyncAutocompleteOption | null) => void;
}

const UserForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    handleClose,
    mode = 'create',
    initialTitle = null,
    initialBranch = null,
    initialDepartment = null,
    initialUnit = null,
    onBranchChange,
    onDepartmentChange,
}: IUserFormProps) => {
    // The Department field exists in the form schema; useWatch lets us react to
    // the live branch selection without rerendering the whole tree.
    const selectedBranchId = useWatch({ control, name: 'branch' as any });
    const selectedDepartmentId = useWatch({ control, name: 'department' as any });

    const isHeadOffice = useMemo(() => {
        // initialBranch covers Update form pre-fill; onBranchChange callback (parent state) covers post-change.
        // We rely on the parent to inform us via onBranchChange — see CreateUser/UpdateUsers.
        if (initialBranch?.raw?.isHeadOffice && initialBranch.value === selectedBranchId) return true;
        return false;
    }, [initialBranch, selectedBranchId]);

    // Route changes while dirty (Cancel, breadcrumbs, browser Back) are guarded
    // by the useBlocker in CreateUser/UpdateUsers — this only covers tab close/refresh.
    useEffect(() => {
        if (!formState.isDirty) return;
        const warn = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [formState.isDirty]);

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                borderRadius: 2.5,
                overflow: 'hidden',
                border: `1px solid ${border.subtle}`,
                bgcolor: '#fff',
            }}
        >
            {/* ── Body ── */}
            <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 3 }}>
                <PageSection
                    variant="flat"
                    title="Personal Information"
                    subtitle="The user's names, corporate email and gender"
                    icon={<PersonOutlineIcon />}
                    mb={4}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <UseFormInput
                                register={register}
                                control={control}
                                formState={formState}
                                value="firstName"
                                label="First Name"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <UseFormInput
                                register={register}
                                control={control}
                                formState={formState}
                                value="lastName"
                                label="Last Name"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <UseFormInput
                                register={register}
                                control={control}
                                formState={formState}
                                value="otherName"
                                label="Other Name"
                                required={false}
                                helperText="Optional"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <UseFormInput
                                register={register}
                                control={control}
                                formState={formState}
                                value="email"
                                label="Email Address"
                                placeholder="e.g. jdoe@pridebank.co.ug"
                                helperText="Must be a @pridebank.co.ug address — the verification email is sent here"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <UseFormSelect
                                register={register}
                                control={control}
                                formState={formState}
                                value="gender"
                                label="Gender"
                                options={[
                                    { label: 'Male', value: 'male' },
                                    { label: 'Female', value: 'female' },
                                ]}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <UseFormSelect
                                register={register}
                                control={control}
                                formState={formState}
                                value="availability"
                                label="Availability"
                                options={[
                                    { label: 'Present', value: 'present' },
                                    { label: 'Absent', value: 'absent' },
                                ]}
                                helperText="Whether the user is currently on duty and can receive assignments"
                            />
                        </Grid>
                    </Grid>
                </PageSection>

                <PageSection
                    variant="flat"
                    title="Title & Identification"
                    subtitle="Job title and staff number"
                    icon={<BadgeOutlinedIcon />}
                    mb={4}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <AsyncAutocomplete
                                control={control}
                                name={'title' as any}
                                label="Title"
                                required
                                error={(formState.errors as any).title}
                                fetchPage={fetchTitlesPage}
                                initialOption={initialTitle}
                                placeholder="Search titles…"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <UseFormInput
                                register={register}
                                control={control}
                                formState={formState}
                                value="staffNumber"
                                label="Staff Number"
                                placeholder="Enter the staff number"
                            />
                        </Grid>
                    </Grid>
                </PageSection>

                <PageSection
                    variant="flat"
                    title="Duty Station"
                    subtitle="Where the user is stationed — departments and units apply to Head Office staff only"
                    icon={<BusinessOutlinedIcon />}
                    mb={0}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <AsyncAutocomplete
                                control={control}
                                name={'branch' as any}
                                label="Duty Station"
                                required
                                error={(formState.errors as any).branch}
                                fetchPage={fetchBranchesPage}
                                initialOption={initialBranch}
                                onOptionChange={onBranchChange}
                                placeholder="Search branches (Head Office, etc.)…"
                            />
                        </Grid>
                        {isHeadOffice && (
                            <Grid item xs={12} sm={6}>
                                <Collapse in appear>
                                    <AsyncAutocomplete
                                        control={control}
                                        name={'department' as any}
                                        label="Department"
                                        required
                                        error={(formState.errors as any).department}
                                        fetchPage={fetchDepartmentsPage(selectedBranchId)}
                                        initialOption={initialDepartment}
                                        onOptionChange={onDepartmentChange}
                                        refetchKey={selectedBranchId}
                                        placeholder="Search Head Office departments…"
                                    />
                                </Collapse>
                            </Grid>
                        )}
                        {isHeadOffice && selectedDepartmentId && (
                            <Grid item xs={12} sm={6}>
                                <Collapse in appear>
                                    <AsyncAutocomplete
                                        control={control}
                                        name={'unit' as any}
                                        label="Unit (optional)"
                                        required={false}
                                        error={(formState.errors as any).unit}
                                        fetchPage={fetchUnitsPage(selectedDepartmentId)}
                                        initialOption={initialUnit}
                                        refetchKey={selectedDepartmentId}
                                        placeholder="Search units in this department…"
                                    />
                                </Collapse>
                            </Grid>
                        )}
                    </Grid>
                </PageSection>
            </Box>

            {/* ── Footer ── */}
            <Box
                sx={{
                    px: { xs: 2, md: 3.5 },
                    py: 2,
                    borderTop: `1px solid ${border.subtle}`,
                    bgcolor: '#FAFBFC',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <MuiButton
                        onClick={handleClose}
                        type="button"
                        variant="text"
                        startIcon={<CloseIcon fontSize="small" />}
                        sx={{
                            color: neutral[500], textTransform: 'none', fontSize: '0.82rem', borderRadius: '8px',
                            '&:hover': { color: status.danger.main, bgcolor: alpha(status.danger.main, 0.06) },
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <Typography variant="caption" sx={{ color: neutral[400], display: { xs: 'none', sm: 'block' } }}>
                        {mode === 'update'
                            ? 'Changes take effect immediately after saving'
                            : 'A verification email is sent once the user is created'}
                    </Typography>
                </Stack>

                <MuiButton
                    type="submit"
                    variant="contained"
                    disabled={sendingRequest}
                    startIcon={sendingRequest ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon fontSize="small" />}
                    sx={{
                        height: 40, minWidth: { xs: '100%', sm: 170 }, borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                        bgcolor: P, boxShadow: `0 2px 8px ${alpha(P, 0.3)}`,
                        '&:hover': { bgcolor: brand[700], boxShadow: `0 4px 14px ${alpha(P, 0.4)}` },
                        '&.Mui-disabled': { bgcolor: alpha(P, 0.45), color: '#fff' },
                    }}
                >
                    {sendingRequest ? 'Saving…' : buttonText}
                </MuiButton>
            </Box>
        </Paper>
    );
};

export default UserForm;
