import {
    FormControl,
    FormHelperText,
    Grid,
    Stack
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
import SelectComponent from '../../components/forms/Select';

interface IUserForm {
    formState: FormState<IUser> & {
        errors: {
            email?: FieldError;
            reportsTo?: FieldError;
            firstName?: FieldError;
            lastName?: FieldError;
            otherName?: FieldError;
            title?: FieldError;
            department?: FieldError;
            unit?: FieldError;
            gender?: FieldError;
            staffNumber?: FieldError;
        };
    };
    control: Control<IUser>;
    register: UseFormRegister<IUser>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

const UserForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    handleClose
}: IUserForm) => {
    return (
        <Grid item container xs={12}>
            <Grid item container spacing={4} xs={12}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("firstName")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent type='input' required label='First name' field={field} error={formState.errors.firstName} id='firstName' />
                            )}
                        />
                        {formState.errors.email && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.firstName?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("lastName")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent type='input' required label='Last name' field={field} error={formState.errors.lastName} id='lastName' />
                            )}
                        />
                        {formState.errors.email && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.lastName?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("otherName")}
                            rules={{ required: false }}
                            render={({ field }) => (
                                <InputComponent type='input' label='Other name' field={field} error={formState.errors.otherName} id='otherName' />
                            )}
                        />
                        {formState.errors.email && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.otherName?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("staffNumber")}
                            rules={{ required: false }}
                            render={({ field }) => (
                                <InputComponent type='input' required label='Staff Number' field={field} error={formState.errors.staffNumber} id='staffNumber' />
                            )}
                        />
                        {formState.errors.email && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.staffNumber?.message}</FormHelperText>
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
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("gender")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <SelectComponent
                                    id='gender'
                                    field={field}
                                    error={formState.errors.gender}
                                    required label='Gender'
                                    options={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }]} />
                            )}
                        />
                        {formState.errors.gender && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.gender.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("department")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Department' field={field} error={formState.errors.department} id='department' />
                            )}
                        />
                        {formState.errors.department && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.department.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("unit")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Unit' field={field} error={formState.errors.unit} id='unit' />
                            )}
                        />
                        {formState.errors.unit && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.unit.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("title")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Title' field={field} error={formState.errors.title} id='title' />
                            )}
                        />
                        {formState.errors.title && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.title.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("reportsTo")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Reports To' field={field} error={formState.errors.reportsTo} id='reportsTo' />
                            )}
                        />
                        {formState.errors.reportsTo && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.reportsTo.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                    <Stack direction="row" spacing={3} sx={{ width: "30%" }}>
                        <ButtonComponent handleClick={handleClose} buttonColor='error' type='button' sendingRequest={false} buttonText="Close" />
                        <ButtonComponent buttonColor='success' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default UserForm;