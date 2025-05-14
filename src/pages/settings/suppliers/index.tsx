/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Card, Grid, InputAdornment, TextField, useMediaQuery, useTheme } from "@mui/material"
import { ChangeEvent, useEffect, useState } from "react"
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ButtonComponent from "../../../components/forms/Button";
import SupplierUtills from "./Utills";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import CreateSupplier from "./CreateSupplier";
import UpdateSupplier from "./UpdateSupplier";
import DeleteSupplier from "./DeleteSupplier";
import { ISupplier } from "./interface";
import Loading from "../../../components/loading";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import SupplierDetails from "./SupplierDetails";
import NoContent from "../../../components/noContent";

const Suppliers = () => {
    const [currentSupplier, setCurrentSupplier] = useState<ISupplier>({} as ISupplier);
    const { setModalState, handleOpen, modalState, open, handleClose, loading, fetchAllSuppliers } = SupplierUtills()
    const [sendingRequest, setSendingRequest] = useState<boolean>(false)
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore)

    useEffect(() => { fetchAllSuppliers() }, [])

    const createSupplier = () => {
        setModalState(crudStates.create);
        handleOpen()
    }

    const updateSupplier = (supplier: ISupplier) => {
        setCurrentSupplier(supplier)
        setModalState(crudStates.update);
        handleOpen()
    }

    const deleteSupplier = (supplier: ISupplier) => {
        setCurrentSupplier(supplier)
        setModalState(crudStates.delete);
        handleOpen()
    }

    return (
        <>
            {
                crudStates.create === modalState && <ModalComponent width={"50%"} title='Create Supplier' open={open} handleClose={handleClose}>
                    <CreateSupplier
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest} />
                </ModalComponent>
            }
            {
                crudStates.delete === modalState && <ModalComponent width={"35%"} title='Delete Supplier' open={open} handleClose={handleClose}>
                    <DeleteSupplier
                        setSendingRequest={setSendingRequest}
                        supplier={currentSupplier}
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        buttonText='Delete' />
                </ModalComponent>
            }
            {
                crudStates.update === modalState && <ModalComponent width={"50%"} title='Update Supplier' open={open} handleClose={handleClose}>
                    <UpdateSupplier
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        supplier={currentSupplier}
                        setSendingRequest={setSendingRequest} />
                </ModalComponent>
            }
            <Card
                elevation={2}
                sx={{
                    p: 3,
                    mb: 4,
                    display: "flex",
                    flexDirection: isSmallScreen ? "column" : "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                <TextField
                    placeholder="Filter by name"
                    size="small"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => console.log(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlinedIcon color="info" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: isSmallScreen ? "100%" : "300px" }}
                />
                <ButtonComponent
                    handleClick={createSupplier}
                    sendingRequest={false}
                    buttonText="Create New Title"
                    variant="contained"
                    buttonColor="info"
                    type="button"
                />
            </Card>

            <Box>
                {loading ? (
                    <Loading items="suppliers" />
                ) : suppliers.length > 0 ? (
                    <Grid container spacing={3}>
                        {suppliers.map((supplier) => (
                            <Grid item xs={12} sm={6} md={4} key={supplier.id}>
                                <SupplierDetails supplier={supplier} deleteSupplier={deleteSupplier} updateSupplier={updateSupplier} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <NoContent item="supplier" items="suppliers" />
                )}
            </Box>
        </>
    )
}

export default Suppliers