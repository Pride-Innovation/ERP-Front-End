import { useEffect, useState } from "react"
import { IBranch } from "../../assets/ITEquipment/interface"
import { listBranchesService } from "../../assets/ITEquipment/service";

const BranchUtills = () => {
    const [branches, setBranches] = useState<IBranch[]>([] as Array<IBranch>);
    const fetchAllBranches = async () => {
        const response = await listBranchesService() as Array<IBranch>;
        console.log(response)
        setBranches(response);
    }

    useEffect(() => { fetchAllBranches() }, [])

    return (
        { branches }
    )
}

export default BranchUtills