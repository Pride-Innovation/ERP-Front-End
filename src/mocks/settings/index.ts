/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ISupplier } from "../../pages/settings/suppliers/interface";


export const suppliersMock: Array<ISupplier> = [
    {
        id: 1,
        name: "Alican & Sons",
        telephone: "+1 345 2341426",
        email: "alicomsons@test.gmail.com",
        address: "Gulu City",
        commodities: [
            {
                "id": 1,
                "name": "Pens",
                "groupName": "Box",
                "assetType": {
                    "id": 3,
                    "name": "Stationery",
                    "description": "Stationery"
                }
            }
        ],
    }
]
