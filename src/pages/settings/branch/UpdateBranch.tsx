/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { IBranch, IBranchAxiosResponse, IUpdateBranch } from "./interface";
import BranchForm from "./BranchForm";
import { yupResolver } from "@hookform/resolvers/yup";
import { branchSchema } from "./schema";
import BranchUtills from "./utills";
import { updateBranchService } from "./service";
import { toast } from "react-toastify";

const UpdateBranch = ({ handleClose, sendingRequest, branch, setSendingRequest }: IUpdateBranch) => {
    const [defaultBranch, setDefaultBranch] = useState<any>(branch);
    const { updateBranchInStore } = BranchUtills();

    useEffect(() => {
        setDefaultBranch({
            ...branch,
            branchManager: branch.branchManager?.id,
            branchOperationsManager: branch.branchOperationsManager?.id,
            relationshipManager: branch.relationshipManager?.id,
            district: branch.district?.id,
            creditAdministrator: branch.creditAdministrator?.id,
            region: branch.region?.id
        })
    }, [branch]);

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
    }, [defaultBranch]);

    const onSubmit = async (formData: IBranch) => {
        setSendingRequest(true);
        try {
            const response = await updateBranchService(formData, branch?.id as number) as IBranchAxiosResponse;
            if (response.status === 201) {
                updateBranchInStore(response.data)
                toast.success("Branch updated successfully")
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false);
        handleClose()
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