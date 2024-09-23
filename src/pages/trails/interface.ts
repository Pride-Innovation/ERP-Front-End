export interface IAuditTrail {
    id: string | number;
    timeStamp: string;
    event: string;
    description: string;
    actor: string;
}