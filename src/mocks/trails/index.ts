import { IAuditTrail } from "../../pages/trails/interface";

export const auditTrailsMock: IAuditTrail[] = [
    {
        id: 1,
        timeStamp: "Sep 11, 2024 3:25 PM",
        event: "updated",
        description: "Activated user (snamwanja@pridemicrofinance.co.ug)",
        actor: "John Doe"
    },
    {
        id: 2,
        timeStamp: "Sep 11, 2024 3:17 PM",
        event: "updated",
        description: "	Activated user (dariusk.kats+7@gmail.com)",
        actor: "Jane Doe"
    }
]