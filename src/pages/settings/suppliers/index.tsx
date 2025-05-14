/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Grid } from "@mui/material"
import { useEffect, useState } from "react"
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
import SettingsHeader from "../../../components/settingsNavigationCard";

const Suppliers = () => {
    const [currentSupplier, setCurrentSupplier] = useState<ISupplier>({} as ISupplier);
    const { setModalState, handleOpen, modalState, open, handleClose, loading, fetchAllSuppliers } = SupplierUtills()
    const [sendingRequest, setSendingRequest] = useState<boolean>(false)
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
            <SettingsHeader handleCreationClicked={createSupplier} title="Supplier"/>
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