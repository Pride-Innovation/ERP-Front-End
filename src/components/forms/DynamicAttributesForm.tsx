/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, FormControlLabel, FormHelperText, Grid, Stack, Switch, Typography, alpha } from '@mui/material';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { InputComponent } from './Inputs';
import SelectComponent from './Select';
import DatePickerComponent from './DatePicker';
import { brand } from '../../utils/tokens';
import { ICustomAttribute } from '../../pages/settings/assetTypes/interface';

const PRIMARY_COLOR = brand[500];

interface IDynamicAttributesFormProps<T extends FieldValues = FieldValues> {
    /** Category attribute definitions (rendered in `order`). Pass an empty array to render nothing. */
    attributes: ICustomAttribute[];
    /** react-hook-form control from the parent form. */
    control: Control<T>;
    /** Path prefix in the parent form values where attribute values are stored, e.g. "attributes". */
    namePrefix?: string;
    /** Optional section title above the inputs. */
    title?: string;
}

/**
 * Renders inputs for a category's custom attributes inside a parent react-hook-form.
 *
 * Each attribute is bound to `<namePrefix>.<key>` in the parent form's values.
 * The parent is responsible for merging the resulting `attributes: { ... }` object
 * into its submission payload.
 */
const DynamicAttributesForm = <T extends FieldValues = FieldValues>({
    attributes,
    control,
    namePrefix = 'attributes',
    title,
}: IDynamicAttributesFormProps<T>) => {
    if (!attributes || attributes.length === 0) return null;

    const ordered = [...attributes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return (
        <Box>
            {title && (
                <Typography
                    variant="overline"
                    sx={{
                        color: PRIMARY_COLOR,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        display: 'block',
                        mb: 1.5,
                    }}
                >
                    {title}
                </Typography>
            )}
            <Grid container spacing={2}>
                {ordered.map((attr) => {
                    const fieldName = `${namePrefix}.${attr.key}` as any;
                    const inputId = `attr-${attr.key}`;

                    return (
                        <Grid item xs={12} md={6} key={attr.key}>
                            <Controller
                                control={control}
                                name={fieldName}
                                rules={{
                                    required: attr.required ? `${attr.label} is required` : false,
                                }}
                                render={({ field, fieldState }) => {
                                    const fieldError = fieldState.error;
                                    const errorMessage = fieldError?.message;

                                    if (attr.dataType === 'BOOLEAN') {
                                        return (
                                            <Box>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={Boolean(field.value)}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            color="primary"
                                                        />
                                                    }
                                                    label={
                                                        <Stack>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {attr.label}
                                                                {attr.required && (
                                                                    <Typography component="span" color="error" ml={0.5}>*</Typography>
                                                                )}
                                                            </Typography>
                                                            {attr.helperText && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {attr.helperText}
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    }
                                                />
                                                {errorMessage && (
                                                    <FormHelperText sx={{ color: 'error.main' }}>{errorMessage}</FormHelperText>
                                                )}
                                            </Box>
                                        );
                                    }

                                    if (attr.dataType === 'SELECT') {
                                        return (
                                            <Box>
                                                <SelectComponent
                                                    id={inputId}
                                                    label={attr.label}
                                                    required={attr.required}
                                                    field={field}
                                                    error={fieldError}
                                                    options={(attr.options ?? []).map((opt) => ({ value: opt, label: opt }))}
                                                />
                                                {attr.helperText && !errorMessage && (
                                                    <FormHelperText sx={{ color: alpha('#000', 0.55) }}>
                                                        {attr.helperText}
                                                    </FormHelperText>
                                                )}
                                                {errorMessage && (
                                                    <FormHelperText sx={{ color: 'error.main' }}>{errorMessage}</FormHelperText>
                                                )}
                                            </Box>
                                        );
                                    }

                                    if (attr.dataType === 'DATE') {
                                        return (
                                            <Box>
                                                <DatePickerComponent
                                                    label={attr.label}
                                                    field={field}
                                                    error={fieldError}
                                                />
                                                {attr.helperText && !errorMessage && (
                                                    <FormHelperText sx={{ color: alpha('#000', 0.55) }}>
                                                        {attr.helperText}
                                                    </FormHelperText>
                                                )}
                                                {errorMessage && (
                                                    <FormHelperText sx={{ color: 'error.main' }}>{errorMessage}</FormHelperText>
                                                )}
                                            </Box>
                                        );
                                    }

                                    // TEXT or NUMBER
                                    return (
                                        <Box>
                                            <InputComponent
                                                id={inputId}
                                                label={attr.label}
                                                required={attr.required}
                                                type={attr.dataType === 'NUMBER' ? 'number' : 'text'}
                                                field={field}
                                                error={fieldError}
                                            />
                                            {attr.helperText && !errorMessage && (
                                                <FormHelperText sx={{ color: alpha('#000', 0.55) }}>
                                                    {attr.helperText}
                                                </FormHelperText>
                                            )}
                                            {errorMessage && (
                                                <FormHelperText sx={{ color: 'error.main' }}>{errorMessage}</FormHelperText>
                                            )}
                                        </Box>
                                    );
                                }}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default DynamicAttributesForm;
