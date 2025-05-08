/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import DetailSection from "../../assets/trails/DetailSection";
import { IInventory } from "../interface";
import AddchartIcon from '@mui/icons-material/Addchart';
import ScaleIcon from '@mui/icons-material/Scale';
import EventIcon from '@mui/icons-material/Event';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';

const OtherDetails = ({ inventory }: { inventory: IInventory }) => (
    <>
        {inventory.reorderLevel && <DetailSection text={inventory.reorderLevel} label="Reorder Level" icon={<AddchartIcon />} />}
        {inventory.unitOfMeasure && <DetailSection text={inventory.unitOfMeasure} label="Unit of Measure" icon={<ScaleIcon />} />}
        {inventory.expirationDate && <DetailSection text={inventory.expirationDate} label="Expiration Date" icon={<EventIcon />} />}
        {inventory.quantityInStock && <DetailSection text={(inventory.quantityInStock).toString()} label="Quantity in Stock" icon={<InventoryOutlinedIcon />} />}
        {inventory.supplier && <DetailSection text={inventory.supplier} label="Supplier" icon={<AccountCircleOutlinedIcon />} />}
    </>
);

export default OtherDetails;