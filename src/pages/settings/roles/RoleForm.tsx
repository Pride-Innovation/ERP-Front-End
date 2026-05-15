/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { FormControl, FormHelperText, Stack, Typography, Box, alpha, useTheme, Button as MuiButton, CircularProgress } from "@mui/material"
import { Controller } from "react-hook-form"
import { IRoleForm } from "../interface"
import { InputComponent } from "../../../components/forms/Inputs"
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

const RoleForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    handleClose
}: IRoleForm) => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%' }}>
            {/* Form Header */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${alpha('#08796C', 0.1)}` }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '7px',
                            background: 'linear-gradient(135deg, #08796C, #065E53)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: '18px' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B' }}>
                        Role Information
                    </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Enter the details for this role. Roles define access levels within the system.
                </Typography>
            </Box>

            {/* Name field */}
            <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                    <Controller
                        control={control}
                        {...register("name")}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <InputComponent
                                type='input'
                                required
                                label='Role Name'
                                field={field}
                                error={formState.errors.name}
                                id='name'
                            />
                        )}
                    />
                    {formState.errors.name && (
                        <FormHelperText sx={{ color: 'error.main', ml: 0, mt: 0.5 }}>
                            {formState.errors.name?.message}
                        </FormHelperText>
                    )}
                </FormControl>
            </Box>

            {/* Description field */}
            <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                    <Controller
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <InputComponent
                                type='input'
                                label='Description (optional)'
                                field={field}
                                error={formState.errors.description}
                                id='description'
                            />
                        )}
                    />
                    {formState.errors.description && (
                        <FormHelperText sx={{ color: 'error.main', ml: 0, mt: 0.5 }}>
                            {formState.errors.description?.message}
                        </FormHelperText>
                    )}
                </FormControl>
            </Box>

            {/* Info tip */}
            <Box
                sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.08),
                    p: 2,
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    mb: 3
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    After creating the role, you can assign specific permissions to control what actions users with this role can perform.
                </Typography>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    pt: 2,
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
            >
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <MuiButton
                        onClick={handleClose}
                        color="inherit"
                        type="button"
                        variant="outlined"
                        disabled={sendingRequest}
                        sx={{
                            minWidth: '100px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            py: 0.85,
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            '&:hover': { borderColor: alpha('#000', 0.3) }
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        type="submit"
                        variant="contained"
                        disabled={sendingRequest}
                        sx={{
                            minWidth: '100px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            py: 0.85,
                            bgcolor: '#08796C',
                            '&:hover': { bgcolor: '#065E53' },
                            boxShadow: '0 2px 8px rgba(8,121,108,0.3)'
                        }}
                    >
                        {sendingRequest ? <CircularProgress size={20} color="inherit" /> : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Box>
    )
}

export default RoleForm;