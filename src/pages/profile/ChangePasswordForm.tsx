import { FormControl, FormHelperText, Grid, Stack } from '@mui/material'
import { Controller } from 'react-hook-form'
import { IIChangePasswordForm } from './interface'
import { InputComponent } from '../../components/forms/Inputs'
import ButtonComponent from '../../components/forms/Button'

const ChangePasswordForm = ({
    formState,
    control,
    register,
    buttonText,
    showOldPassword,
    showNewPassword,
    showConfirmPassword,
    sendingRequest,
    handleClickShowOldPassword,
    handleClickShowNewPassword,
    handleClickShowConfirmPassword,
    handleMouseDownPassword,
    handleClose
}: IIChangePasswordForm) => {
    return (
        <Grid item container xs={12}>
            <Grid item container spacing={3} xs={12}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("oldPassword")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent
                                    required
                                    handleClick={handleClickShowOldPassword}
                                    handleMouseDown={handleMouseDownPassword}
                                    label='Enter Old Password'
                                    field={field}
                                    error={formState.errors.oldPassword}
                                    id='oldPassword'
                                    type={showOldPassword ? 'text' : 'password'}
                                    adornment
                                />
                            )}
                        />
                        {formState.errors.oldPassword && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.oldPassword.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("newPassword")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent
                                    required
                                    handleClick={handleClickShowNewPassword}
                                    handleMouseDown={handleMouseDownPassword}
                                    label='Enter New Password'
                                    field={field}
                                    error={formState.errors.newPassword}
                                    id='newPassword'
                                    type={showNewPassword ? 'text' : 'password'}
                                    adornment />
                            )}
                        />
                        {formState.errors.newPassword && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.newPassword.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("confirmPassword")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent
                                    required
                                    handleClick={handleClickShowConfirmPassword}
                                    handleMouseDown={handleMouseDownPassword}
                                    label='Confirm Password'
                                    field={field}
                                    error={formState.errors.confirmPassword}
                                    id='confirmPassword'
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    adornment />
                            )}
                        />
                        {formState.errors.confirmPassword && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.confirmPassword.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Stack direction="row" spacing={3}>
                        <ButtonComponent handleClick={handleClose} buttonColor='error' type='button' sendingRequest={false} buttonText="Cancel" />
                        <ButtonComponent buttonColor='info' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default ChangePasswordForm;