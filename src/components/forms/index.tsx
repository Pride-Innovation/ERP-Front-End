/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { FormControl, FormHelperText } from '@mui/material';
import React from 'react';
import { Controller, FieldValues } from 'react-hook-form';
import { InputComponent } from './Inputs';
import SelectComponent from './Select';
import { IOptions } from '../tables/interface';
import { IUseFormInput } from './interface';
import DatePickerComponent from './DatePicker';
import AutocompleteComponent from './Autocomplete';
import TimePickerComponent from './TimePicker';

export const UseFormInput = <T extends FieldValues>({
    register,
    control,
    formState,
    value,
    label,
    type = "input",
    row = 0,
    multiline = false,
    required = true
}: IUseFormInput<T>) => {
    return (
        <React.Fragment>
            <FormControl fullWidth>
                <Controller
                    control={control}
                    {...register(value)}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <InputComponent
                            row={row}
                            multiline={multiline}
                            type={type}
                            required={required}
                            label={label}
                            field={field}
                            error={formState.errors[value]?.message}
                            id={value}
                        />
                    )}
                />
                {formState.errors[value] && (
                    <FormHelperText sx={{ color: 'error.main' }}>
                        {formState.errors[value].message}
                    </FormHelperText>
                )}
            </FormControl>
        </React.Fragment>
    );
}

export const UseFormSelect = <T extends FieldValues>({
    register,
    control,
    formState,
    value,
    label,
    options
}: IUseFormInput<T>) => {
    return (
        <React.Fragment>
            <FormControl fullWidth>
                <Controller
                    control={control}
                    {...register(value)}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <SelectComponent
                            id={value}
                            field={field}
                            error={formState.errors[value]}
                            required label={label}
                            options={options as IOptions[]}
                        />
                    )}
                />
                {formState.errors[value] && (
                    <FormHelperText sx={{ color: 'error.main' }}>{formState.errors[value].message}</FormHelperText>
                )}
            </FormControl>
        </React.Fragment>
    )
}

export const UseFormDatePicker = <T extends FieldValues>({
    register,
    control,
    formState,
    value,
    label,
}: IUseFormInput<T>) => {
    return (
        <React.Fragment>
            <FormControl fullWidth>
                <Controller
                    control={control}
                    {...register(value)}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <DatePickerComponent field={field} label={label} error={formState.errors[value]?.message} />
                    )}
                />
                {formState.errors[value] && (
                    <FormHelperText sx={{ color: 'error.main' }}>{formState.errors[value].message}</FormHelperText>
                )}
            </FormControl>
        </React.Fragment>
    )
}


export const UseFormAutocompleteComponent = <T extends FieldValues>({
    register,
    control,
    formState,
    value,
    label,
    options,
    multiple = false
}: IUseFormInput<T>) => {
    return (
        <React.Fragment>
            <FormControl fullWidth>
                <Controller
                    control={control}
                    {...register(value)}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <AutocompleteComponent
                            multiple={multiple}
                            options={options as Array<IOptions>}
                            field={field}
                            label={label}
                            error={formState.errors[value]?.message} />
                    )}
                />
                {formState.errors[value] && (
                    <FormHelperText sx={{ color: 'error.main' }}>{formState.errors[value].message}</FormHelperText>
                )}
            </FormControl>
        </React.Fragment>
    )
}


export const UseFormTimePicker = <T extends FieldValues>({
    register,
    control,
    formState,
    value,
    label,
}: IUseFormInput<T>) => {
    return (
        <React.Fragment>
            <FormControl fullWidth>
                <Controller
                    control={control}
                    {...register(value)}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <TimePickerComponent field={field} label={label} error={formState.errors[value]?.message} />
                    )}
                />
                {formState.errors[value] && (
                    <FormHelperText sx={{ color: 'error.main' }}>{formState.errors[value].message}</FormHelperText>
                )}
            </FormControl>
        </React.Fragment>
    )
}