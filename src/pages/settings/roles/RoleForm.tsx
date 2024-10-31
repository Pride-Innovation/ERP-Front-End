import { FormControl, FormHelperText, Grid, Stack } from "@mui/material"
import { Controller } from "react-hook-form"
import { IRoleForm } from "../interface"
import { InputComponent } from "../../../components/forms/Inputs"
import ButtonComponent from "../../../components/forms/Button"

const RoleForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    handleClose
}: IRoleForm) => {
    return (
        <Grid item container xs={12} mt={2}>
            <Grid item container spacing={4} xs={12}>
                <Grid item xs={12} md={12} >
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("name")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent type='input' required label='Role name' field={field} error={formState.errors.name} id='name' />
                            )}
                        />
                        {formState.errors.name && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.name?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                    <Stack direction="row" spacing={3} sx={{ width: "50%" }}>
                        <ButtonComponent handleClick={handleClose} buttonColor='error' type='button' sendingRequest={false} buttonText="Close" />
                        <ButtonComponent buttonColor='success' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default RoleForm