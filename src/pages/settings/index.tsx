import { Box } from "@mui/material"
import Roles from "./roles";

const Settings = () => {
    return (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Box sx={{ width: "90%" }}>
                <Roles />
            </Box>
        </Box>
    )
}

export default Settings