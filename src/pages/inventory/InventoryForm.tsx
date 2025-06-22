/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Divider, Grid, Stack } from "@mui/material";
import InventoryUtills from "./Utills";
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect,
    UseFormTimePicker
} from "../../components/forms";
import { IInventoryForm } from "./interface";
import ButtonComponent from "../../components/forms/Button";
import SupplierUtills from "../settings/suppliers/Utills";
import { useEffect } from "react";
import StockItems from "../../components/stockForm/StockItems";
import AssetTypeUtills from "../settings/assetTypes/utills";

const InventoryForm = ({
    register,
    control,
    formState,
    handleClose,
    sendingRequest,
    buttonText
}: IInventoryForm) => {
    const { formFields } = InventoryUtills();
    const { fetchAllSuppliers } = SupplierUtills();
    const { fetchAllAssetTypes } = AssetTypeUtills();
    
    useEffect(() => { fetchAllSuppliers() }, []);
    useEffect(() => { fetchAllAssetTypes() }, []);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Grid container spacing={3}>

                    {formFields.map((field, idx) => {
                        const commonProps = {
                            register,
                            control,
                            formState,
                            value: field.value,
                            label: field.label
                        };

                        const gridSize = field.type === "textarea" ? 12 : 4;

                        return (
                            <Grid item xs={12} md={gridSize} key={idx}>
                                {field.type === "input" || field.type === "number" ? (
                                    <UseFormInput {...commonProps} type={field.type === "number" ? "number" : "text"} />
                                ) : field.type === "textarea" ? (
                                    <UseFormInput {...commonProps} multiline row={5} />
                                ) : field.type === "select" ? (
                                    <UseFormSelect {...commonProps} options={field.options} />
                                ) : field.type === "date" ? (
                                    <UseFormDatePicker {...commonProps} />
                                ) : field.type === "time" ? (
                                    <UseFormTimePicker {...commonProps} />
                                ) : field.type === "autocomplete" ? (
                                    <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                                ) : null}
                            </Grid>
                        );
                    })}
                </Grid>
                <Box sx={{ width: "100%", mt: 3 }}>
                    <StockItems />
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <Stack direction="row" spacing={2}>
                        <ButtonComponent
                            handleClick={handleClose}
                            buttonColor="error"
                            type="button"
                            sendingRequest={false}
                            buttonText="Cancel"
                        />
                        <ButtonComponent
                            buttonColor="success"
                            type="submit"
                            sendingRequest={sendingRequest}
                            buttonText={buttonText}
                        />
                    </Stack>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default InventoryForm;
