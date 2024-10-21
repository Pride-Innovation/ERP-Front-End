import React from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Box,
    Divider,
} from '@mui/material';
import { itEquipmentMock } from '../../../mocks/itEquipment';
import PlaceHolder from "../../../statics/images/Placeholder.png";
import TabComponent from '../../../components/tabs';
import { IITEquipment } from './interface';

const OtherDetails = ({ equipment }: { equipment: IITEquipment }) => (
    <>
        {equipment.ram && <Typography variant="body1"><strong>RAM:</strong> {equipment.ram}</Typography>}
        {equipment.cpuSpeed && <Typography variant="body1"><strong>CPU Speed:</strong> {equipment.cpuSpeed}</Typography>}
        {equipment.hardDiskSize && <Typography variant="body1"><strong>Hard Disk Size:</strong> {equipment.hardDiskSize}</Typography>}
        {equipment.macAddress && <Typography variant="body1"><strong>MAC Address:</strong> {equipment.macAddress}</Typography>}
        {equipment.ipAddress && <Typography variant="body1"><strong>IP Address:</strong> {equipment.ipAddress}</Typography>}
        {equipment.assetDepreciationRate && <Typography variant="body1"><strong>Depreciation Rate:</strong> {equipment.assetDepreciationRate}</Typography>}
    </>
)

const ITEquipmentDetails = () => {
    const equipment = itEquipmentMock[0];
    return (
        <Card sx={{ p: 4 }} >
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardMedia
                            component="img"
                            height="250"
                            image={PlaceHolder}
                            alt="Equipment Image"
                        />
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                {equipment.assetName}
                            </Typography>
                            <Divider />
                            <Typography variant="body1" sx={{ mt: 2 }}><strong>Hostname:</strong> {equipment.hostname}</Typography>
                            {equipment.model && <Typography variant="body1"><strong>Model:</strong> {equipment.model}</Typography>}
                            {equipment.serialNumber && <Typography variant="body1"><strong>Serial Number:</strong> {equipment.serialNumber}</Typography>}
                            <Typography variant="body1"><strong>Supplier:</strong> {equipment.supplier}</Typography>
                            <Typography variant="body1"><strong>Purchase Cost:</strong> {equipment.purchaseCost}</Typography>
                            <Typography variant="body1"><strong>Date of Receipt:</strong> {equipment.dateReceipt}</Typography>
                            {equipment.location && <Typography variant="body1"><strong>Location:</strong> {equipment.location}</Typography>}
                            {equipment.assetStatus && <Typography variant="body1"><strong>Status:</strong> {equipment.assetStatus}</Typography>}
                            {equipment.desc && <Typography variant="body1"><strong>Description:</strong> {equipment.desc}</Typography>}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <TabComponent
                                headers={[{
                                    label: "Step One",
                                    position: 0,
                                    content: <OtherDetails equipment={equipment} />
                                }, {
                                    label: "Step Two",
                                    position: 1,
                                    content: <p>Section Two</p>
                                },]} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" mt={4}>
                <Button variant="contained" color="primary" onClick={() => {/* handle edit */ }} sx={{ mr: 2 }}>
                    Edit
                </Button>
                <Button variant="contained" color="secondary" onClick={() => {/* handle delete */ }}>
                    Delete
                </Button>
            </Box>
        </Card>
    );
};

export default ITEquipmentDetails;
