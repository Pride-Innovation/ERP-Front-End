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
} from '@mui/material';

import UserUtils from './utils';
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect
} from '../../components/forms';
import { IUserForm } from './interface';
import TitleUtills from '../settings/titles/utills';
import { useContext, useEffect } from 'react';
import BranchUtills from '../settings/branch/utills';
import { AutocompleteContext } from '../../context/autocomplete';
import DepartmentUtills from '../settings/departments/utills';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import BusinessIcon from '@mui/icons-material/Business';
import CancelIcon from '@mui/icons-material/Cancel';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SaveIcon from '@mui/icons-material/Save';

// Brand colors
const PRIMARY_COLOR = '#08796C';

const sectionPaperSx = {
    p: { xs: 2, sm: 3 },
    borderRadius: 2,
    border: `1px solid ${alpha('#000', 0.08)}`,
    bgcolor: alpha(PRIMARY_COLOR, 0.02),
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const UserForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    handleClose,
    mode = 'create',
}: IUserForm) => {
    const { userFields } = UserUtils();
    const { fetchAllTitles } = TitleUtills();
    const { fetchAllBranches } = BranchUtills();
    const { fetchAllDepartments } = DepartmentUtills();
    const { displayDepartment } = useContext(AutocompleteContext);

    useEffect(() => { fetchAllTitles() }, []);
    useEffect(() => { fetchAllBranches() }, []);
    useEffect(() => { fetchAllDepartments() }, []);

    const personalInfoFields = userFields.filter(field =>
        ['firstName', 'lastName', 'otherName', 'email', 'phone', 'gender', 'dateOfBirth', 'title'].includes(field.value)
    );

    const workInfoFields = userFields.filter(field =>
        ['branch', 'department', 'employmentType', 'designation', 'staffNumber'].includes(field.value)
    );

    const accountFields = userFields.filter(field =>
        ['username', 'role', 'status'].includes(field.value)
    );

    const otherFields = userFields.filter(field =>
        !personalInfoFields.includes(field) &&
        !workInfoFields.includes(field) &&
        !accountFields.includes(field)
    );

    const renderSectionHeader = (title: string, icon: React.ReactNode) => (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            position: 'relative'
        }}>
            <Box
                sx={{
                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                    color: PRIMARY_COLOR,
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    mr: 2
                }}
            >
                {icon}
            </Box>
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {title}
            </Typography>
            <Box
                sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '1px',
                    bgcolor: alpha('#000', 0.1),
                    bottom: -8,
                    zIndex: 0
                }}
            />
        </Box>
    );

    const renderFormFields = (fields: any[], columnSize: number = 12) => (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {fields.map((field) => {
                const commonProps = {
                    register,
                    control,
                    formState,
                    value: field.value,
                    label: field.label,
                    required: field.required === false ? field.required : true
                };

                let gridSize;
                if (field.type === "textarea") {
                    gridSize = 12;
                } else if (field.value === "firstName" || field.value === "lastName") {
                    gridSize = 6;
                } else if (field.value === "email") {
                    gridSize = 12;
                } else if (columnSize <= 6) {
                    gridSize = 12;
                } else {
                    gridSize = 6;
                }

                return (
                    <Grid item xs={12} sm={gridSize} key={field.value}>
                        {field.type === "input" && <UseFormInput {...commonProps} />}
                        {field.type === "textarea" && <UseFormInput {...commonProps} multiline row={4} />}
                        {field.type === "number" && <UseFormInput {...commonProps} type="number" />}
                        {field.type === "select" && (
                            <UseFormSelect {...commonProps} options={field.options} />
                        )}
                        {field.type === "date" && <UseFormDatePicker {...commonProps} />}
                        {field.type === "autocomplete" && !displayDepartment && (
                            <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                        )}
                        {field.type === "autocomplete" && displayDepartment && (
                            <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                        )}
                    </Grid>
                );
            })}
        </Grid>
    );

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha('#000', 0.08)}`,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: alpha(PRIMARY_COLOR, 0.03),
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: `1px solid ${alpha('#000', 0.08)}`,
                }}
            >
                <Box
                    sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.12),
                        color: PRIMARY_COLOR,
                        width: 44,
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1.5,
                        mr: 2,
                        flexShrink: 0,
                    }}
                >
                    {mode === 'update' ? <ManageAccountsIcon /> : <PersonIcon />}
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
                        {mode === 'update' ? 'Update User Account' : 'Create New User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {mode === 'update'
                            ? 'Modify user account details, permissions and work information'
                            : 'Fill in the details below to register a new user account'}
                    </Typography>
                </Box>
            </Box>

            {/* Form Content */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Grid container spacing={3}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={6} lg={6}>
                        <Paper elevation={0} sx={{ ...sectionPaperSx, height: '100%' }}>
                            {renderSectionHeader('Personal Information', <PersonIcon />)}
                            {renderFormFields(personalInfoFields, 5)}
                        </Paper>
                    </Grid>

                    {/* Work + Account sections */}
                    <Grid item xs={12} md={6} lg={6}>
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={sectionPaperSx}>
                                {renderSectionHeader('Work Information', <BusinessIcon />)}
                                {renderFormFields(workInfoFields, 7)}
                            </Paper>

                            <Paper elevation={0} sx={sectionPaperSx}>
                                {renderSectionHeader('Account & Access', <ManageAccountsIcon />)}
                                {renderFormFields(accountFields, 7)}
                            </Paper>

                            {otherFields.length > 0 && (
                                <Paper elevation={0} sx={sectionPaperSx}>
                                    {renderSectionHeader('Additional Information', <ContactMailIcon />)}
                                    {renderFormFields(otherFields, 7)}
                                </Paper>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    p: 3,
                    borderTop: `1px solid ${alpha('#000', 0.08)}`,
                    bgcolor: alpha('#f5f5f5', 0.5),
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    <MuiButton
                        variant="outlined"
                        onClick={handleClose}
                        startIcon={<CancelIcon />}
                        sx={{
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            minWidth: { xs: '100%', sm: 110 },
                            '&:hover': {
                                borderColor: alpha('#000', 0.3),
                                bgcolor: alpha('#000', 0.05),
                            },
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        type="submit"
                        variant="contained"
                        disabled={sendingRequest}
                        startIcon={<SaveIcon />}
                        sx={{
                            minWidth: { xs: '100%', sm: 140 },
                            bgcolor: PRIMARY_COLOR,
                            boxShadow: `0 4px 12px ${alpha(PRIMARY_COLOR, 0.3)}`,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: '#065f54',
                                transform: 'translateY(-1px)',
                                boxShadow: `0 6px 16px ${alpha(PRIMARY_COLOR, 0.4)}`,
                            },
                            transition: 'all 0.2s ease',
                            '&.Mui-disabled': {
                                bgcolor: alpha(PRIMARY_COLOR, 0.5),
                                color: '#fff',
                            },
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