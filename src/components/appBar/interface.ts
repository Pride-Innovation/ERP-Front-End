/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

export interface ISideBarItem {
    id: number;
    name: string;
    route: string;
    icon: JSX.Element;
    access?: boolean;
    /** Section heading this item is rendered under (uppercase micro-label when the drawer is open). */
    group?: string;
    subroutes: Array<{
        id: number;
        name: string;
        route: string;
        icon: JSX.Element;
    }>
}