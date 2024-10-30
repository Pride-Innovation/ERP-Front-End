import { Box, Typography } from "@mui/material"
import { IRoleRow } from "../interface"
import CheckboxComponent from "../../../components/forms/CheckBox"
import RoleUtills from "./utills"
import { useEffect } from "react"

const RoleRow = ({ role }: IRoleRow) => {
    const { determineCrudStates, mainCheckedState } = RoleUtills();

    useEffect(() => { determineCrudStates(role.permissions) }, []);

    return (
        <Box
            display="grid"
            sx={{ width: "100%", alignItems: "center" }}
            gridTemplateColumns="6fr 1fr 1fr 1fr 1fr "
            gap={4}
            px={3}
            py={0.5}
        >
            <Typography variant="body2">{role.name}</Typography>
            <CheckboxComponent checked={mainCheckedState.create} />
            <CheckboxComponent checked={mainCheckedState.read} />
            <CheckboxComponent checked={mainCheckedState.update} />
            <CheckboxComponent checked={mainCheckedState.delete} />
        </Box>
    )
}
export default RoleRow