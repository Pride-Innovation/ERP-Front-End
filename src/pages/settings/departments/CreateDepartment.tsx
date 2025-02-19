import { useForm } from "react-hook-form";
import { ICreateDepartment, IDepartment } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import DepartmentUtills from "./utills";
import { toast } from "react-toastify";
import { IResponseData } from "../../users/interface";
import { Grid } from "@mui/material";
import DepartmentForm from "./DepartmentForm";
import { departmentSchema } from "./schema";
import { createDepartmentService } from "./service";

const CreateDepartment = ({
    handleClose,
    sendingRequest,
    setSendingRequest
}: ICreateDepartment) => {
    const defaultSupplier: IDepartment = {} as IDepartment;
    const { addDepartmentToStore } = DepartmentUtills()
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IDepartment>({
        mode: 'onChange',
        resolver: yupResolver(departmentSchema),
    });

    useEffect(() => {
        reset({ ...defaultSupplier });
    }, [reset]);

    const onSubmit = async (formData: IDepartment) => {
        setSendingRequest(true)

        const response = await createDepartmentService(formData) as IResponseData;
        if (response.status === 'success') {
            addDepartmentToStore(response.data[0] as unknown as IDepartment)
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
                    <DepartmentForm
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

export default CreateDepartment