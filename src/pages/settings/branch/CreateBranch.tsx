/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import BranchForm from "./BranchForm";
import { IBranchDTO, IBranchAxiosResponse, IBranchEntityAxiosResponse, ICreateBranch } from "./interface";
import { branchSchema } from "./schema";
import { createBranchService, fetchSingleBranchService } from "./service";
import BranchUtills from "./utills";

const CreateBranch = ({
    handleClose,
    sendingRequest,
    setSendingRequest,
}: ICreateBranch) => {
    const { addBranchToStore } = BranchUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
    } = useForm<IBranchDTO>({
        mode: "onChange",
        resolver: yupResolver(branchSchema),
    });

    useEffect(() => {
        reset({} as IBranchDTO);
    }, [reset]);

    const onSubmit = async (formData: IBranchDTO) => {
        setSendingRequest(true);
        try {
            const response = await createBranchService(formData) as IBranchEntityAxiosResponse;
            if (response.status === 201) {
                // Fetch enriched branch (BranchWithManagersDTO) so manager names appear on the card
                const enriched = await fetchSingleBranchService(response.data.id) as IBranchAxiosResponse;
                if (enriched.status === 200) {
                    addBranchToStore(enriched.data);
                } else {
                    addBranchToStore(response.data as any);
                }
                toast.success("Branch created successfully");
                handleClose();
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to create branch. Please try again.");
        }
        setSendingRequest(false);
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <BranchForm
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

export default CreateBranch;
