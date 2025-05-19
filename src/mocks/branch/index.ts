import { IBranch } from "../../pages/settings/branch/interface";
import { districtsMock } from "../districts";
import { regionsMock } from "../regions";

export const branchesMock: IBranch[] = [
    {
        id: 1,
        name: "Main Branch",
        email: "main.branch@example.com",
        telephone: "123-456-7890",
        branchManager: null,
        branchOperationsManager: null,
        relationshipManager: null,
        creditAdministrator: null,
        region: regionsMock[0],
        district: districtsMock[0],
    },
];