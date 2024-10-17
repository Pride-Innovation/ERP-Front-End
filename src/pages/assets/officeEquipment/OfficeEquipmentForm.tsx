import { useNavigate } from "react-router";
import OfficeEquipmentUtills from "./utills";
import { Grid, Stack } from "@mui/material";
import { UseFormAutocompleteComponent, UseFormDatePicker, UseFormInput, UseFormSelect } from "../../../components/forms";
import { IOfficeEquipmentForm } from "./interface";
import ButtonComponent from "../../../components/forms/Button";
import { ROUTES } from "../../../core/routes/routes";

const OfficeEquipmentForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
}:
    IOfficeEquipmentForm
) => {
    const navigate = useNavigate();
    const { formFields } = OfficeEquipmentUtills();

    return (
        <Grid item container xs={12}>
            <Grid item container spacing={4} xs={12}>
                {
                    formFields.map(formField => {
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
                        <ButtonComponent handleClick={() => navigate(ROUTES.LIST_OFFICE_EQUIPMENT)} buttonColor='error' type='button' sendingRequest={false} buttonText="Back" />
                        <ButtonComponent buttonColor='success' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default OfficeEquipmentForm