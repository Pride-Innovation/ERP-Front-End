import {
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack
} from '@mui/material'
import ButtonComponent from '../../components/forms/Button';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../core/routes/routes';
import {
    UseFormSelect,
    UseFormInput,
    UseFormDatePicker,
    UseFormAutocompleteComponent
} from '../../components/forms';
import { IAsset, IAssetForm, IFormData } from './interface';
import AssetUtills from './utils';
import { useEffect, useState } from 'react';
import { IOptions } from '../../components/tables/interface';

const AssetForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    option,
    handleChange
}: IAssetForm) => {
    const navigate = useNavigate();
    const { formFields, categories, computerFields } = AssetUtills();

    const [stateFormFields, setStateFormFields] = useState<Array<IFormData<IAsset>>>(formFields);

    useEffect(() => {
        if (option) {
            if ([categories.laptop, categories.desktopComputer].includes(option)) {
                setStateFormFields(() => {
                    return [...formFields, ...computerFields]
                })
            } else {
                setStateFormFields([...formFields])
            }
        }
    }, [option]);

    return (
        <Grid item container xs={12}>
            <Grid item container spacing={4} xs={12}>
                <Grid item xs={12} md={4}>
                    <FormControl size='small' fullWidth>
                        <InputLabel id={"category"}>Select Category</InputLabel>
                        <Select
                            required={true}
                            labelId={"category"}
                            id={"category"}
                            value={option}
                            label="Select Category"
                            onChange={handleChange}
                        >
                            {(formFields[0].options as Array<IOptions>).map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                {
                    stateFormFields.map(formField => {
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
                            <Grid item xs={12} md={4}>
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
                        <ButtonComponent handleClick={() => navigate(ROUTES.LIST_ASSETS)} buttonColor='error' type='button' sendingRequest={false} buttonText="Back" />
                        <ButtonComponent buttonColor='success' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default AssetForm;