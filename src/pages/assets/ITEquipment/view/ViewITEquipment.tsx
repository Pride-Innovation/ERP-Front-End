import {
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
    Divider,
    Stack,
} from '@mui/material';
import { itEquipmentMock } from '../../../../mocks/itEquipment';
import PlaceHolder from "../../../../statics/images/Placeholder.png";
import TabComponent from '../../../../components/tabs';
import { grey } from '@mui/material/colors';
import ButtonComponent from '../../../../components/forms/Button';
import DetailSection from './DetailSection';
import OtherDetails from './OtherDetails';
import AssignmentHistory from './AssignmentHistory';



const ITEquipmentDetails = () => {
    const equipment = itEquipmentMock[0];

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
                            {equipment.model && <DetailSection label="Model" text={equipment.model} />}
                            {equipment.serialNumber && <DetailSection label="Serial Number" text={equipment.serialNumber} />}
                            <DetailSection label="Supplier" text={equipment.supplier} />
                            <DetailSection label="Purchase Cost" text={equipment.purchaseCost} />
                            <DetailSection label="Date of Receipt" text={equipment.dateReceipt} />
                            {equipment.location && <DetailSection label="Location" text={equipment.location} />}
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
                                        label: "Other Details",
                                        position: 0,
                                        content: <OtherDetails equipment={equipment} />
                                    },
                                    {
                                        label: "ASSIGNMENT HISTORY",
                                        position: 1,
                                        content: <AssignmentHistory id={equipment.id} />
                                    },
                                    {
                                        label: "REPAIR TRAILS",
                                        position: 2,
                                        content: <Typography variant="body1">Section Three</Typography>
                                    },
                                ]}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "end"}}>
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
};

export default ITEquipmentDetails;
