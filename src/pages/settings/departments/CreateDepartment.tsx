/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { ICreateDepartment, IDepartmentAxiosResponse, IDepartmentFormValues } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import DepartmentUtills from "./utills";
import { toast } from "react-toastify";
import DepartmentForm from "./DepartmentForm";
import { departmentSchema } from "./schema";
import { createDepartmentService } from "./service";

const CreateDepartment = ({
    handleClose,
    sendingRequest,
    setSendingRequest
}: ICreateDepartment) => {
    const { addDepartmentToStore } = DepartmentUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
    } = useForm<IDepartmentFormValues>({
        mode: 'onChange',
        resolver: yupResolver(departmentSchema),
        defaultValues: {
            name: '',
            headOfDepartment: undefined,
            branch: undefined,
            managersGroupEmail: null,
        },
    });

    const onSubmit = async (formData: IDepartmentFormValues) => {
        setSendingRequest(true);
        try {
            const response = await createDepartmentService({
                name: formData.name,
                headOfDepartment: formData.headOfDepartment,
                branch: formData.branch,
                managersGroupEmail: formData.managersGroupEmail || null,
            }) as IDepartmentAxiosResponse;
            if (response.status === 201) {
                addDepartmentToStore(response.data);
                toast.success("Department created successfully", { position: 'bottom-right' });
                handleClose();
            }
        } catch (error: any) {
            const detail = error?.response?.data?.detail;
            const properties = error?.response?.data?.properties;
            const message = error?.response?.data?.message;
            if (properties) {
                const messages = Object.values(properties).join(', ');
                toast.error(messages, { position: 'bottom-right' });
            } else if (detail) {
                toast.error(detail, { position: 'bottom-right' });
            } else if (message) {
                toast.error(message, { position: 'bottom-right' });
            } else {
                toast.error("Failed to create department. Please try again.", { position: 'bottom-right' });
            }
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <DepartmentForm
                handleClose={handleClose}
                buttonText="Submit"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
            />
        </form>
    );
};

export default CreateDepartment;