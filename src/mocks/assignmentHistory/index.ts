/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAssetAssignmentHistory } from "../../pages/assets/trails/interface";
import { statusMocks } from "../status";
import { usersMock } from "../users";

const assignmentHistoryMock: IAssetAssignmentHistory[] = [
    {
        id: 1,
        startDate: "2024-01-01",
        endDate: "2024-01-05",
        statusBefore: statusMocks[0],
        statusAfter: statusMocks[0],
        user: usersMock[0],
        asset: null
    }
];

export default assignmentHistoryMock;
