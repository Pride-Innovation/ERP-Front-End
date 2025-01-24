import { useEffect, useState } from "react"
import { IBranch } from "../../assets/ITEquipment/interface"
import { listBranchesService } from "../../assets/ITEquipment/service";
import { IFormData } from "../../assets/interface";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { addBranch, loadBranches } from "./slice";

const BranchUtills = () => {
    const [branchList, setBranchList] = useState<IBranch[]>([] as Array<IBranch>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const dispatch = useDispatch();

    const { branches } = useSelector((state: RootState) => state.BranchStore);

    const fetchAllBranches = async () => {
        const response = await listBranchesService() as Array<IBranch>;
        dispatch(loadBranches(response))
        setBranchList(response);
    }
    const filterByName = (text: string) => {
        const filteredBranches = branches.filter(branch => branch.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
        setBranchList(filteredBranches);
    }

    const addBranchToStore = (branch: IBranch) => {
        dispatch(addBranch(branch))
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
            label: 'Branch Email',
            type: "input"
        },
        {
            value: "tel",
            label: 'Branch Telephone',
            type: "input"
        },
        {
            value: "status",
            label: 'Branch Status',
            type: "select",
            options: [
                {
                    label: "Full Branch",
                    value: 1
                },
                {
                    label: "Echo Branch",
                    value: 2
                }
            ]
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
            handleOpen,
            addBranchToStore
        }
    )
}

export default BranchUtills