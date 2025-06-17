/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IFleet } from "../../pages/assets/fleet/interface";
import { branchesMock } from "../branch";
import { suppliersMock } from "../settings";
import { statusMocks } from "../status";
import { usersMock } from "../users";

export const fleetsMock: IFleet[] = [
    {
        id: 1,
        assetName: "Forklift",
        hostname: "FLK-001",
        detailNetBookValue: "15000",
        engravedNumber: "ENG-001",
        dateReceipt: "2022-01-15",
        make: "Toyota",
        supplier: suppliersMock[0],
        unitOfMeasure: "units",
        purchaseCost: "12000",
        costOfTheAsset: "15000",
        netValueB: "8000",
        description: "Electric forklift for warehouse use.",
        image: "forklift.png",
        assetStatus: statusMocks[0],
        assignedTo: usersMock[0],
        branch: branchesMock[0]
    }
];
