import { Box, TextField } from "@mui/material"
import { ChangeEvent, useState } from "react"
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ButtonComponent from "../../../components/forms/Button";
import SupplierUtills from "./Utills";
import SupplierDetails from "./SupplierDetails";
import { ISupplier } from "../../assets/ITEquipment/interface";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import CreateSupplier from "./CreateSupplier";
import UpdateSupplier from "./UpdateSupplier";
import DeleteSupplier from "./DeleteSupplier";

const Suppliers = () => {
    const [currentSupplier, setCurrentSupplier] = useState<ISupplier>({} as ISupplier);
    const { suppliers, setModalState, handleOpen, modalState, open, handleClose } = SupplierUtills()

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
                    <CreateSupplier handleClose={handleClose} sendingRequest={false} />
                </ModalComponent>
            }
            {
                crudStates.delete === modalState && <ModalComponent width={"35%"} title='Delete Supplier' open={open} handleClose={handleClose}>
                    <DeleteSupplier supplier={currentSupplier} handleClose={handleClose} sendingRequest={false} buttonText='Delete' />
                    <p>Delete supplier</p>
                </ModalComponent>
            }
            {
                crudStates.update === modalState && <ModalComponent width={"50%"} title='Update Supplier' open={open} handleClose={handleClose}>
                    <UpdateSupplier handleClose={handleClose} sendingRequest={false} supplier={currentSupplier} />
                </ModalComponent>
            }
            <Box sx={{ width: "100%" }}>
                <Box sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 4,
                    alignItems: "center",
                }}>
                    <Box sx={{ mr: "10px" }}>
                        <TextField
                            onChange={(e: ChangeEvent<HTMLInputElement>) => () => console.log(e.target.value)}
                            size="small"
                            placeholder="Filter by supplier name"
                            InputProps={
                                {
                                    startAdornment: (<SearchOutlinedIcon color="info" fontSize="small" sx={{ mr: "10px" }} />)
                                }
                            }
                        />
                    </Box>
                    <Box>
                        <ButtonComponent
                            handleClick={createSupplier}
                            sendingRequest={false}
                            buttonText="Create New Supplier"
                            variant='contained'
                            buttonColor='info'
                            type='button' />
                    </Box>
                </Box>
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(3, 1fr)"
                    gap={3}
                    sx={{
                        width: "100%",
                        alignItems: "center",
                    }}>
                    {
                        suppliers.map(supplier => (
                            <SupplierDetails
                                supplier={supplier}
                                deleteSupplier={deleteSupplier}
                                updateSupplier={updateSupplier} />
                        ))
                    }
                </Box>
            </Box>
        </>
    )
}

export default Suppliers