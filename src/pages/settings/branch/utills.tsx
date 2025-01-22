import { useEffect, useState } from "react"
import { IBranch } from "../../assets/ITEquipment/interface"
import { listBranchesService } from "../../assets/ITEquipment/service";
import { IFormData } from "../../assets/interface";

const BranchUtills = () => {
    const [branches, setBranches] = useState<IBranch[]>([] as Array<IBranch>);
    const [branchList, setBranchList] = useState<IBranch[]>([] as Array<IBranch>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const fetchAllBranches = async () => {
        const response = await listBranchesService() as Array<IBranch>;
        setBranches(response);
        setBranchList(response);
    }
    const filterByName = (text: string) => {
        const filteredBranches = branchList.filter(branch => branch.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
        setBranches(filteredBranches);
    }

    useEffect(() => { fetchAllBranches() }, []);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const formFields: Array<IFormData<IBranch>> = [
        {
            value: "name",
            label: 'Branch Name',
            type: "input"
        },
        {
            value: "email",
            label: 'Branch Name',
            type: "input"
        },
        {
            value: "tel",
            label: 'Telephone Number',
            type: "input"
        },
        {
            value: "desc",
            label: 'Description',
            type: "textarea"
        }]

    return (
        {
            branches,
            filterByName,
            formFields,
            modalState,
            setModalState,
            open,
            handleClose,
            handleOpen
        }
    )
}

export default BranchUtills