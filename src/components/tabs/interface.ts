export interface ITabHeader {
    label: string;
    position: number;
    content: JSX.Element
}

export interface ITabComponent {
    headers: Array<ITabHeader>
}