import {
    Grid,
    Stack
} from '@mui/material'
import {
    Control,
    FieldError,
    FormState,
    UseFormRegister
} from 'react-hook-form'
import { IUser } from './interface';
import ButtonComponent from '../../components/forms/Button';
import UserUtils from './utils';
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect
} from '../../components/forms';
import { useEffect } from 'react';

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
    handleClose,
}: IUserForm) => {
    const { userFields, formatRoles, fetchRolesData, roles, setRoleOptions } = UserUtils();
    useEffect(() => { fetchRolesData(); }, []);
    useEffect(() => { setRoleOptions(formatRoles(roles)) }, [roles])
    return (
        <Grid item container xs={12}>
            <Grid item container spacing={4} xs={12}>
                {
                    userFields.map(formField => {
                        return formField.type === 'input' ? (
                            <Grid item xs={12} md={4}>
                                <UseFormInput
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label}
                                />
                            </Grid>
                        ) : formField.type === 'select' ? (
                            <Grid item xs={12} md={4}>
                                <UseFormSelect
                                    options={formField.options}
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label} />
                            </Grid>
                        ) : formField.type === 'date' ? (
                            <Grid item xs={12} md={4}>
                                <UseFormDatePicker
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label} />
                            </Grid>
                        ) : formField.type === 'autocomplete' ? (
                            <Grid item xs={12} md={8}>
                                <UseFormAutocompleteComponent
                                    multiple
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label}
                                    options={formField.options}
                                />
                            </Grid>
                        )
                            : null
                    })
                }
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                    <Stack direction="row" spacing={3} sx={{ width: "30%" }}>
                        <ButtonComponent handleClick={() => handleClose?.()} buttonColor='error' type='button' sendingRequest={false} buttonText="Cancel" />
                        <ButtonComponent buttonColor='success' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default UserForm;