import { FormControl, FormHelperText, Grid } from '@mui/material'
import { Controller } from 'react-hook-form'
import { IIChangePasswordForm } from './interface'
import { InputComponent } from '../../components/forms/Inputs'
import ButtonComponent from '../../components/forms/Button'

const ChangePasswordForm = ({
    formState,
    control,
    register,
    buttonText,
    showPassword,
    loggingIn,
    handleClickShowPassword,
    handleMouseDownPassword,
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
                                <InputComponent required label='Enter Old Password' field={field} error={formState.errors.oldPassword} id='oldPassword' />
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
                                    handleClick={handleClickShowPassword}
                                    handleMouseDown={handleMouseDownPassword}
                                    label='Enter New Password'
                                    field={field}
                                    error={formState.errors.newPassword}
                                    id='newPassword'
                                    type={showPassword ? 'text' : 'password'}
                                    adornment />
                            )}
                        />
                        {formState.errors.newPassword && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.newPassword.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <ButtonComponent buttonColor='success' type='submit' sendingRequest={loggingIn} buttonText={buttonText} />
                </Grid>
            </Grid>
        </Grid>
    )
}

export default ChangePasswordForm