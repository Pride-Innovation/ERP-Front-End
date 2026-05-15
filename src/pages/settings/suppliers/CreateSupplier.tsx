// CreateSupplier.tsx
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import SupplierForm from "./SupplierForm";
import { ICreateSupplier, ISupplierAxiosResponse, ISupplierFormValues } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { supplierSchema } from "./schema";
import { createSupplierService } from "./service";
import SupplierUtills from "./Utills";
import { toast } from "react-toastify";

const CreateSupplier = ({ handleClose, sendingRequest, setSendingRequest }: ICreateSupplier) => {
  const defaultSupplier: ISupplierFormValues = {} as ISupplierFormValues;
  const { addSupplierToStore } = SupplierUtills();

  const {
    control,
    handleSubmit,
    formState,
    register,
    reset
  } = useForm<ISupplierFormValues>({
    mode: 'onChange',
    resolver: yupResolver(supplierSchema),
  });

  useEffect(() => {
    reset({ ...defaultSupplier });
  }, [reset]);

  const onSubmit = async (formData: ISupplierFormValues) => {
    setSendingRequest(true);
    try {
      const response = await createSupplierService(formData) as ISupplierAxiosResponse;
      if (response.status === 201) {
        toast.success("Supplier created successfully", { position: 'bottom-right' });
        addSupplierToStore(response.data);
        handleClose();
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      const properties = error?.response?.data?.properties;
      if (properties) {
        const messages = Object.values(properties).join(', ');
        toast.error(messages, { position: 'bottom-right' });
      } else if (detail) {
        toast.error(detail, { position: 'bottom-right' });
      } else {
        toast.error("Failed to create supplier. Please try again.", { position: 'bottom-right' });
      }
    }
    setSendingRequest(false);
  };

  return (
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
  );
};

export default CreateSupplier;