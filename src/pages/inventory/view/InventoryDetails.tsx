/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useParams } from "react-router"
import { useContext, useEffect } from "react";
import { InventoryContext } from "../../../context/inventory";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Divider,
    Grid,
    Stack,
    Typography
} from "@mui/material";
import { grey } from "@mui/material/colors";
import TabComponent from "../../../components/tabs";
import ButtonComponent from "../../../components/forms/Button";
import OtherDetails from "./OtherDetails";
import PlaceHolder from "../../../statics/images/Placeholder.png"
import DetailSection from "../../assets/trails/DetailSection";
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import moment from "moment";
import ViewInventoryutills from "./utills";

const InventoryDetails = () => {
    const { currentInventory } = useContext(InventoryContext);
    const { id } = useParams<{ id: string }>();
    const { fetchInventoryByID, handleInventoryTableData } = ViewInventoryutills()


    useEffect(() => { fetchInventoryByID(id as string) }, []);

    return (
        <Card sx={{ p: 4, boxShadow: 3 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                        <CardMedia
                            component="img"
                            height="250"
                            image={PlaceHolder}
                            alt="Equipment Image"
                        />
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ color: "#1976d2" }}>
                                {currentInventory?.name}
                            </Typography>
                            <Divider />
                            <DetailSection label='Supplier Name' text={currentInventory?.supplier?.name as string} />
                            <DetailSection label='Supplier Contact' icon={<LocalPhoneOutlinedIcon />} text={currentInventory?.supplier?.telephone as string} />
                            {currentInventory?.supplier?.email && <DetailSection label='Supplier Email' icon={<EmailOutlinedIcon style={{ color: "#BC892C" }} />} text={currentInventory?.supplier?.email as string} />}
                            {currentInventory?.lpoNumber && <DetailSection label="LPO Number" text={currentInventory?.lpoNumber} />}
                            {currentInventory?.grnNumber && <DetailSection label="GRN Number" text={currentInventory?.grnNumber} />}
                            {currentInventory?.createDate && <DetailSection label="Delivery Date" text={moment(currentInventory?.createDate).format('Do MMMM YYYY, h:mm')} />}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                        <CardContent>
                            <TabComponent
                                headers={[
                                    {
                                        label: "Stock Commodities",
                                        position: 0,
                                        content: <OtherDetails inventory={currentInventory} />
                                    }
                                ]}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
                <Stack direction="row" spacing={3} sx={{ width: "30%", mt: 3 }}>
                    <ButtonComponent
                        handleClick={() => console.log("information!!")}
                        buttonColor='error'
                        type='button'
                        sendingRequest={false}
                        buttonText="Back"
                    />
                    <ButtonComponent
                        buttonColor='info'
                        type='submit'
                        sendingRequest={false}
                        buttonText="Update" />
                </Stack>
            </Box>
        </Card>
    )
}

export default InventoryDetails