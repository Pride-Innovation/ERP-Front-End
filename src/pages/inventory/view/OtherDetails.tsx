/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IInventory } from "../interface";

const OtherDetails = ({ inventory }: { inventory: IInventory }) => {
    console.log(inventory, "Inventory")
    return (
        <>
            Other Details
        </>
    )
};

export default OtherDetails;