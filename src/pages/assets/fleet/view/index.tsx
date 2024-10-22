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
import { fleetsMock } from "../../../../mocks/fleet";
import { grey } from "@mui/material/colors";
import PlaceHolder from "../../../../statics/images/Placeholder.png";
import DetailSection from "../../trails/DetailSection";
import TabComponent from "../../../../components/tabs";
import AssignmentHistory from "../../trails/AssignmentHistory";
import RepairHistory from "../../trails/RepairHistory";
import ButtonComponent from "../../../../components/forms/Button";


const FleetDetails = () => {
    const equipment = fleetsMock[0];
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
                                {equipment.assetName}
                            </Typography>
                            <Divider />
                            <DetailSection label='Hostname' text={equipment.hostname} />
                            <DetailSection label="Supplier" text={equipment.supplier} />
                            <DetailSection label="Purchase Cost" text={equipment.purchaseCost} />
                            <DetailSection label="Date of Receipt" text={equipment.dateReceipt} />
                            {equipment.assetStatus && <DetailSection label="Status" text={equipment.assetStatus} />}
                            {equipment.desc && <DetailSection label="Description" text={equipment.desc} />}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                        <CardContent>
                            <TabComponent
                                headers={[
                                    {
                                        label: "ASSIGNMENT HISTORY",
                                        position: 0,
                                        content: <AssignmentHistory id={equipment.id as number} />
                                    },
                                    {
                                        label: "REPAIR TRAILS",
                                        position: 1,
                                        content: <RepairHistory id={equipment.id as number} />
                                    },
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
    );
}

export default FleetDetails