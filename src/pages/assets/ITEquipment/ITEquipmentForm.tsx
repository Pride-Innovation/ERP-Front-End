/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useNavigate } from "react-router";
import ITEquipmentUtills from "./utills";
import { useEffect, useState } from "react";
import { IFormData } from "../interface";
import { IITEquipment, IITEquipmentForm } from "./interface";
import {
    Box,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack
} from "@mui/material";
import { Controller } from "react-hook-form";
import { IOptions } from "../../../components/tables/interface";
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect
} from "../../../components/forms";
import ButtonComponent from "../../../components/forms/Button";
import { ROUTES } from "../../../core/routes/routes";
import BranchUtills from "../../settings/branch/utills";
import StatusUtills from "../../settings/statuses/Utills";
import UserUtils from "../../users/utils";
import SupplierUtills from "../../settings/suppliers/Utills";
import AssetTypeUtills from "../../settings/assetTypes/utills";

const ITEquipmentForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    option,
    handleChange
}: IITEquipmentForm) => {
    const navigate = useNavigate();
    const { formFields, categories, computerFields } = ITEquipmentUtills();
    const { fetchAllBranches } = BranchUtills();
    const { fetchAllStatuses } = StatusUtills();
    const { fetchAllUsers } = UserUtils();
    const { fetchAllAssetTypes } = AssetTypeUtills()
    const { fetchAllSuppliers } = SupplierUtills();

    useEffect(() => { fetchAllBranches() }, []);
    useEffect(() => { fetchAllStatuses() }, []);
    useEffect(() => { fetchAllUsers() }, []);
    useEffect(() => { fetchAllSuppliers() }, []);
    useEffect(() => { fetchAllAssetTypes() }, []);

    const [stateFormFields, setStateFormFields] = useState<Array<IFormData<IITEquipment>>>(formFields.slice(1));

    useEffect(() => {
        if (option) {
            if ([categories.laptop, categories.desktopComputer].includes(option)) {
                setStateFormFields(() => {
                    return [...(formFields.slice(1)), ...computerFields]
                })
            } else {
                return setStateFormFields([...(formFields.slice(1))])
            }
        }
    }, [option]);

    useEffect(() => {
        if (!option) { setStateFormFields(formFields.slice(1)) }
    }, [formFields])

    return (
        <Box sx={{ width: "100%" }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <FormControl size='small' fullWidth>
                        <InputLabel id={"category"}>Select Category</InputLabel>
                        <Controller
                            control={control}
                            {...register("category")}
                            rules={{ required: true }}
                            render={({ field: { onChange, onBlur } }) => (
                                <Select
                                    required={true}
                                    labelId={"category"}
                                    id={"category"}
                                    value={option}
                                    label="Select Category"
                                    onBlur={onBlur}
                                    onChange={
                                        (e) => {
                                            onChange(e);
                                            handleChange?.(e)
                                        }
                                    }
                                >
                                    {(formFields[0].options as Array<IOptions>).map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>

                            )}
                        />
                    </FormControl>
                </Grid>
                {stateFormFields.map((field) => {
                    const commonProps = {
                        register,
                        control,
                        formState,
                        value: field.value,
                        label: field.label,
                        required: field.required === false ? field.required : true
                    };

                    const gridSize = field.type === "textarea" ? 12 : 3;


                    return (
                        <Grid item xs={12} md={gridSize} key={field.value}>
                            {field.type === "input" && <UseFormInput {...commonProps} />}
                            {field.type === "textarea" && <UseFormInput {...commonProps} multiline row={4} />}
                            {field.type === "number" && <UseFormInput {...commonProps} type="number" />}
                            {field.type === "select" && (
                                <UseFormSelect {...commonProps} options={field.options} />
                            )}
                            {field.type === "date" && <UseFormDatePicker {...commonProps} />}
                            {field.type === "autocomplete" && (
                                <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                            )}
                        </Grid>
                    );
                })}

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
                                handleClick={() => navigate(ROUTES.LIST_ASSETS)}
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
        </Box>
    )
}

export default ITEquipmentForm