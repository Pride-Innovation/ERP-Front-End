/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { IBranchDTO, IBranchAxiosResponse, IBranchEntityAxiosResponse, IUpdateBranch } from "./interface";
import BranchForm from "./BranchForm";
import { yupResolver } from "@hookform/resolvers/yup";
import { branchSchema } from "./schema";
import BranchUtills from "./utills";
import { updateBranchService, fetchSingleBranchService } from "./service";
import { toast } from "react-toastify";

const UpdateBranch = ({ handleClose, sendingRequest, branch, setSendingRequest }: IUpdateBranch) => {
    const [defaultValues, setDefaultValues] = useState<IBranchDTO | null>(null);
    const { updateBranchInStore } = BranchUtills();

    useEffect(() => {
        setDefaultValues({
            name: branch.name,
            email: branch.email,
            telephone: branch.telephone ?? "",
            region: branch.region?.id as number,
            district: branch.district?.id as number,
            branchManager: branch.branchManager?.id as number ?? null,
            branchOperationsManager: branch.branchOperationsManager?.id as number ?? null,
            relationshipManager: branch.relationshipManager?.id as number ?? null,
            creditAdministrator: branch.creditAdministrator?.id as number ?? null,
        });
    }, [branch]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IBranchDTO>({
        mode: 'onChange',
        resolver: yupResolver(branchSchema),
    });

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        }
    }, [defaultValues]);

    const onSubmit = async (formData: IBranchDTO) => {
        setSendingRequest(true);
        try {
            const response = await updateBranchService(formData, branch?.id as number) as IBranchEntityAxiosResponse;
            if (response.status === 200) {
                // Fetch enriched branch (BranchWithManagersDTO) so manager names reflect update immediately
                const enriched = await fetchSingleBranchService(branch?.id as number) as IBranchAxiosResponse;
                if (enriched.status === 200) {
                    updateBranchInStore(enriched.data);
                } else {
                    updateBranchInStore(response.data as any);
                }
                toast.success("Branch updated successfully");
                handleClose();
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to update branch. Please try again.");
        }
        setSendingRequest(false);
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <BranchForm
                update
                handleClose={handleClose}
                buttonText="Submit"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
            />
        </form>
    )
}

export default UpdateBranch