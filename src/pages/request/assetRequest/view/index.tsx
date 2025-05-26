/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


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
import ButtonComponent from "../../../../components/forms/Button";


const RequestDetails = () => {

    return (
        <Card sx={{ p: 4, boxShadow: "none" }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                        <CardMedia
                            component="img"
                            height="250"
                            // image={PlaceHolder}
                            alt="Equipment Image"
                        />
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ color: "#1976d2" }}>
                                {/* {currentInventory?.name} */}
                                curent name
                            </Typography>
                            <Divider />
                            {/* <DetailSection label='Cost Price' text={currentInventory?.costPrice} /> */}
                            {/* {currentInventory?.purchasePrice && <DetailSection label="Purchase Price" text={currentInventory?.purchasePrice} />}
                            {currentInventory?.location && <DetailSection label="Location" text={currentInventory?.location} />}
                            {currentInventory?.description && <DetailSection label="Description" text={currentInventory?.description} />} */}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                        <CardContent>
                            {/* <TabComponent
                                headers={[
                                    {
                                        label: "Other Details",
                                        position: 0,
                                        content: <OtherDetails inventory={currentInventory} />
                                    },
                                    {
                                        label: "ASSIGNMENT HISTORY",
                                        position: 1,
                                        content: <AssignmentHistory id={currentInventory?.id as string} />
                                    }
                                ]}
                            /> */}
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

export default RequestDetails