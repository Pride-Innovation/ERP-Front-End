/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Divider,
    Grid,
    Stack
} from '@mui/material'

import ButtonComponent from '../../components/forms/Button';
import UserUtils from './utils';
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect
} from '../../components/forms';
import { IUserForm } from './interface';

const UserForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    handleClose,
}: IUserForm) => {
    const { userFields } = UserUtils();
    return (
        <Box sx={{ width: "100%" }}>
            <Grid container spacing={3}>
                {userFields.map((field) => {
                    const commonProps = {
                        register,
                        control,
                        formState,
                        value: field.value,
                        label: field.label,
                    };

                    const gridSize = field.type === "textarea" ? 12 : 4;

                    return (
                        <Grid item xs={12} md={gridSize} key={field.value}>
                            {field.type === "input" && <UseFormInput {...commonProps} />}
                            {field.type === "textarea" && <UseFormInput {...commonProps} multiline row={4} />}
                            {field.type === "number" && <UseFormInput {...commonProps} type="number" />}
                            {field.type === "select" && (
                                <UseFormSelect {...commonProps} options={field.options} />
                            )}
                            {field.type === "date" && <UseFormDatePicker {...commonProps} />}
                            {field.type === "autocomplete" && (
                                <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                            )}
                        </Grid>
                    );
                })}

                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                    >
                        {/* {update && (
                            <ButtonComponent
                                variant="outlined"
                                handleClick={handleClose}
                                buttonColor="info"
                                type="button"
                                sendingRequest={false}
                                buttonText="Update Permissions"
                            />
                        )} */}

                        <Stack direction="row" spacing={2}>
                            <ButtonComponent
                                handleClick={handleClose}
                                buttonColor="error"
                                type="button"
                                sendingRequest={false}
                                buttonText="Cancel"
                            />
                            <ButtonComponent
                                buttonColor="success"
                                type="submit"
                                sendingRequest={sendingRequest}
                                buttonText={buttonText}
                            />
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    )
}

export default UserForm;