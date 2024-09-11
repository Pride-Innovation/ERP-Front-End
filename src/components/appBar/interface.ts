export interface ISideBarItem {
    id: number;
    name: string;
    route: string;
    icon: JSX.Element;
    subroutes: Array<{
        id: number;
        name: string;
        route: string;
        icon: JSX.Element;
    }>
}