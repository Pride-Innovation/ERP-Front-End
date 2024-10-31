import { Box, Typography } from "@mui/material"
import { IRoleRow } from "../interface"
import CheckboxComponent from "../../../components/forms/CheckBox"
import RoleUtills from "./utills"
import { ChangeEvent, useEffect } from "react"

const RoleRow = ({ role, module }: IRoleRow) => {
    const { determineCrudStates, mainCheckedState } = RoleUtills();

    useEffect(() => {
        const moduleName = module.name.toLocaleLowerCase().split(" ").join("_");
        determineCrudStates(role.permissions, moduleName)
    }, []);

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value, "request information!!!")
    }

    return (
        <Box
            display="grid"
            sx={{ width: "100%", alignItems: "center" }}
            gridTemplateColumns="6fr 1fr 1fr 1fr 1fr"
            gap={4}
            px={3}
            py={0.5}
        >
            <Typography variant="body2">{role.name}</Typography>
            <CheckboxComponent handleChangeEvent={handleChange} checked={mainCheckedState.create} />
            <CheckboxComponent handleChangeEvent={handleChange} checked={mainCheckedState.read} />
            <CheckboxComponent handleChangeEvent={handleChange} checked={mainCheckedState.update} />
            <CheckboxComponent handleChangeEvent={handleChange} checked={mainCheckedState.delete} />
        </Box>
    )
}

export default RoleRow