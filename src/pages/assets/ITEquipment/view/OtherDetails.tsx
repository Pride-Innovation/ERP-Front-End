import { IITEquipment } from "../interface";
import DetailSection from "./DetailSection";
import InfoIcon from '@mui/icons-material/Info';
import HardwareIcon from '@mui/icons-material/Hardware';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';

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

export default OtherDetails;