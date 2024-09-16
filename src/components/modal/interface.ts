export interface IModalComponent {
    handleClose: () => void;
    open: boolean;
    children: React.ReactNode
    width?: string | number;
    title: string;
}