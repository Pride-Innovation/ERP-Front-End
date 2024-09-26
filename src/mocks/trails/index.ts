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

export interface ITest {
    "userId": number | string;
    "id": number | string;
    "title": string;
    "body": string;
}

export const testListMock: ITest[] = [
    {
        "userId": 1,
        "id": 8,
        "title": "dolorem dolore est ipsam",
        "body": "dignissimos aperiam dolorem qui eum\nfacilis quibusdam animi sint suscipit qui sint possimus cum\nquaerat magni maiores excepturi\nipsam ut commodi dolor voluptatum modi aut vitae"
    },
    {
        "userId": 1,
        "id": 9,
        "title": "nesciunt iure omnis dolorem tempora et accusantium",
        "body": "consectetur animi nesciunt iure dolore\nenim quia ad\nveniam autem ut quam aut nobis\net est aut quod aut provident voluptas autem voluptas"
    },
]