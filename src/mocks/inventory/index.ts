/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IInventory } from "../../pages/inventory/interface";
import { branchesMock } from "../branch";
import { suppliersMock } from "../settings";
import { statusMocks } from "../status";

export const inventoryMock: IInventory[] = [
    {
        id: 1,
        name: "ATM Machine",
        referenceNumber: "REF15267378PRIDE",
        totalCost: 8000.00,
        balanceCost: 10000.00,
        supplier: suppliersMock[0],
        branch: branchesMock[0],
        status: statusMocks[0],
        deliveryNote: "",
        commodities: [
            {
                orderedQuantity: 20,
                deliveredQuantity: 15,
                costPrice: 500,
                purchasePrice: 700,
                commodity: {
                    "id": 1,
                    "name": "Pens",
                    "groupName": "Box",
                    "assetType": {
                        "id": 3,
                        "name": "Stationery",
                        "description": "Stationery"
                    }
                }
            }
        ]
    }
];
