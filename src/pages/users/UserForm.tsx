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
    useTheme,
    Button as MuiButton,
    useMediaQuery,
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

// Brand colors
const PRIMARY_COLOR = '#08796C';

const UserForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    handleClose,
}: IUserForm) => {
    const { userFields } = UserUtils();
    const { fetchAllTitles } = TitleUtills();
    const { fetchAllBranches } = BranchUtills();
    const { fetchAllDepartments } = DepartmentUtills();
    const { displayDepartment } = useContext(AutocompleteContext);
    const theme = useTheme();
    // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
        <Box
            sx={{
                width: "100%",
                px: { xs: 1, sm: 2 },
                py: { xs: 2, sm: 3 }
            }}
        >
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={6}>
                    <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 3 },
                                borderRadius: 2,
                                height: '100%',
                                border: `1px solid ${alpha('#000', 0.08)}`,
                                bgcolor: alpha(PRIMARY_COLOR, 0.02),
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                        >
                            {renderSectionHeader("Personal Information", <PersonIcon />)}
                        {renderFormFields(personalInfoFields, 5)}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6} lg={6}>
                    <Stack spacing={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 3 },
                                borderRadius: 2,
                                border: `1px solid ${alpha('#000', 0.08)}`,
                                bgcolor: alpha(PRIMARY_COLOR, 0.02),
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                        >
                            {renderSectionHeader("Work Information", <BusinessIcon />)}
                            {renderFormFields(workInfoFields, 7)}
                        </Paper>

                        {otherFields.length > 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 2, sm: 3 },
                                    borderRadius: 2,
                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.02),
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                }}
                            >
                                {renderSectionHeader("Additional Information", <ContactMailIcon />)}
                                {renderFormFields(otherFields, 7)}
                            </Paper>
                        )}
                    </Stack>
                </Grid>
            </Grid>

            <Box sx={{
                mt: 4,
                pt: 2,
                borderTop: `1px solid ${alpha('#000', 0.1)}`
            }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="flex-end"
                    alignItems={{ xs: "stretch", sm: "center" }}
                >

                    <MuiButton
                        onClick={handleClose}
                        color="inherit"
                        type="button"
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        sx={{
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: alpha('#000', 0.3),
                                backgroundColor: alpha('#000', 0.05)
                            }
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        color="success"
                        variant="contained"
                        type="submit"
                        fullWidth={isSmallScreen}
                        disabled={sendingRequest}
                        sx={{
                            minWidth: { xs: '100%', sm: '120px' },
                            maxWidth: { sm: '200px' },
                            px: 3,
                            bgcolor: PRIMARY_COLOR,
                            '&:hover': {
                                bgcolor: alpha(PRIMARY_COLOR, 0.9),
                            }
                        }}
                    >
                        {buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default UserForm;