/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IRequest, ITransportRequest } from "../../pages/request/interface";
import { requestStatus } from "../../utils/constants";
import { requestCommoditiesMocks } from "../commodity";
import { statusMocks } from "../status";
import { usersMock } from "../users";

export const requestMock: IRequest[] = [
    {
        id: 25,
        name: "Request for Office Supplies",
        priority: "High",
        description: "Request for office supplies",
        signaturePath: "C:\\Users\\sodong\\Projects\\erp\\human-resource\\statics/e0b84f16-4fed-4a83-b833-1a9608d5dd94_Airtel Mobile Money.png",
        status: statusMocks[0],
        timeOfSubmissionOfRequest: "2025-05-07T12:21:29.278878",
        createDate: "2025-05-07T12:21:29.278878",
        lastModified: "2025-05-07T12:21:29.278878",
        createdBy: usersMock[0],
        lastModifiedBy: usersMock[0],
        requester: usersMock[0],
        // "requestReports": [],
        currentApprover: usersMock[0],
        commodities: requestCommoditiesMocks,
        emailMessage: "Email sent Successfully"
    }
];


export const transportRequest: ITransportRequest[] = [
    {
        id: 1,
        requester: usersMock[0],
        requestDate: "2024-11-01",
        timeOfSubmissionOfRequest: "08:00",
        timeVehicleIsRequired: "09:00",
        dateVehicleIsRequired: "2024-11-01",
        destination: "123 Main St, Cityville",
        purpose: "Business meeting",
        duration: "2 hours",
        priority: "high",
        status: requestStatus.approved,
        signature: null,
        desc: "Need to be on time for a client presentation.",
        position: "test",
        fromPosition: "mbale",
        Narration: "sample",
    }
];
