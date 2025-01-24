import { Grid } from "@mui/material"
import { useForm } from "react-hook-form";
import { IBranch } from "../../assets/ITEquipment/interface";
import { useEffect } from "react";
import BranchForm from "./BranchForm";
import { ICreateBranch } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { branchSchema } from "./schema";
import { createBranchService } from "./service";
import { IResponseData } from "../../users/interface";
import { toast } from "react-toastify";
import BranchUtills from "./utills";

const CreateBranch = ({
    handleClose,
    sendingRequest,
    setSendingRequest
}: ICreateBranch) => {
    const defaultBranch: IBranch = {} as IBranch;
    const { addBranchToStore } = BranchUtills();
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IBranch>({
        mode: 'onChange',
        resolver: yupResolver(branchSchema),
    });

    useEffect(() => {
        reset({ ...defaultBranch });
    }, [reset]);

    const onSubmit = async (formData: IBranch) => {
        setSendingRequest(true)
        const request = {
            ...formData,
            user_id: 1
        }
        const response = await createBranchService(request) as IResponseData;
        if (response.status === 'success') {
            addBranchToStore(response.data[0] as IBranch)
            toast.success(response.data.message)
            setSendingRequest(false);
            handleClose()
        }
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