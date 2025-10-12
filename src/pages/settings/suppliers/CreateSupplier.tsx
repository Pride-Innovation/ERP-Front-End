// CreateSupplier.tsx
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Box } from "@mui/material";
import SupplierForm from "./SupplierForm";
import { ICreateSupplier, ISupplier, ISupplierAxiosResponse } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { supplierSchema } from "./schema";
import { createSupplierService } from "./service";
import SupplierUtills from "./Utills";
import { toast } from "react-toastify";

const CreateSupplier = ({ handleClose, sendingRequest, setSendingRequest }: ICreateSupplier) => {
  const defaultSupplier: ISupplier = {} as ISupplier;
  const { addSupplierToStore } = SupplierUtills();

  const {
    control,
    handleSubmit,
    formState,
    register,
    reset
  } = useForm<ISupplier>({
    mode: 'onChange',
    resolver: yupResolver(supplierSchema),
  });

  useEffect(() => {
    reset({ ...defaultSupplier });
  }, [reset]);

  const onSubmit = async (formData: ISupplier) => {
    setSendingRequest(true);
    try {
      const response = await createSupplierService(formData) as ISupplierAxiosResponse;
      if (response.status === 201) {
        toast.success("Supplier created successfully", { position: 'bottom-right' });
        addSupplierToStore(response.data);
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast.error("Failed to create supplier. Please try again.", { position: 'bottom-right' });
    }
    setSendingRequest(false);
    handleClose();
  };

  return (
    <Box sx={{ width: "100%" }}>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <SupplierForm
          handleClose={handleClose}
          buttonText="Create Supplier"
          formState={formState}
          control={control}
          sendingRequest={sendingRequest}
          register={register}
        />
      </form>
    </Box>
  );
};

export default CreateSupplier;