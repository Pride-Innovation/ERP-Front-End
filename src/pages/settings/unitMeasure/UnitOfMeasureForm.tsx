/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack } from "@mui/material"
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect
} from "../../../components/forms"
import { IUnitOfMeasureForm } from "./interface"
import UnitMeasureUtills from "./Utills"
import ButtonComponent from "../../../components/forms/Button"

const UnitOfMeasureForm = ({
    register,
    control,
    formState,
    handleClose,
    sendingRequest,
    buttonText
}: IUnitOfMeasureForm) => {
    const { formFields } = UnitMeasureUtills()
    return (
        <Grid item container xs={12}>
            <Grid item container spacing={4} xs={12}>
                {
                    formFields.map(formField => {
                        return formField.type === 'input' ? (
                            <Grid item xs={12} md={6}>
                                <UseFormInput
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label}
                                />
                            </Grid>
                        ) :
                            formField.type === 'textarea' ? (
                                <Grid item xs={12} md={12}>
                                    <UseFormInput
                                        row={4}
                                        multiline={true}
                                        register={register}
                                        control={control}
                                        formState={formState}
                                        value={formField.value}
                                        label={formField.label}
                                    />
                                </Grid>
                            ) :
                                formField.type === 'number' ? (
                                    <Grid item xs={12} md={6}>
                                        <UseFormInput
                                            type="number"
                                            register={register}
                                            control={control}
                                            formState={formState}
                                            value={formField.value}
                                            label={formField.label}
                                        />
                                    </Grid>
                                ) : formField.type === 'select' ? (
                                    <Grid item xs={12} md={6}>
                                        <UseFormSelect
                                            options={formField.options}
                                            register={register}
                                            control={control}
                                            formState={formState}
                                            value={formField.value}
                                            label={formField.label} />
                                    </Grid>
                                ) : formField.type === 'date' ? (
                                    <Grid item xs={12} md={6}>
                                        <UseFormDatePicker
                                            register={register}
                                            control={control}
                                            formState={formState}
                                            value={formField.value}
                                            label={formField.label} />
                                    </Grid>
                                ) : formField.type === 'autocomplete' ? (
                                    <Grid item xs={12} md={6}>
                                        <UseFormAutocompleteComponent
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
                        <ButtonComponent handleClick={handleClose} buttonColor='error' type='button' sendingRequest={false} buttonText="Cancel" />
                        <ButtonComponent buttonColor='success' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default UnitOfMeasureForm