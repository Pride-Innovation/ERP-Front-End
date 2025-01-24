import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Grid } from "@mui/material";
import SupplierForm from "./SupplierForm";
import { ICreateSupplier, ISupplier } from "./interface";

const CreateSupplier = ({ handleClose, sendingRequest }: ICreateSupplier) => {
  const defaultSupplier: ISupplier = {} as ISupplier;

  const {
    control,
    handleSubmit,
    formState,
    register,
    reset
  } = useForm<ISupplier>({
    mode: 'onChange',
    // resolver: yupResolver(roleSchema),
  });

  useEffect(() => {
    reset({ ...defaultSupplier });
  }, [reset]);

  const onSubmit = (formData: ISupplier) => {
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
          <SupplierForm
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

export default CreateSupplier