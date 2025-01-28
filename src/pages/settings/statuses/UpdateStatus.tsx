import { Grid } from "@mui/material"
import { IStatus, IUpdateStatus } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { statusSchema } from "./schema";
import { useEffect } from "react";
import StatusUtills from "./Utills";
import { toast } from "react-toastify";
import { updateStatusService } from "./service";
import { IResponseData } from "../../users/interface";
import StatusForm from "./StatusForm";

const UpdateStatus = ({ status, handleClose, sendingRequest, setSendingRequest }: IUpdateStatus) => {
    const { updateStatusInStore } = StatusUtills()
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IStatus>({
        mode: 'onChange',
        resolver: yupResolver(statusSchema),
    });

    useEffect(() => {
        reset({ ...status });
    }, [reset]);


    const onSubmit = async (formData: IStatus) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            user_id: 1
        }

        const response = await updateStatusService(request, formData?.id as string) as IResponseData;
        if (response.status === 'success') {
            updateStatusInStore(response.data[0] as unknown as IStatus)
            toast.success(response.data.message)
            setSendingRequest(false);
            handleClose()
        }
        setSendingRequest(true);
    };
    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <StatusForm
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

export default UpdateStatus