import { useEffect, useState } from "react"
import { IBranch } from "../../assets/ITEquipment/interface"
import { listBranchesService } from "../../assets/ITEquipment/service";

const BranchUtills = () => {
    const [branches, setBranches] = useState<IBranch[]>([] as Array<IBranch>);
    const [branchList, setBranchList] = useState<IBranch[]>([] as Array<IBranch>);
    
    const fetchAllBranches = async () => {
        const response = await listBranchesService() as Array<IBranch>;
        setBranches(response);
        setBranchList(response);
    }
    const filterByName = (text: string) => {
        const filteredBranches = branchList.filter(branch => branch.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
        setBranches(filteredBranches);
    }

    useEffect(() => { fetchAllBranches() }, [])

    return (
        { branches, filterByName }
    )
}

export default BranchUtills