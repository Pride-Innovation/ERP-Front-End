/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid } from '@mui/material';
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect,
    UseFormTimePicker,
} from '../../../../components/forms';
import { Control, FormState, UseFormRegister } from 'react-hook-form';
import { IRequest } from '../../interface';
import { IFormData } from '../../../assets/interface';

interface IBasicInformationPanelProps {
    register: UseFormRegister<IRequest>;
    control: Control<IRequest>;
    formState: FormState<IRequest>;
    formFields: Array<IFormData<IRequest>>;
}

const BasicInformationPanel = ({
    register,
    control,
    formState,
    formFields,
}: IBasicInformationPanelProps) => {
    const basicFields = formFields.filter(
        (f) => f.type === 'input' || f.type === 'select' || f.type === 'autocomplete'
    );
    const detailFields = formFields.filter((f) => f.type === 'textarea');
    const dateTimeFields = formFields.filter((f) => f.type === 'date' || f.type === 'time');

    return (
        <Grid container spacing={3}>
            {basicFields.map((field, idx) => {
                const commonProps = {
                    register,
                    control,
                    formState,
                    value: field.value,
                    label: field.label,
                } as const;

                return (
                    <Grid item xs={12} md={6} key={`basic-${idx}`}>
                        {field.type === 'input' || field.type === 'number' ? (
                            <UseFormInput {...commonProps} type={field.type} />
                        ) : field.type === 'select' ? (
                            <UseFormSelect {...commonProps} options={field.options} />
                        ) : field.type === 'autocomplete' ? (
                            <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                        ) : null}
                    </Grid>
                );
            })}

            {detailFields.map((field, idx) => (
                <Grid item xs={12} key={`detail-${idx}`}>
                    <UseFormInput
                        register={register}
                        control={control}
                        formState={formState}
                        value={field.value}
                        label={field.label}
                        multiline
                        // Tall enough to bring the section level with the upload card beside it —
                        // a shorter textarea leaves a dead band under this column.
                        row={9}
                    />
                </Grid>
            ))}

            {dateTimeFields.map((field, idx) => (
                <Grid item xs={12} md={6} key={`datetime-${idx}`}>
                    {field.type === 'date' ? (
                        <UseFormDatePicker
                            register={register}
                            control={control}
                            formState={formState}
                            value={field.value}
                            label={field.label}
                        />
                    ) : field.type === 'time' ? (
                        <UseFormTimePicker
                            register={register}
                            control={control}
                            formState={formState}
                            value={field.value}
                            label={field.label}
                        />
                    ) : null}
                </Grid>
            ))}
        </Grid>
    );
};

export default BasicInformationPanel;
