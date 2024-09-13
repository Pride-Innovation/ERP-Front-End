import {
    FormControl,
    FormHelperText,
    Grid
} from '@mui/material'
import {
    Control,
    Controller,
    FieldError,
    FormState,
    UseFormRegister
} from 'react-hook-form'
import { IUser } from './interface';
import { InputComponent } from '../../components/forms/Inputs';
import ButtonComponent from '../../components/forms/Button';

interface IUserForm {
    formState: FormState<IUser> & {
        errors: {
            email?: FieldError;
            password?: FieldError;
        };
    };
    control: Control<IUser>;
    register: UseFormRegister<IUser>;
    buttonText: string;
    sendingRequest: boolean;
}

const UserForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
}: IUserForm) => {
    return (
        <Grid item container xs={12}>
            <Grid item container spacing={2} xs={12}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("email")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Email Address' field={field} error={formState.errors.email} id='email' />
                            )}
                        />
                        {formState.errors.email && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.email.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("email")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Email Address' field={field} error={formState.errors.email} id='email' />
                            )}
                        />
                        {formState.errors.email && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.email.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <ButtonComponent buttonColor='success' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                </Grid>
            </Grid>
        </Grid>
    )
}

export default UserForm;