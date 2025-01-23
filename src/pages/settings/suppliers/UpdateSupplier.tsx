import { useForm } from "react-hook-form";
import { ISupplier } from "../../assets/ITEquipment/interface";
import { useEffect } from "react";
import { IUpdateSupplier } from "./interface";
import { Grid } from "@mui/material";
import SupplierForm from "./SupplierForm";

const UpdateSupplier = ({ handleClose, sendingRequest, supplier }: IUpdateSupplier) => {
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<ISupplier>({
        mode: 'onChange',
        // resolver: yupResolver(roleSchema),
    });

    useEffect(() => {
        reset({ ...supplier });
    }, [reset]);

    const onSubmit = (formData: ISupplier) => {
        console.log(formData, "form data!!")
    };

    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <SupplierForm
                        handleClose={handleClose}
                        buttonText="Submit"
                        formState={formState}
                        control={control}
                        sendingRequest={sendingRequest}
                        register={register}
                    />
                </form>
            </Grid>
        </Grid>
    )
}

export default UpdateSupplier