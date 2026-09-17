/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';

export interface IModalComponent {
    handleClose: () => void;
    open: boolean;
    children: React.ReactNode
    /** Percentage or px width at `sm` and up. Capped by `maxWidth` so it cannot sprawl. */
    width?: string | number;
    /**
     * Optional upper bound on the dialog width, for dialogs whose content stops benefiting from
     * extra room — a percentage `width` alone becomes a 1900px dialog on an ultrawide monitor.
     * Unset by default so existing dialogs keep exactly the width they ask for.
     */
    maxWidth?: string | number;
    title: string;
    /**
     * Optional glyph for the header, shown in a tinted rounded tile before the title — the
     * treatment the Enable/Disable User dialogs hand-rolled in their own bodies.
     */
    icon?: ReactNode;
    /** Optional line under the title — context the title itself shouldn't have to carry. */
    subtitle?: ReactNode;
    /** Optional right-aligned header content (a status chip, a count) shown before the close button. */
    headerAction?: ReactNode;
    /** Optional pinned footer, for the dialog's primary actions. */
    footer?: ReactNode;
    /** Hides the header close button. The backdrop and Escape still close the dialog. */
    hideCloseButton?: boolean;
}
