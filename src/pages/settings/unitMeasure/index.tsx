import { Box } from "@mui/material";
import ButtonComponent from "../../../components/forms/Button";

const UnitMeasures = () => {
    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                mb: 4,
                alignItems: "center",
            }}>
                {/* <Box sx={{ mr: "10px" }}>
                    <TextField
                        onChange={(e: ChangeEvent<HTMLInputElement>) => filterByName(e.target.value)}
                        size="small"
                        placeholder="Filter by branch name"
                        InputProps={
                            {
                                startAdornment: (<SearchOutlinedIcon color="info" fontSize="small" sx={{ mr: "10px" }} />)
                            }
                        }
                    />
                </Box> */}
                <Box>
                    <ButtonComponent
                        handleClick={() => console.log("create unit of measure!!")}
                        sendingRequest={false}
                        buttonText="Create New Unit of Measure"
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
                {/* {
                    branches.map(branch => (
                        <ViewBranch branch={branch} deleteBranch={deleteBranch} updateBranch={updateBranch} />
                    ))
                } */}
            </Box>
        </Box>
    )
}

export default UnitMeasures;