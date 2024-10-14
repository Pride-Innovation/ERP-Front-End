export interface IDashboardCard {
    image: string;
    number: number;
    name: string;
    stockLevel: string;
    lastUpdated: string
}

export interface IStockIndicatorProps {
    color: string;
}

export interface IStockDetails {
    color: string;
    status: string;
}