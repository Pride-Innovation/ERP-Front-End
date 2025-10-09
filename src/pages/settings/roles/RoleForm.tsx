/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { FormControl, FormHelperText, Grid, Stack, Typography, Box, alpha, useTheme, Divider } from "@mui/material"
import { Controller } from "react-hook-form"
import { IRoleForm } from "../interface"
import { InputComponent } from "../../../components/forms/Inputs"
import ButtonComponent from "../../../components/forms/Button"
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
        <Grid item container xs={12} mt={0}>
            {/* Form header with icon */}
            <Grid item xs={12} sx={{ mb: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 1.5
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                    >
                        <ShieldOutlinedIcon color="primary" />
                    </Box>
                    <Typography variant="h6" fontWeight={500} color="primary">
                        Role Information
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Enter the details for this role. Roles define access levels within the system.
                </Typography>
                <Divider sx={{ opacity: 0.6 }} />
            </Grid>

            <Grid item container spacing={3} xs={12}>
                <Grid item xs={12}>
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
                                    // placeholder="Enter role name (e.g. Admin, Manager, User)"
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
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Box sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.08),
                        p: 2,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            After creating the role, you can assign specific permissions to control what actions users with this role can perform.
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Stack direction="row" spacing={2}>
                        <ButtonComponent
                            handleClick={handleClose}
                            buttonColor='inherit'
                            type='button'
                            variant="outlined"
                            sendingRequest={false}
                            buttonText="Cancel"
                        />
                        <ButtonComponent
                            buttonColor='primary'
                            type='submit'
                            sendingRequest={sendingRequest}
                            buttonText={buttonText}
                            // sx={{
                            //     px: 3,
                            //     boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                            // }}
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default RoleForm;