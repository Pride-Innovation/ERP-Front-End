/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import {
    Box,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
    useTheme
} from "@mui/material";
import RoofingOutlinedIcon from '@mui/icons-material/RoofingOutlined';
import { useContext, useEffect } from "react";
import StoreUtills from "./utillls";
import Loading from "../../components/loading";
import NoContent from "../../components/noContent";
import { StoreContext } from "../../context/store";
import BranchStoreReport from "./BranchStoreReport";

const Store = () => {
    const theme = useTheme();
    const { storeCommodities } = useContext(StoreContext);
    const {
        fetchStoreDetailsPerBranch,
        setCurrentUserBranch,
        branchId,
        sendingRequest
    } = StoreUtills()

    useEffect(() => { setCurrentUserBranch() }, []);
    useEffect(() => { if (branchId) { fetchStoreDetailsPerBranch(branchId) } }, [branchId]);

    return (
        <Paper
            elevation={3}
            sx={{
                width: "100%",
                minHeight: "85vh",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "none"
            }}
        >
            <Box
                sx={{
                    width: { xs: "100%", md: "250px" },
                    bgcolor: theme.palette.grey[100],
                    borderRight: { md: `1px solid ${theme.palette.divider}` },
                    p: 3,
                }}
            >
                <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        mb: 2,
                        color: theme.palette.secondary.main,
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    <RoofingOutlinedIcon fontSize="medium" sx={{ color: theme.palette.secondary.main, mx: "10px" }} />
                    Store Report
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1}>
                    banks list
                </Stack>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    p: 4,
                    bgcolor: theme.palette.background.paper,
                }}
            >
                <Box>
                    {sendingRequest ? (
                        <Loading items="Store Commodity" />
                    ) : storeCommodities.length > 0 ? (
                        <Grid container xs>
                            <BranchStoreReport storeData={storeCommodities} />
                            {/* {storeCommodities.map((comm) => (
                                    <BranchStoreReport storeData={comm} />
                                </Grid>
                            ))} */}
                        </Grid>
                    ) : (
                        <NoContent item="stock" items="stocks" />
                    )}
                </Box>
            </Box>
        </Paper>
    )
}

export default Store