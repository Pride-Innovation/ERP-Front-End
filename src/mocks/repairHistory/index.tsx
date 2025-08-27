/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IRepairDetails } from "../../pages/assets/interface";

export const repairHistoryMock: Array<IRepairDetails> = [
    {
        id: 1,
        repairStartDate: "2024-01-10",
        repairEndDate: "2024-01-12",
        technician: "alice smith",
        repairReason: "Battery replacement",
        documents: [],
        status: "Completed",
        completionNotes: "Battery replaced successfully.",
        completionDocuments: [],
        asset: {
            id: 1,
            assetName: "Laptop",
            hostname: "laptop-01",
            detailNetBookValue: "1000",
            engravedNumber: "ENG-001",
            dateReceipt: "2024-01-01",
            make: "Brand A",
            supplier: null,
            unitOfMeasure: "pcs",
            purchaseCost: "1000",
            costOfTheAsset: "1000",
            netValueB: "1000",
            assignedTo: null,
            branch: null,
            assetDepreciationRate: null,
            description: null,
            model: null,
            image: null,
            assetStatus: null,
            assetType: null,
            category: null,
            lpoNumber: "LPO-001",
            commodity: null,
            stock: null
        }
    }
];

