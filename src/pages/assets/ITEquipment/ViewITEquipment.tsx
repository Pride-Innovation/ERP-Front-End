import {
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
    Divider,
    IconButton,
    Stack,
} from '@mui/material';
import { itEquipmentMock } from '../../../mocks/itEquipment';
import PlaceHolder from "../../../statics/images/Placeholder.png";
import TabComponent from '../../../components/tabs';
import { IITEquipment } from './interface';
import InfoIcon from '@mui/icons-material/Info';
import HardwareIcon from '@mui/icons-material/Hardware';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import { grey } from '@mui/material/colors';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import TableUtills from '../../../components/tables/utills';
import TimeLineDot from '../../../components/timeLineDots';
import ButtonComponent from '../../../components/forms/Button';

const DetailSection = ({
    text, label, icon
}: { text: string; label: string; icon?: JSX.Element }) => {
    const { determineTimeLineDotColor } = TableUtills();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {icon && <IconButton color='info' sx={{ mr: 1, bgcolor: '#FFF', borderRadius: "4px" }}>{icon}</IconButton>}
            <Typography variant="body2" sx={{ bgcolor: "#FFF", p: 1.2, borderRadius: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <strong>{label}:</strong>
                <span style={{ display: "flex", alignItems: "center" }}>
                    {
                        label === "Status" &&
                        <TimeLineDot color={determineTimeLineDotColor(text.toLocaleLowerCase())} />

                    }
                    {text}
                    {
                        label === "Serial Number" &&
                        <ContentPasteIcon fontSize='small' color='info' sx={{ ml: "5px" }} />
                    }
                    {
                        label === "Purchase Cost" && <span style={{marginLeft: "5px"}}>UGX</span>
                    }
                </span>
            </Typography>
        </Box>
    );
}
const OtherDetails = ({ equipment }: { equipment: IITEquipment }) => (
    <>
        {equipment.ram && <DetailSection text={equipment.ram} label="RAM" icon={<MemoryIcon />} />}
        {equipment.cpuSpeed && <DetailSection text={equipment.cpuSpeed} label="CPU Speed" icon={<HardwareIcon />} />}
        {equipment.hardDiskSize && <DetailSection text={equipment.hardDiskSize} label="Hard Disk Size" icon={<StorageIcon />} />}
        {equipment.macAddress && <DetailSection text={equipment.macAddress} label="MAC Address" icon={<SettingsEthernetIcon />} />}
        {equipment.ipAddress && <DetailSection text={equipment.ipAddress} label="IP Address" icon={<SettingsEthernetIcon />} />}
        {equipment.assetDepreciationRate && <DetailSection text={equipment.assetDepreciationRate} label="Depreciation Rate" icon={<InfoIcon />} />}
    </>
);

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
                                        label: "Step One",
                                        position: 0,
                                        content: <OtherDetails equipment={equipment} />
                                    },
                                    {
                                        label: "Step Two",
                                        position: 1,
                                        content: <Typography variant="body1">Section Two</Typography>
                                    },
                                    {
                                        label: "Step Three",
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
