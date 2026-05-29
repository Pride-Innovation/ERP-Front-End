/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Grid,
    Stack,
    Typography,
    alpha,
    Button as MuiButton,
    Paper,
    CircularProgress,
} from '@mui/material';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { UseFormInput, UseFormSelect } from '../../components/forms';
import AsyncAutocomplete, { IAsyncAutocompleteOption } from '../../components/forms/AsyncAutocomplete';
import { IUserForm } from './interface';
import {
    fetchBranchesPage,
    fetchDepartmentsPage,
    fetchTitlesPage,
    fetchUnitsPage,
} from './service/referenceData';

import PersonIcon from '@mui/icons-material/Person';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import BusinessIcon from '@mui/icons-material/Business';
import CancelIcon from '@mui/icons-material/Cancel';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SaveIcon from '@mui/icons-material/Save';

const PRIMARY_COLOR = '#08796C';

const sectionSx = {
    p: { xs: 2, sm: 2.5 },
    borderRadius: 2,
    border: `1px solid ${alpha('#000', 0.07)}`,
    bgcolor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
};

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

const SectionHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Box
            sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                color: PRIMARY_COLOR,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
            {title}
        </Typography>
    </Stack>
);

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

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha('#000', 0.08)}`,
                bgcolor: alpha('#F8FAFC', 0.5),
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 3,
                    bgcolor: '#fff',
                    borderBottom: `1px solid ${alpha('#000', 0.07)}`,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                        color: PRIMARY_COLOR,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                    }}
                >
                    {mode === 'update' ? <ManageAccountsIcon /> : <PersonIcon />}
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {mode === 'update' ? 'Update User Account' : 'Create New User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {mode === 'update'
                            ? 'Update personal details, duty station and account information.'
                            : 'Provide the user details below. Verification email is sent on creation.'}
                    </Typography>
                </Box>
            </Box>

            {/* Body */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Grid container spacing={3}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ ...sectionSx, height: '100%' }}>
                            <SectionHeader title="Personal Information" icon={<PersonIcon fontSize="small" />} />
                            <Grid container spacing={2}>
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
                                <Grid item xs={12}>
                                    <UseFormInput
                                        register={register}
                                        control={control}
                                        formState={formState}
                                        value="otherName"
                                        label="Other Name (optional)"
                                        required={false}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <UseFormInput
                                        register={register}
                                        control={control}
                                        formState={formState}
                                        value="email"
                                        label="Email Address (@pridebank.co.ug)"
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
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Work / Title Information */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3} sx={{ height: '100%' }}>
                            <Paper elevation={0} sx={sectionSx}>
                                <SectionHeader title="Title & Identification" icon={<ContactMailIcon fontSize="small" />} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
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
                                    <Grid item xs={12}>
                                        <UseFormInput
                                            register={register}
                                            control={control}
                                            formState={formState}
                                            value="staffNumber"
                                            label="Staff Number"
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            <Paper elevation={0} sx={sectionSx}>
                                <SectionHeader title="Duty Station" icon={<BusinessIcon fontSize="small" />} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
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
                                        <Grid item xs={12}>
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
                                        </Grid>
                                    )}
                                    {isHeadOffice && selectedDepartmentId && (
                                        <Grid item xs={12}>
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
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    p: 3,
                    borderTop: `1px solid ${alpha('#000', 0.07)}`,
                    bgcolor: '#fff',
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <MuiButton
                        variant="outlined"
                        onClick={handleClose}
                        startIcon={<CancelIcon />}
                        sx={{
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: { xs: '100%', sm: 120 },
                            '&:hover': { borderColor: alpha('#000', 0.3), bgcolor: alpha('#000', 0.04) },
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        type="submit"
                        variant="contained"
                        disabled={sendingRequest}
                        startIcon={sendingRequest ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
                        sx={{
                            minWidth: { xs: '100%', sm: 160 },
                            bgcolor: PRIMARY_COLOR,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: `0 4px 12px ${alpha(PRIMARY_COLOR, 0.3)}`,
                            '&:hover': { bgcolor: '#065f54' },
                            '&.Mui-disabled': { bgcolor: alpha(PRIMARY_COLOR, 0.5), color: '#fff' },
                        }}
                    >
                        {sendingRequest ? 'Saving…' : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Paper>
    );
};

export default UserForm;
