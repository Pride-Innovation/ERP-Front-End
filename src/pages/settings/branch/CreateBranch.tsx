import { Grid } from "@mui/material"
import { useForm } from "react-hook-form";
import { IBranch } from "../../assets/ITEquipment/interface";
import { useEffect } from "react";
import BranchForm from "./BranchForm";
import { ICreateBranch } from "./interface";

const CreateBranch = ({ handleClose, sendingRequest }: ICreateBranch) => {
    const defaultBranch: IBranch = {} as IBranch;

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IBranch>({
        mode: 'onChange',
        // resolver: yupResolver(roleSchema),
    });

    useEffect(() => {
        reset({ ...defaultBranch });
    }, [reset]);

    const onSubmit = (formData: IBranch) => {
        console.log(formData, "form data!!!!!");
    };

    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <BranchForm
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

export default CreateBranch