import { Grid, Stack, useTheme } from "@mui/material";
import InventoryUtills from "./Utills";
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect,
    UseFormTimePicker
} from "../../components/forms";
import { IInventoryForm } from "./interface";
import ButtonComponent from "../../components/forms/Button";

const InventoryForm = ({
    register,
    control,
    formState,
    handleClose,
    sendingRequest,
    buttonText
}: IInventoryForm) => {
    const { formFields } = InventoryUtills();
    const theme = useTheme();

    return (
        <Grid container spacing={3}>
            {formFields.map((field, idx) => {
                const commonProps = {
                    register,
                    control,
                    formState,
                    value: field.value,
                    label: field.label
                };

                const gridSize = field.type === "textarea" ? 12 : 12;

                return (
                    <Grid item xs={12} md={field.type === "textarea" ? 12 : 4} key={idx}>
                        {field.type === "input" || field.type === "number" ? (
                            <UseFormInput {...commonProps} type={field.type === "number" ? "number" : "text"} />
                        ) : field.type === "textarea" ? (
                            <UseFormInput {...commonProps} multiline row={5} />
                        ) : field.type === "select" ? (
                            <UseFormSelect {...commonProps} options={field.options} />
                        ) : field.type === "date" ? (
                            <UseFormDatePicker {...commonProps} />
                        ) : field.type === "time" ? (
                            <UseFormTimePicker {...commonProps} />
                        ) : field.type === "autocomplete" ? (
                            <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                        ) : null}
                    </Grid>
                );
            })}

            <Grid item xs={12} sx={{ mt: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor="error"
                        type="button"
                        variant="outlined"
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
            </Grid>
        </Grid>
    );
};

export default InventoryForm;
